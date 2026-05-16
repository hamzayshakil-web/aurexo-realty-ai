"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion, useInView, useScroll, useTransform, AnimatePresence, type Variants,
} from "framer-motion";
import {
  Building2, Zap, Users, CalendarDays, ArrowRight, CheckCircle2,
  BarChart3, MessageSquare, Globe, Star, PhoneCall, Bot, Mail,
  Menu, X, TrendingUp, Shield, Clock, ChevronRight,
} from "lucide-react";
import { InquiryForm } from "@/components/public/InquiryForm";

// ── Easing & variants ───────────────────────────────────────────────
const EASE = "easeOut" as const;

const fadeUp: Variants = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } };
const fadeIn: Variants = { hidden: { opacity: 0 },         show: { opacity: 1 } };
const stagger = (s = 0.12): Variants => ({ hidden: {}, show: { transition: { staggerChildren: s } } });
const T = (d = 0.8, delay = 0) => ({ duration: d, ease: EASE, delay });

// ── Count-up hook ───────────────────────────────────────────────────
function useCountUp(target: number, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const step = target / 80;
    const id = setInterval(() => {
      v += step;
      if (v >= target) { setCount(target); clearInterval(id); }
      else setCount(Math.floor(v));
    }, 16);
    return () => clearInterval(id);
  }, [inView, target]);
  return count;
}

// ── Data ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Users,         title: "Smart Lead Management",   desc: "Capture, qualify, and score leads instantly. AI ranks every enquiry so you always call the right person first." },
  { icon: Building2,     title: "Property Portfolio",      desc: "Manage your entire inventory with rich details and real-time availability — always at your fingertips." },
  { icon: CalendarDays,  title: "Appointment Scheduling",  desc: "Book viewings and follow-ups effortlessly. Automated reminders reduce no-shows by up to 60%." },
  { icon: Zap,           title: "n8n Automation Engine",   desc: "Connect n8n workflows to automate emails, Telegram alerts, lead capture, and more — no coding required." },
  { icon: BarChart3,     title: "Pipeline Analytics",      desc: "Track conversion rates, revenue, and agent performance with real-time dashboards." },
  { icon: MessageSquare, title: "Multi-Channel Outreach",  desc: "Reach leads via email and Telegram from a single platform. Every conversation in one place." },
];

const STATS = [
  { value: 3,  suffix: "×",  label: "Faster Lead Response" },
  { value: 60, suffix: "%",  label: "Fewer No-Shows" },
  { value: 40, suffix: "%",  label: "Higher Conversion" },
  { value: 10, suffix: "hr", label: "Saved Per Week" },
];

const TESTIMONIALS = [
  { name: "Ahmed Al Mansouri", role: "Principal Broker, Dubai",     text: "Aurexo transformed how our team handles leads. We went from losing deals to closing them consistently.", rating: 5 },
  { name: "Sophie Laurent",    role: "Real Estate Investor, Paris", text: "The automation features are incredible. My agent gets alerts the moment I show interest in a property.", rating: 5 },
  { name: "Marcus Webb",       role: "Property Developer, London",  text: "Finally a CRM built specifically for real estate. The pipeline view alone is worth the subscription.", rating: 5 },
];

const PLANS = [
  {
    name: "Starter", price: "Free", period: "14-day trial",
    desc: "Perfect for solo agents.",
    features: ["Up to 50 leads", "3 automation workflows", "Email notifications", "AI lead scoring", "Appointment scheduling"],
    cta: "Start Free Trial", href: "/signup", highlight: false,
  },
  {
    name: "Pro", price: "AED 299", period: "/ month",
    desc: "For growing teams closing more deals.",
    features: ["Unlimited leads", "Unlimited workflows", "Email + Telegram alerts", "AI summaries & scoring", "Priority support", "Custom domain emails"],
    cta: "Get Started", href: "/signup", highlight: true,
  },
  {
    name: "Enterprise", price: "Custom", period: "contact us",
    desc: "For large agencies and brokerages.",
    features: ["Everything in Pro", "Dedicated account manager", "Custom integrations", "SLA guarantee", "White-label option", "Team analytics"],
    cta: "Contact Sales", href: "#inquiry", highlight: false,
  },
];

