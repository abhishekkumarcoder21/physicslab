import Link from "next/link";

const modules = [
  {
    title: "Kinematics",
    description: "Motion, velocity, acceleration, and projectile motion.",
    href: "/kinematics",
    icon: "⚡",
    progress: 12,
    gradient: "from-primary to-primary-light",
    available: true,
  },
  {
    title: "Dynamics",
    description: "Forces, Newton's laws, friction, and circular motion.",
    href: "/modules",
    icon: "🔄",
    progress: 0,
    gradient: "from-accent to-accent-light",
    available: false,
  },
  {
    title: "Work & Energy",
    description: "Work, kinetic & potential energy, power, and conservation laws.",
    href: "/modules",
    icon: "🔋",
    progress: 0,
    gradient: "from-success to-accent",
    available: false,
  },
  {
    title: "Waves & Oscillations",
    description: "SHM, wave properties, sound, and superposition.",
    href: "/modules",
    icon: "🌊",
    progress: 0,
    gradient: "from-warning to-danger",
    available: false,
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Welcome */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold text-text tracking-tight mb-2">
          Welcome back, Student! 👋
        </h1>
        <p className="text-text-muted text-base">
          Continue your physics journey. Pick up where you left off.
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Lessons Completed", value: "2", icon: "📖" },
          { label: "Quiz Score Avg", value: "78%", icon: "🎯" },
          { label: "Study Streak", value: "5 days", icon: "🔥" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl bg-surface-card border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">{stat.icon}</span>
            <div>
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-xs text-text-muted font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Module cards */}
      <section>
        <h2 className="text-xl font-semibold text-text mb-5">Your Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {modules.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className={`group relative overflow-hidden rounded-2xl bg-surface-card border border-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                !mod.available ? "opacity-60 pointer-events-none" : ""
              }`}
            >
              {/* Gradient accent */}
              <div
                className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${mod.gradient} opacity-80 group-hover:opacity-100 transition-opacity`}
              />

              <div className="flex items-start gap-4">
                <span className="text-3xl">{mod.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text mb-1 flex items-center gap-2">
                    {mod.title}
                    {!mod.available && (
                      <span className="text-[10px] uppercase tracking-wider bg-text-muted/10 text-text-muted px-2 py-0.5 rounded-full font-bold">
                        Coming Soon
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-3">
                    {mod.description}
                  </p>

                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-hover overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${mod.gradient} transition-all duration-500`}
                        style={{ width: `${mod.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-text-muted">
                      {mod.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
