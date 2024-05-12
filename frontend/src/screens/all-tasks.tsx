import { StatusBar } from "expo-status-bar";
import { FlatList, SafeAreaView, ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import Loading from "../components/loading";
import { TaskItem } from "../components/task-item";
import { fetchWrapper } from "../utils/fetchWrapper";

const taskSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  interval: z.string().nullable(),
  id: z.number(),
  createdAt: z.coerce.date(),
});

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
      <ScrollView className="p-4 w-full">
        <StatusBar style="auto" />
        <FlatList
          contentContainerStyle={{ gap: 12 }}
          data={data}
          renderItem={({ item: task }) => (
            <TaskItem
              title={task.title}
              description={task.description}
              interval={task.interval}
              createdAt={task.createdAt}
              id={task.id}
            />
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
