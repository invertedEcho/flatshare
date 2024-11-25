import { TaskToAssign } from 'src/db/functions/assignment';

export function groupTasksToAssignByTaskGroupId(tasksToAssign: TaskToAssign[]) {
  return tasksToAssign.reduce<Map<number, TaskToAssign[]>>((acc, curr) => {
    if (!acc.get(curr.taskGroupId)) {
      acc.set(curr.taskGroupId, []);
    }
    acc.get(curr.taskGroupId)?.push({
      ...curr,
      taskGroupInitialStartDate: curr.taskGroupInitialStartDate,
    });
    return acc;
  }, new Map());
}
