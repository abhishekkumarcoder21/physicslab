import Link from "next/link";

/* ─── Data ─── */

const kinematicsConcepts = [
  { module: "Motion Fundamentals", concepts: [
    { name: "Rest & Motion", status: "done" },
    { name: "Distance", status: "done" },
    { name: "Displacement", status: "done" },
    { name: "Distance vs Displacement", status: "done" },
  ]},
  { module: "Speed & Velocity", concepts: [
    { name: "Average Speed", status: "current" },
    { name: "Average Velocity", status: "current" },
    { name: "Instantaneous Velocity", status: "locked" },
    { name: "Turning Point", status: "locked" },
  ]},
  { module: "Acceleration & Graphs", concepts: [
    { name: "Acceleration", status: "locked" },
    { name: "Average Acceleration", status: "locked" },
    { name: "Instantaneous Acceleration", status: "locked" },
    { name: "Velocity-Time Graph", status: "locked" },
    { name: "Area Under v-t Graph", status: "locked" },
  ]},
  { module: "Applied Kinematics", concepts: [
    { name: "Equations of Motion", status: "locked" },
    { name: "Projectile Motion", status: "locked" },
    { name: "Relative Motion", status: "locked" },
    { name: "Motion Under Gravity", status: "locked" },
  ]},
  { module: "Advanced Kinematics", concepts: [
    { name: "v² vs Position Graph", status: "locked" },
    { name: "Variable Acceleration", status: "locked" },
    { name: "Minimum Distance", status: "locked" },
  ]},
];

const roadmap = [
  { title: "Kinematics", subtitle: "Motion, velocity & acceleration", status: "in-progress" as const, progress: 12, icon: "⚡" },
  { title: "Dynamics", subtitle: "Forces & Newton's laws", status: "locked" as const, progress: 0, icon: "🔄" },
  { title: "Work & Energy", subtitle: "Energy conservation & power", status: "locked" as const, progress: 0, icon: "🔋" },
  { title: "Rotational Motion", subtitle: "Torque & angular momentum", status: "locked" as const, progress: 0, icon: "🌀" },
  { title: "Gravitation", subtitle: "Orbital motion & Kepler's laws", status: "locked" as const, progress: 0, icon: "🌍" },
  { title: "Waves & Oscillations", subtitle: "SHM, sound & superposition", status: "locked" as const, progress: 0, icon: "🌊" },
];

const labExperiments = [
  { name: "Projectile Motion Lab", description: "Launch projectiles and explore parabolic trajectories in real time.", icon: "🚀", color: "from-rose-500 to-orange-500" },
  { name: "Gravity Free-fall Lab", description: "Drop objects under gravity and compare motion with & without drag.", icon: "🍎", color: "from-emerald-500 to-teal-500" },
  { name: "Particle Sandbox", description: "Create, fling, and observe particles with the physics engine.", icon: "⚛️", color: "from-violet-500 to-indigo-500" },
];

