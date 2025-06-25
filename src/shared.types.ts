export type Task = {
    id: string;
    name: string;
    description: string;
    status: string;
    dueDate: string;
    priority: "Low" | "Medium" | "High";
    assignee: string;
    tags: string[];
  };