// ── Stat card ───────────────────────────────────────────────────────
function StatCard({ stat }: { stat: typeof STATS[0] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const count  = useCountUp(stat.value, inView);
  return (
    <motion.div ref={ref} variants={fadeUp} transition={T(0.7)} className="text-center">
      <p className="font-serif-luxury text-5xl sm:text-6xl font-light" style={{ color: "var(--lux-gold)" }}>
        {count}{stat.suffix}
      </p>
      <div className="lux-divider mx-auto w-8 my-3" />
      <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "var(--lux-cream-muted)" }}>{stat.label}</p>
    </motion.div>
  );
}

// ── Gold line divider ───────────────────────────────────────────────
function GoldDivider({ className = "" }: { className?: string }) {
  return <div className={`lux-divider ${className}`} />;
}

// ── Main ────────────────────────────────────────────────────────────
export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg     = useTransform(scrollY, [0, 100], ["rgba(10,9,8,0)", "rgba(10,9,8,0.97)"]);
  const navBorder = useTransform(scrollY, [0, 100], ["rgba(201,168,76,0)", "rgba(201,168,76,0.18)"]);

  const statsRef   = useRef(null);
  const featRef    = useRef(null);
  const pricingRef = useRef(null);
  const inquiryRef = useRef(null);
  const statsInView   = useInView(statsRef,   { once: true, margin: "-80px" });
  const featInView    = useInView(featRef,     { once: true, margin: "-80px" });
  const priceInView   = useInView(pricingRef,  { once: true, margin: "-80px" });
  const inquiryInView = useInView(inquiryRef,  { once: true, margin: "-80px" });

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "var(--lux-bg)", color: "var(--lux-cream)" }}>

      {/* ── NAV ─────────────────────────────────────────────── */}
      <motion.nav
        style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex h-18 items-center justify-between py-4">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-sm border" style={{ borderColor: "var(--lux-gold-dark)", background: "rgba(201,168,76,0.08)" }}>
                <Building2 className="h-4 w-4" style={{ color: "var(--lux-gold)" }} />
              </div>
              <div>
                <span className="font-serif-luxury text-base font-semibold tracking-wider" style={{ color: "var(--lux-cream)" }}>AUREXO</span>
                <span className="block text-[9px] tracking-[0.35em] uppercase" style={{ color: "var(--lux-gold)" }}>Realty AI</span>
              </div>
            </motion.div>

            {/* Desktop links */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:flex items-center gap-10"
            >
              {[
                { label: "Features", href: "#features" },
                { label: "Pricing",  href: "#pricing" },
                { label: "Docs",     href: "#inquiry" },
                { label: "Blog",     href: "#inquiry" },
              ].map((item) => (
                <a key={item.label} href={item.href}
                  className="text-xs tracking-[0.18em] uppercase transition-colors duration-300 hover:opacity-100"
                  style={{ color: "var(--lux-cream-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--lux-gold)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--lux-cream-muted)")}
                >
                  {item.label}
                </a>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <Link href="/login" className="hidden sm:block">
                <button className="text-xs tracking-[0.15em] uppercase px-4 py-2 transition-colors duration-300"
                  style={{ color: "var(--lux-cream-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--lux-gold)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--lux-cream-muted)")}
                >
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  className="text-xs tracking-[0.15em] uppercase px-5 py-2.5 border transition-all duration-300"
                  style={{
                    borderColor: "var(--lux-gold)", color: "var(--lux-gold)",
                    background: "rgba(201,168,76,0.06)",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.15)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.06)"; }}
                >
                  Begin Free Trial
                </motion.button>
              </Link>
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 transition-colors"
                style={{ color: "var(--lux-cream-muted)" }}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
              className="md:hidden border-t overflow-hidden"
              style={{ borderColor: "var(--lux-border)", background: "var(--lux-surface)" }}
            >
              <div className="px-5 py-5 space-y-1">
                {[{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "Docs", href: "#inquiry" }, { label: "Blog", href: "#inquiry" }].map((item) => (
                  <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)}
                    className="block py-3 text-xs tracking-[0.18em] uppercase border-b"
                    style={{ color: "var(--lux-cream-muted)", borderColor: "var(--lux-border)" }}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-4 flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-3 text-xs tracking-widest uppercase border" style={{ borderColor: "var(--lux-border)", color: "var(--lux-cream-muted)" }}>Sign In</button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-3 text-xs tracking-widest uppercase border" style={{ borderColor: "var(--lux-gold)", color: "var(--lux-gold)", background: "rgba(201,168,76,0.08)" }}>Begin Free Trial</button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-16 px-5 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[140px]"
            style={{ background: "radial-gradient(ellipse, rgba(201,168,76,0.12) 0%, transparent 70%)" }}
          />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(var(--lux-gold) 1px, transparent 1px), linear-gradient(90deg, var(--lux-gold) 1px, transparent 1px)", backgroundSize: "80px 80px" }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center w-full">
          {/* Eyebrow */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={T(0.7)}>
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="h-px w-10" style={{ background: "var(--lux-gold)" }} />
              <span className="text-[10px] tracking-[0.4em] uppercase" style={{ color: "var(--lux-gold)" }}>
                AI-Powered Real Estate CRM
              </span>
              <div className="h-px w-10" style={{ background: "var(--lux-gold)" }} />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            transition={T(1.0, 0.1)}
            className="font-serif-luxury font-light leading-[1.08] mb-6"
            style={{ color: "var(--lux-cream)", fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
          >
            Close More Deals<br />
            with{" "}
            <em className="gold-luxury not-italic">Intelligent</em>
            <br />
            Real Estate Automation
          </motion.h1>

          {/* Thin gold divider */}
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={T(0.9, 0.5)}
            className="mx-auto w-24 h-px mb-8 origin-center"
            style={{ background: "linear-gradient(90deg, transparent, var(--lux-gold), transparent)" }}
          />

          {/* Subtitle */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={T(0.8, 0.4)}
            className="text-base sm:text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: "var(--lux-cream-muted)" }}
          >
            The all-in-one CRM built for modern real estate professionals. Automate follow-ups,
            qualify leads instantly, and never miss an opportunity.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={T(0.8, 0.55)}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(201,168,76,0.25)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-8 py-4 text-xs tracking-[0.2em] uppercase transition-all duration-300 w-full sm:w-auto justify-center"
                style={{ background: "var(--lux-gold)", color: "#0a0908" }}
              >
                Begin Your Free Trial
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </Link>
            <a href="#inquiry">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-8 py-4 text-xs tracking-[0.2em] uppercase border transition-all duration-300 w-full sm:w-auto justify-center"
                style={{ borderColor: "rgba(201,168,76,0.4)", color: "var(--lux-cream-muted)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--lux-gold)"; (e.currentTarget as HTMLElement).style.color = "var(--lux-gold)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.4)"; (e.currentTarget as HTMLElement).style.color = "var(--lux-cream-muted)"; }}
              >
                Enquire About a Property
              </motion.button>
            </a>
          </motion.div>

          {/* Trust line */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={T(0.8, 0.8)}
            className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-10"
          >
            {[
              { icon: Shield,     text: "Bank-level Security" },
              { icon: TrendingUp, text: "99.9% Uptime" },
              { icon: Clock,      text: "Setup in 5 Minutes" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-xs tracking-widest uppercase" style={{ color: "var(--lux-cream-muted)" }}>
                <item.icon className="h-3.5 w-3.5" style={{ color: "var(--lux-gold)" }} />
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={T(1.1, 0.6)}
          className="relative z-10 mt-20 w-full max-w-5xl mx-auto px-4"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="rounded-sm border overflow-hidden shadow-2xl"
            style={{
              borderColor: "var(--lux-border)",
              background: "var(--lux-surface)",
              boxShadow: "0 40px 100px -20px rgba(0,0,0,0.8), 0 0 60px -10px rgba(201,168,76,0.12)",
            }}
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: "var(--lux-border)", background: "var(--lux-surface-2)" }}>
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
              <span className="ml-4 text-[11px] font-mono" style={{ color: "var(--lux-cream-muted)" }}>aurexo.com/dashboard</span>
            </div>
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden sm:flex flex-col w-40 border-r p-3 gap-0.5" style={{ borderColor: "var(--lux-border)" }}>
                {["Dashboard", "Leads", "Properties", "Appointments", "Automation", "Settings"].map((item, i) => (
                  <div key={item} className="h-8 rounded-sm px-2.5 flex items-center text-[11px]"
                    style={{
                      background: i === 0 ? "rgba(201,168,76,0.12)" : "transparent",
                      color: i === 0 ? "var(--lux-gold)" : "var(--lux-cream-muted)",
                      borderLeft: i === 0 ? "2px solid var(--lux-gold)" : "2px solid transparent",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
              {/* Content */}
              <div className="flex-1 p-4 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "Total Leads", value: "248", change: "+12.5%" },
                    { label: "Properties",  value: "34",  change: "+8.3%" },
                    { label: "Appointments",value: "18",  change: "This week" },
                    { label: "Revenue",     value: "AED 4.7M", change: "+23.7%" },
                  ].map((stat, i) => (
                    <motion.div key={stat.label}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="rounded-sm p-3 border"
                      style={{ background: "var(--lux-surface-2)", borderColor: "var(--lux-border)" }}
                    >
                      <p className="text-[10px] tracking-wider uppercase" style={{ color: "var(--lux-cream-muted)" }}>{stat.label}</p>
                      <p className="text-sm font-semibold mt-1" style={{ color: "var(--lux-cream)" }}>{stat.value}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--lux-gold)" }}>{stat.change}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[
                    { name: "Ahmed Al Mansouri", temp: "HOT",  score: 92, amount: "AED 3.5M" },
                    { name: "Marcus Webb",        temp: "WARM", score: 74, amount: "AED 8.0M" },
                    { name: "Sophie Laurent",     temp: "HOT",  score: 88, amount: "AED 1.5M" },
                  ].map((lead, i) => (
                    <motion.div key={lead.name}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="flex items-center justify-between rounded-sm p-2.5 border"
                      style={{ background: "var(--lux-surface-2)", borderColor: "var(--lux-border)" }}
                    >
                      <div>
                        <p className="text-[11px] font-medium" style={{ color: "var(--lux-cream)" }}>{lead.name}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: lead.temp === "HOT" ? "#ef4444" : "#f59e0b" }}>{lead.temp} · {lead.score}/100</p>
                      </div>
                      <p className="text-[11px] font-semibold" style={{ color: "var(--lux-gold)" }}>{lead.amount}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 border-y" style={{ borderColor: "var(--lux-border)", background: "var(--lux-surface)" }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <motion.div
            variants={stagger(0.15)} initial="hidden" animate={statsInView ? "show" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-10"
          >
            {STATS.map((s) => <StatCard key={s.label} stat={s} />)}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" ref={featRef} className="py-24 sm:py-32" style={{ background: "var(--lux-bg)" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <motion.div variants={fadeUp} initial="hidden" animate={featInView ? "show" : "hidden"}
            transition={T(0.8)} className="text-center mb-16"
          >
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: "var(--lux-gold)" }}>Platform Features</p>
            <h2 className="font-serif-luxury font-light" style={{ color: "var(--lux-cream)", fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Everything You Need to{" "}
              <em className="gold-luxury not-italic">Close Faster</em>
            </h2>
            <GoldDivider className="mx-auto w-16 mt-6" />
          </motion.div>

          <motion.div
            variants={stagger(0.08)} initial="hidden" animate={featInView ? "show" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ border: "1px solid var(--lux-border)", background: "var(--lux-border)" }}
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUp} transition={T(0.7)}
                className="group p-8 transition-all duration-500 cursor-default"
                style={{ background: "var(--lux-surface)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--lux-surface-2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--lux-surface)"; }}
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center border transition-colors duration-300 group-hover:border-[var(--lux-gold)]"
                  style={{ borderColor: "var(--lux-border)", background: "rgba(201,168,76,0.04)" }}
                >
                  <f.icon className="h-5 w-5 transition-colors duration-300" style={{ color: "var(--lux-gold)" }} />
                </div>
                <h3 className="font-serif-luxury text-xl font-light mb-3" style={{ color: "var(--lux-cream)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--lux-cream-muted)" }}>{f.desc}</p>
                <div className="mt-5 flex items-center gap-2 text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: "var(--lux-gold)" }}
                >
                  Learn more <ChevronRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section className="py-24 sm:py-32 border-y" style={{ borderColor: "var(--lux-border)", background: "var(--lux-surface)" }}>
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp} transition={T(0.8)} className="text-center mb-20"
          >
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: "var(--lux-gold)" }}>The Process</p>
            <h2 className="font-serif-luxury font-light" style={{ color: "var(--lux-cream)", fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Set Up in Minutes.<br />
              <em className="gold-luxury not-italic">Automate in Hours.</em>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 relative">
            <div className="hidden md:block absolute top-6 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px" style={{ background: "linear-gradient(90deg, var(--lux-gold), var(--lux-gold-dark))", opacity: 0.3 }} />
            {[
              { step: "I",   title: "Add Your Data",           desc: "Import leads and properties or start fresh. Configure your team and assign territories in minutes." },
              { step: "II",  title: "Connect Automations",     desc: "Link n8n workflows for emails, Telegram alerts, and lead capture — all without writing a single line of code." },
              { step: "III", title: "Watch Deals Flow",        desc: "Track every lead through your pipeline. AI insights surface which deals need attention today." },
            ].map((s, i) => (
              <motion.div key={s.step}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={T(0.8, i * 0.2)}
                className="text-center"
              >
                <div className="inline-flex h-14 w-14 items-center justify-center border mb-6 font-serif-luxury text-xl font-light relative z-10"
                  style={{ borderColor: "var(--lux-gold)", color: "var(--lux-gold)", background: "var(--lux-surface)" }}
                >
                  {s.step}
                </div>
                <h3 className="font-serif-luxury text-xl font-light mb-3" style={{ color: "var(--lux-cream)" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--lux-cream-muted)" }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────── */}
      <section className="py-24 sm:py-32" style={{ background: "var(--lux-bg)" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp} transition={T(0.8)} className="text-center mb-16"
          >
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: "var(--lux-gold)" }}>Testimonials</p>
            <h2 className="font-serif-luxury font-light" style={{ color: "var(--lux-cream)", fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Trusted by Top Agents
            </h2>
            <GoldDivider className="mx-auto w-16 mt-6" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }} transition={T(0.8, i * 0.15)}
                className="p-8 border transition-all duration-500 group"
                style={{ background: "var(--lux-surface)", borderColor: "var(--lux-border)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--lux-gold-dark)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--lux-border)"; }}
              >
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-current" style={{ color: "var(--lux-gold)" }} />
                  ))}
                </div>
                <p className="font-serif-luxury text-lg font-light leading-relaxed mb-6" style={{ color: "var(--lux-cream)" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <GoldDivider className="mb-5" />
                <p className="text-sm font-medium" style={{ color: "var(--lux-cream)" }}>{t.name}</p>
                <p className="text-xs mt-1 tracking-wider" style={{ color: "var(--lux-cream-muted)" }}>{t.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" ref={pricingRef} className="py-24 sm:py-32 border-y" style={{ borderColor: "var(--lux-border)", background: "var(--lux-surface)" }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <motion.div variants={fadeUp} initial="hidden" animate={priceInView ? "show" : "hidden"}
            transition={T(0.8)} className="text-center mb-16"
          >
            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: "var(--lux-gold)" }}>Membership</p>
            <h2 className="font-serif-luxury font-light" style={{ color: "var(--lux-cream)", fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Simple, Transparent{" "}
              <em className="gold-luxury not-italic">Pricing</em>
            </h2>
            <GoldDivider className="mx-auto w-16 mt-6" />
          </motion.div>

          <motion.div
            variants={stagger(0.12)} initial="hidden" animate={priceInView ? "show" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {PLANS.map((plan) => (
              <motion.div key={plan.name} variants={fadeUp} transition={T(0.8)}
                className="relative flex flex-col p-8 border transition-all duration-500"
                style={{
                  background: plan.highlight ? "rgba(201,168,76,0.05)" : "var(--lux-bg)",
                  borderColor: plan.highlight ? "var(--lux-gold)" : "var(--lux-border)",
                  boxShadow: plan.highlight ? "0 0 60px -15px rgba(201,168,76,0.2)" : "none",
                }}
              >
                {plan.highlight && (
                  <div className="absolute -top-px left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--lux-gold), transparent)" }} />
                )}
                {plan.highlight && (
                  <p className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.3em] uppercase px-4 py-1"
                    style={{ background: "var(--lux-gold)", color: "#0a0908" }}
                  >
                    Most Popular
                  </p>
                )}
                <div className="mb-8">
                  <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: "var(--lux-gold)" }}>{plan.name}</p>
                  <p className="font-serif-luxury text-4xl font-light" style={{ color: "var(--lux-cream)" }}>{plan.price}</p>
                  <p className="text-xs mt-1 tracking-wider" style={{ color: "var(--lux-cream-muted)" }}>{plan.period}</p>
                  <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--lux-cream-muted)" }}>{plan.desc}</p>
                </div>
                <GoldDivider className="mb-6" />
                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "var(--lux-cream-muted)" }}>
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--lux-gold)" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 text-xs tracking-[0.2em] uppercase border transition-all duration-300"
                    style={plan.highlight
                      ? { background: "var(--lux-gold)", color: "#0a0908", borderColor: "var(--lux-gold)" }
                      : { background: "transparent", color: "var(--lux-cream-muted)", borderColor: "var(--lux-border)" }
                    }
                    onMouseEnter={e => { if (!plan.highlight) { (e.currentTarget as HTMLElement).style.borderColor = "var(--lux-gold)"; (e.currentTarget as HTMLElement).style.color = "var(--lux-gold)"; }}}
                    onMouseLeave={e => { if (!plan.highlight) { (e.currentTarget as HTMLElement).style.borderColor = "var(--lux-border)"; (e.currentTarget as HTMLElement).style.color = "var(--lux-cream-muted)"; }}}
                  >
                    {plan.cta}
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── INQUIRY ─────────────────────────────────────────── */}
      <section id="inquiry" ref={inquiryRef} className="py-24 sm:py-32" style={{ background: "var(--lux-bg)" }}>
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <motion.div
            variants={stagger(0.1)} initial="hidden" animate={inquiryInView ? "show" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
          >
            <motion.div variants={fadeUp} transition={T(0.9)}>
              <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ color: "var(--lux-gold)" }}>Free Consultation</p>
              <h2 className="font-serif-luxury font-light leading-tight mb-6" style={{ color: "var(--lux-cream)", fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
                Find Your Dream<br />
                Property in{" "}
                <em className="gold-luxury not-italic">Dubai</em>
              </h2>
              <p className="text-sm leading-relaxed mb-10" style={{ color: "var(--lux-cream-muted)" }}>
                Tell us what you're looking for and our AI-powered system instantly qualifies
                your enquiry, scores it, and connects you with the right agent — in seconds.
              </p>
              <div className="space-y-6">
                {[
                  { icon: PhoneCall, title: "You fill the form",            desc: "Takes 60 seconds. Name, budget, what you're looking for." },
                  { icon: Bot,       title: "AI qualifies your enquiry",    desc: "Our AI instantly scores and summarises your requirements for the agent." },
                  { icon: Mail,      title: "Agent notified instantly",     desc: "Your agent receives an email alert with your full profile and AI summary." },
                  { icon: PhoneCall, title: "We contact you",              desc: "Expect a call within 1 hour during business hours." },
                ].map((step, i) => (
                  <motion.div key={i} variants={fadeUp} transition={T(0.7, i * 0.1)}
                    className="flex items-start gap-5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center border shrink-0 mt-0.5" style={{ borderColor: "var(--lux-border)" }}>
                      <step.icon className="h-4 w-4" style={{ color: "var(--lux-gold)" }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: "var(--lux-cream)" }}>{step.title}</p>
                      <p className="text-sm" style={{ color: "var(--lux-cream-muted)" }}>{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Form */}
            <motion.div variants={fadeUp} transition={T(0.9, 0.1)}
              className="border p-8 sm:p-10"
              style={{ background: "var(--lux-surface)", borderColor: "var(--lux-border)" }}
            >
              <p className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: "var(--lux-gold)" }}>Private Enquiry</p>
              <h3 className="font-serif-luxury text-2xl font-light mb-1" style={{ color: "var(--lux-cream)" }}>Request a Consultation</h3>
              <p className="text-sm mb-8" style={{ color: "var(--lux-cream-muted)" }}>No commitment. No spam. Just the right property, fast.</p>
              <div className="luxury-form">
                <InquiryForm />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 relative overflow-hidden border-t" style={{ borderColor: "var(--lux-border)", background: "var(--lux-surface)" }}>
        <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 6, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-3xl px-5 text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={stagger(0.12)}
          >
            <motion.div variants={fadeUp} transition={T(0.7)}>
              <Globe className="h-10 w-10 mx-auto mb-8" style={{ color: "var(--lux-gold)" }} />
            </motion.div>
            <motion.h2 variants={fadeUp} transition={T(0.9)}
              className="font-serif-luxury font-light leading-tight mb-6"
              style={{ color: "var(--lux-cream)", fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Ready to Elevate Your<br />
              <em className="gold-luxury not-italic">Real Estate Business?</em>
            </motion.h2>
            <GoldDivider className="mx-auto w-16 mb-8" />
            <motion.p variants={fadeUp} transition={T(0.7)} className="text-base leading-relaxed mb-10" style={{ color: "var(--lux-cream-muted)" }}>
              Join hundreds of agents already using Aurexo to close more deals with less effort.
            </motion.p>
            <motion.div variants={fadeUp} transition={T(0.7)} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: "0 0 50px rgba(201,168,76,0.3)" }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-3 px-10 py-4 text-xs tracking-[0.2em] uppercase w-full sm:w-auto"
                  style={{ background: "var(--lux-gold)", color: "#0a0908" }}
                >
                  Start Your Free Trial
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              </Link>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-3 px-10 py-4 text-xs tracking-[0.2em] uppercase border w-full sm:w-auto transition-all duration-300"
                  style={{ borderColor: "rgba(201,168,76,0.4)", color: "var(--lux-cream-muted)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--lux-gold)"; (e.currentTarget as HTMLElement).style.color = "var(--lux-gold)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.4)"; (e.currentTarget as HTMLElement).style.color = "var(--lux-cream-muted)"; }}
                >
                  Already Have an Account?
                </motion.button>
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} transition={T(0.7)} className="mt-10 flex flex-wrap justify-center gap-6 sm:gap-10 text-xs tracking-widest uppercase" style={{ color: "var(--lux-cream-muted)" }}>
              {["14-day Free Trial", "No Credit Card", "Cancel Anytime", "Full Access"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="h-px w-4" style={{ background: "var(--lux-gold)" }} />
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="py-10 border-t" style={{ borderColor: "var(--lux-border)", background: "var(--lux-bg)" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center border" style={{ borderColor: "var(--lux-gold-dark)", background: "rgba(201,168,76,0.08)" }}>
                <Building2 className="h-3.5 w-3.5" style={{ color: "var(--lux-gold)" }} />
              </div>
              <span className="font-serif-luxury text-sm tracking-widest" style={{ color: "var(--lux-cream)" }}>AUREXO REALTY AI</span>
            </div>
            <p className="text-[11px] tracking-widest" style={{ color: "var(--lux-cream-muted)" }}>
              © 2026 Aurexo Realty AI. Built for modern real estate teams.
            </p>
            <div className="flex gap-8 text-[11px] tracking-widest uppercase" style={{ color: "var(--lux-cream-muted)" }}>
              {["Privacy", "Terms", "Support"].map((item) => (
                <a key={item} href="#"
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--lux-gold)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--lux-cream-muted)")}
                  className="transition-colors duration-300"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
