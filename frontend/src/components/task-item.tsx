import Feather from "@expo/vector-icons/Feather";
import * as React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Task } from "../screens/all-tasks";
import { EditTaskForm } from "./edit-task-form";
import { Ionicons } from "@expo/vector-icons";

export function TaskItem({
  id,
  title,
  description,
  createdAt,
  taskGroupId,
}: Task) {
  const [isEditing, setIsEditing] = React.useState(false);

  return (
    <View className="p-2 bg-slate-900 flex-row justify-between items-start rounded-lg">
      <View style={{ flexGrow: 1 }}>
        <Text className="font-semibold text-lg text-gray-200">{title}</Text>
        {description && (
          <Text className="text-base text-gray-400">{description}</Text>
        )}
        <Text className="text-gray-100 text-xs">
          Created at {createdAt.toLocaleString()}
        </Text>
      </View>
      <View className="justify-center self-center">
        <Pressable onPress={() => setIsEditing(true)}>
          {isEditing ? (
            <Feather size={30} color="white" name="save" />
          ) : (
            <Feather size={30} color="white" name="edit" />
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
              defaultValues={{ title, description, taskGroupId }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: "90%",
    height: "80%",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
