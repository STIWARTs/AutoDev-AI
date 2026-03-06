import CodeCanvas from "@/components/CodeCanvas";

interface CanvasPageProps {
  params: Promise<{
    repoId: string;
  }>;
}

export default async function CanvasPage({ params }: CanvasPageProps) {
  const { repoId } = await params;
  
  // Decoding the repoId for display purposes
  const decodedRepoId = decodeURIComponent(repoId);

  return (
    <div className="flex-1 h-[calc(100vh-theme(spacing.16))] p-6 w-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gradient mb-2">Code Canvas</h1>
          <p className="text-brand-text-secondary max-w-2xl">
            Explore {decodedRepoId}&apos;s architecture via an infinite graph map.
          </p>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[600px] rounded-xl overflow-hidden border border-white/10 bg-black/20">
        <CodeCanvas repoId={decodedRepoId} />
      </div>
    </div>
  );
}
