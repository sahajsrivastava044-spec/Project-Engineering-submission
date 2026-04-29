// DashboardPage.jsx
// TODO: This file is getting really long... but it works so let's not touch it 🙃

import { useState } from "react";
import tasks from "../data/tasks";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsRow from "../components/dashboard/StatsRow";
import AddTaskInput from "../components/dashboard/AddTaskInput";
import TaskFilterBar from "../components/dashboard/TaskFilterBar";
import TaskList from "../components/dashboard/TaskList";

export default function DashboardPage() {
  const [taskList, setTaskList] = useState(tasks);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

const addTask = (text) => {
  if (!text.trim()) return;

  setTaskList([
    ...taskList,
    {
      id: Date.now(),
      title: text,
      completed: false,
      priority: "medium",
      tag: "general",
      createdAt: new Date().toISOString(),
      },
    ]);
  };

  const toggleTask = (id) => {
    setTaskList(
      taskList.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id) => {
    setTaskList(taskList.filter((t) => t.id !== id));
  };

  const filtered = taskList
    .filter((t) => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      return true;
    })
    .filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const completedCount = taskList.filter((t) => t.completed).length;
  const totalCount = taskList.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", color: "#e2e8f0", fontFamily: "sans-serif" }}>
  
  <DashboardHeader />

  <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

    <StatsRow
      total={totalCount}
      completed={completedCount}
      progress={progressPercent}
    />

    <AddTaskInput onAdd={addTask} />

    <TaskFilterBar
      filter={filter}
      setFilter={setFilter}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />

    <TaskList
      tasks={filtered}
      onToggle={toggleTask}
      onDelete={deleteTask}
    />

  </div>
</div>
  );
}
