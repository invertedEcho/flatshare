import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";
import { z } from "zod";
import { AuthContext } from "../auth-context";
import { AssignmentItem } from "../components/assignment-item";
import Loading from "../components/loading";
import UserDropdown from "../components/user-dropdown";
import { fetchWrapper } from "../utils/fetchWrapper";
import { queryKeys } from "../utils/queryKeys";
import AnimatedView from "../components/animated-view";

export const assignmentSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  isCompleted: z.boolean(),
  assigneeId: z.number(),
  assigneeName: z.string(),
  createdAt: z.coerce.date(),
});

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  createdAt: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;

type AssignmentState = "pending" | "completed";

const assignmentsResponse = z.array(assignmentSchema);
const usersResponse = z.array(userSchema);

async function getAssigments() {
  const res = await fetchWrapper.get("assignments");
  const assignments = await res.json();
  return assignmentsResponse.parse(assignments);
}

export async function getUsers() {
  const res = await fetchWrapper.get("users");
  const users = await res.json();
  return usersResponse.parse(users);
}

async function updateAssignmentStatus(
  assignmentId: number,
  state: AssignmentState
) {
  await fetchWrapper.post(`assignments/${assignmentId}/${state}`);
}

export function AssigmentsScreen() {
  const queryClient = useQueryClient();
  const { data: assignments, isLoading } = useQuery({
    queryKey: [queryKeys.assignments],
    queryFn: getAssigments,
  });
  const { userId } = React.useContext(AuthContext);

  const { data: users } = useQuery({
    queryKey: [queryKeys.users],
    queryFn: getUsers,
  });

  const [selectedUserId, setSelectedUserId] = React.useState(userId);
  const [refreshing, setRefreshing] = React.useState(false);

  const { mutate } = useMutation({
    mutationFn: ({
      assignmentId,
      state,
    }: {
      assignmentId: number;
      state: AssignmentState;
    }) => updateAssignmentStatus(assignmentId, state),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [queryKeys.assignments] });
    },
  });

  console.log({ assignments });
  if (assignments === undefined || users === undefined || isLoading) {
    return <Loading message="Loading your assignments..." />;
  }

  const sortedAssignments = assignments.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const filteredAssignments = sortedAssignments.filter(
    (assignment) => assignment.assigneeId === selectedUserId
  );

  async function refreshAssignments() {
    setRefreshing(true);
    await queryClient.refetchQueries({
      queryKey: [queryKeys.assignments],
    });
    setRefreshing(false);
  }

  return (
    <AnimatedView>
      <SafeAreaView className="text-black flex-1 bg-slate-900">
        <View className="p-4 w-full" style={{ gap: 20 }}>
          <View>
            <Text className="text-white" style={{ fontSize: 16 }}>
              From user
            </Text>
            <UserDropdown
              data={users.map((user) => ({
                label: user.username,
                value: String(user.id),
              }))}
              onChange={(id: number) => {
                setSelectedUserId(id);
              }}
              selectedUserId={selectedUserId}
            />
          </View>
          <StatusBar style="auto" />
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshAssignments}
              />
            }
            contentContainerStyle={{ gap: 12 }}
            data={filteredAssignments}
            renderItem={({ item }) => (
              <AssignmentItem
                title={item.title}
                description={item.description}
                isCompleted={item.isCompleted}
                id={item.id}
                disabled={item.assigneeId !== userId}
                onPress={() => {
                  mutate({
                    assignmentId: item.id,
                    state: item.isCompleted ? "pending" : "completed",
                  });
                  queryClient.refetchQueries({
                    queryKey: [queryKeys.assignments],
                  });
                }}
              />
            )}
          />
        </View>
      </SafeAreaView>
    </AnimatedView>
  );
}
