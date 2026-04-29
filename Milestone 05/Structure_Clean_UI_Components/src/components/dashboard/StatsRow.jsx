import StatCard from "../shared/StatCard";

export default function StatsRow({ total, completed, progress }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
      <StatCard title="Total Tasks" value={total} subtitle="All time" color="#e2e8f0" />
      <StatCard title="Completed" value={completed} subtitle="Done ✓" color="#22c55e" />
      <StatCard title="Remaining" value={total - completed} subtitle="To do" color="#f59e0b" />
      <StatCard title="Progress" value={`${progress}%`} subtitle="">
        <div style={{ height: 4, background: "#2d2d44", borderRadius: 99, marginTop: 8 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
        </div>
      </StatCard>
    </div>
  );
}