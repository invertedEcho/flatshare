import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { FlatList, SafeAreaView, ScrollView } from "react-native";
import { z } from "zod";
import Loading from "../components/loading";
import { TaskItem } from "../components/task-item";
import { fetchWrapper } from "../utils/fetchWrapper";

export const taskSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  taskGroupId: z.number().nullable(),
  id: z.number(),
});

export type Task = z.infer<typeof taskSchema>;

async function getAllTasks() {
  const response = await fetchWrapper.get("tasks");
  const body = await response.json();
  const parsed = z.array(taskSchema).safeParse(body);
  if (!parsed.success) {
    console.error({ parseError: parsed.error });
    return [];
  }
  return parsed.data;
}

export default function AllTasksScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: getAllTasks,
  });

  if (data === undefined || isLoading) {
    return <Loading message="Loading all tasks" />;
  }

  return (
    <SafeAreaView className="text-black flex-1 items-center bg-slate-700">
      <ScrollView className="p-4 w-full" contentContainerStyle={{ gap: 12 }}>
        <StatusBar style="auto" />
        {data.map((task) => (
          <TaskItem
            title={task.title}
            description={task.description}
            createdAt={task.createdAt}
            id={task.id}
            taskGroupId={task.taskGroupId}
            key={task.id}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
