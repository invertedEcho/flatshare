import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { Pressable, Text, View } from "react-native";
import { AuthContext } from "../auth-context";
import { fetchWrapper } from "../utils/fetchWrapper";
import { z } from "zod";
import Toast from "react-native-toast-message";
import { queryKeys } from "../utils/queryKeys";
import { getDefinedValueOrThrow } from "../utils/assert";
import { GenerateInviteCode } from "../components/generate-invite-code";
import FormTextInput from "../components/form-text-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRoute } from "@react-navigation/native";

const groupInviteSchema = z.object({
  inviteCode: z.string().length(8),
});
type GroupInvite = z.infer<typeof groupInviteSchema>;

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

async function generateInviteCode(
  groupId: number | undefined,
): Promise<string | null> {
  if (groupId === undefined) return null;
  const response = await fetchWrapper.get(`user-group/invite-code/${groupId}`);
  const body = await response.json();
  const { inviteCode } = groupInviteSchema.parse(body);
  return inviteCode;
}

export function GroupInviteScreen({
  groupId,
}: {
  groupId: number | undefined;
}) {
  const route = useRoute();
  console.log({ params: route.params });
  const { user, setUser } = React.useContext(AuthContext);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupInvite>({
    resolver: zodResolver(groupInviteSchema),
  });

  // NOTE: The group screen should only be shown if the user is authenticated.
  const { userId } = getDefinedValueOrThrow(user);

  const { mutate } = useMutation({
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

  const { data: generatedInviteCode, refetch } = useQuery({
    queryKey: [queryKeys.groups],
    queryFn: () => generateInviteCode(groupId),
    enabled: false,
  });

  function handleJoinGroup(data: GroupInvite) {
    mutate(data.inviteCode);
  }

  return (
    <View>
      {groupId === undefined ? (
        <>
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
            onPress={handleSubmit(handleJoinGroup)}
            className="font-bold text-center bg-blue-300 flex"
          >
            <Text>Join Group</Text>
          </Pressable>
        </>
      ) : (
        <View>
          {generatedInviteCode ? (
            <>
              <Text className="text-white">Generated invite code:</Text>
              <Text className="text-white">{generatedInviteCode}</Text>
            </>
          ) : (
            <GenerateInviteCode onPress={() => refetch()} />
          )}
        </View>
      )}
    </View>
  );
}
