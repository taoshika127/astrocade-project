// KanbanApp.tsx
// KanbanApp.tsx (Expanded Version)
import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DEFAULT_TAGS = ["important", "urgent", "low priority"];

const mockFetchTasks = (count = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tasks = Array.from({ length: count }, (_, i) => ({
        id: uuidv4(),
        name: `Task ${i}`,
        description: `Description for Task ${i}`,
        dueDate: new Date().toISOString(),
        priority: ["Low", "Medium", "High"][i % 3],
        assignee: `User ${i % 5}`,
        tags: [DEFAULT_TAGS[i % 3]],
        stage: ["To Do", "In Progress", "Review", "Done"][i % 4],
      }));
      resolve(tasks);
    }, 1000);
  });
};

function TaskCard({ task, moveTask }) {
  const [, drag] = useDrag({ type: "TASK", item: task });

  return (
    <motion.div
      ref={drag}
      className="p-2 mb-2 bg-white rounded shadow cursor-move"
      layout
    >
      <div className="font-bold">{task.name}</div>
      <div className="text-sm">{task.description}</div>
      <div className="text-xs text-gray-500">{format(new Date(task.dueDate), "PPP")}</div>
      <div className="text-xs mt-1">Tags: {task.tags.join(", ")}</div>
    </motion.div>
  );
}

function Column({ title, onTitleChange, tasks, onDrop }) {
  const [, drop] = useDrop({
    accept: "TASK",
    drop: (item) => onDrop(item, title),
  });

  return (
    <div ref={drop} className="w-64 p-4 bg-gray-100 rounded">
      <input
        className="text-lg font-semibold mb-4 w-full border-b border-gray-400 bg-transparent"
        value={title}
        onChange={(e) => onTitleChange(title, e.target.value)}
      />
      <motion.div layout>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </motion.div>
    </div>
  );
}

function TaskModal({ tags, onCreate, onClose }) {
  const [task, setTask] = useState({
    name: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    assignee: "",
    tags: [],
  });

  const toggleTag = (tag) => {
    setTask((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleCreate = () => {
    onCreate({ ...task, id: uuidv4(), stage: "To Do" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl mb-4">Create a Task</h2>
        <input
          className="w-full border p-1 mb-2"
          placeholder="Name"
          onChange={(e) => setTask({ ...task, name: e.target.value })}
        />
        <textarea
          className="w-full border p-1 mb-2"
          placeholder="Description"
          onChange={(e) => setTask({ ...task, description: e.target.value })}
        />
        <input
          type="date"
          className="w-full border p-1 mb-2"
          onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
        />
        <input
          className="w-full border p-1 mb-2"
          placeholder="Assignee"
          onChange={(e) => setTask({ ...task, assignee: e.target.value })}
        />
        <select
          className="w-full border p-1 mb-2"
          onChange={(e) => setTask({ ...task, priority: e.target.value })}
        >
          <option>Low</option>
          <option selected>Medium</option>
          <option>High</option>
        </select>
        <div className="flex flex-wrap gap-1 mb-2">
          {[...new Set([...tags, ...DEFAULT_TAGS])].map((tag) => (
            <button
              key={tag}
              className={`px-2 py-1 text-sm rounded-full border ${task.tags.includes(tag) ? "bg-blue-300" : "bg-gray-200"}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </div>
      </div>
    </div>
  );
}

export default function KanbanApp() {
  const [tasks, setTasks] = useState([]);
  const [sections, setSections] = useState(["To Do", "In Progress", "Review", "Done"]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    mockFetchTasks().then((data) => setTasks(data));
  }, []);

  const moveTask = (task, toStage) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, stage: toStage } : t))
    );
  };

  const handleTitleChange = (oldTitle, newTitle) => {
    setSections((prev) => prev.map((title) => (title === oldTitle ? newTitle : title)));
    setTasks((prev) =>
      prev.map((t) => (t.stage === oldTitle ? { ...t, stage: newTitle } : t))
    );
  };

  const handleAddSection = () => {
    const newSection = `Stage ${sections.length + 1}`;
    setSections((prev) => [...prev, newSection]);
  };

  const handleCreateTask = (task) => {
    setTasks((prev) => [...prev, task]);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <Button onClick={() => setShowModal(true)}>Create a Task</Button>
        </div>
        <div className="flex gap-4 overflow-x-auto">
          {sections.map((stage) => (
            <Column
              key={stage}
              title={stage}
              onTitleChange={handleTitleChange}
              tasks={tasks.filter((t) => t.stage === stage)}
              onDrop={moveTask}
            />
          ))}
          <div className="flex items-center">
            <Button onClick={handleAddSection}>+ Add Section</Button>
          </div>
        </div>
      </div>
      {showModal && (
        <TaskModal
          tags={[...new Set(tasks.flatMap((t) => t.tags))]}
          onCreate={handleCreateTask}
          onClose={() => setShowModal(false)}
        />
      )}
    </DndProvider>
  );
}
