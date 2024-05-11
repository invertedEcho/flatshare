import * as React from "react";

import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { Dropdown } from "react-native-element-dropdown";
import { intervalItems } from "../utils/interval";

const intervalType = z.enum(["hours", "days", "weeks"]);
export type IntervalType = z.infer<typeof intervalType>;

const createTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is missing" }),
  description: z.string().optional(),
  intervalValue: z.coerce.number(),
});

type CreateTask = z.infer<typeof createTaskSchema>;

async function createTask({
  title,
  description,
  intervalValue,
  intervalType,
}: CreateTask & { intervalType: IntervalType }) {
  const response = await fetch("http://localhost:3000/tasks", {
    method: "POST",
    body: JSON.stringify({ title, description, intervalValue, intervalType }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    console.error({ loc: "response was not ok", response });
    throw new Error(`Failed request ${response}`);
  }
}

const defaultValues = {
  title: "",
  description: "",
  intervalValue: 1,
};

export function CreateTaskScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<CreateTask>({
    defaultValues,
    resolver: zodResolver(createTaskSchema),
  });

  const [intervalType, setIntervalType] = React.useState<IntervalType>("days");

  const { mutate } = useMutation({
    mutationFn: ({ ...args }: CreateTask) =>
      createTask({
        title: args.title,
        description: args.description,
        intervalValue: args.intervalValue,
        intervalType,
      }),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Succcessfully created task" });
      resetForm({ ...defaultValues });
    },
    onError: () => {
      Toast.show({ type: "error", text1: "Failed creating task" });
    },
  });

  function onSubmit(data: CreateTask) {
    mutate({
      ...data,
    });
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
              placeholder="Enter a description"
              onChangeText={onChange}
              value={value}
              className="p-4 text-white"
            />
          )}
          name="description"
        />
        {errors.description && (
          <Text className="text-red-300">Description is required</Text>
        )}
        <Text className="text-white">Select an interval type</Text>
        <Dropdown
          style={{ padding: 10 }}
          data={intervalItems}
          labelField="label"
          valueField="value"
          onChange={(item) => setIntervalType(item.value)}
          value={intervalType}
          placeholderStyle={{ color: "white" }}
          selectedTextStyle={{ color: "white" }}
        />
        <Text className="text-white">Interval</Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Interval"
              onChangeText={onChange}
              value={String(value)}
              className="p-4 text-white"
              inputMode="numeric"
              style={{ color: "white" }}
            />
          )}
          name="intervalValue"
        />
        {errors.intervalValue && (
          <Text className="text-red-300">Interval is required</Text>
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
          <Text>Submit</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
