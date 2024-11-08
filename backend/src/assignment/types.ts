export type AssignmentResponse = {
  id: number;
  title: string;
  description: string | null;
  assigneeId: number;
  assigneeName: string;
  isCompleted: boolean;
  createdAt: Date;
  isOneOff: boolean;
  dueDate: Date | null;
};
