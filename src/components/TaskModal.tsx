import { useState } from 'react';
import { priorities, initialSections} from "../utils/constants";
import Tag from './Tag';

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
          if (task) {
            task.tags = currentTags;
          }
          onSubmit(e, currentTags);
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
             <Tag key={tag}
             text={tag}
             onClick={() => removeTag(tag)}
             canRemove={true}
             />
            ))}
          </div>
          <p className="text-sm">Choose tags from:</p>
          <div className="flex flex-wrap gap-1 my-1">
            {availableTags.map((tag: string) => (
              <Tag key={tag}
              text={tag}
              canRemove={false}
              onClick={() => {
                setCurrentTags((prev) => [...prev, tag]);
                setAvailableTags((prev) => prev.filter((t) => t !== tag));
              }} />
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
              className="bg-blue-500 text-white px-3 rounded"
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

export default TaskModal;