const achievements = [
  { name: "First Simulation", description: "Ran your first interactive simulation", icon: "🚀", earned: true },
  { name: "Kinematics Explorer", description: "Completed 4 concepts in Kinematics", icon: "⚡", earned: true },
  { name: "Graph Reader", description: "Explored position-time & velocity-time graphs", icon: "📈", earned: true },
  { name: "5-Day Streak", description: "Studied for 5 consecutive days", icon: "🔥", earned: true },
  { name: "Motion Master", description: "Complete all Kinematics concepts", icon: "🏆", earned: false },
  { name: "Lab Rat", description: "Open 10 different simulations", icon: "🔬", earned: false },
  { name: "Speed Demon", description: "Complete a module in under 2 hours", icon: "⚡", earned: false },
  { name: "Physics Sage", description: "Complete all 6 chapters", icon: "🎓", earned: false },
];

const recentActivity = [
  { action: "Explored Average Speed simulation", time: "2 hours ago", icon: "🧪" },
  { action: "Completed Distance vs Displacement", time: "Yesterday", icon: "✅" },
  { action: "Completed Displacement concept", time: "Yesterday", icon: "✅" },
  { action: "Completed Distance concept", time: "2 days ago", icon: "✅" },
  { action: "Started Kinematics chapter", time: "5 days ago", icon: "🚀" },
];

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">

      {/* ─── Profile Header ─── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-surface-card to-accent/10 border border-primary/15 p-8">
        <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/25">
            U
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-text tracking-tight">Student Name</h1>
            <p className="text-sm text-text-muted">student@example.com</p>
            <p className="text-xs text-text-muted/70 mt-1">Learning since March 2026 · 5 day streak 🔥</p>
          </div>
        </div>
      </section>

      {/* ─── Learning Journey Stats ─── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Concepts Mastered", value: "4", icon: "🧠", gradient: "from-indigo-500/10 to-violet-500/10" },
          { label: "Chapters Started", value: "1", icon: "📖", gradient: "from-emerald-500/10 to-teal-500/10" },
          { label: "Simulations Explored", value: "5", icon: "🔬", gradient: "from-cyan-500/10 to-blue-500/10" },
          { label: "Study Streak", value: "5d", icon: "🔥", gradient: "from-orange-500/10 to-amber-500/10" },
        ].map((stat, i) => (
          <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.gradient} border border-border p-5 text-center animate-fade-in`} style={{ animationDelay: `${i * 80}ms` }}>
            <span className="text-2xl block mb-2">{stat.icon}</span>
            <p className="text-2xl font-extrabold text-text">{stat.value}</p>
            <p className="text-[11px] text-text-muted font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* ─── Achievements ─── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <span className="text-base">🏅</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-text">Achievements</h2>
            <p className="text-xs text-text-muted">{achievements.filter(a => a.earned).length} of {achievements.length} earned</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((badge, i) => (
            <div
              key={badge.name}
              className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 animate-fade-in ${
                badge.earned
                  ? "bg-amber-500/5 border-amber-500/20 shadow-sm"
                  : "bg-surface-card border-border opacity-45"
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className={`text-3xl shrink-0 ${badge.earned ? "" : "grayscale"}`}>{badge.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${badge.earned ? "text-text" : "text-text-muted"}`}>{badge.name}</p>
                <p className="text-xs text-text-muted leading-relaxed">{badge.description}</p>
              </div>
              {badge.earned && (
                <span className="shrink-0 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500">
                  ✓ Earned
                </span>
              )}
              {!badge.earned && (
                <span className="shrink-0 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400">
                  🔒
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Recent Activity ─── */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-lg font-bold text-text">Recent Activity</h2>
        </div>

        <div className="relative">
          {/* timeline line */}
          <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-border rounded-full" />

          <div className="space-y-0">
            {recentActivity.map((activity, i) => (
              <div key={i} className="relative flex items-start gap-4 py-3 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                {/* dot */}
                <div className="relative z-10 shrink-0 w-[31px] h-[31px] rounded-full bg-surface-card border-2 border-border flex items-center justify-center text-sm">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm text-text font-medium">{activity.action}</p>
                  <p className="text-xs text-text-muted mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Settings Placeholder ─── */}
      <section className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
        <p className="text-text-muted text-sm">
          ⚙️ Account settings and preferences will appear here once authentication is connected.
        </p>
      </section>
    </div>
  );
}
