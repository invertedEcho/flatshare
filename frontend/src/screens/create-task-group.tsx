import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Platform, Pressable, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import FormTextInput from "../components/form-text-input";
import Loading from "../components/loading";
import UserMultiSelect from "../components/user-multi-select";
import WebDateTimerPicker from "../components/web-date-picker";
import { addDays, setTimeToZero } from "../utils/date";
import { fetchWrapper } from "../utils/fetchWrapper";
import { queryKeys } from "../utils/queryKeys";
import { getUsers } from "./assignments";
import AnimatedView from "../components/animated-view";
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
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
    watch,
  } = useForm<CreateTaskGroup>({
    defaultValues,
    resolver: zodResolver(createTaskGroupSchema),
  });

  const { data: users, isLoading } = useQuery({
    queryKey: [queryKeys.users],
    queryFn: getUsers,
  });

  const queryClient = useQueryClient();

  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
  const [date, setDate] = React.useState<Date | undefined>(
    setTimeToZero(new Date())
  );
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const intervalDays = watch("intervalDays");

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
      queryClient.refetchQueries({ queryKey: [queryKeys.taskGroups] });
    },
    onError: (err) => {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed creating task group" });
    },
    mutationKey: [queryKeys.tasks],
  });

  function onSubmit(data: CreateTaskGroup) {
    mutate({
      ...data,
    });
  }

  if (users === undefined || isLoading) {
    return <Loading message="Loading Users ..." />;
  }

  return (
    <AnimatedView key="group">
      <View className=" bg-slate-900 p-4   flex-1 justify-between">
        <View style={{ rowGap: 16 }}>
          <FormTextInput
            name="title"
            labelText="Title"
            textInputProps={{
              placeholder: "Enter a title",
            }}
            control={control}
            errors={errors}
            rules={{ required: true }}
          />
          <FormTextInput
            name="description"
            labelText="Description"
            textInputProps={{
              placeholder: "Enter a description",
            }}
            control={control}
            errors={errors}
          />
          <FormTextInput
            control={control}
            errors={errors}
            name="intervalDays"
            labelText="Description"
            textInputProps={{ keyboardType: "numeric", returnKeyType: "done" }}
          />
          <UserMultiSelect
            users={users}
            selectedUserIds={selectedUserIds}
            setSelectedUserIds={setSelectedUserIds}
            header="Select Users"
          />
          {/* TODO: When inserting a date into the database, it somehow is one day earlier in the database. For example inserting 31.05.2024 -> 30.05.2024 in db
          Probably some timezone issues, investigate how to do this correctly */}
          <View className=" items-start">
            <Text className="text-white mb-2">Select initial start date</Text>
            {Platform.select({
              ios: (
                <RNDateTimePicker
                  value={date ? date : setTimeToZero(new Date())}
                  onChange={(e, date) => {
                    setDate(setTimeToZero(date ?? new Date()));
                    setShowDatePicker(false);
                  }}
                  accentColor="lightblue"
                  mode="date"
                  themeVariant="dark"
                  timeZoneName="Europe/Berlin"
                  minimumDate={addDays(new Date(), -(Number(intervalDays) - 1))}
                />
              ),
              android: (
                <>
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    className="bg-slate-700 p-2 rounded-lg"
                  >
                    <Text className="text-xl text-white">
                      {date?.toLocaleDateString("de-DE")}
                    </Text>
                  </Pressable>
                  {showDatePicker && (
                    <RNDateTimePicker
                      value={date ? date : setTimeToZero(new Date())}
                      onChange={(e, date) => {
                        setDate(setTimeToZero(date ?? new Date()));
                        setShowDatePicker(false);
                      }}
                      accentColor="lightblue"
                      mode="date"
                      themeVariant="dark"
                      minimumDate={addDays(
                        new Date(),
                        -(Number(intervalDays) - 1)
                      )}
                    />
                  )}
                </>
              ),
              web: (
                // TODO: add mindate
                <WebDateTimerPicker
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDate(
                      new Date(
                        new Date(e.currentTarget.value).setHours(0, 0, 0, 0)
                      )
                    )
                  }
                  value={
                    date?.toLocaleDateString("en-CA") ??
                    new Date().toLocaleDateString("en-CA")
                  }
                />
              ),
            })}
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
    </AnimatedView>
  );
}
