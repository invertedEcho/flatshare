import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { RefreshControl, SafeAreaView, ScrollView, Text } from "react-native";
import { z } from "zod";
import AnimatedView from "../components/animated-view";
import Loading from "../components/loading";
import { TaskItem } from "../components/task-item";
import { fetchWrapper } from "../utils/fetchWrapper";
import { queryKeys } from "../utils/queryKeys";
import { AuthContext } from "../auth-context";
import { getDefinedValueOrThrow } from "../utils/assert";

export const taskSchema = z.object({
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  recurringTaskGroupId: z.number().nullable(),
  id: z.number(),
});

export type Task = z.infer<typeof taskSchema>;

async function getAllTasks({ groupId }: { groupId: number }) {
  const response = await fetchWrapper.get(`tasks?groupId=${groupId}`);
  const body = await response.json();
  const parsed = z.array(taskSchema).safeParse(body);
  if (!parsed.success) {
    console.error({ parseError: parsed.error });
    return [];
  }
  return parsed.data;
}

export default function AllTasksScreen() {
  const { user } = React.useContext(AuthContext);
  const groupId = getDefinedValueOrThrow(user?.groupId);
  const {
    data: tasks,
    isLoading,
    refetch: refetchAllTasks,
  } = useQuery({
    queryKey: [queryKeys.tasks],
    queryFn: () => {
      return getAllTasks({ groupId });
    },
  });
  const [refreshing, setRefreshing] = React.useState(false);

  if (tasks === undefined || isLoading) {
    return <Loading message="Loading all tasks..." />;
  }

  async function refreshTasks() {
    setRefreshing(true);
    refetchAllTasks();
    setRefreshing(false);
  }

  return (
    <AnimatedView>
      <SafeAreaView className="text-black flex-1 items-center bg-slate-900">
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshTasks} />
          }
          className="p-4 w-full"
          contentContainerStyle={{ gap: 12 }}
        >
          <StatusBar style="auto" />
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskItem
                title={task.title}
                description={task.description}
                createdAt={task.createdAt}
                id={task.id}
                recurringTaskGroupId={task.recurringTaskGroupId}
                key={task.id}
              />
            ))
          ) : (
            <Text className="text-white">
              Your current group does not have any tasks.
            </Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </AnimatedView>
  );
}
