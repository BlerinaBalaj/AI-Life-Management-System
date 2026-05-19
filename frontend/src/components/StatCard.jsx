export default function StatCard({ icon: Icon, label, value, accent = "blue", hint }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <span className="stat-glow" />
      <div className="stat-icon">
        <Icon size={20} />
      </div>
      <div className="stat-meta">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </div>
  );
}
