import { useState } from "react";

export default function AddTaskInput({ onAdd }) {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
  };

  return (
    <div style={{ background: "#1a1a2e", padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ marginBottom: 12 }}>Add New Task</div>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button onClick={handleAdd}>+ Add Task</button>
      </div>
    </div>
  );
}