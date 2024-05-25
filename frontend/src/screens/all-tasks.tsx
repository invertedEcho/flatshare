import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { RefreshControl, SafeAreaView, ScrollView } from "react-native";
import { z } from "zod";
import AnimatedView from "../components/animated-view";
import Loading from "../components/loading";
import { TaskItem } from "../components/task-item";
import { fetchWrapper } from "../utils/fetchWrapper";
import { queryKeys } from "../utils/queryKeys";

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
    queryKey: [queryKeys.tasks],
    queryFn: getAllTasks,
  });
  const [refreshing, setRefreshing] = React.useState(false);
  const queryClient = useQueryClient();

  if (data === undefined || isLoading) {
    return <Loading message="Loading all tasks" />;
  }

  async function refreshTasks() {
    setRefreshing(true);
    await queryClient.refetchQueries({ queryKey: [queryKeys.tasks] });
    setRefreshing(false);
  }

  return (
    <AnimatedView key="tasksall">
      <SafeAreaView className="text-black flex-1 items-center bg-slate-900">
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshTasks} />
          }
          className="p-4 w-full"
          contentContainerStyle={{ gap: 12 }}
        >
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
    </AnimatedView>
  );
}
