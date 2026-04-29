export default function StatCard({ title, value, subtitle, color, children }) {
  return (
    <div style={{ background: "#1a1a2e", border: "1px solid #2d2d44", borderRadius: 14, padding: "20px 24px" }}>
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 36, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{subtitle}</div>
      {children}
    </div>
  );
}