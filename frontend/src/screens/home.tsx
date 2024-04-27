import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { FlatList, SafeAreaView, Text, View } from "react-native";
import { ListItem } from "../components/list-item";
import { TailSpin } from "react-loader-spinner";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";

type Assignment = {
  title: string;
  description: string;
  isCompleted: boolean;
  assigneeId: number;
  assigneeName: string;
  id: number;
};

async function getAssigments() {
  const response = await fetch("http://localhost:3000/assigments");
  if (!response.ok) {
    return undefined;
  }
  // TODO: validate with zod
  const json = await response.json();
  return json;
}

const queryClient = new QueryClient();

export function Assigments() {
  const queryClient = useQueryClient();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: getAssigments,
  });
  console.log({ assignments });

  // function handleListItemPress(id: number) {
  //   setAssignments(
  //     (prev) =>
  //       prev?.map((assignment) =>
  //         assignment.id === id
  //           ? {
  //               ...assignment,
  //               isCompleted: !assignment.isCompleted,
  //             }
  //           : assignment,
  //       ),
  //   );
  // }

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
              onPress={() => {}}
            />
          )}
          className="flex-grow-0 w-full  p-2 h-full"
        />
      </View>
    </SafeAreaView>
  );
}
