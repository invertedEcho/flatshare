import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";

type Assignment = {
  title: string;
  description: string;
  isCompleted: boolean;
  assigneeId: number;
  assigneeName: string;
  id: number;
};

export function HomeScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${process.env.EXPO_PUBLIC_API_URL}/assignments`)
      .then((res) => res.json())
      .then((json) => {
        setAssignments(json);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  function handleListItemPress(id: number) {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === id
          ? {
              ...assignment,
              isCompleted: !assignment.isCompleted,
            }
          : assignment,
      ),
    );
  }

  if (!assignments || isLoading) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }

  const sortedAssignments = assignments.sort((a, b) =>
    a.isCompleted == b.isCompleted ? 0 : a.isCompleted ? 1 : -1,
  );

  return (
    <SafeAreaView className="text-black flex-1 items-center  bg-slate-700">
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
