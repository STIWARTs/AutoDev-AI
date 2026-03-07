"use client";

import { motion, Variants, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Code2, Cpu, Globe2, GitBranch, Terminal, Shield, Sparkles, Check, Play, Map, BookOpen, BarChart2, Mic, Monitor, Zap, Users, Settings2, Languages, FileCode2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveGrid } from "@/components/InteractiveGrid";
import { useAuth, UserButton } from "@clerk/nextjs";

// Particle component for background
const FloatingParticles = () => {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<{ x: number; y: number; duration: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    setParticles(
      [...Array(20)].map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        duration: Math.random() * 10 + 10,
      }))
    );
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-brand rounded-full opacity-20"
          initial={{
            x: p.x,
            y: p.y,
          }}
          animate={{
            y: [null, Math.random() * -500],
            opacity: [0.2, 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Define animation variants for smooth, sequenced reveal
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      delay: i * 0.1, 
      type: "spring",
      stiffness: 50,
      damping: 15,
      mass: 1 
    },
  }),
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 }
  }
};

const AnimatedTerminal = () => {
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const fullText = "autodev init --repo https://github.com/org/core-backend";
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (step === 0) {
      setTypedText("");
      let i = 0;
      const typeChar = () => {
        if (i <= fullText.length) {
          setTypedText(fullText.substring(0, i));
          i++;
          timeout = setTimeout(typeChar, 40); // typing speed
        } else {
          timeout = setTimeout(() => {
             setStep(1);
          }, 400); // Wait bit after finish typing
        }
      };
      timeout = setTimeout(typeChar, 800);
      return () => clearTimeout(timeout);
    }
    
    // Normal sequence execution
    if (step > 0 && step < 6) {
      const delays = [0, 800, 600, 800, 600, 3000]; // delays for steps 1-5, and reset at 6
      timeout = setTimeout(() => {
        setStep(step >= 5 ? 0 : step + 1);
      }, delays[step]);
      return () => clearTimeout(timeout);
    }

  }, [step]);

  return (
    <div className="p-6 text-left font-mono text-xs md:text-sm h-full min-h-[220px]">
      <div className="space-y-3">
        <div className="text-brand-muted">
          <span className="text-brand">$</span> {step === 0 ? typedText : fullText}
          {step === 0 && <span className="inline-block w-2 h-4 bg-brand-muted animate-pulse align-middle ml-1" />}
        </div>
        
        {step >= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-brand-muted">
            <span className="text-emerald-400">✓</span> Repository cloned successfully (432 files).
          </motion.div>
        )}
        
        {step >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-brand-muted pl-4">
            Scanning for architectural patterns...
          </motion.div>
        )}
        
        {step >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-brand-muted">
            <span className="text-emerald-400">✓</span> Detected Next.js frontend, Express backend, PostgreSQL database.
          </motion.div>
        )}
        
        {step >= 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-brand-muted">
            <span className="text-emerald-400">✓</span> Building interactive system graph... done.
          </motion.div>
        )}
        
        {step >= 5 && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-brand mt-4 font-semibold">
            Generating multilingual walkthroughs (Hindi, Tamil, English)...
            <span className="inline-block w-2 h-4 bg-brand animate-pulse align-middle ml-1" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

const AnimatedCodeReview = () => {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const sequence = [
      { delay: 1500, step: 1 },
      { delay: 2000, step: 2 },
      { delay: 1000, step: 3 },
      { delay: 4000, step: 0 }
    ];
    let timeout: NodeJS.Timeout;
    const runSequence = (idx: number) => {
      timeout = setTimeout(() => {
        setStep(sequence[idx].step);
        if (idx + 1 < sequence.length) runSequence(idx + 1);
      }, sequence[idx].delay);
    };
    runSequence(0);
    return () => clearTimeout(timeout);
  }, [step === 0]);
  
  return (
    <div className="bg-brand-surface border border-brand-border rounded-sm p-6 space-y-4 relative overflow-hidden h-full flex flex-col justify-center">
      <div className="pb-3 border-b border-brand-border mb-4">
        <div className="flex justify-between items-center text-sm font-mono text-brand-muted">
          <span>src/services/payment.ts</span>
          {step >= 3 && (
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-red-400">1 Issue</motion.span>
          )}
        </div>
      </div>
      
      <div className="font-mono text-xs sm:text-sm bg-brand-bg p-4 rounded-sm border border-brand-border/50 space-y-2 relative">
        <div className="text-red-400 opacity-70 bg-red-400/10 -mx-4 px-4 py-1">- const result = stripe.charges.create(data);</div>
        
        {step >= 2 ? (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-emerald-400 bg-emerald-400/10 -mx-4 px-4 py-1">
            + const result = await stripe.charges.create(data);
          </motion.div>
        ) : step === 1 ? (
          <div className="h-6 flex items-center -mx-4 px-4">
            <div className="w-1.5 h-4 bg-brand animate-pulse" />
            <span className="text-brand-muted text-[10px] sm:text-xs ml-2 animate-pulse uppercase tracking-widest">AutoDev AI Reviewing...</span>
          </div>
        ) : <div className="h-6" />}
        
        {step < 2 && (
          <motion.div 
            className="absolute top-0 left-0 w-full h-[2px] bg-brand/50 shadow-[0_0_10px_rgba(226,90,52,0.8)]"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
      
      <div className="h-[120px]">
        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 bg-brand-bg border border-brand-border p-4 rounded-sm">
            <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-brand-bg" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-brand-text mb-1 flex items-center gap-2">
                Missing Async Context <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-[10px] rounded-sm font-mono uppercase tracking-wider">Error</span>
              </p>
              <p className="text-brand-muted leading-relaxed text-xs">This Stripe API call returns a Promise. Standard project convention dictates that all external API calls must be awaited to prevent unhandled promise rejections downstream.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const AnimatedQA = () => {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const sequence = [
      { delay: 1500, step: 1 },
      { delay: 1500, step: 2 },
      { delay: 3000, step: 3 },
      { delay: 5000, step: 0 }
    ];
    let timeout: NodeJS.Timeout;
    const runSequence = (idx: number) => {
      timeout = setTimeout(() => {
        setStep(sequence[idx].step);
        if (idx + 1 < sequence.length) runSequence(idx + 1);
      }, sequence[idx].delay);
    };
    runSequence(0);
    return () => clearTimeout(timeout);
  }, [step === 0]);
  
  return (
    <div className="bg-brand-surface border border-brand-border rounded-sm overflow-hidden flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(#2A2726_1px,transparent_1px)] [background-size:16px_16px] relative flex flex-col justify-start">
        {step >= 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className="flex justify-end"
          >
            <div className="bg-brand-card border border-brand-border rounded-sm rounded-tr-none px-4 py-3 max-w-[80%] inline-block text-sm">
              How does the authentication middleware work here? (कृपया हिंदी में समझाएं)
            </div>
          </motion.div>
        )}
        
        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
             <div className="bg-brand/20 text-brand border border-brand/30 rounded-sm rounded-tl-none px-4 py-3 flex gap-1 items-center">
               <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
          </motion.div>
        )}

        {step >= 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex justify-start"
          >
        <div className="bg-brand-surface border border-brand-border rounded-sm rounded-tl-none px-4 py-3 max-w-[85%] inline-block text-[13px] leading-relaxed">
              <p className="font-semibold mb-2 text-brand-text">ज़रूर!</p>
              <p className="mb-2 text-brand-muted">इस प्रोजेक्ट में, ऑथेंटिकेशन <code className="text-brand bg-brand-card px-1 rounded-sm font-mono text-[11px]">src/middleware/auth.ts</code> में संभाला गया है।</p>
              <ol className="list-decimal pl-4 space-y-1 text-brand-muted">
                <li>यह रिक्वेस्ट हेडर से JWT टोकन निकालता है।</li>
                <li><code className="text-brand bg-brand-card px-1 rounded-sm font-mono text-[11px]">jsonwebtoken</code> लाइब्रेरी का उपयोग करके टोकन को वेरीफाई करता है।</li>
                <li>अगर टोकन सही है, तो यह यूज़र डेटा को <code className="text-brand bg-brand-card px-1 rounded-sm font-mono text-[11px]">req.user</code> में डाल देता है ताकि आगे इस्तेमाल हो सके।</li>
              </ol>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="p-4 bg-brand-bg border-t border-brand-border flex gap-2">
        <div className="flex-1 border border-brand-border bg-brand-card rounded-sm px-4 py-2 text-sm text-brand-muted font-mono flex items-center">
          {step === 0 ? (
            <>
              Ask a question<span className="ml-[1px] w-1.5 h-3.5 bg-brand-muted animate-pulse" />
            </>
          ) : "Ask a question..."}
        </div>
        <Button className="rounded-sm bg-brand-text text-brand-bg"><ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
};

