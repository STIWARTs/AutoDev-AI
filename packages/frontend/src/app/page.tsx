"use client";

import { motion, Variants, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRight, Code2, Cpu, Globe2, GitBranch, Terminal, Shield, Sparkles, Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InteractiveGrid } from "@/components/InteractiveGrid";

// Particle component for background
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-brand rounded-full opacity-20"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
          }}
          animate={{
            y: [null, Math.random() * -500],
            opacity: [0.2, 0.5, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
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
          <span className="text-brand-DEFAULT">$</span> {step === 0 ? typedText : fullText}
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
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-brand-DEFAULT mt-4 font-semibold">
            Generating multilingual walkthroughs (Hindi, Tamil, English)...
            <span className="inline-block w-2 h-4 bg-brand-DEFAULT animate-pulse align-middle ml-1" />
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
            <div className="w-1.5 h-4 bg-brand-DEFAULT animate-pulse" />
            <span className="text-brand-muted text-[10px] sm:text-xs ml-2 animate-pulse uppercase tracking-widest">AutoDev AI Reviewing...</span>
          </div>
        ) : <div className="h-6" />}
        
        {step < 2 && (
          <motion.div 
            className="absolute top-0 left-0 w-full h-[2px] bg-brand-DEFAULT/50 shadow-[0_0_10px_rgba(226,90,52,0.8)]"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
      
      <div className="h-[120px]">
        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 bg-brand-bg border border-brand-border p-4 rounded-sm">
            <div className="w-6 h-6 rounded-full bg-brand-DEFAULT flex items-center justify-center shrink-0 mt-0.5">
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
             <div className="bg-brand-DEFAULT/20 text-brand-DEFAULT border border-brand-DEFAULT/30 rounded-sm rounded-tl-none px-4 py-3 flex gap-1 items-center">
               <span className="w-1.5 h-1.5 bg-brand-DEFAULT rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
               <span className="w-1.5 h-1.5 bg-brand-DEFAULT rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
               <span className="w-1.5 h-1.5 bg-brand-DEFAULT rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
             </div>
          </motion.div>
        )}

        {step >= 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex justify-start"
          >
            <div className="bg-brand-DEFAULT text-brand-bg rounded-sm rounded-tl-none px-4 py-3 max-w-[85%] inline-block text-[13px] leading-relaxed shadow-lg">
              <p className="font-semibold mb-2">ज़रूर!</p>
              <p className="mb-2">इस प्रोजेक्ट में, ऑथेंटिकेशन <code>src/middleware/auth.ts</code> में संभाला गया है।</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>यह रिक्वेस्ट हेडर से JWT टोकन निकालता है।</li>
                <li><code>jsonwebtoken</code> लाइब्रेरी का उपयोग करके टोकन को वेरीफाई करता है।</li>
                <li>अगर टोकन सही है, तो यह यूज़र डेटा को <code>req.user</code> में डाल देता है ताकि आगे इस्तेमाल हो सके।</li>
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

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

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

  return (
    <main className="min-h-screen bg-brand-bg text-brand-text font-body selection:bg-brand-DEFAULT/30 overflow-x-hidden">
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
            <div className="w-8 h-8 bg-brand-DEFAULT rounded-sm flex items-center justify-center">
              <Code2 className="w-4 h-4 text-brand-bg" />
            </div>
            <span className="font-heading font-semibold text-xl tracking-tight">AutoDev</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest text-brand-muted">
            <Link href="#how-it-works" className="hover:text-brand-text transition-colors">How it works</Link>
            <Link href="#product" className="hover:text-brand-text transition-colors">Product</Link>
            <Link href="#customers" className="hover:text-brand-text transition-colors">Customers</Link>
            <Link href="#pricing" className="hover:text-brand-text transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="font-mono text-sm text-brand-text hover:text-brand-DEFAULT transition-colors">
              Log In
            </Link>
            <Button className="rounded-sm bg-brand-text text-brand-bg hover:bg-brand-DEFAULT hover:text-brand-bg transition-colors font-semibold px-6 h-9">
              Start Free
            </Button>
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
              <span className="w-1.5 h-1.5 rounded-full bg-brand-DEFAULT animate-pulse" />
              AI for Bharat Hackathon 2026
            </motion.div>
            
            <motion.h1 variants={fadeUp} custom={1} className="font-heading text-6xl md:text-8xl leading-[1.05] tracking-tight">
              Onboard new developers in hours, <span className="text-brand-muted italic">not weeks.</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} custom={2} className="font-mono text-sm md:text-base text-brand-muted max-w-3xl mx-auto leading-relaxed">
              AutoDev deeply analyzes your repositories, builds interactive architecture maps, and provides contextual AI guidance to get new hires shipping code instantly.
            </motion.p>
            
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button className="rounded-sm bg-brand-DEFAULT hover:bg-white text-brand-bg h-12 px-8 text-base font-medium transition-colors">
                Connect Repository <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
              <Link href="/demo">
                <Button variant="outline" className="rounded-sm border-brand-border bg-transparent hover:bg-brand-surface text-brand-text h-12 px-8 text-base transition-colors">
                  <Play className="mr-2 w-4 h-4" /> Watch the Demo
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
                  <s.Icon className="w-6 h-6 text-brand-DEFAULT" />
                </div>
                <div className="font-mono text-xs text-brand-muted mb-2 uppercase tracking-widest text-brand-DEFAULT">Step {s.step}</div>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-brand-border bg-brand-surface font-mono text-xs text-brand-DEFAULT">
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
                  className="p-4 bg-brand-bg border border-brand-DEFAULT/50 rounded-sm absolute top-32 right-12 z-10 w-48 shadow-[0_0_30px_rgba(226,90,52,0.1)]"
                >
                  <div className="font-mono text-[10px] text-brand-DEFAULT mb-1">BACKEND</div>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-brand-border bg-brand-surface font-mono text-xs text-brand-DEFAULT">
                <Shield className="w-3 h-3" /> Automated Code Reviews
              </div>
              <h2 className="font-heading text-4xl md:text-5xl leading-[1.1]">Catch drift before it merges</h2>
              <p className="font-body text-lg text-brand-muted leading-relaxed">
                Our AI doesn't just look for syntax errors. It understands your unique architectural patterns. If a new developer violates a convention, AutoDev catches it in the PR.
              </p>
              <div className="pt-2">
                <Link href="/demo" className="font-mono text-sm text-brand-text hover:text-brand-DEFAULT flex items-center gap-2 transition-colors">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-brand-border bg-brand-surface font-mono text-xs text-brand-DEFAULT">
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

        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section id="customers" className="py-24 px-6 border-t border-brand-border bg-brand-bg relative overflow-hidden scroll-mt-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-DEFAULT opacity-5 blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-16">
          <h2 className="font-heading text-4xl">Trusted by teams scaling fast</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { stat: "4.3M+", label: "INDIAN DEVELOPERS" },
              { stat: "10k+", label: "REPOS ANALYZED" },
              { stat: "-80%", label: "ONBOARDING TIME" },
              { stat: "99.9%", label: "UPTIME SLA" },
            ].map((s, i) => (
              <div key={i} className="border border-brand-border bg-brand-surface p-6 rounded-sm flex flex-col items-center justify-center">
                <div className="font-heading text-3xl mb-1 text-brand-text">{s.stat}</div>
                <div className="font-mono text-[10px] text-brand-muted uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="border border-brand-border bg-brand-surface rounded-sm p-8 md:p-12 text-left relative">
            <span className="font-heading text-8xl text-brand-DEFAULT absolute top-4 left-6 opacity-20">"</span>
            <blockquote className="relative z-10 font-heading text-2xl md:text-3xl leading-snug mb-8">
              AutoDev fundamentally changed how we scale our engineering team. What used to take 3 weeks of shadowing and paired programming is now done asynchronously over a weekend. The animated data flow graph is magic.
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-card border border-brand-border rounded-sm" />
              <div>
                <div className="font-bold text-brand-text">Priya Sharma</div>
                <div className="font-mono text-xs text-brand-muted uppercase tracking-wider">VP of Engineering, Acme Corp</div>
              </div>
            </div>
          </div>
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
                <li className="flex gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Basic architecture mapping</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> 100 native Q&A queries/month</li>
              </ul>
              <Button variant="outline" className="w-full rounded-sm border-brand-border bg-transparent hover:bg-brand-card text-brand-text transition-colors">
                Start for Free
              </Button>
            </div>

            {/* Pro Tier */}
            <div className="border border-brand-DEFAULT relative bg-brand-surface rounded-sm p-8 flex flex-col shadow-[0_0_30px_rgba(226,90,52,0.05)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-brand-DEFAULT text-brand-bg font-mono text-[10px] uppercase tracking-widest rounded-sm border border-brand-border">
                Most Popular
              </div>
              <div className="font-mono text-xs text-brand-DEFAULT mb-2 uppercase tracking-widest">Developer</div>
              <div className="font-heading text-4xl mb-1">$29<span className="text-lg text-brand-muted font-mono font-normal tracking-normal">/user/mo</span></div>
              <div className="font-mono text-[10px] text-brand-muted mb-6">Billed annually</div>
              <ul className="space-y-4 mb-8 flex-1 font-mono text-sm text-brand-text">
                <li className="flex gap-3"><Check className="w-4 h-4 text-brand-DEFAULT shrink-0 mt-0.5" /> Unlimited private repos</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-brand-DEFAULT shrink-0 mt-0.5" /> Multi-service architecture tracing</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-brand-DEFAULT shrink-0 mt-0.5" /> Unlimited multilingual Q&A</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-brand-DEFAULT shrink-0 mt-0.5" /> AI PR convention reviews</li>
              </ul>
              <Button className="w-full rounded-sm bg-brand-text hover:bg-brand-DEFAULT text-brand-bg hover:text-brand-bg transition-colors">
                Upgrade to Pro
              </Button>
            </div>

            {/* Enterprise Tier */}
            <div className="border border-brand-border bg-brand-surface rounded-sm p-8 flex flex-col md:col-span-2 lg:col-span-1">
              <div className="font-mono text-xs text-brand-muted mb-2 uppercase tracking-widest">Enterprise</div>
              <div className="font-heading text-4xl mb-6">Custom</div>
              <ul className="space-y-4 mb-8 flex-1 font-mono text-sm text-brand-text">
                <li className="flex gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> Self-hosted model options</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> VPC peering & SSO setup</li>
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-DEFAULT/5 pointer-events-none" />
        <div className="max-w-2xl mx-auto relative z-10 space-y-8">
          <h2 className="font-heading text-5xl md:text-6xl tracking-tight">Ready to eliminate your onboarding bottleneck?</h2>
          <p className="font-mono text-brand-muted max-w-lg mx-auto">Join hundreds of high-performing engineering teams using AutoDev to scale efficiently.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button className="rounded-sm flex border border-transparent bg-brand-text hover:bg-brand-DEFAULT text-brand-bg hover:text-brand-bg h-14 px-8 text-base font-semibold transition-colors">
              Start Building Free <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
            <Button variant="outline" className="rounded-sm border-brand-border bg-brand-bg hover:bg-brand-card text-brand-text h-14 px-8 text-base transition-colors">
              Talk to Sales
            </Button>
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
              <div className="w-6 h-6 bg-brand-DEFAULT rounded-sm flex items-center justify-center">
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
              <li><Link href="#" className="hover:text-brand-DEFAULT transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-brand-DEFAULT transition-colors">Integrations</Link></li>
              <li><Link href="#" className="hover:text-brand-DEFAULT transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-brand-DEFAULT transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="font-heading font-semibold text-brand-text">Developers</div>
            <ul className="space-y-3 font-mono text-xs text-brand-muted flex flex-col items-start">
              <li><Link href="#" className="hover:text-brand-DEFAULT transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-brand-DEFAULT transition-colors">API Reference</Link></li>
              <li><Link href="#" className="hover:text-brand-DEFAULT transition-colors">GitHub Check Status</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="font-heading font-semibold text-brand-text">Company</div>
            <ul className="space-y-3 font-mono text-xs text-brand-muted flex flex-col items-start">
              <li><Link href="#" className="hover:text-brand-DEFAULT transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-brand-DEFAULT transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-brand-DEFAULT transition-colors">Careers</Link></li>
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
