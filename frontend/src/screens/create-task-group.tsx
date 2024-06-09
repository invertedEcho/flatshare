import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";
import { z } from "zod";
import AnimatedView from "../components/animated-view";
import { DismissKeyboard } from "../components/dismiss-keyboard";
import FormTextInput from "../components/form-text-input";
import Loading from "../components/loading";
import { dropdownStyles } from "../components/user-dropdown";
import UserMultiSelect from "../components/user-multi-select";
import WebDateTimerPicker from "../components/web-date-picker";
import { addDays, addMonth, setTimeToZero } from "../utils/date";
import { fetchWrapper } from "../utils/fetchWrapper";
import { queryKeys } from "../utils/queryKeys";
import { getUsers } from "./assignments";
const createTaskGroupSchema = z.object({
  title: z.string().min(1, { message: "Title is missing" }),
  description: z.string().optional(),
  intervalValue: z.string(),
});

type CreateTaskGroup = z.infer<typeof createTaskGroupSchema>;

type IntervalType = "days" | "weeks" | "months";

async function createTaskGroup({
  title,
  description,
  interval,
  initialStartDate,
  userIds,
}: {
  title: string;
  description?: string;
  interval: string;
  initialStartDate: Date;
  userIds: number[];
}) {
  console.debug({ interval });
  await fetchWrapper.post("task-group", {
    title,
    description,
    interval,
    initialStartDate,
    userIds,
  });
}

const defaultValues = {
  title: "",
  description: "",
  intervalValue: "1",
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
    setTimeToZero(new Date()),
  );
  const [selectedIntervalType, setSelectedIntervalType] = React.useState<
    "days" | "months" | "weeks"
  >("weeks");

  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const intervalValue = watch("intervalValue");

  const { mutate } = useMutation({
    mutationFn: ({ ...args }: CreateTaskGroup) =>
      createTaskGroup({
        title: args.title,
        description: args.description,
        interval: `${args.intervalValue} ${selectedIntervalType}`,
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

  function getMinimumDate(intervalValue: number, intervalType: IntervalType) {
    const date = new Date();

    switch (intervalType) {
      case "days":
        return addDays(date, -(intervalValue - 1));
      case "weeks":
        return addDays(date, -(intervalValue * 7 - 1));
      // Not sure if this logic makes sense due to how JS handles months differently from postgres -> look into it
      case "months":
        return addMonth(date, -intervalValue);
    }
  }

  if (users === undefined || isLoading) {
    return <Loading message="Loading Users ..." />;
  }

  return (
    <AnimatedView>
      <DismissKeyboard>
        <View className=" bg-slate-900 p-4   flex-1 justify-between">
          <View style={{ rowGap: 16 }}>
            <FormTextInput
              name="title"
              labelText="Title"
              textInputProps={{
                placeholder: "Enter a title",
                returnKeyType: "next",
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
                returnKeyType: "next",
              }}
              control={control}
              errors={errors}
            />
            <View>
              <Text className="text-white mb-2">Interval</Text>
              <View className="flex flex-row items-center">
                <Controller
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      keyboardType="numeric"
                      returnKeyType="next"
                      onChangeText={onChange}
                      value={value}
                      className="p-4 rounded-lg bg-white flex-1 mr-2"
                    />
                  )}
                  name="intervalValue"
                />
                <Dropdown
                  style={[dropdownStyles.dropdown, { flex: 4 }]}
                  placeholderStyle={dropdownStyles.placeholderStyle}
                  selectedTextStyle={dropdownStyles.selectedTextStyle}
                  inputSearchStyle={dropdownStyles.inputSearchStyle}
                  iconStyle={dropdownStyles.iconStyle}
                  containerStyle={dropdownStyles.container}
                  data={[
                    { intervalType: "days" },
                    { intervalType: "weeks" },
                    { intervalType: "months" },
                  ]}
                  maxHeight={300}
                  labelField="intervalType"
                  valueField="intervalType"
                  value={selectedIntervalType}
                  keyboardAvoiding
                  // onFocus={() => setIsFocus(true)}
                  // onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setSelectedIntervalType(item.intervalType as IntervalType);
                  }}
                  autoScroll={false}
                />
              </View>
              {errors["intervalValue"] && (
                <Text className="text-red-300">Interval is required</Text>
              )}
            </View>

            <UserMultiSelect
              users={users}
              selectedUserIds={selectedUserIds}
              setSelectedUserIds={setSelectedUserIds}
              header="Select Users"
            />
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
                    minimumDate={getMinimumDate(
                      Number(intervalValue),
                      selectedIntervalType,
                    )}
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
                        minimumDate={getMinimumDate(
                          Number(intervalValue),
                          selectedIntervalType,
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
                          new Date(e.currentTarget.value).setHours(0, 0, 0, 0),
                        ),
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
            <Text className="font-bold text-center">Login</Text>
          </Pressable>
        </View>
      </DismissKeyboard>
    </AnimatedView>
  );
}
