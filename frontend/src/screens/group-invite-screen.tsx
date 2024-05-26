import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AuthContext } from "../auth-context";
import { fetchWrapper } from "../utils/fetchWrapper";
import { z } from "zod";
import Toast from "react-native-toast-message";
import { queryKeys } from "../utils/queryKeys";
import { getDefinedValueOrThrow } from "../utils/assert";
import { GenerateInviteCode } from "../components/generate-invite-code";

async function tryJoinGroup(inviteCode: number | undefined, userId: number) {
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

async function generateInviteCode(groupId: number | undefined) {
  if (groupId === undefined) return null;
  return "123456";
}

export function GroupInviteScreen({
  groupId,
}: {
  groupId: number | undefined;
}) {
  const [inviteCode] = React.useState<number | undefined>(undefined);
  const { user, setUser } = React.useContext(AuthContext);

  // NOTE: The group screen should only be shown if the user is authenticated.
  const { userId } = getDefinedValueOrThrow(user);

  const { mutate } = useMutation({
    mutationKey: [queryKeys.groups],
    mutationFn: async () => tryJoinGroup(inviteCode, userId),
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

  function handleJoinGroup() {
    if (inviteCode === undefined) {
      Toast.show({ type: "error", text1: "No invite code provided." });
      return;
    }
    mutate();
  }

  return (
    <View>
      {groupId === undefined ? (
        <>
          <Text className="text-white">To continue, join a group</Text>
          <TextInput
            placeholder="Enter invitation code"
            // FIXME: I dont like this number cast
            keyboardType="numeric"
            maxLength={6}
          />
          <Pressable
            onPress={handleJoinGroup}
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
