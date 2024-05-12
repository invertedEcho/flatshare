import { IntervalType } from "../screens/create-task";

type IntervalItem = { label: string; value: IntervalType };
export const intervalItems = [
  { label: "Hours", value: "hours" },
  { label: "Days", value: "days" },
  { label: "Weeks", value: "weeks" },
] satisfies IntervalItem[];
