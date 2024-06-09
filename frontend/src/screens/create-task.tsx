import * as React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Pressable, Switch, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";
import { z } from "zod";
import FormTextInput from "../components/form-text-input";
import Loading from "../components/loading";
import { dropdownStyles } from "../components/user-dropdown";
import UserMultiSelect from "../components/user-multi-select";
import { fetchWrapper } from "../utils/fetchWrapper";
import { queryKeys } from "../utils/queryKeys";
import { getUsers } from "./assignments";
import AnimatedView from "../components/animated-view";
import { DismissKeyboard } from "../components/dismiss-keyboard";

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
    <AnimatedView>
      <DismissKeyboard>
        <View className=" bg-slate-900 p-4 flex-1 justify-between">
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
            <View className="flex flex-row items-center gap-2">
              <Switch
                value={taskType === "recurring"}
                onValueChange={() =>
                  setTaskType(
                    taskType === "recurring" ? "non-recurring" : "recurring",
                  )
                }
                trackColor={{ true: "#24a0ed" }}
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
              <View>
                <Text className="text-white mb-2">Select Task group</Text>
                <Dropdown
                  data={taskGroups}
                  disable={noTaskGroupExist}
                  labelField="title"
                  valueField="id"
                  onChange={(item) => setSelectedTaskGroupId(item.id)}
                  style={dropdownStyles.dropdown}
                  placeholderStyle={dropdownStyles.placeholderStyle}
                  containerStyle={dropdownStyles.container}
                  selectedTextStyle={dropdownStyles.selectedTextStyle}
                  inputSearchStyle={dropdownStyles.inputSearchStyle}
                  iconStyle={dropdownStyles.iconStyle}
                  placeholder="Select a task group (optional)"
                />
                {noTaskGroupExist && (
                  <Text className="text-red-200">
                    Currently, there are no task groups available. Please create
                    a task group first in order to assign tasks to it.
                  </Text>
                )}
              </View>
            ) : (
              <UserMultiSelect
                users={users}
                selectedUserIds={selectedUserIds}
                setSelectedUserIds={setSelectedUserIds}
                header="Select users"
              />
            )}
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
            disabled={disableSubmit}
          >
            <Text className="font-bold text-center ">Submit</Text>
          </Pressable>
        </View>
      </DismissKeyboard>
    </AnimatedView>
  );
}
