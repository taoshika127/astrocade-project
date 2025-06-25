import { v4 as uuidv4 } from "uuid";
import { priorities, initialSections, defaultTags} from "./constants";
import { Task } from "../shared.types";

const assignees = ["Alice", "Bob", "Charlie", "Dana", "Eli", "Fatima", "George"];

const getRandomFromArray = <T,>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const getRandomTags = (): string[] => {
  const shuffled = [...defaultTags].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 1);
};

const generateDummyTasks = (count = 15): Task[] => {
  const taskTemplates = [
    "Fix login bug",
    "Implement search feature",
    "Refactor user profile page",
    "Write unit tests for dashboard",
    "Design onboarding flow",
    "Update README documentation",
    "Optimize database queries",
    "Configure CI/CD pipeline",
    "Fix mobile responsiveness",
    "Improve accessibility",
    "Review pull request #42",
    "Prepare sprint demo",
    "Analyze user feedback",
    "Migrate to TypeScript",
    "Implement dark mode",
  ];

  return Array.from({ length: count }, (_, i) => {
    const name = taskTemplates[i % taskTemplates.length];
    return {
      id: uuidv4(),
      name,
      description: `This task is about ${name.toLowerCase()}. Make sure to follow the guidelines and check for edge cases.`,
      dueDate: new Date(
        Date.now() + (Math.random() * 14 - 7) * 86400000
      ).toISOString().slice(0, 10),
      priority: getRandomFromArray(priorities),
      assignee: getRandomFromArray(assignees),
      status: getRandomFromArray(initialSections),
      tags: getRandomTags(),
    };
  });
};

export default generateDummyTasks;
