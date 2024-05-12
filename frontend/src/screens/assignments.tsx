import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { AuthContext } from "../auth-context";
import { AssignmentItem } from "../components/assignment-item";
import Loading from "../components/loading";
import UserDropdown from "../components/user-dropdown";
import { fetchWrapper } from "../utils/fetchWrapper";

const assignmentSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  isCompleted: z.boolean(),
  assigneeId: z.number(),
  assigneeName: z.string(),
  createdAt: z.coerce.date(),
});

const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  createdAt: z.coerce.date(),
});

type AssignmentState = "pending" | "completed";

const assignmentsResponse = z.array(assignmentSchema);
const usersResponse = z.array(userSchema);

async function getAssigments() {
  const res = await fetchWrapper.get("assignments");
  const assignments = await res.json();
  return assignmentsResponse.parse(assignments);
}

async function getUsers() {
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
    queryKey: ["todos"],
    queryFn: getAssigments,
  });
  const { userId } = React.useContext(AuthContext);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const [selectedUserId, setSelectedUserId] = React.useState(userId);

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

  if (assignments === undefined || users === undefined || isLoading) {
    return <Loading message="Loading your assignments..." />;
  }

  const sortedAssignments = assignments.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const filteredAssignments = sortedAssignments.filter(
    (assignment) => assignment.assigneeId === selectedUserId
  );

  return (
    <SafeAreaView className="text-black flex-1 bg-slate-700">
      <View className="p-4 w-full">
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
        <StatusBar style="auto" />
        <FlatList
          contentContainerStyle={{ gap: 12 }}
          data={filteredAssignments}
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
