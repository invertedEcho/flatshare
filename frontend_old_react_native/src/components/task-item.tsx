import Feather from "@expo/vector-icons/Feather";
import * as React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Task } from "../screens/all-tasks";
import { EditTaskForm } from "./edit-task-form";
import { Ionicons } from "@expo/vector-icons";
import { modalStyles } from "../styles/modal";

export function TaskItem({
  id,
  title,
  description,
  createdAt,
  recurringTaskGroupId,
}: Task) {
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <View className="p-2 bg-white flex-row justify-between items-start rounded-lg">
      <View style={{ flexGrow: 1 }}>
        <Text className="font-semibold text-lg text-slate-900">{title}</Text>
        {description && (
          <Text className="text-base text-slate-500">{description}</Text>
        )}
        <Text className="text-slate-400 text-xs">
          Created at {createdAt.toLocaleString()}
        </Text>
      </View>
      <View className="justify-center self-center">
        <Pressable onPress={() => setIsEditing(true)}>
          {isEditing ? (
            <Feather size={30} color="black" name="save" />
          ) : (
            <Feather size={30} color="black" name="edit" />
          )}
        </Pressable>
      </View>
      <Modal
        visible={isEditing}
        animationType="fade"
        transparent
        onRequestClose={() => {
          setIsEditing(false);
        }}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Pressable
              className="absolute top-4 right-4"
              onPress={() => {
                setIsEditing(false);
              }}
            >
              <Ionicons name="close" size={30} />
            </Pressable>
            <Text className="text-2xl font-bold">Edit Task</Text>
            <EditTaskForm
              closeModal={() => setIsEditing(false)}
              taskId={id}
              defaultValues={{ title, description, recurringTaskGroupId }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
