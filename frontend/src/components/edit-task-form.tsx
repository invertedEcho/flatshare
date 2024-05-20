import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { View, Text, TextInput, Pressable } from "react-native";
import Toast from "react-native-toast-message";
import { Task } from "../screens/all-tasks";
import { modalStyles } from "./task-item";
import { fetchWrapper } from "../utils/fetchWrapper";
import { queryKeys } from "../utils/queryKeys";

async function updateTask({
  id,
  title,
  description,
  taskGroupId,
}: Omit<Task, "createdAt">) {
  await fetchWrapper.put(`tasks/${id}`, {
    taskId: id,
    title: title,
    description: description,
    taskGroupId: taskGroupId,
  });
}

export function EditTaskForm({
  taskId,
  defaultValues,
  closeModal,
}: {
  taskId: number;
  closeModal(): void;
  defaultValues: {
    title: string;
    description: string | null;
    taskGroupId: number | null;
  };
}) {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Successfully updated task" });
      queryClient.refetchQueries({ queryKey: [queryKeys.tasks] });
    },
    onError: () => {
      Toast.show({ type: "error", text1: "Failed updated task" });
    },
    onSettled: closeModal,
  });

  function onSave(data: Omit<Task, "createAt">) {
    mutate({
      id: data.id,
      title: data.title,
      description: data.description,
      taskGroupId: data.taskGroupId,
    });
  }

  const { control, handleSubmit } = useForm<Omit<Task, "id">>({
    defaultValues,
  });
  return (
    <>
      <View className="w-full justify-between h-full">
        <View className="gap-y-2">
          <View>
            <Text className="text-black text-lg mb-1">Title</Text>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{ color: "white" }}
                  onChangeText={onChange}
                  value={value}
                  className="p-4 rounded-lg bg-slate-900 text-lg"
                />
              )}
              name="title"
            />
          </View>
          <View>
            <Text className="text-black text-lg mb-1">Description</Text>
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{ color: "white" }}
                  onChangeText={onChange}
                  // @ts-expect-error FIXME: later
                  value={value}
                  className="p-4 rounded-lg bg-slate-900 text-lg"
                />
              )}
              name="description"
            />
          </View>
          <View>
            <Text className="text-black text-lg mb-1">TaskGroupId</Text>
          </View>
        </View>
        <Pressable
          style={[modalStyles.button, modalStyles.buttonClose]}
          onPress={handleSubmit((data) => onSave({ ...data, id: taskId }))}
        >
          <Text style={modalStyles.textStyle}>Save changes</Text>
        </Pressable>
      </View>
    </>
  );
}
