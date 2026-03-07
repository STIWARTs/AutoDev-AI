import { SignUp } from "@clerk/nextjs";
import { Code2 } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-90 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at top left, rgba(226,90,52,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(226,90,52,0.1) 0%, transparent 40%)" }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="z-10 w-full max-w-sm flex flex-col items-center mb-8 gap-3">
        <div className="w-12 h-12 bg-brand flex items-center justify-center">
          <Code2 className="w-6 h-6 text-brand-bg" />
        </div>
        <div className="text-2xl font-heading font-semibold text-brand-text">Create your AutoDev account</div>
      </div>

      <div className="z-10">
        <SignUp />
      </div>
    </div>
  );
}
