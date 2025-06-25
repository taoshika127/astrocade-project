import { useDrag } from "react-dnd";
const TaskCard = ({ task, onClick }: any) => {
  const [, drag] = useDrag({
    type: "task",
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

export default TaskCard;