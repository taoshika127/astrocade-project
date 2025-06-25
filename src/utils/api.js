// src/utils/api.js
export const fetchMockTasks = (count = 10, delay = 300) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const sample = Array.from({ length: count }, (_, i) => ({
          id: i,
          name: `Task ${i + 1}`,
          description: 'Task description',
          dueDate: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
          priority: ['Low', 'Medium', 'High'][i % 3],
          assignee: `User ${i % 5}`,
          tags: ['work', 'optional'].filter((_, j) => j === i % 2),
          status: ['To Do', 'In Progress', 'Review', 'Done'][i % 4]
        }));
        resolve(sample);
      }, delay);
    });
  };