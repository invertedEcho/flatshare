import { AssignmentResponse } from 'src/types';
import { db } from '..';
import {
  AssignmentState,
  assignmentTable,
  taskTable,
  userTable,
  userTaskTable,
} from '../schema';
import { eq } from 'drizzle-orm';

export async function dbGetAllAssignments(): Promise<AssignmentResponse[]> {
  try {
    const queryResult = await db
      .select()
      .from(assignmentTable)
      .innerJoin(
        userTaskTable,
        eq(assignmentTable.userTaskId, userTaskTable.id),
      )
      .innerJoin(userTable, eq(userTaskTable.userId, userTable.id))
      .innerJoin(taskTable, eq(userTaskTable.taskId, taskTable.id));

    return queryResult.map((query) => {
      return {
        title: query.task.title,
        description: query.task.description,
        id: query.assignment.id,
        assigneeId: query.user.id,
        assigneeName: query.user.email,
        isCompleted: query.assignment.state === 'completed',
      } satisfies AssignmentResponse;
    });
  } catch (error) {
    console.error({ error });
    throw error;
  }
}

export async function dbChangeAssignmentState(
  assignmentId: number,
  state: AssignmentState,
) {
  try {
    await db
      .update(assignmentTable)
      .set({ state })
      .where(eq(assignmentTable.id, assignmentId));
  } catch (error) {
    console.error({ error });
    throw error;
  }
}
