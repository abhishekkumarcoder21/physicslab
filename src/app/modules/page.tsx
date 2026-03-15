import Link from "next/link";

const allModules = [
  {
    title: "Kinematics",
    description: "Motion, velocity, acceleration, and projectile motion.",
    icon: "⚡",
    lessons: 8,
    concepts: 22,
    estimatedHours: 12,
    available: true,
    status: "in-progress" as const,
    progress: 12,
    gradient: "from-indigo-500 to-violet-500",
    borderColor: "border-indigo-500/30",
    bgColor: "bg-indigo-500/5",
    href: "/kinematics",
    highlights: ["Interactive Simulations", "Motion Graphs", "Projectile Motion", "Relative Motion"],
  },
  {
    title: "Dynamics",
    description: "Forces, Newton's laws, friction, and circular motion.",
    icon: "🔄",
    lessons: 10,
    concepts: 26,
    estimatedHours: 14,
    available: false,
    status: "locked" as const,
    progress: 0,
    gradient: "from-cyan-500 to-blue-500",
    borderColor: "border-border",
    bgColor: "bg-surface-card",
    href: "/modules",
    highlights: ["Newton's Laws", "Friction", "Circular Motion", "Pseudo Forces"],
  },
  {
    title: "Work, Energy & Power",
    description: "Work-energy theorem, conservation of energy, and power.",
    icon: "🔋",
    lessons: 7,
    concepts: 18,
    estimatedHours: 10,
    available: false,
    status: "locked" as const,
    progress: 0,
    gradient: "from-emerald-500 to-teal-500",
    borderColor: "border-border",
    bgColor: "bg-surface-card",
    href: "/modules",
    highlights: ["Work-Energy Theorem", "Conservation Laws", "Collisions", "Power"],
  },
  {
    title: "Rotational Motion",
    description: "Torque, angular momentum, and moment of inertia.",
    icon: "🌀",
    lessons: 9,
    concepts: 24,
    estimatedHours: 13,
    available: false,
    status: "locked" as const,
    progress: 0,
    gradient: "from-orange-500 to-amber-500",
    borderColor: "border-border",
    bgColor: "bg-surface-card",
    href: "/modules",
    highlights: ["Torque", "Moment of Inertia", "Rolling Motion", "Angular Momentum"],
  },
  {
    title: "Gravitation",
    description: "Kepler's laws, gravitational potential, and orbital motion.",
    icon: "🌍",
    lessons: 6,
    concepts: 16,
    estimatedHours: 9,
    available: false,
    status: "locked" as const,
    progress: 0,
    gradient: "from-rose-500 to-pink-500",
    borderColor: "border-border",
    bgColor: "bg-surface-card",
    href: "/modules",
    highlights: ["Kepler's Laws", "Gravitational Potential", "Satellites", "Escape Velocity"],
  },
  {
    title: "Waves & Oscillations",
    description: "SHM, wave properties, sound, and superposition.",
    icon: "🌊",
    lessons: 8,
    concepts: 20,
    estimatedHours: 11,
    available: false,
    status: "locked" as const,
    progress: 0,
    gradient: "from-violet-500 to-purple-500",
    borderColor: "border-border",
    bgColor: "bg-surface-card",
    href: "/modules",
    highlights: ["Simple Harmonic Motion", "Wave Equation", "Superposition", "Resonance"],
  },
];

export default function ModulesPage() {
  const totalModules = allModules.length;
  const activeModules = allModules.filter(m => m.status === "in-progress").length;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">

      {/* ─── Hero ─── */}
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-2">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-primary/70 mb-2">Physics Chapters</p>
            <h1 className="text-3xl font-extrabold text-text tracking-tight">
              All Modules
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {totalModules} chapters · {activeModules} in progress · Master physics one chapter at a time.
            </p>
          </div>

          {/* Overall progress pill */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface-card border border-border shadow-sm">
            <div className="w-32 h-2 rounded-full bg-surface-hover overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent animate-progress-fill" style={{ width: "12%" }} />
            </div>
            <span className="text-xs font-bold text-primary">12% overall</span>
          </div>
        </div>
      </section>

      {/* ─── Learning Path Connector ─── */}
      <section className="relative space-y-5">
        {/* Vertical connector line */}
        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/40 via-border to-border rounded-full hidden lg:block" />

        {allModules.map((mod, i) => {
          const isActive = mod.status === "in-progress";
          const isLocked = mod.status === "locked";

          return (
            <div key={mod.title} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <Link
                href={mod.href}
                className={`group relative flex flex-col lg:flex-row gap-6 rounded-3xl border p-6 lg:p-8 transition-all duration-300 ${
                  isActive
                    ? `${mod.bgColor} ${mod.borderColor} shadow-lg hover:shadow-xl`
                    : `bg-surface-card border-border hover:bg-surface-hover shadow-sm hover:shadow-md`
                } ${isLocked ? "opacity-55 pointer-events-none" : "hover:-translate-y-0.5"}`}
              >
                {/* Gradient top accent */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r ${mod.gradient} ${isActive ? "opacity-80" : "opacity-0 group-hover:opacity-40"} transition-opacity`} />

                {/* Left: Icon + Order */}
                <div className="relative z-10 flex lg:flex-col items-center lg:items-center gap-4 lg:gap-2 shrink-0">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 ${
                    isActive ? `bg-gradient-to-br ${mod.gradient} shadow-lg text-white group-hover:scale-110` : "bg-surface-hover group-hover:scale-105"
                  }`}>
                    {mod.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-text-muted">
                    Ch. {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Center: Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className={`text-xl font-bold ${isActive ? "text-text" : "text-text"}`}>{mod.title}</h3>
                    {isActive && (
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-primary/15 text-primary">
                        In Progress
                      </span>
                    )}
                    {isLocked && (
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400">
                        🔒 Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed mb-3">{mod.description}</p>

                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted bg-surface-hover/80 px-2.5 py-1 rounded-lg">
                      📚 {mod.lessons} lessons
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted bg-surface-hover/80 px-2.5 py-1 rounded-lg">
                      🧠 {mod.concepts} concepts
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted bg-surface-hover/80 px-2.5 py-1 rounded-lg">
                      ⏱️ ~{mod.estimatedHours}h
                    </span>
                  </div>

                  {/* Topic pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {mod.highlights.map((h) => (
                      <span key={h} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isActive ? "border-primary/20 text-primary bg-primary/5" : "border-border text-text-muted bg-surface-card"
                      }`}>
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Progress */}
                <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-3 shrink-0 lg:w-28">
                  {isActive ? (
                    <>
                      <div className="relative">
                        <svg width="64" height="64" className="rotate-[-90deg]">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-surface-hover" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="url(#modProgressGrad)" strokeWidth="4" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 28}`}
                            strokeDashoffset={`${2 * Math.PI * 28 - (mod.progress / 100) * 2 * Math.PI * 28}`}
                            className="animate-progress-fill" />
                          <defs>
                            <linearGradient id="modProgressGrad" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#22d3ee" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                          {mod.progress}%
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-primary">Continue →</span>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-text-muted">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </section>
    </div>
  );
}
