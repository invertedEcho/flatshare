import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

const mockAssignments = [
  {
    title: "Staubsaugen",
    description: "Sauge den Boden in Flur, Kuche und Bad.",
    isCompleted: false,
    assigneeId: 0,
    assigneeName: "Julian",
    id: 0,
  },
  {
    title: "Boden Wischen",
    description: "Wische den Boden in Flur, Kuche und Bad.",
    isCompleted: false,
    assigneeId: 1,
    assigneeName: "Felix",
    id: 1,
  },
  {
    title: "Klo Putzen",
    description: "Putze das Klo.",
    isCompleted: false,
    assigneeId: 1,
    assigneeName: "Felix",
    id: 2,
  },
];

export function HomeScreen() {
  const [assignments, setAssignments] = useState(mockAssignments);

  function handleListItemPress(id: number) {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === id
          ? { ...assignment, isCompleted: !assignment.isCompleted }
          : assignment
      )
    );
  }
  return (
    <SafeAreaView className="text-black flex-1 items-center  bg-slate-700">
      <View className="p-4 w-full">
        <StatusBar style="auto" />
        <FlatList
          contentContainerStyle={{ gap: 12 }}
          data={assignments.sort((a, b) => (a == b ? 0 : a ? 1 : -1))}
          renderItem={({ item }) => (
            <ListItem
              title={item.title}
              assignee={item.assigneeName}
              description={item.description}
              isCompleted={item.isCompleted}
              id={item.id}
              onPress={handleListItemPress}
            />
          )}
          className="flex-grow-0 w-full  p-2 h-full"
        ></FlatList>
      </View>
    </SafeAreaView>
  );
}

type ListItemProps = {
  title: string;
  description: string;
  assignee: string;
  isCompleted: boolean;
  id: number;
  onPress(id: number): void;
};

function ListItem({
  title,
  description,
  assignee,
  isCompleted,
  id,
  onPress,
}: ListItemProps) {
  return (
    <Pressable
      className="p-2  bg-slate-900 flex-row items-center justify-between rounded-lg"
      onPress={() => onPress(id)}
    >
      <View>
        <Text
          className={`font-semibold text-lg text-gray-200 ${
            isCompleted && "line-through"
          }`}
        >
          {title}
        </Text>
        <Text className="text-gray-100">{description}</Text>
      </View>
      <BouncyCheckbox
        size={25}
        unFillColor="#FFFFFF"
        iconStyle={{ borderColor: "black" }}
        innerIconStyle={{ borderWidth: 2 }}
        isChecked={isCompleted}
        onPress={() => onPress(id)}
      />
    </Pressable>
  );
}
