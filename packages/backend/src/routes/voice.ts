import { Router } from "express";
import { synthesizeSpeech, startAudioTranscription, getTranscriptionResult } from "../services/voice.js";
import { requireAuthMiddleware } from "../middleware/auth.js";

export const voiceRoutes = Router();

/**
 * POST /api/voice/synthesize
 * Converts a text response (like a Q&A answer) into an MP3 audio buffer using Amazon Polly.
 * Returns the raw binary audio for the frontend to play.
 */
voiceRoutes.post("/synthesize", requireAuthMiddleware, async (req, res) => {
  const { text, voiceId = "Matthew" } = req.body as { text: string; voiceId?: string };

  if (!text) {
    res.status(400).json({ error: "Text is required for synthesis." });
    return;
  }

  try {
    const audioBuffer = await synthesizeSpeech(text, voiceId);

    // Send the raw binary audio stream back
    res.set("Content-Type", "audio/mpeg");
    res.set("Content-Length", audioBuffer.length.toString());
    res.send(audioBuffer);
  } catch (error: any) {
    console.error("[voice] Polly synthesis failed:", error);
    res.status(500).json({ error: "Failed to synthesize speech." });
  }
});

/**
 * POST /api/voice/transcribe/start
 * Starts an async Amazon Transcribe job for a given S3 URI.
 */
voiceRoutes.post("/transcribe/start", requireAuthMiddleware, async (req, res) => {
  const { mediaUri } = req.body as { mediaUri: string };

  if (!mediaUri || !mediaUri.startsWith("s3://")) {
    res.status(400).json({ error: "Valid S3 mediaUri is required." });
    return;
  }

  const jobName = `autodev-transcribe-${Date.now()}`;

  try {
    await startAudioTranscription(mediaUri, jobName);
    res.json({ jobName, status: "IN_PROGRESS" });
  } catch (error: any) {
    console.error(`[voice] Transcribe start failed:`, error);
    res.status(500).json({ error: "Failed to start transcription job." });
  }
});

/**
 * GET /api/voice/transcribe/status/:jobName
 * Polls the status of the transcription job and returns text if complete.
 */
voiceRoutes.get("/transcribe/status/:jobName", requireAuthMiddleware, async (req, res) => {
  const jobName = req.params.jobName as string;

  try {
    const transcript = await getTranscriptionResult(jobName);
    
    if (transcript) {
      res.json({ status: "COMPLETED", transcript });
    } else {
      res.json({ status: "IN_PROGRESS" });
    }
  } catch (error: any) {
    console.error(`[voice] Transcribe poll failed:`, error);
    res.status(500).json({ error: error.message });
  }
});
