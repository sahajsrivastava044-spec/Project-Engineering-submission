import { useState } from 'react'

interface AddTaskProps {
  onAddTask: (title: string) => void
}

function AddTask({ onAddTask }: AddTaskProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      onAddTask(input)
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter a new task..."
        className="task-input"
      />
      <button type="submit" className="add-btn">
        Add Task
      </button>
    </form>
  )
}

export default AddTask
