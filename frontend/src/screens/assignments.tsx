import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { ListItem } from "../components/list-item";
import { TailSpin } from "react-loader-spinner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

const assignmentSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  isCompleted: z.boolean(),
  assigneeId: z.number(),
  assigneeName: z.string(),
});

type AssignmentState = "pending" | "completed";

const assignmentsResponse = z.array(assignmentSchema);

async function getAssigments() {
  const response = await fetch("http://localhost:3000/assignments");
  const json = await response.json();
  return assignmentsResponse.parse(json);
}

async function updateAssignmentStatus(
  assignmentId: number,
  state: AssignmentState,
) {
  await fetch(`http://localhost:3000/assignments/${assignmentId}/${state}`, {
    method: "POST",
  });
}

export function Assigments() {
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
  });

  if (assignments === undefined || isLoading) {
    return (
      <View>
        <TailSpin />
        <Text>Loading your assigments...</Text>
      </View>
    );
  }

  const sortedAssignments = assignments.sort((a, b) =>
    a.isCompleted == b.isCompleted ? 0 : a.isCompleted ? 1 : -1,
  );

  return (
    <SafeAreaView className="text-black flex-1 items-center bg-slate-700">
      <View className="p-4 w-full">
        <StatusBar style="auto" />
        <FlatList
          contentContainerStyle={{ gap: 12 }}
          data={sortedAssignments}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              assignee={item.assigneeName}
              description={item.description}
              isCompleted={item.isCompleted}
              id={item.id}
              onPress={() =>
                mutate({
                  assignmentId: item.id,
                  state: item.isCompleted ? "pending" : "completed",
                })
              }
            />
          )}
          className="flex-grow-0 w-full p-2 h-full"
        />
      </View>
    </SafeAreaView>
  );
}
