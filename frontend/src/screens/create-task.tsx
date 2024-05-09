import * as React from "react";

import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast, { useToaster } from "react-hot-toast/headless";

const createTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is missing" }),
  description: z.string().optional(),
  intervalInDays: z.string(),
});

type CreateTask = z.infer<typeof createTaskSchema>;

async function createTask({ title, description, intervalInDays }: CreateTask) {
  await fetch("http://localhost:3000/tasks", {
    method: "POST",
    body: JSON.stringify({ title, description, intervalInDays }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function CreateTaskScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      intervalInDays: "7 days",
    },
    resolver: zodResolver(createTaskSchema),
  });

  const { mutate } = useMutation({
    mutationFn: createTask,
    onMutate(variables) {
      toast.loading("Creating task...");
    },
    onSuccess: () => {
      toast.success("Created task!");
    },
    onError: () => {
      toast.error("Could not create task");
    },
  });

  useToaster();

  function onSubmit(data: CreateTask) {
    mutate({
      ...data,
    });
    console.log({ data });
  }

  return (
    <SafeAreaView className="text-black bg-slate-700 flex p-4 h-full">
      <View className="p-4 w-full bg-slate-900 rounded-lg h-full">
        <Text>Title *</Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Title"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="p-4"
            />
          )}
          name="title"
        />
        {errors.title && (
          <Text className="text-red-300">Title is required</Text>
        )}
        <Text>Description</Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Description"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="p-4"
            />
          )}
          name="description"
        />
        {errors.description && (
          <Text className="text-red-300">Description is required</Text>
        )}
        <Text>Interval in days</Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Interval"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className="p-4"
              inputMode="numeric"
            />
          )}
          name="intervalInDays"
        />
        {errors.intervalInDays && (
          <Text className="text-red-300">Interval is required</Text>
        )}
        <Pressable
          // TODO: nativewind won't work here for some odd reason
          style={{
            backgroundColor: "blue",
            width: "fit-content",
            padding: "8px",
            borderRadius: "5px",
          }}
          onPress={handleSubmit(onSubmit)}
        >
          <Text>Submit</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
