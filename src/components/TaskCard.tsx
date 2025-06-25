import { useDrag } from "react-dnd";
import Tag from "./Tag";


const setTextColor = (priority: string) => {
  if (priority === 'Medium') {
    return "text-yellow-500"
  } else if (priority === 'High') {
    return "text-red-600"
  } else {
    return "text-green-600"
  }

}

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
      <div className="flex justify-between py-2">
      <div className="font-semibold pb-2">{task.name}</div>
      <div className={`${setTextColor(task.priority)} text-sm`}>{task.priority}</div>
      </div>
      <p className="text-sm pb-2">{"Due: " + task.dueDate}</p>
      {task.tags.map(tag => (<span className="pr-2"><Tag text={tag} key={tag} canRemove={false} /></span>))}
    </div>
  );
};

export default TaskCard;