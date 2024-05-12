import { Pressable, Text, TextInput, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { fetchWrapper } from "../utils/fetchWrapper";

type TaskItemProps = Task & {
  interval?: string | null;
  createdAt: Date;
};

// TODO: fix duplication
type Task = {
  id: number;
  title: string;
  description: string | null;
};

async function updateTask(task: Task) {
  const response = await fetchWrapper.put(`tasks/${task.id}`, {
    taskId: task.id,
    title: task.title,
    description: task.description,
  });
}

export function TaskItem({
  id,
  title,
  description,
  interval,
  createdAt,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const { mutate } = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Successfully updated task" });
    },
    onError: () => {
      Toast.show({ type: "error", text1: "Failed updated task" });
    },
  });

  function onSave(data: Task) {
    if (isEditing) {
      mutate({ id: data.id, title: data.title, description: data.description });
    }
    setIsEditing(!isEditing);
  }

  const { control, handleSubmit } = useForm<Omit<Task, "id">>({
    defaultValues: { title, description },
    disabled: !isEditing,
  });

  return (
    <View className="p-2 bg-slate-900 flex-row justify-between items-start rounded-lg">
      <View style={{ flexGrow: 1 }}>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              editable={isEditing}
              style={{ color: "white" }}
              onChangeText={onChange}
              value={value}
              className="font-semibold text-lg text-gray-200"
            />
          )}
          name="title"
        />
        {description !== null && (
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => {
              return (
                <TextInput
                  onChangeText={onChange}
                  // @ts-expect-error fix me later
                  value={value}
                  className="font-semibold text-base text-gray-200"
                  editable={isEditing}
                />
              );
            }}
            name="description"
          />
        )}
        {interval !== null && (
          <View className="flex-row flex items-center" style={{ gap: 4 }}>
            <Ionicons name="time-outline" color="white" size={22} />
            <Text className="text-gray-100 text-xs">Every {interval}</Text>
          </View>
        )}
        <Text className="text-gray-100 text-xs">
          Created at {createdAt.toLocaleString()}
        </Text>
      </View>
      <View className="justify-center">
        <Pressable onPress={handleSubmit((data) => onSave({ ...data, id }))}>
          {isEditing ? (
            <Feather size={22} color="white" name="save" />
          ) : (
            <Feather size={22} color="white" name="edit" />
          )}
        </Pressable>
      </View>
    </View>
  );
}