const AnimatedWalkthrough = () => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { label: "Client Request", tag: "HTTP", color: "#60a5fa" },
    { label: "API Gateway", tag: "Route", color: "#E25A34" },
    { label: "Auth Middleware", tag: "JWT", color: "#a78bfa" },
    { label: "Order Service", tag: "Logic", color: "#34d399" },
    { label: "DynamoDB", tag: "SQL", color: "#fbbf24" },
  ];
  useEffect(() => {
    const t = setInterval(() => setActiveStep((s) => (s + 1) % steps.length), 1300);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-brand-surface border border-brand-border rounded-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-border bg-brand-bg">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        <div className="font-mono text-[10px] text-brand-muted ml-4">Animated Flow — Checkout Request</div>
        <div className="ml-auto font-mono text-[10px] text-brand flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" /> Live
        </div>
      </div>
      <div className="p-8 flex flex-col items-center">
        {steps.map((step, i) => {
          const isActive = i === activeStep;
          const isPast = i < activeStep;
          return (
            <div key={i} className="flex flex-col items-center w-full max-w-xs">
              <motion.div
                animate={{
                  scale: isActive ? 1.04 : 1,
                  boxShadow: isActive ? `0 0 24px ${step.color}35` : "0 0 0 transparent",
                }}
                transition={{ duration: 0.25 }}
                className="w-full border px-4 py-3 font-mono text-sm flex items-center justify-between"
                style={{
                  borderColor: isActive ? step.color : "#3a3533",
                  backgroundColor: isActive ? `${step.color}12` : "#1a1816",
                  color: isActive ? step.color : isPast ? "#5a5452" : "#3a3533",
                }}
              >
                <span>{step.label}</span>
                <span className="text-[10px] uppercase tracking-widest opacity-60">{step.tag}</span>
              </motion.div>
              {i < steps.length - 1 && (
                <div className="w-[2px] h-6 bg-brand-border relative overflow-hidden">
                  {(isPast || isActive) && (
                    <motion.div
                      className="absolute inset-0"
                      style={{ backgroundColor: step.color }}
                      initial={{ scaleY: 0, transformOrigin: "top" }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.35 }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 text-center"
        >
          <div className="font-mono text-[11px] text-brand-muted">
            Step {activeStep + 1}/{steps.length} — <span className="text-brand-text">{steps[activeStep].label}</span>
          </div>
          <div className="font-mono text-[10px] text-brand-muted/60 mt-1">Click any node to pause and get AI explanation</div>
        </motion.div>
      </div>
    </div>
  );
};

const AnimatedVSCode = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const modules = [
    { id: "routes", label: "API Routes", files: 4, color: "#60a5fa", type: "CONTROLLER" },
    { id: "auth", label: "Auth Layer", files: 2, color: "#E25A34", type: "MIDDLEWARE" },
    { id: "services", label: "Services", files: 6, color: "#a78bfa", type: "SERVICE" },
    { id: "models", label: "Data Models", files: 3, color: "#34d399", type: "MODEL" },
  ];
  const connections: Record<string, string[]> = {
    routes: ["auth", "services"],
    auth: ["services"],
    services: ["models"],
    models: [],
  };
  return (
    <div className="bg-brand-bg border border-brand-border rounded-sm overflow-hidden font-mono text-xs">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-brand-border bg-[#0d0d0c]">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        <span className="ml-4 text-brand-muted text-[10px]">AutoDev · Code Canvas</span>
        <span className="ml-auto text-[10px] text-brand flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" /> Connected
        </span>
      </div>
      <div className="flex h-[280px]">
        <div className="w-28 border-r border-brand-border bg-brand-surface p-3 space-y-1 shrink-0">
          <div className="text-[9px] uppercase tracking-widest text-brand-muted mb-3">Explorer</div>
          {modules.map((m) => (
            <div
              key={m.id}
              onClick={() => setSelected((s) => (s === m.id ? null : m.id))}
              className={`px-2 py-1.5 cursor-pointer text-[10px] flex items-center gap-1.5 transition-colors ${
                selected === m.id ? "text-brand" : "text-brand-muted hover:text-brand-text hover:bg-brand-bg/60"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
              {m.label}
            </div>
          ))}
        </div>
        <div className="flex-1 p-4 grid grid-cols-2 gap-2 content-center">
          {modules.map((m) => {
            const isSel = selected === m.id;
            const isConn = !!selected && (connections[selected]?.includes(m.id) || connections[m.id]?.includes(selected ?? ""));
            const isDim = !!selected && !isSel && !isConn;
            return (
              <motion.div
                key={m.id}
                animate={{ opacity: isDim ? 0.18 : 1 }}
                onClick={() => setSelected((s) => (s === m.id ? null : m.id))}
                className="border p-2 cursor-pointer transition-all"
                style={{
                  borderColor: isSel ? m.color : "#3a3533",
                  backgroundColor: isSel ? `${m.color}12` : "#1a1816",
                  boxShadow: isSel ? `0 0 14px ${m.color}30` : "none",
                }}
              >
                <div className="text-[8px] uppercase tracking-widest mb-1" style={{ color: m.color }}>{m.type}</div>
                <div className="text-brand-text text-[11px] font-semibold">{m.label}</div>
                <div className="text-brand-muted text-[9px] mt-0.5">{m.files} files</div>
              </motion.div>
            );
          })}
        </div>
        <div className="w-28 border-l border-brand-border bg-brand-surface p-3 shrink-0">
          <div className="text-[9px] uppercase tracking-widest text-brand-muted mb-3">Detail</div>
          {selected ? (() => {
            const m = modules.find((x) => x.id === selected)!;
            return (
              <div className="space-y-2">
                <div className="text-[10px] font-semibold" style={{ color: m.color }}>{m.label}</div>
                <div className="text-brand-muted text-[9px]">{m.files} source files</div>
                <div className="text-brand-muted text-[9px]">{connections[m.id]?.length ?? 0} deps</div>
                <button className="mt-2 text-[9px] text-brand border border-brand/30 px-2 py-1 w-full text-left hover:bg-brand/10 transition-colors">
                  ✦ AI Explain
                </button>
                <button className="text-[9px] text-brand-muted border border-brand-border px-2 py-1 w-full text-left hover:bg-brand-bg/60 transition-colors">
                  ⎇ Open Files
                </button>
              </div>
            );
          })() : (
            <div className="text-brand-muted text-[9px] leading-relaxed">Click any node to inspect module</div>
          )}
        </div>
      </div>
      <div className="border-t border-brand-border bg-[#0d0d0c] px-4 py-1.5 flex items-center justify-between">
        <span className="text-brand-muted text-[9px]">⎇ Canvas · {modules.length} modules · calls / writes / imports</span>
        <span className="text-emerald-400 text-[9px]">● Synced</span>
      </div>
    </div>
  );
};

const AnimatedProgress = () => {
  const [visible, setVisible] = useState(false);
  const skills = [
    { label: "Authentication", score: 85, color: "#E25A34" },
    { label: "API Routes", score: 70, color: "#60a5fa" },
    { label: "Database Layer", score: 60, color: "#34d399" },
    { label: "Frontend", score: 50, color: "#a78bfa" },
    { label: "DevOps / Infra", score: 20, color: "#fbbf24" },
  ];
  return (
    <div className="bg-brand-surface border border-brand-border rounded-sm overflow-hidden">
      <div className="flex items-center px-4 py-3 border-b border-brand-border bg-brand-bg">
        <div className="font-mono text-[10px] text-brand-muted">Learning Progress — Rahul S., Day 1 (2 hrs)</div>
        <div className="ml-auto font-mono text-[10px] text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> +23% today
        </div>
      </div>
      <div className="p-6 space-y-3">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          onViewportEnter={() => setVisible(true)}
          className="space-y-3"
        >
          {skills.map((s, i) => (
            <div key={i}>
              <div className="flex justify-between font-mono text-[11px] text-brand-muted mb-1">
                <span>{s.label}</span>
                <span>{s.score}%</span>
              </div>
              <div className="h-1 bg-brand-bg overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: s.color }}
                  initial={{ width: 0 }}
                  animate={visible ? { width: `${s.score}%` } : { width: 0 }}
                  transition={{ duration: 1.1, delay: i * 0.12, ease: "easeOut" }}
                />
              </div>
            </div>
          ))}
        </motion.div>
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-brand-border">
          {[
            { v: "12", l: "Questions Asked" },
            { v: "3", l: "Walkthroughs Done" },
            { v: "2h", l: "Active Time" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-heading text-2xl text-brand-text">{s.v}</div>
              <div className="font-mono text-[9px] text-brand-muted uppercase tracking-wider mt-1">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-brand-border font-mono text-[10px] text-brand">
          <Sparkles className="w-3 h-3" />
          Ready for first contribution in 3 more walkthroughs
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Client-side fallback: if middleware didn't catch it (e.g., client navigation),
  // redirect signed-in users away from the landing page to the dashboard.
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Disable browser's default scroll restoration to avoid jumpiness on reload
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Force to top immediately on mount
    window.scrollTo(0, 0);

    // Some browsers need a short delay to override their built-in restoration
    const id = requestAnimationFrame(() => {
        window.scrollTo(0, 0);
    });

    return () => cancelAnimationFrame(id);
  }, []);

  // While Clerk is resolving auth state, show a minimal loading screen
  // so there's no flash of the landing page before a redirect fires.
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 bg-brand flex items-center justify-center">
            <Code2 className="w-4 h-4 text-brand-bg" />
          </div>
          <Loader2 className="w-4 h-4 text-brand-muted animate-spin" />
        </div>
      </div>
    );
  }

  // If signed in, render nothing while the redirect fires
  if (isSignedIn) return null;

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text font-body selection:bg-brand/30 overflow-x-hidden">
      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-brand-border bg-brand-bg/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-brand rounded-sm flex items-center justify-center">
              <Code2 className="w-4 h-4 text-brand-bg" />
            </div>
            <span className="font-heading font-semibold text-xl tracking-tight">AutoDev</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest text-brand-muted">
            <Link href="#how-it-works" className="hover:text-brand-text transition-colors">How it works</Link>
            <Link href="#product" className="hover:text-brand-text transition-colors">Product</Link>
            <Link href="#extension" className="hover:text-brand-text transition-colors">Extension</Link>
            <Link href="#customers" className="hover:text-brand-text transition-colors">Customers</Link>
            <Link href="#pricing" className="hover:text-brand-text transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Link href="/dashboard">
                  <Button className="rounded-sm bg-brand-text text-brand-bg hover:bg-brand hover:text-brand-bg transition-colors font-semibold px-6 h-9">
                    Go to Dashboard <ChevronRight className="ml-1 w-3 h-3" />
                  </Button>
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link href="/sign-in" className="font-mono text-sm text-brand-text hover:text-brand transition-colors">
                  Log In
                </Link>
                <Link href="/sign-up">
                  <Button className="rounded-sm bg-brand-text text-brand-bg hover:bg-brand hover:text-brand-bg transition-colors font-semibold px-6 h-9">
                    Start Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-24 overflow-hidden border-b border-brand-border">
        {/* Dynamic Aurora & Grid Background */}
        <div className="absolute inset-0 w-full h-full bg-brand-bg opacity-90 animate-aurora pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at top left, rgba(226,90,52,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(226,90,52,0.1) 0%, transparent 40%)" }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <FloatingParticles />
        
        {/* 2D Interactive Cursor Grid */}
        <InteractiveGrid />

        <motion.div 
          className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl space-y-8"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-brand-border bg-brand-surface font-mono text-xs text-brand-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              AI for Bharat Hackathon 2026
            </motion.div>
            
            <motion.h1 variants={fadeUp} custom={1} className="font-heading text-6xl md:text-8xl leading-[1.05] tracking-tight">
              Onboard new developers in hours, <span className="text-brand-muted italic">not weeks.</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} custom={2} className="font-mono text-sm md:text-base text-brand-muted max-w-3xl mx-auto leading-relaxed">
              AutoDev deeply analyzes your repositories, builds interactive architecture maps, and provides contextual AI guidance to get new hires shipping code instantly.
            </motion.p>
            
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/sign-up">
                <Button className="rounded-sm bg-brand hover:bg-white text-brand-bg h-12 px-8 text-base font-medium transition-colors">
                  Get Started Free <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard?demo=true">
                <Button variant="outline" className="rounded-sm border-brand-border bg-transparent hover:bg-brand-surface text-brand-text h-12 px-8 text-base transition-colors">
                  <Play className="mr-2 w-4 h-4" /> Try Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              variants={fadeUp} custom={4} 
              className="mt-16 w-full max-w-4xl mx-auto border border-brand-border rounded-sm bg-brand-surface overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-bg/50 pointer-events-none" />
              <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-border bg-brand-bg">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <div className="font-mono text-[10px] text-brand-muted ml-4">Terminal &middot; bash</div>
              </div>
              <AnimatedTerminal />
            </motion.div>

          </motion.div>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-brand-border bg-brand-surface scroll-mt-16 relative overflow-hidden">
        {/* Subtle motion background */}
        <div className="absolute inset-0 animate-aurora opacity-30 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 120%, rgba(226,90,52,0.05) 0%, transparent 70%)" }} />
        <FloatingParticles />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl mb-4">How it works</h2>
            <p className="font-mono text-sm text-brand-muted max-w-2xl mx-auto">Three simple steps to transition your team from reading generic docs to interacting with live codebase intelligence.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[28px] left-[16%] right-[16%] h-[1px] bg-brand-border" />
            
            {[
              { 
                step: "01",
                title: "Connect your repo", 
                desc: "Install the AutoDev GitHub App to grant read-only access. We pull your code into our secure, sandboxed environment.",
                Icon: Terminal
              },
              { 
                step: "02",
                title: "AI Analysis", 
                desc: "Our engine maps your entire application graph, tracing dependencies, recognizing frameworks, and identifying core logic paths.",
                Icon: Cpu
              },
              { 
                step: "03",
                title: "Team Onboarding", 
                desc: "Invite your new hires. They get immediate access to visual architecture maps, code walkthroughs, and a multilingual codebase Q&A bot.",
                Icon:Globe2 
              }
            ].map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center cursor-default bg-brand-surface p-6 rounded-sm border border-transparent hover:border-brand-border/50 hover:bg-brand-bg/50 transition-colors"
              >
                <div className="w-14 h-14 bg-brand-bg border border-brand-border rounded-sm flex items-center justify-center mb-6 shadow-sm">
                  <s.Icon className="w-6 h-6 text-brand" />
                </div>
                <div className="font-mono text-xs text-brand-muted mb-2 uppercase tracking-widest text-brand">Step {s.step}</div>
                <h3 className="font-heading text-2xl mb-3">{s.title}</h3>
                <p className="font-body text-sm text-brand-muted leading-relaxed max-w-xs">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURE DEEP DIVES ─── */}
      <section id="product" className="py-24 px-6 overflow-hidden scroll-mt-16">
        <div className="max-w-7xl mx-auto space-y-32">
          
          {/* Feature 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-brand-border bg-brand-surface font-mono text-xs text-brand">
                <GitBranch className="w-3 h-3" /> Visual Graph
              </div>
              <h2 className="font-heading text-4xl md:text-5xl leading-[1.1]">The Architecture Map</h2>
              <p className="font-body text-lg text-brand-muted leading-relaxed">
                Stop guessing how services connect. AutoDev generates a live, interactive map of your entire codebase. When your code updates, the map updates automatically.
              </p>
              <ul className="space-y-3 pt-4 font-mono text-sm text-brand-muted">
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-0.5" /> Visualize data flow between microservices.</li>
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-0.5" /> See database schema relationships mapped against API routes.</li>
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-0.5" /> Filter by tech stack components to isolate complex logic.</li>
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <div className="bg-brand-surface border border-brand-border rounded-sm p-4 h-[400px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#2A2726_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="p-4 bg-brand-bg border border-brand-border rounded-sm absolute top-10 left-10 shadow-xl z-10 w-48"
                >
                  <div className="font-mono text-[10px] text-brand-muted mb-1">FRONTEND</div>
                  <div className="font-heading text-lg">Next.js App</div>
                </motion.div>
                {/* Connecting Line 1 */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <motion.path 
                    d="M 230 80 Q 300 100 350 200" 
                    fill="none" 
                    className="stroke-brand-border stroke-[2px] opacity-50"
                    strokeDasharray="4 4" 
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  <circle r="4" fill="#E25A34" className="filter drop-shadow-md">
                    <animateMotion dur="3s" repeatCount="indefinite" path="M 230 80 Q 300 100 350 200" />
                  </circle>
                  <circle r="2" fill="#FFFFFF">
                    <animateMotion dur="3s" repeatCount="indefinite" path="M 230 80 Q 300 100 350 200" />
                  </circle>
                </svg>
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="p-4 bg-brand-bg border border-brand/50 rounded-sm absolute top-32 right-12 z-10 w-48 shadow-[0_0_30px_rgba(226,90,52,0.1)]"
                >
                  <div className="font-mono text-[10px] text-brand mb-1">BACKEND</div>
                  <div className="font-heading text-lg">Express API</div>
                  <div className="mt-2 pt-2 border-t border-brand-border font-mono text-[10px] text-brand-muted">REST + WebSockets</div>
                </motion.div>
                {/* Connecting Line 2 */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <motion.path 
                    d="M 400 280 Q 300 350 150 300" fill="none"
                    className="stroke-brand-border stroke-[2px] opacity-50"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                  />
                  <circle r="4" fill="#E25A34" className="filter drop-shadow-md">
                    <animateMotion dur="4s" repeatCount="indefinite" path="M 400 280 Q 300 350 150 300" />
                  </circle>
                  <circle r="2" fill="#FFFFFF">
                    <animateMotion dur="4s" repeatCount="indefinite" path="M 400 280 Q 300 350 150 300" />
                  </circle>
                </svg>
                <motion.div 
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="p-4 bg-brand-bg border border-brand-border rounded-sm absolute bottom-12 left-16 shadow-xl z-10 w-48"
                >
                  <div className="font-mono text-[10px] text-emerald-500 mb-1">DATABASE</div>
                  <div className="font-heading text-lg">PostgreSQL</div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Feature 2 (Reversed) */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-brand-border bg-brand-surface font-mono text-xs text-brand">
                <Shield className="w-3 h-3" /> Automated Code Reviews
              </div>
              <h2 className="font-heading text-4xl md:text-5xl leading-[1.1]">Catch drift before it merges</h2>
              <p className="font-body text-lg text-brand-muted leading-relaxed">
                Our AI doesn&apos;t just look for syntax errors. It understands your unique architectural patterns. If a new developer violates a convention, AutoDev catches it in the PR.
              </p>
              <div className="pt-2">
                <Link href="/demo" className="font-mono text-sm text-brand-text hover:text-brand flex items-center gap-2 transition-colors">
                  Explore conventions checker <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <AnimatedCodeReview />
            </motion.div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-brand-border bg-brand-surface font-mono text-xs text-brand">
                <Globe2 className="w-3 h-3" /> Global Diversity
              </div>
              <h2 className="font-heading text-4xl md:text-5xl leading-[1.1]">Multilingual Q&A</h2>
              <p className="font-body text-lg text-brand-muted leading-relaxed">
                Developers learn best in their native context. AutoDev can answer complex architectural questions in English, Hindi, Tamil, Telugu, and more—making codebase intelligence accessible to everyone.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <AnimatedQA />
            </motion.div>
          </div>

          {/* Feature 4 — Animated Walkthroughs */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-brand-border bg-brand-surface font-mono text-xs text-brand">
                <Map className="w-3 h-3" /> Animated Architecture Maps
              </div>
              <h2 className="font-heading text-4xl md:text-5xl leading-[1.1]">Watch your system come alive</h2>
              <p className="font-body text-lg text-brand-muted leading-relaxed">
                See how a real request travels through your entire stack — node by node, service by service. AutoDev animates the exact execution path so every new developer understands the system in minutes, not weeks.
              </p>
              <ul className="space-y-3 pt-4 font-mono text-sm text-brand-muted">
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-0.5" /> Nodes highlight sequentially showing real request flows.</li>
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-0.5" /> Click any node to pause and get an AI explanation.</li>
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-0.5" /> Fresher Mode simplifies explanations for junior devs.</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <AnimatedWalkthrough />
            </motion.div>
          </div>

          {/* Feature 5 — VS Code Extension / Code Canvas */}
          <div id="extension" className="flex flex-col md:flex-row items-center gap-12 lg:gap-20 scroll-mt-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-brand-border bg-brand-surface font-mono text-xs text-brand">
                <Monitor className="w-3 h-3" /> VS Code Extension
              </div>
              <h2 className="font-heading text-4xl md:text-5xl leading-[1.1]">Architecture inside your editor</h2>
              <p className="font-body text-lg text-brand-muted leading-relaxed">
                The AutoDev VS Code extension brings the full architecture canvas directly into your IDE. Open Code Canvas with one command — hover to preview, click to inspect, jump to files instantly.
              </p>
              <ul className="space-y-3 pt-4 font-mono text-sm text-brand-muted">
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-0.5" /> 3-panel layout: Explorer + Canvas + Detail — zero context switching.</li>
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-0.5" /> CodeLens annotations above every key function and class.</li>
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-0.5" /> Ask questions in Hindi, Tamil, Telugu — right in the Q&A panel.</li>
              </ul>
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 font-mono text-xs text-brand-muted border border-brand-border bg-brand-surface px-3 py-1.5">
                  <code className="text-brand">Ctrl+Shift+P</code> → AutoDev: Open Code Canvas
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <AnimatedVSCode />
            </motion.div>
          </div>

          {/* Feature 6 — Learning Progress Dashboard */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex-1 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-brand-border bg-brand-surface font-mono text-xs text-brand">
                <BarChart2 className="w-3 h-3" /> Learning Progress
              </div>
              <h2 className="font-heading text-4xl md:text-5xl leading-[1.1]">Measure onboarding in real time</h2>
              <p className="font-body text-lg text-brand-muted leading-relaxed">
                Stop guessing if a new developer is ready. AutoDev tracks every walkthrough, every question, every module explored — and shows you exactly where their knowledge gaps are.
              </p>
              <ul className="space-y-3 pt-4 font-mono text-sm text-brand-muted">
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-0.5" /> Per-module skill scores updated in real time.</li>
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-0.5" /> Team leaderboard — see who&apos;s onboarding fastest.</li>
                <li className="flex items-start gap-3"><Check className="w-4 h-4 text-emerald-400 mt-0.5" /> AI recommendation: &quot;Ready for first contribution.&quot;</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="flex-1 w-full"
            >
              <AnimatedProgress />
            </motion.div>
          </div>

        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="py-24 px-6 border-t border-brand-border bg-brand-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl mb-4">Everything in one platform</h2>
            <p className="font-mono text-sm text-brand-muted max-w-2xl mx-auto">From architecture maps to VS Code integration — AutoDev covers every touchpoint in the developer onboarding journey.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { Icon: Map, title: "Animated Architecture Maps", desc: "Step-by-step animated flows showing how requests travel through your entire stack — node by node." },
              { Icon: Monitor, title: "VS Code Code Canvas", desc: "Full-screen interactive architecture panel inside your editor. 3-panel layout: explorer, canvas, detail." },
              { Icon: Globe2, title: "Multilingual Q&A", desc: "Ask questions and get answers in Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, or English." },
              { Icon: BookOpen, title: "Guided Walkthroughs", desc: "AI-generated step-by-step code tours with file highlights and contextual explanations at every step." },
              { Icon: BarChart2, title: "Learning Progress Dashboard", desc: "Real-time skill scores, question history, and team leaderboard to track onboarding across your org." },
              { Icon: Settings2, title: "Environment Setup Autopilot", desc: "AI scans your repo and generates a verified setup guide — detects conflicts, missing docs, and prerequisites." },
              { Icon: Mic, title: "Voice Q&A", desc: "Speak your question and receive an audio response — accessibility-first code explanations via AWS Bedrock." },
              { Icon: Users, title: "Team Leaderboard", desc: "Compare onboarding speed across your entire engineering team and surface who needs extra support." },
              { Icon: Zap, title: "GitHub App Integration", desc: "Auto-analyze repos on install. Get AI-powered onboarding comments on every new PR opened." },
              { Icon: FileCode2, title: "CodeLens Annotations", desc: "Inline architecture context above key functions — see call counts, writes, and module ownership at a glance." },
              { Icon: Languages, title: "Fresher Mode", desc: "Toggle simplified explanations designed for junior developers entering their first real production codebase." },
              { Icon: Shield, title: "Convention Checker", desc: "AI detects project-specific coding conventions and flags violations in PRs before they reach production." },
            ].map(({ Icon, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.07 }}
                className="border border-brand-border bg-brand-bg p-6 hover:border-brand/40 hover:bg-brand-card transition-colors group"
              >
                <Icon className="w-5 h-5 text-brand mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-heading text-lg mb-2">{title}</h3>
                <p className="font-mono text-xs text-brand-muted leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROFILES / WHO USES AUTODEV ─── */}
      <section id="customers" className="py-24 px-6 border-t border-brand-border bg-brand-bg scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-brand-border bg-brand-surface font-mono text-xs text-brand">
                <Users className="w-3 h-3" /> Real Developers, Real Results
              </div>
              <h2 className="font-heading text-4xl md:text-5xl">Built for every developer in India</h2>
              <p className="font-mono text-sm text-brand-muted max-w-2xl mx-auto">
                From freshers joining their first startup to senior engineers rotating across enterprise projects — AutoDev works for every stage of your career.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {[
              {
                initials: "RS",
                name: "Rahul Sharma",
                role: "Junior Developer",
                company: "Fintech Startup, Bengaluru",
                color: "#E25A34",
                lang: "Hindi",
                story: "Joined a 3-year-old fintech codebase with zero documentation. AutoDev gave me a live animated map of the entire payment flow — explained in Hindi. I felt like I had a senior sitting next to me.",
                features: ["Fresher Mode", "Hindi Q&A", "Animated Maps"],
                before: "3 weeks",
                after: "2 days",
                metric: "to first PR",
              },
              {
                initials: "PK",
                name: "Priya Krishnamurthy",
                role: "Senior Software Engineer",
                company: "IT Services firm, Chennai",
                color: "#60a5fa",
                lang: "English",
                story: "Our team rotates across 5 projects every year. With AutoDev's Code Canvas in VS Code, I understand any new codebase in an afternoon — not a week of shadowing seniors.",
                features: ["VS Code Canvas", "Walkthroughs", "Convention Checker"],
                before: "1 week",
                after: "2 hours",
                metric: "per project rotation",
              },
              {
                initials: "AM",
                name: "Arjun Mehta",
                role: "Engineering Manager",
                company: "B2B SaaS company, Pune",
                color: "#34d399",
                lang: "English",
                story: "I manage 12 developers across 3 time zones. The team leaderboard shows exactly who's onboarding well and who needs support — before they fall behind and start asking the same questions.",
                features: ["Team Leaderboard", "Progress Dashboard", "GitHub App"],
                before: "No visibility",
                after: "Full tracking",
                metric: "across team onboarding",
              },
              {
                initials: "DS",
                name: "Divya Subramanian",
                role: "Full Stack Developer",
                company: "Remote freelancer, Coimbatore",
                color: "#a78bfa",
                lang: "Tamil",
                story: "English documentation always slowed me down on client projects. AutoDev explains complex architecture patterns in Tamil — I can focus on actually understanding the code, not translating it.",
                features: ["Tamil Q&A", "Voice Q&A", "Env Setup Autopilot"],
                before: "Language barrier",
                after: "Explained in Tamil",
                metric: "zero translation overhead",
              },
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 2) * 0.1 }}
                className="border border-brand-border bg-brand-surface hover:border-brand/30 transition-colors group"
                style={{ borderLeftWidth: 3, borderLeftColor: p.color }}
              >
                {/* Header */}
                <div className="p-6 pb-4 flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-sm flex items-center justify-center font-heading font-bold text-sm shrink-0"
                    style={{ backgroundColor: `${p.color}20`, color: p.color, border: `1px solid ${p.color}40` }}
                  >
                    {p.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading text-base text-brand-text">{p.name}</div>
                    <div className="font-mono text-[11px] text-brand-muted">{p.role}</div>
                    <div className="font-mono text-[10px] text-brand-muted/60 mt-0.5">{p.company}</div>
                  </div>
                  <div
                    className="ml-auto font-mono text-[9px] px-2 py-1 shrink-0"
                    style={{ color: p.color, backgroundColor: `${p.color}15`, border: `1px solid ${p.color}30` }}
                  >
                    {p.lang}
                  </div>
                </div>

                {/* Quote */}
                <div className="px-6 pb-4">
                  <p className="font-body text-sm text-brand-muted leading-relaxed">
                    &ldquo;{p.story}&rdquo;
                  </p>
                </div>

                {/* Feature tags */}
                <div className="px-6 pb-4 flex flex-wrap gap-2">
                  {p.features.map((f) => (
                    <span key={f} className="font-mono text-[10px] px-2 py-1 border border-brand-border text-brand-muted bg-brand-bg">
                      {f}
                    </span>
                  ))}
                </div>

                {/* Before → After */}
                <div className="mx-6 mb-6 border-t border-brand-border pt-4 flex items-center gap-4 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-brand-muted/50 line-through">{p.before}</span>
                    <ChevronRight className="w-3 h-3" style={{ color: p.color }} />
                    <span className="font-semibold" style={{ color: p.color }}>{p.after}</span>
                  </div>
                  <span className="text-brand-muted/60 text-[10px]">{p.metric}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-brand-border pt-12">
            {[
              { stat: "4.3M+", label: "INDIAN DEVELOPERS", sub: "target market" },
              { stat: "2 hrs", label: "AVG. ONBOARDING", sub: "down from 2–4 weeks" },
              { stat: "7", label: "LANGUAGES", sub: "Hindi, Tamil, Telugu + more" },
              { stat: "90%", label: "COST REDUCTION", sub: "vs manual onboarding" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="border border-brand-border bg-brand-surface p-6 flex flex-col items-center text-center"
              >
                <div className="font-heading text-3xl mb-1 text-brand-text">{s.stat}</div>
                <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider">{s.label}</div>
                <div className="font-mono text-[9px] text-brand-muted/50 mt-1">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIAL ─── */}
      <section className="py-24 px-6 border-t border-brand-border bg-brand-surface relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand opacity-5 blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-brand-border bg-brand-bg p-8 md:p-12 text-left relative"
            style={{ borderLeftWidth: 3, borderLeftColor: "#E25A34" }}
          >
            <span className="font-heading text-8xl text-brand absolute top-4 left-6 opacity-15">&ldquo;</span>
            <blockquote className="relative z-10 font-heading text-2xl md:text-3xl leading-snug mb-8">
              AutoDev fundamentally changed how we scale our engineering team. What used to take 3 weeks of shadowing and paired programming now happens asynchronously over a weekend. The animated architecture map is genuinely magic.
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-brand/20 border border-brand/30 flex items-center justify-center font-heading font-bold text-sm text-brand">
                PS
              </div>
              <div>
                <div className="font-bold text-brand-text">Priya Sharma</div>
                <div className="font-mono text-xs text-brand-muted uppercase tracking-wider">VP of Engineering, Series B Startup</div>
              </div>
              <div className="ml-auto hidden md:flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 text-brand">★</div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 px-6 border-t border-brand-border bg-brand-bg scroll-mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl mb-4">Simple, predictable pricing</h2>
            <p className="font-mono text-sm text-brand-muted max-w-2xl mx-auto">Start instantly. Scale perfectly. No hidden repository fees.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="border border-brand-border bg-brand-surface rounded-sm p-8 flex flex-col">
              <div className="font-mono text-xs text-brand-muted mb-2 uppercase tracking-widest">Open Source</div>
              <div className="font-heading text-4xl mb-6">Free</div>
              <ul className="space-y-4 mb-8 flex-1 font-mono text-sm text-brand-text">
                <li className="flex gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Public repositories only</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Architecture maps + animated flows</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> 100 Q&A queries/month (English)</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> VS Code extension included</li>
              </ul>
              <Button variant="outline" className="w-full rounded-sm border-brand-border bg-transparent hover:bg-brand-card text-brand-text transition-colors">
                Start for Free
              </Button>
            </div>

            {/* Pro Tier */}
            <div className="border border-brand relative bg-brand-surface rounded-sm p-8 flex flex-col shadow-[0_0_30px_rgba(226,90,52,0.05)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-brand text-brand-bg font-mono text-[10px] uppercase tracking-widest rounded-sm border border-brand-border">
                Most Popular
              </div>
              <div className="font-mono text-xs text-brand mb-2 uppercase tracking-widest">Developer</div>
              <div className="font-heading text-4xl mb-1">$29<span className="text-lg text-brand-muted font-mono font-normal tracking-normal">/user/mo</span></div>
              <div className="font-mono text-[10px] text-brand-muted mb-6">Billed annually</div>
              <ul className="space-y-4 mb-8 flex-1 font-mono text-sm text-brand-text">
                <li className="flex gap-3"><Check className="w-4 h-4 text-brand shrink-0 mt-0.5" /> Unlimited private repos</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-brand shrink-0 mt-0.5" /> Animated maps + guided walkthroughs</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-brand shrink-0 mt-0.5" /> Unlimited multilingual Q&A (7 languages)</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-brand shrink-0 mt-0.5" /> VS Code Code Canvas + CodeLens</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-brand shrink-0 mt-0.5" /> Learning progress + team leaderboard</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-brand shrink-0 mt-0.5" /> AI PR convention reviews</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-brand shrink-0 mt-0.5" /> Voice Q&A + Fresher Mode</li>
              </ul>
              <Button className="w-full rounded-sm bg-brand-text hover:bg-brand text-brand-bg hover:text-brand-bg transition-colors">
                Upgrade to Pro
              </Button>
            </div>

            {/* Enterprise Tier */}
            <div className="border border-brand-border bg-brand-surface rounded-sm p-8 flex flex-col md:col-span-2 lg:col-span-1">
              <div className="font-mono text-xs text-brand-muted mb-2 uppercase tracking-widest">Enterprise</div>
              <div className="font-heading text-4xl mb-6">Custom</div>
              <ul className="space-y-4 mb-8 flex-1 font-mono text-sm text-brand-text">
                <li className="flex gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Everything in Developer, unlimited seats</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Self-hosted Bedrock model options</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> VPC peering & SSO / SAML setup</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Dedicated success manager</li>
              </ul>
              <Button variant="outline" className="w-full rounded-sm border-brand-border bg-transparent hover:bg-brand-card text-brand-text transition-colors">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="py-32 px-6 bg-brand-surface text-center border-t border-brand-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand/5 pointer-events-none" />
        <div className="max-w-2xl mx-auto relative z-10 space-y-8">
          <h2 className="font-heading text-5xl md:text-6xl tracking-tight">Ready to eliminate your onboarding bottleneck?</h2>
          <p className="font-mono text-brand-muted max-w-lg mx-auto">Join hundreds of high-performing engineering teams using AutoDev to scale efficiently.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/sign-up">
              <Button className="rounded-sm flex border border-transparent bg-brand-text hover:bg-brand text-brand-bg hover:text-brand-bg h-14 px-8 text-base font-semibold transition-colors">
                Start Building Free <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard?demo=true">
              <Button variant="outline" className="rounded-sm border-brand-border bg-brand-bg hover:bg-brand-card text-brand-text h-14 px-8 text-base transition-colors">
                <Play className="mr-2 w-4 h-4" /> Try Demo First
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-brand-border bg-brand-bg pt-20 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2 space-y-6">
            <Link 
              href="/" 
              onClick={(e) => {
                if (window.location.pathname === "/") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="flex items-center gap-2"
            >
              <div className="w-6 h-6 bg-brand rounded-sm flex items-center justify-center">
                <Code2 className="w-3 h-3 text-brand-bg" />
              </div>
              <span className="font-heading font-semibold text-lg tracking-tight">AutoDev</span>
            </Link>
            <p className="font-mono text-xs text-brand-muted max-w-xs leading-relaxed">
              The AI-powered onboarding engine that translates arbitrary codebases into accessible, multimodal knowledge maps and automated reviews.
            </p>
          </div>
          <div className="space-y-4">
            <div className="font-heading font-semibold text-brand-text">Product</div>
            <ul className="space-y-3 font-mono text-xs text-brand-muted flex flex-col items-start">
              <li><Link href="#product" className="hover:text-brand transition-colors">Architecture Maps</Link></li>
              <li><Link href="#extension" className="hover:text-brand transition-colors">VS Code Extension</Link></li>
              <li><Link href="#product" className="hover:text-brand transition-colors">Multilingual Q&A</Link></li>
              <li><Link href="#pricing" className="hover:text-brand transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="font-heading font-semibold text-brand-text">Developers</div>
            <ul className="space-y-3 font-mono text-xs text-brand-muted flex flex-col items-start">
              <li><Link href="/dashboard" className="hover:text-brand transition-colors">Demo Dashboard</Link></li>
              <li><Link href="#" className="hover:text-brand transition-colors">API Reference</Link></li>
              <li><Link href="#" className="hover:text-brand transition-colors">GitHub App</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="font-heading font-semibold text-brand-text">Company</div>
            <ul className="space-y-3 font-mono text-xs text-brand-muted flex flex-col items-start">
              <li><Link href="#" className="hover:text-brand transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-brand transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-brand transition-colors">Careers</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-brand-border pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-mono text-xs text-brand-muted">
            © 2026 AutoDev Inc. All rights reserved. Built for AI for Bharat.
          </div>
          <div className="flex items-center gap-6 font-mono text-xs text-brand-muted">
            <Link href="#" className="hover:text-brand-text transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-brand-text transition-colors">Terms of Service</Link>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
