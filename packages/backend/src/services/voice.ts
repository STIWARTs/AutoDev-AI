import {
  PollyClient,
  SynthesizeSpeechCommand,
} from "@aws-sdk/client-polly";
import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} from "@aws-sdk/client-transcribe";

const pollyClient = new PollyClient({ region: process.env.AWS_REGION || "us-east-1" });
const transcribeClient = new TranscribeClient({ region: process.env.AWS_REGION || "us-east-1" });

/**
 * Amazon Polly: Converts text answer into speech (MP3).
 */
export async function synthesizeSpeech(text: string, voiceId: string = "Matthew"): Promise<Buffer> {
  const command = new SynthesizeSpeechCommand({
    OutputFormat: "mp3",
    Text: text,
    VoiceId: voiceId as any,
    Engine: "neural", // Use highest quality neural voices
  });

  const response = await pollyClient.send(command);
  
  if (!response.AudioStream) {
    throw new Error("Failed to synthesize speech.");
  }
  
  // Convert stream to Buffer
  const chunks = [];
  for await (const chunk of response.AudioStream as unknown as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Amazon Transcribe: Starts a transcription job for uploaded audio in S3.
 * Note: Transcribe is async. For real-time, we'd use TranscribeStreamingClient via WebSocket.
 * For hackathon simplicity, we assume audio is placed in S3 first.
 */
export async function startAudioTranscription(
  mediaFileUri: string, 
  jobName: string
): Promise<string> {
  const command = new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    LanguageCode: "en-US",
    MediaFormat: mediaFileUri.endsWith(".mp3") ? "mp3" : "wav",
    Media: {
      MediaFileUri: mediaFileUri, // e.g. s3://bucket-name/folder/audio.mp3
    },
  });

  await transcribeClient.send(command);
  return jobName;
}

export async function getTranscriptionResult(jobName: string): Promise<string | null> {
  const command = new GetTranscriptionJobCommand({
    TranscriptionJobName: jobName,
  });

  const response = await transcribeClient.send(command);
  const status = response.TranscriptionJob?.TranscriptionJobStatus;

  if (status === "COMPLETED" && response.TranscriptionJob?.Transcript?.TranscriptFileUri) {
    const transcriptUrl = response.TranscriptionJob.Transcript.TranscriptFileUri;
    const res = await fetch(transcriptUrl);
    const data = await res.json() as any;
    return data.results.transcripts[0].transcript;
  }
  
  if (status === "FAILED") {
    throw new Error(`Transcription job failed: ${response.TranscriptionJob?.FailureReason}`);
  }

  return null; // Still processing
}
