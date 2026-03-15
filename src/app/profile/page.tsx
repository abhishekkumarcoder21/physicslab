export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-text tracking-tight mb-8">
        Your Profile
      </h1>

      {/* Avatar & name */}
      <div className="rounded-2xl bg-surface-card border border-border p-8 shadow-sm mb-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          U
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text">Student Name</h2>
          <p className="text-sm text-text-muted">student@example.com</p>
          <p className="text-xs text-text-muted mt-1">
            Member since March 2026
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Lessons", value: "12" },
          { label: "Quizzes", value: "8" },
          { label: "Avg Score", value: "82%" },
          { label: "Streak", value: "5d" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-surface-card border border-border p-4 text-center shadow-sm"
          >
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-text-muted font-medium mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Settings placeholder */}
      <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
        <p className="text-text-muted text-sm">
          ⚙️ Account settings and preferences will appear here once
          authentication is connected.
        </p>
      </div>
    </div>
  );
}
