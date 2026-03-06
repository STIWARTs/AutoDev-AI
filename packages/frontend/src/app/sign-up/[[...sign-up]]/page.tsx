import { SignUp } from "@clerk/nextjs";
import { Code2 } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-brand-bg opacity-90 animate-aurora pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at top left, rgba(226,90,52,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(226,90,52,0.1) 0%, transparent 40%)" }} />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="z-10 w-full max-w-sm flex flex-col items-center mb-8 gap-3">
        <div className="w-12 h-12 bg-brand rounded-sm flex items-center justify-center">
            <Code2 className="w-6 h-6 text-brand-bg" />
        </div>
        <div className="text-2xl font-heading font-semibold text-brand-text">Create your AutoDev account</div>
      </div>
      
      <div className="z-10">
        <SignUp appearance={{
          elements: {
            card: "bg-brand-surface border border-brand-border rounded-sm shadow-none",
            headerTitle: "text-brand-text font-heading",
            headerSubtitle: "text-brand-muted font-mono text-sm",
            socialButtonsBlockButton: "border border-brand-border bg-brand-card hover:bg-brand-bg text-brand-text rounded-sm",
            dividerLine: "bg-brand-border",
            dividerText: "text-brand-muted font-mono text-xs",
            formFieldLabel: "text-brand-text font-mono text-sm",
            formFieldInput: "bg-brand-bg border border-brand-border text-brand-text rounded-sm focus:border-brand focus:ring-1 focus:ring-brand",
            formButtonPrimary: "bg-brand text-brand-bg hover:bg-brand-text hover:text-brand-bg rounded-sm font-semibold transition-colors shadow-none",
            footerActionText: "text-brand-muted font-mono text-sm",
            footerActionLink: "text-brand hover:text-brand-text transition-colors",
          }
        }} />
      </div>
    </div>
  );
}
