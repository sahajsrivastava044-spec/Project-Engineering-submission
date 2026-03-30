import type { Task } from '../App'

interface TaskItemProps {
  task: Task
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}

function TaskItem({ task, onDelete, onToggle }: TaskItemProps) {
  return (
    <li className="task-item">
      <div className="task-content">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="task-checkbox"
        />
        <span className={`task-title ${task.completed ? 'completed' : ''}`}>
          {task.title}
        </span>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="delete-btn"
        aria-label="Delete task"
      >
        Delete
      </button>
    </li>
  )
}

export default TaskItem
