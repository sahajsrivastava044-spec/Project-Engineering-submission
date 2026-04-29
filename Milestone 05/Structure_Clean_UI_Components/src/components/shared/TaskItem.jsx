export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div>
      <button onClick={() => onToggle(task.id)}>
        {task.completed ? "✓" : ""}
      </button>

      <div>{task.title}</div>

      <button onClick={() => onDelete(task.id)}>✕</button>
    </div>
  );
}