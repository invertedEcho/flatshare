import * as React from "react";

import {
  Pressable,
  SafeAreaView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { fetchWrapper } from "../utils/fetchWrapper";

const createTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is missing" }),
  description: z.string().optional(),
});

type CreateTask = z.infer<typeof createTaskSchema>;

async function createTask({ title, description }: CreateTask) {
  await fetchWrapper.post("tasks", {
    title,
    description,
  });
}

async function getTaskGroups() {
  const response = await fetchWrapper.get("task-groups");
  const json = await response.json();
  console.log({ json });
  return json;
}

const defaultValues = {
  title: "",
  description: "",
};

export function CreateTaskScreen() {
  const [taskType, setTaskType] = React.useState<"recurring" | "non-recurring">(
    "recurring",
  );
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<CreateTask>({
    defaultValues,
    resolver: zodResolver(createTaskSchema),
  });

  const { mutate: createTaskMutation } = useMutation({
    mutationFn: ({ ...args }: CreateTask) =>
      createTask({
        title: args.title,
        description: args.description,
      }),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Succcessfully created task" });
      resetForm({ ...defaultValues });
    },
    onError: (err) => {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed creating task" });
    },
    mutationKey: ["tasks"],
  });

  const { data: taskGroups } = useQuery({
    queryKey: ["taskGroup"],
    queryFn: getTaskGroups,
  });
  console.log({ taskGroups });

  function onSubmit(data: CreateTask) {
    createTaskMutation({
      ...data,
    });
    queryClient.refetchQueries({ queryKey: ["tasks"] });
  }

  return (
    <SafeAreaView className="bg-slate-700 flex p-4 h-full">
      <View className="p-4 w-full bg-slate-900 rounded-lg h-full">
        <Text className="text-white">Title *</Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Enter a title"
              placeholderTextColor="white"
              style={{ color: "white" }}
              onChangeText={onChange}
              value={value}
              className="p-4 text-white"
            />
          )}
          name="title"
        />
        {errors.title && (
          <Text className="text-red-300">Title is required</Text>
        )}
        <Text className="text-white">Description</Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={{
                color: "white",
              }}
              placeholderTextColor="white"
              placeholder="Enter a description"
              onChangeText={onChange}
              value={value}
              className="p-4 text-white"
            />
          )}
          name="description"
        />
        <Text className="text-white">Options:</Text>
        <View className="flex flex-row items-center">
          <Text className="text-white">Recurring task</Text>
          <Switch
            value={taskType === "recurring"}
            onValueChange={() =>
              setTaskType(
                taskType === "recurring" ? "non-recurring" : "recurring",
              )
            }
          />
        </View>
        {errors.description && (
          <Text className="text-red-300">Description is required</Text>
        )}
        <Pressable
          // TODO: nativewind won't work here for some odd reason
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 5,
          }}
          onPress={handleSubmit(onSubmit)}
        >
          <Text className="text-center font-bold">Submit</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
