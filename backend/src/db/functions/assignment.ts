import { AssignmentResponse } from 'src/types';
import { db } from '..';
import {
  AssignmentState,
  assignmentTable,
  taskTable,
  userTable,
} from '../schema';
import { eq } from 'drizzle-orm';

export async function dbGetAllAssignments(): Promise<AssignmentResponse[]> {
  const queryResult = await db
    .select()
    .from(assignmentTable)
    .innerJoin(taskTable, eq(assignmentTable.taskId, taskTable.id))
    .innerJoin(userTable, eq(assignmentTable.userId, userTable.id));

  return queryResult.map((query) => {
    return {
      title: query.task.title,
      description: query.task.description,
      id: query.assignment.id,
      assigneeId: query.assignment.userId,
      assigneeName: query.user.email,
      isCompleted: query.assignment.state === 'completed',
    } satisfies AssignmentResponse;
  });
}

export async function dbChangeAssignmentState(
  assignmentId: number,
  state: AssignmentState,
) {
  await db
    .update(assignmentTable)
    .set({ state })
    .where(eq(assignmentTable.id, assignmentId));
}
