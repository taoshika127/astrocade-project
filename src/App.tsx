import React, { useState } from "react";
import {
  DndProvider,
  useDrag,
  useDrop,
} from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";

type Task = {
  id: string;
  name: string;
  description: string;
  status: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High";
  assignee: string;
  tags: string[];
};

const defaultTags = ["super urgent", "complete ASAP", "optional", "work", "casual"];

const initialSections = ["To Do", "In Progress", "Review", "Done"];

const priorities = ["Low", "Medium", "High"];

const generateDummyTasks = (): Task[] => {
  const dummy: Task[] = [];
  for (let i = 1; i <= 15; i++) {
    dummy.push({
      id: uuidv4(),
      name: `Task ${i}`,
      description: `This is a description of task ${i}`,
      status: initialSections[i % 4],
      dueDate: new Date(
        Date.now() + (Math.random() * 14 - 7) * 86400000
      ).toISOString().slice(0, 10),
      priority: priorities[i % 3] as "Low" | "Medium" | "High",
      assignee: `User ${i % 5}`,
      tags: [defaultTags[i % defaultTags.length]],
    });
  }
  return dummy;
};

const ItemType = {
  TASK: "task",
};

const App = () => {
  const [tasks, setTasks] = useState<Task[]>(generateDummyTasks());
  const [sections, setSections] = useState(initialSections);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<any>({});
  const [sort, setSort] = useState("");

  const [tagPool, setTagPool] = useState<string[]>([...defaultTags]);

  const moveTask = (taskId: string, newStatus: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );
  };

  const filteredTasks = tasks
    .filter((task) => {
      const searchMatch =
        search === "" ||
        Object.values(task).some((value) =>
          typeof value === "string"
            ? value.toLowerCase().includes(search.toLowerCase())
            : Array.isArray(value)
            ? value.some((tag) =>
                tag.toLowerCase().includes(search.toLowerCase())
              )
            : false
        );
      return searchMatch;
    })
    .filter((task) => {
      if (filter.overdue) {
        const today = new Date();
        if (new Date(task.dueDate) >= today) return false;
      }
      if (filter.dueSoon) {
        const today = new Date();
        const weekLater = new Date();
        weekLater.setDate(today.getDate() + 7);
        const dueDate = new Date(task.dueDate);
        if (!(dueDate > today && dueDate <= weekLater)) return false;
      }
      if (filter.priority?.length && !filter.priority.includes(task.priority))
        return false;
      if (filter.assignee?.length && !filter.assignee.includes(task.assignee))
        return false;
      if (
        filter.tags?.length &&
        !filter.tags.every((t: string) => task.tags.includes(t))
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "dueDate") return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (sort === "az") return a.name.localeCompare(b.name);
      if (sort === "za") return b.name.localeCompare(a.name);
      if (sort === "prioLow") return priorities.indexOf(a.priority) - priorities.indexOf(b.priority);
      if (sort === "prioHigh") return priorities.indexOf(b.priority) - priorities.indexOf(a.priority);
      return 0;
    });

  const openTaskModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsModalOpen(true);
  };

  const handleSubmitTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newTask: Task = {
      id: editingTask?.id || uuidv4(),
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      dueDate: formData.get("dueDate") as string,
      priority: formData.get("priority") as "Low" | "Medium" | "High",
      assignee: formData.get("assignee") as string,
      tags: editingTask?.tags || [],
      status: formData.get("status") as string,
    };
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? newTask : t))
      );
    } else {
      setTasks((prev) => [...prev, { ...newTask, status: "To Do" }]);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const addNewSection = () => {
    if (newSectionName && !sections.includes(newSectionName)) {
      setSections((prev) => [...prev, newSectionName]);
      setNewSectionName("");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 text-gray-800">
        {/* Navbar */}
        <nav className="flex items-center justify-between bg-white shadow px-4 py-2 sticky top-0 z-50">
          <h1
            className="text-xl font-bold cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Sijia's Kanban
          </h1>
          <input
            className="border rounded px-2 py-1 w-1/3"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded"
            onClick={() => openTaskModal()}
          >
            Create a Task
          </button>
        </nav>

        {/* Filter & Sort */}
        <div className="flex justify-between items-center p-4">
          <div>
            <select
              className="border rounded p-1"
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Sort</option>
              <option value="dueDate">Due Date</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
              <option value="prioLow">Priority Low to High</option>
              <option value="prioHigh">Priority High to Low</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => setFilter((prev: any) => ({ ...prev, overdue: !prev.overdue }))}
              className={`px-2 py-1 rounded border ${
                filter.overdue ? "bg-red-200" : ""
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilter((prev: any) => ({ ...prev, dueSoon: !prev.dueSoon }))}
              className={`ml-2 px-2 py-1 rounded border ${
                filter.dueSoon ? "bg-yellow-200" : ""
              }`}
            >
              Due Soon
            </button>
          </div>
        </div>

        {/* Task Board */}
        <div className="flex overflow-x-auto p-4 space-x-4">
          {sections.map((section) => (
            <Section
              key={section}
              name={section}
              tasks={filteredTasks.filter((t) => t.status === section)}
              moveTask={moveTask}
              onTaskClick={setSelectedTask}
            />
          ))}
          <div className="flex flex-col items-center">
            <input
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="New section"
              className="border rounded p-1 mb-1"
            />
            <button
              className="text-green-600 text-2xl"
              onClick={addNewSection}
            >
              +
            </button>
          </div>
        </div>

        {/* Modals */}
        {isModalOpen && (
          <TaskModal
            onClose={() => {
              setIsModalOpen(false);
              setEditingTask(null);
            }}
            onSubmit={handleSubmitTask}
            task={editingTask}
            tags={tagPool}
            setTags={setTagPool}
          />
        )}
        {selectedTask && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            onClick={() => setSelectedTask(null)}
          >
            <div
              className="bg-white p-4 rounded shadow max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold">{selectedTask.name}</h2>
              <p>{selectedTask.description}</p>
              <p>Due: {selectedTask.dueDate}</p>
              <p>Priority: {selectedTask.priority}</p>
              <p>Assignee: {selectedTask.assignee}</p>
              <p>Tags: {selectedTask.tags.join(", ")}</p>
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-1 rounded"
                onClick={() => {
                  openTaskModal(selectedTask);
                  setSelectedTask(null);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

// Section Component
const Section = ({ name, tasks, moveTask, onTaskClick }: any) => {
  const [, drop] = useDrop({
    accept: ItemType.TASK,
    drop: (item: any) => moveTask(item.id, name),
  });

  return (
    <div ref={drop} className="w-72 flex-shrink-0 bg-white rounded shadow p-2">
      <h3 className="font-bold text-lg mb-2">{name}</h3>
      {tasks.map((task: Task) => (
        <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
      ))}
    </div>
  );
};

// TaskCard Component
const TaskCard = ({ task, onClick }: any) => {
  const [, drag] = useDrag({
    type: ItemType.TASK,
    item: { id: task.id },
  });

  return (
    <div
      ref={drag}
      onClick={onClick}
      className="bg-gray-100 p-2 rounded mb-2 cursor-pointer shadow"
    >
      <p className="font-semibold">{task.name}</p>
      <p className="text-sm">{task.dueDate}</p>
      <p className="text-xs">{task.priority}</p>
    </div>
  );
};

// TaskModal Component
const TaskModal = ({ onClose, onSubmit, task, tags, setTags }: any) => {
  const [currentTags, setCurrentTags] = useState<string[]>(task?.tags || []);
  const [availableTags, setAvailableTags] = useState<string[]>(
    tags.filter((tag: string) => !currentTags.includes(tag))
  );
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState("");

  const addTag = () => {
    if (!newTag) {
      setError("Tag cannot be empty");
      return;
    }
    if (currentTags.includes(newTag) || availableTags.includes(newTag)) {
      setError("Tag already exists");
      return;
    }
    setCurrentTags((prev) => [...prev, newTag]);
    setTags((prev: string[]) => [...prev, newTag]);
    setNewTag("");
    setError("");
  };

  const removeTag = (tag: string) => {
    setCurrentTags((prev) => prev.filter((t) => t !== tag));
    setAvailableTags((prev) => [...prev, tag]);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          task.tags = currentTags;
          onSubmit(e);
        }}
        className="bg-white p-6 rounded shadow max-w-md w-full space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold">
          {task ? "Edit Task" : "Create Task"}
        </h2>
        <input name="name" defaultValue={task?.name} className="border p-1 w-full" placeholder="Name" required />
        <textarea name="description" defaultValue={task?.description} className="border p-1 w-full" placeholder="Description" />
        <input type="date" name="dueDate" defaultValue={task?.dueDate} className="border p-1 w-full" required />
        <select name="priority" defaultValue={task?.priority} className="border p-1 w-full">
          {priorities.map((p) => <option key={p}>{p}</option>)}
        </select>
        <input name="assignee" defaultValue={task?.assignee} className="border p-1 w-full" placeholder="Assignee" />
        <select name="status" defaultValue={task?.status || "To Do"} className="border p-1 w-full">
          {initialSections.map((s) => <option key={s}>{s}</option>)}
        </select>
        <div>
          <p className="text-sm font-semibold">Current tags:</p>
          <div className="flex flex-wrap gap-1 my-1">
            {currentTags.map((tag: string) => (
              <span key={tag} className="bg-blue-200 px-2 py-0.5 rounded text-sm flex items-center">
                {tag}
                <button
                  type="button"
                  className="ml-1 text-red-600"
                  onClick={() => removeTag(tag)}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <p className="text-sm">Choose tags from:</p>
          <div className="flex flex-wrap gap-1 my-1">
            {availableTags.map((tag: string) => (
              <button
                key={tag}
                type="button"
                className="bg-gray-200 px-2 py-0.5 rounded text-sm"
                onClick={() => {
                  setCurrentTags((prev) => [...prev, tag]);
                  setAvailableTags((prev) => prev.filter((t) => t !== tag));
                }}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="enter a new tag name"
              className="border p-1 w-full"
            />
            <button
              type="button"
              className="bg-green-500 text-white px-3 rounded"
              onClick={addTag}
            >
              Add
            </button>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
          Submit
        </button>
      </form>
    </div>
  );
};

export default App;
