import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import * as Linking from "expo-linking";
import { AuthContext } from "../auth-context";
import { fetchWrapper } from "../utils/fetchWrapper";
import { z } from "zod";
import Toast from "react-native-toast-message";
import { queryKeys } from "../utils/queryKeys";
import { getDefinedValueOrThrow } from "../utils/assert";
import FormTextInput from "../components/form-text-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRoute } from "@react-navigation/native";

const groupInviteSchema = z.object({
  inviteCode: z.string().length(8),
});
type GroupInvite = z.infer<typeof groupInviteSchema>;

const groupCreateSchema = z.object({
  groupName: z.string(),
});
type GroupCreate = z.infer<typeof groupCreateSchema>;

async function joinGroupByCode(inviteCode: string, userId: number) {
  const response = await fetchWrapper.post("user-group/join", {
    inviteCode,
    userId,
  });
  const body = await response.json();
  const { success, groupId } = z
    .object({ success: z.boolean(), groupId: z.number().nullable() })
    .parse(body);
  if (!success) {
    throw new Error("Could not join group.");
  }
  return groupId;
}

async function joinGroupById(groupId: number, userId: number) {
  // TODO: ugly endpoint
  const response = await fetchWrapper.post("user-group/join-by-id", {
    groupId,
    userId,
  });
  const body = await response.json();
  const { success } = z
    .object({ success: z.boolean(), groupId: z.number().nullable() })
    .parse(body);
  if (!success) {
    throw new Error("Could not join group.");
  }
  return groupId;
}

async function createGroup({ groupName }: { groupName: string }) {
  const response = await fetchWrapper.post("user-group/create", {
    groupName,
  });
  const body = await response.json();
  const { id } = z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .parse(body);
  return id;
}

// FIXME: rename me
const deepLinkInviteSchemaThing = z.object({
  inviteCode: z.string(),
});

export function GroupJoinScreen() {
  const route = useRoute();

  React.useEffect(() => {
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        const { queryParams } = Linking.parse(url);
        const parsed = deepLinkInviteSchemaThing.parse(queryParams);
        setValue("inviteCode", parsed.inviteCode);
      }
    };
    const params = route.params;
    if (params !== undefined) {
      const parsed = deepLinkInviteSchemaThing.parse(params);
      setValue("inviteCode", parsed.inviteCode);
    } else {
      handleInitialURL();
    }
  });

  const { user, setUser } = React.useContext(AuthContext);
  const {
    control,
    handleSubmit: handleJoinSubmit,
    formState: { errors },
    setValue,
  } = useForm<GroupInvite>({
    resolver: zodResolver(groupInviteSchema),
  });
  const {
    control: groupCreateControl,
    handleSubmit: handleCreateSubmit,
    formState: { errors: groupCreateErrors },
  } = useForm<GroupCreate>({ resolver: zodResolver(groupCreateSchema) });

  // NOTE: The group screen should only be shown if the user is authenticated.
  const { userId } = getDefinedValueOrThrow(user);

  const { mutate: mutateJoinGroup } = useMutation({
    mutationKey: [queryKeys.groups],
    mutationFn: async (inviteCode: string) =>
      joinGroupByCode(inviteCode, userId),
    onSuccess: (groupId) => {
      const definedGroupId = getDefinedValueOrThrow(groupId);
      Toast.show({ type: "success", text1: "Joined group!" });
      setUser({ userId, groupId: definedGroupId });
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Could not join group. Invalid invite code?",
      });
    },
  });

  const { mutate: mutateCreateGroup } = useMutation({
    mutationKey: [queryKeys.groups],
    // TODO: lets not mix these, all functions should accept object instead of positional arguments
    mutationFn: async ({
      groupName,
      userId,
    }: {
      groupName: string;
      userId: number;
    }) => {
      try {
        const group = await createGroup({ groupName });
        if (group === undefined) {
          throw new Error("Failed to create group");
        }
        await joinGroupById(group, userId);
      } catch (error) {
        console.error({ error });
        throw new Error("you suck very badlyt");
      }
    },
  });

  function handleJoinGroup(data: GroupInvite) {
    mutateJoinGroup(data.inviteCode);
  }

  function handleCreateGroup(data: GroupCreate) {
    mutateCreateGroup({ groupName: data.groupName, userId });
  }

  return (
    <View className="gap-8 p-16">
      <Text className="text-white">To continue, join a group</Text>
      <FormTextInput
        name="inviteCode"
        control={control}
        labelText="Join group"
        textInputProps={{
          placeholder: "Enter a code",
        }}
        errors={errors}
      />
      <Pressable
        onPress={handleJoinSubmit(handleJoinGroup)}
        className="font-bold text-center bg-blue-300 flex rounded"
      >
        <Text className="p-2">Join Group</Text>
      </Pressable>
      <Text className="text-white">Or, create a new group</Text>
      <FormTextInput
        name="groupName"
        labelText="Create a new group"
        textInputProps={{
          placeholder: "Enter a name",
        }}
        errors={groupCreateErrors}
        control={groupCreateControl}
      />
      <Pressable
        className="font-bold text-center bg-blue-300 flex rounded"
        onPress={handleCreateSubmit(handleCreateGroup)}
      >
        <Text className="p-2">Create Group</Text>
      </Pressable>
    </View>
  );
}
