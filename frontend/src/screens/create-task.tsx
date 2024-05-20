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
import { Dropdown } from "react-native-element-dropdown";
import { dropdownStyles } from "../components/user-dropdown";
import UserMultiSelect from "../components/user-multi-select";
import { getUsers } from "./assignments";
import Loading from "../components/loading";
import { queryKeys } from "../utils/queryKeys";

const createRecurringTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is missing" }),
  description: z.string().optional(),
  taskGroupId: z.number().optional(),
});

type CreateRecurringTask = z.infer<typeof createRecurringTaskSchema>;

const createOneOffTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is missing" }),
  description: z.string().optional(),
  userIds: z.number().array(),
});

type CreateOneOffTask = z.infer<typeof createOneOffTaskSchema>;

async function createOneOffTask({
  title,
  description,
  userIds,
}: CreateOneOffTask) {
  await fetchWrapper.post("tasks/one-off/", {
    title,
    description,
    userIds,
  });
}

// TODO: Should be moved inside task group list screen when it exists
const taskGroupSchema = z.object({
  id: z.number(),
  title: z.string(),
});

async function createRecurringTask({
  title,
  description,
  taskGroupId,
}: CreateRecurringTask) {
  await fetchWrapper.post("tasks/recurring", {
    title,
    description,
    taskGroupId,
  });
}

// TODO: Should be moved inside task group list screen when it exists
async function getTaskGroups() {
  const response = await fetchWrapper.get("task-group");
  const json = await response.json();
  const parsed = z.array(taskGroupSchema).parse(json);
  return parsed;
}

const defaultValues = {
  title: "",
  description: "",
};

export function CreateTaskScreen() {
  const [selectedTaskGroupId, setSelectedTaskGroupId] = React.useState<
    number | undefined
  >(undefined);

  const [taskType, setTaskType] = React.useState<"recurring" | "non-recurring">(
    "recurring",
  );
  const [selectedUserIds, setSelectedUserIds] = React.useState<number[]>([]);

  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<CreateRecurringTask>({
    defaultValues,
    resolver: zodResolver(createRecurringTaskSchema),
  });

  const { mutate: createTaskMutation } = useMutation({
    mutationFn: ({ ...args }: CreateRecurringTask) => {
      return selectedTaskGroupId === undefined
        ? createOneOffTask({
            title: args.title,
            description: args.description,
            userIds: selectedUserIds,
          })
        : createRecurringTask({
            title: args.title,
            description: args.description,
            taskGroupId: selectedTaskGroupId,
          });
    },
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Succcessfully created task" });
      resetForm({ ...defaultValues });
      queryClient.refetchQueries({ queryKey: [queryKeys.tasks] });
      queryClient.refetchQueries({ queryKey: [queryKeys.assignments] });
      setSelectedUserIds([]);
      setSelectedTaskGroupId(undefined);
    },
    onError: (err) => {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed creating task" });
    },
    mutationKey: [queryKeys.tasks],
  });

  const { data: taskGroups, isLoading: isTaskGroupsLoading } = useQuery({
    queryKey: [queryKeys.taskGroups],
    queryFn: getTaskGroups,
  });

  const { data: users, isLoading: isUsersLoading } = useQuery({
    queryKey: [queryKeys.users],
    queryFn: getUsers,
  });

  function onSubmit(data: CreateRecurringTask) {
    createTaskMutation({
      ...data,
    });
    queryClient.refetchQueries({ queryKey: [queryKeys.tasks] });
  }

  if (
    isTaskGroupsLoading ||
    taskGroups === undefined ||
    isUsersLoading ||
    users === undefined
  ) {
    return <Loading message="Loading data required for creating a task..." />;
  }

  const noTaskGroupExist = taskGroups.length === 0;
  const disableSubmit =
    taskType === "non-recurring" && selectedUserIds.length === 0;

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
        {errors.description && (
          <Text className="text-red-300">Description is required</Text>
        )}
        <Text className="text-white">Options:</Text>
        <View className="flex flex-row items-center">
          <Text
            className={
              taskType === "recurring" ? "text-gray-500" : "text-white"
            }
          >
            One-off task
          </Text>
          <Switch
            value={taskType === "recurring"}
            onValueChange={() =>
              setTaskType(
                taskType === "recurring" ? "non-recurring" : "recurring",
              )
            }
          />
          <Text
            className={
              taskType === "recurring" ? "text-white" : "text-gray-500"
            }
          >
            Recurring task
          </Text>
        </View>
        {taskType === "recurring" ? (
          <>
            <Dropdown
              data={taskGroups}
              disable={noTaskGroupExist}
              labelField="title"
              valueField="id"
              onChange={(item) => setSelectedTaskGroupId(item.id)}
              style={dropdownStyles.dropdown}
              placeholderStyle={dropdownStyles.placeholderStyle}
              selectedTextStyle={dropdownStyles.selectedTextStyle}
              inputSearchStyle={dropdownStyles.inputSearchStyle}
              iconStyle={dropdownStyles.iconStyle}
              placeholder="Select a task group (optional)"
            />
            {noTaskGroupExist && (
              <Text className="text-red-200">
                Currently, there are no task groups available. Please create a
                task group first in order to assign tasks to it.
              </Text>
            )}
          </>
        ) : (
          <UserMultiSelect
            users={users}
            selectedUserIds={selectedUserIds}
            setSelectedUserIds={setSelectedUserIds}
            header="Select users"
          />
        )}
        <Pressable
          // TODO: nativewind won't work here for some odd reason
          style={{
            backgroundColor: disableSubmit ? "gray" : "white",
            padding: 10,
            borderRadius: 5,
          }}
          onPress={handleSubmit(onSubmit)}
          disabled={disableSubmit}
        >
          <Text className="text-center font-bold">Submit</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
