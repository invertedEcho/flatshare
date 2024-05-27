import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import {
  RefreshControl,
  SafeAreaView,
  SectionList,
  Text,
  View,
} from "react-native";
import { z } from "zod";
import { AuthContext } from "../auth-context";
import AnimatedView from "../components/animated-view";
import { AssignmentItem } from "../components/assignment-item";
import Loading from "../components/loading";
import UserDropdown from "../components/user-dropdown";
import { fetchWrapper } from "../utils/fetchWrapper";
import { queryKeys } from "../utils/queryKeys";

export const assignmentSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  isCompleted: z.boolean(),
  assigneeId: z.number(),
  assigneeName: z.string(),
  createdAt: z.coerce.date(),
  isOneOff: z.boolean(),
  dueDate: z.coerce.date().nullable(),
});

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  createdAt: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;
export type Assignment = z.infer<typeof assignmentSchema>;

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

  if (assignments === undefined || users === undefined || isLoading) {
    return <Loading message="Loading your assignments..." />;
  }

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.assigneeId === selectedUserId &&
      !(assignment.isOneOff && assignment.isCompleted)
  );

  const oneOffAssignments = filteredAssignments.filter(
    (assignment) => assignment.isOneOff
  );

  const recurringAssignments = filteredAssignments.filter(
    (assignment) => !assignment.isOneOff
  );

  const assignmentsByDateTimestamp = recurringAssignments.reduce<
    Map<number, Assignment[]>
  >((acc, curr) => {
    if (curr.dueDate !== null) {
      const currTime = curr.dueDate.getTime();
      if (!acc.get(currTime)) {
        acc.set(currTime, []);
      }
      acc.get(currTime)?.push(curr);
    }
    return acc;
  }, new Map());

  const sectionedListData = (
    oneOffAssignments.length !== 0
      ? [{ title: "One-off assignments", data: oneOffAssignments }]
      : []
  ).concat(
    Array.from(assignmentsByDateTimestamp)
      .sort(
        ([dateTimeStampA], [dateTimeStampB]) => dateTimeStampA - dateTimeStampB
      )
      .map(([dateTimestamp, assignments]) => ({
        title: `Due on ${new Date(dateTimestamp).toLocaleDateString("en-GB")}`,
        data: assignments.sort((a, b) => a.title.localeCompare(b.title)),
      }))
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
            <Text className="text-white font-semibold text-md">From user</Text>
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
          <SectionList
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshAssignments}
              />
            }
            stickySectionHeadersEnabled={false}
            keyExtractor={(item) => item.title}
            contentContainerStyle={{ gap: 12 }}
            sections={sectionedListData}
            renderSectionHeader={({ section }) => (
              <Text className="text-white font-semibold text-md">
                {section.title}
              </Text>
            )}
            renderItem={({ item: assignment }) => (
              <AssignmentItem
                assignment={assignment}
                disabled={assignment.assigneeId !== userId}
                onPress={() => {
                  mutate({
                    assignmentId: assignment.id,
                    state: assignment.isCompleted ? "pending" : "completed",
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
