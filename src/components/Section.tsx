import { useDrop } from "react-dnd";
import TaskCard from "./TaskCard";
import { Task } from "@/shared.types.js";


const Section = ({ name, tasks, moveTask, onTaskClick }: any) => {
  const [, drop] = useDrop({
    accept: "task",
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

export default Section;