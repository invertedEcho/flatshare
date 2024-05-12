import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { FlatList, SafeAreaView, View } from "react-native";
import { AssignmentItem } from "../components/assignment-item";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { fetchWrapper } from "../utils/fetchWrapper";
import Loading from "../components/loading";

const assignmentSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  isCompleted: z.boolean(),
  assigneeId: z.number(),
  assigneeName: z.string(),
});

type AssignmentState = "pending" | "completed";

const assignmentsResponse = z.array(assignmentSchema);

async function getAssigments() {
  const res = await fetchWrapper.get("assignments");
  const assignments = await res.json();
  return assignmentsResponse.parse(assignments);
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
    queryKey: ["todos"],
    queryFn: getAssigments,
  });

  const { mutate } = useMutation({
    mutationFn: ({
      assignmentId,
      state,
    }: {
      assignmentId: number;
      state: AssignmentState;
    }) => updateAssignmentStatus(assignmentId, state),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["todos"] });
    },
  });

  if (assignments === undefined || isLoading) {
    return <Loading message="Loading your assignments..." />;
  }

  return (
    <SafeAreaView className="text-black flex-1 bg-slate-700">
      <View className="p-4 w-full">
        <StatusBar style="auto" />
        <FlatList
          contentContainerStyle={{ gap: 12 }}
          data={assignments}
          renderItem={({ item }) => (
            <AssignmentItem
              title={item.title}
              description={item.description}
              isCompleted={item.isCompleted}
              id={item.id}
              onPress={() => {
                mutate({
                  assignmentId: item.id,
                  state: item.isCompleted ? "pending" : "completed",
                });
              }}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}
