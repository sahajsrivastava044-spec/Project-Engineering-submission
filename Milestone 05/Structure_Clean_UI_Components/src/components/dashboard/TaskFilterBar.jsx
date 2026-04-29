export default function TaskFilterBar({
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
      <div>
        {["all", "active", "completed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search tasks..."
      />
    </div>
  );
}