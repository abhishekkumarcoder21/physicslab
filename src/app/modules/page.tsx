const allModules = [
  {
    title: "Kinematics",
    description: "Motion, velocity, acceleration, and projectile motion.",
    icon: "⚡",
    lessons: 8,
    available: true,
  },
  {
    title: "Dynamics",
    description: "Forces, Newton's laws, friction, and circular motion.",
    icon: "🔄",
    lessons: 10,
    available: false,
  },
  {
    title: "Work, Energy & Power",
    description: "Work-energy theorem, conservation of energy, and power.",
    icon: "🔋",
    lessons: 7,
    available: false,
  },
  {
    title: "Rotational Motion",
    description: "Torque, angular momentum, and moment of inertia.",
    icon: "🌀",
    lessons: 9,
    available: false,
  },
  {
    title: "Gravitation",
    description: "Kepler's laws, gravitational potential, and orbital motion.",
    icon: "🌍",
    lessons: 6,
    available: false,
  },
  {
    title: "Waves & Oscillations",
    description: "SHM, wave properties, sound, and superposition.",
    icon: "🌊",
    lessons: 8,
    available: false,
  },
];

export default function ModulesPage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-text tracking-tight mb-2">
        All Modules
      </h1>
      <p className="text-text-muted mb-8">
        Explore all physics chapters. New modules are added regularly.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {allModules.map((mod) => (
          <div
            key={mod.title}
            className={`rounded-2xl bg-surface-card border border-border p-6 shadow-sm transition-all duration-300 ${
              mod.available
                ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                : "opacity-50"
            }`}
          >
            <span className="text-4xl mb-4 block">{mod.icon}</span>
            <h3 className="text-lg font-semibold text-text mb-1 flex items-center gap-2">
              {mod.title}
              {!mod.available && (
                <span className="text-[10px] uppercase tracking-wider bg-text-muted/10 text-text-muted px-2 py-0.5 rounded-full font-bold">
                  Soon
                </span>
              )}
            </h3>
            <p className="text-sm text-text-muted leading-relaxed mb-3">
              {mod.description}
            </p>
            <p className="text-xs text-text-muted font-medium">
              📚 {mod.lessons} lessons
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