/* ─── Helpers ─── */

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    done:    { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "✓ Done" },
    current: { bg: "bg-amber-500/15",   text: "text-amber-400",   label: "▶ Current" },
    locked:  { bg: "bg-slate-500/10",   text: "text-slate-400",   label: "🔒" },
  };
  const s = map[status] ?? map.locked;
  return (
    <span className={`inline-flex items-center text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function CircularProgress({ value, size = 72, stroke = 5 }: { value: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-surface-hover" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#progressGrad)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="animate-progress-fill" />
      <defs>
        <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Page ─── */

export default function DashboardPage() {
  const totalConcepts = kinematicsConcepts.reduce((sum, m) => sum + m.concepts.length, 0);
  const doneConcepts = kinematicsConcepts.reduce((sum, m) => sum + m.concepts.filter(c => c.status === "done").length, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">

      {/* ━━━ 1. CONTINUE LEARNING HERO ━━━ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-surface-card to-accent/10 border border-primary/20 p-8 animate-glow">
        {/* decorative blobs */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-primary/70 mb-2">Continue Learning</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-text tracking-tight mb-2">
              Average Speed & Velocity
            </h1>
            <p className="text-sm text-text-muted leading-relaxed max-w-lg">
              You were exploring how speed and velocity differ — pick up right where you left off in <span className="font-semibold text-text">Chapter 01 · Kinematics</span>.
            </p>
          </div>

          <Link
            href="/kinematics"
            className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Resume Learning
          </Link>
        </div>
      </section>


      {/* ━━━ 2. CURRENT CHAPTER ━━━ */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col items-center justify-center rounded-2xl bg-surface-card border border-border p-8 shadow-sm animate-scale-in">
          <div className="relative mb-4">
            <CircularProgress value={12} size={88} stroke={6} />
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-primary rotate-0">
              12%
            </span>
          </div>
          <h2 className="text-lg font-bold text-text mb-1">Kinematics</h2>
          <p className="text-xs text-text-muted mb-4 text-center">Chapter 01 · {doneConcepts}/{totalConcepts} concepts mastered</p>
          <Link
            href="/kinematics"
            className="px-5 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
          >
            Continue Chapter →
          </Link>
        </div>

        {/* Quick info cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Concepts Mastered", value: `${doneConcepts}`, sub: `of ${totalConcepts}`, icon: "🧠", gradient: "from-indigo-500/10 to-violet-500/10" },
            { label: "Simulations Explored", value: "5", sub: "interactive labs", icon: "🔬", gradient: "from-emerald-500/10 to-teal-500/10" },
            { label: "Study Streak", value: "5 days", sub: "keep going!", icon: "🔥", gradient: "from-orange-500/10 to-amber-500/10" },
          ].map((stat, i) => (
            <div key={stat.label} className={`flex flex-col justify-between rounded-2xl bg-gradient-to-br ${stat.gradient} border border-border p-5 shadow-sm animate-fade-in delay-${(i + 1) * 100}`}>
              <span className="text-3xl mb-3">{stat.icon}</span>
              <div>
                <p className="text-2xl font-extrabold text-text">{stat.value}</p>
                <p className="text-xs text-text-muted font-medium">{stat.label}</p>
                <p className="text-[10px] text-text-muted/60 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ━━━ 3. PHYSICS LEARNING ROADMAP ━━━ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          </div>
          <h2 className="text-xl font-bold text-text">Your Learning Roadmap</h2>
        </div>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-border to-border rounded-full hidden sm:block" />

          <div className="space-y-3">
            {roadmap.map((ch, i) => {
              const isActive = ch.status === "in-progress";
              const isLocked = ch.status === "locked";
              return (
                <div key={ch.title} className={`relative flex items-center gap-5 rounded-2xl border p-5 transition-all duration-300 ${
                  isActive
                    ? "bg-primary/5 border-primary/30 shadow-md shadow-primary/5"
                    : "bg-surface-card border-border hover:bg-surface-hover"
                } ${isLocked ? "opacity-50" : ""} animate-fade-in`} style={{ animationDelay: `${i * 80}ms` }}>
                  {/* node dot */}
                  <div className={`relative z-10 shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    isActive ? "bg-primary/15 ring-2 ring-primary/30" : "bg-surface-hover"
                  }`}>
                    {ch.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className={`font-semibold ${isActive ? "text-text" : "text-text-muted"}`}>{ch.title}</h3>
                      {isActive && (
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                          In Progress
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted">{ch.subtitle}</p>
                  </div>

                  {/* progress mini bar */}
                  {isActive && (
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <div className="w-24 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent animate-progress-fill" style={{ width: `${ch.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-primary">{ch.progress}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ━━━ 4. CONCEPT MASTERY ━━━ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">Concept Mastery</h2>
            <p className="text-xs text-text-muted">Kinematics — {doneConcepts} of {totalConcepts} concepts mastered</p>
          </div>
        </div>

        <div className="space-y-4">
          {kinematicsConcepts.map((mod, mi) => {
            const moduleStatus = mod.concepts.every(c => c.status === "done") ? "done"
              : mod.concepts.some(c => c.status === "current") ? "current" : "locked";
            return (
              <div key={mod.module} className={`rounded-2xl border p-5 transition-all ${
                moduleStatus === "current" ? "bg-amber-500/3 border-amber-500/20" :
                moduleStatus === "done" ? "bg-emerald-500/3 border-emerald-500/20" :
                "bg-surface-card border-border opacity-60"
              } animate-fade-in`} style={{ animationDelay: `${mi * 100}ms` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold tracking-wider uppercase text-text-muted">Module {String(mi + 1).padStart(2, "0")}</span>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-sm font-semibold text-text">{mod.module}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mod.concepts.map((c) => (
                    <div key={c.name} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition-all ${
                      c.status === "done" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" :
                      c.status === "current" ? "bg-amber-500/10 border-amber-500/20 text-amber-600" :
                      "bg-surface-hover border-border text-text-muted"
                    }`}>
                      <StatusPill status={c.status} />
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* ━━━ 5. PHYSICS LAB ACCESS ━━━ */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">Physics Lab</h2>
            <p className="text-xs text-text-muted">Interactive simulations & experiments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {labExperiments.map((exp, i) => (
            <Link
              key={exp.name}
              href="/kinematics"
              className="group relative overflow-hidden rounded-2xl bg-surface-card border border-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {/* gradient top accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${exp.color} opacity-70 group-hover:opacity-100 transition-opacity`} />

              <span className="text-4xl block mb-4 animate-float" style={{ animationDelay: `${i * 400}ms` }}>{exp.icon}</span>
              <h3 className="text-sm font-bold text-text mb-1.5 group-hover:text-primary transition-colors">{exp.name}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{exp.description}</p>

              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Open Lab
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
