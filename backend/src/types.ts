// TODO: this has to go somewhere else

export type AssignmentResponse = {
  id: number;
  title: string;
  description: string | null;
  assigneeId: number;
  assigneeName: string;
  isCompleted: boolean;
};
