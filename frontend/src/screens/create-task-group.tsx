import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import Loading from "../components/loading";
import UserMultiSelect from "../components/user-multi-select";
import WebDateTimerPicker from "../components/web-date-picker";
import { fetchWrapper } from "../utils/fetchWrapper";
import { getUsers } from "./assignments";

const createTaskGroupSchema = z.object({
  title: z.string().min(1, { message: "Title is missing" }),
  description: z.string().optional(),
  intervalDays: z.string(),
});

type CreateTaskGroup = z.infer<typeof createTaskGroupSchema>;

async function createTaskGroup({
  title,
  description,
  intervalDays,
  initialStartDate,
  userIds,
}: CreateTaskGroup & { initialStartDate: Date; userIds: number[] }) {
  await fetchWrapper.post("task-group", {
    title,
    description,
    intervalDays,
    initialStartDate,
    userIds,
  });
}

const defaultValues = {
  title: "",
  description: "",
  intervalDays: "7",
};

export function CreateTaskGroupScreen() {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<CreateTaskGroup>({
    defaultValues,
    resolver: zodResolver(createTaskGroupSchema),
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const { mutate } = useMutation({
    mutationFn: ({ ...args }: CreateTaskGroup) =>
      createTaskGroup({
        title: args.title,
        description: args.description,
        intervalDays: args.intervalDays,
        initialStartDate: date ?? new Date(),
        userIds: selectedUserIds.map((id) => Number(id)),
      }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Succcessfully created task group",
      });
      resetForm({ ...defaultValues });
      setSelectedUserIds([]);
      setDate(new Date());
    },
    onError: (err) => {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed creating task group" });
    },
    mutationKey: ["tasks"],
  });

  function onSubmit(data: CreateTaskGroup) {
    mutate({
      ...data,
    });

    // TODO: refetch taskgroups
    // queryClient.refetchQueries({ queryKey: ["tasks"] });
  }

  if (users === undefined || isLoading) {
    return <Loading message="Loading Users ..." />;
  }

  return (
    <View className=" bg-slate-900 p-4   flex-1 justify-between">
      <View style={{ rowGap: 16 }}>
        <View>
          <Text className="text-white mb-2">Title *</Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter a title"
                onChangeText={onChange}
                value={value}
                className="p-4 rounded-lg bg-white mb-2"
              />
            )}
            name="title"
          />
          {errors.title && (
            <Text className="text-red-300">Title is required</Text>
          )}
        </View>
        <View>
          <Text className="text-white mb-2">Description</Text>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter a description"
                onChangeText={onChange}
                value={value}
                className="p-4 rounded-lg bg-white"
              />
            )}
            name="description"
          />
        </View>
        <View>
          <Text className="text-white mb-2">Interval days</Text>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                onChangeText={onChange}
                value={value}
                className="p-2 rounded-lg bg-white mb-2"
                keyboardType="numeric"
                returnKeyType="done"
              />
            )}
            name="intervalDays"
          />
          {errors.intervalDays && (
            <Text className="text-red-300">Interval is required</Text>
          )}
        </View>
        <UserMultiSelect
          users={users}
          selectedUserIds={selectedUserIds}
          setSelectedUserIds={setSelectedUserIds}
        />
        {/* TODO: When inserting a date into the database, it somehow is one day earlier in the database. For example inserting 31.05.2024 -> 30.05.2024 in db 
        Probably some timezone issues, investigate how to do this correctly */}
        <View className=" items-start">
          <Text className="text-white mb-2">Select initial start date</Text>

          {Platform.OS === "web" ? (
            <WebDateTimerPicker
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDate(new Date(e.currentTarget.value))
              }
              value={
                date?.toLocaleDateString("en-CA") ??
                new Date().toLocaleDateString("en-CA")
              }
            />
          ) : (
            // TODO: test on mobile
            <RNDateTimePicker
              value={date ? new Date(date) : new Date()}
              onChange={(e, date) => setDate(date)}
              accentColor="lightblue"
              mode="date"
              themeVariant="dark"
            />
          )}
        </View>
      </View>
      <Pressable
        // TODO: nativewind won't work here for some odd reason
        style={({ pressed }) => ({
          backgroundColor: pressed ? "#24aeff" : "#24a0ed",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 5,
        })}
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="font-bold text-center ">Submit</Text>
      </Pressable>
    </View>
  );
}
