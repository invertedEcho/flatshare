import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { AuthContext } from "../auth-context";
import { fetchWrapper } from "../utils/fetchWrapper";
import { z } from "zod";
import Loading from "../components/loading";
import Toast from "react-native-toast-message";
import { queryKeys } from "../utils/queryKeys";

const userGroupSchema = z.object({
  userGroupId: z.number().nullable(),
  name: z.string().nullable(),
});

async function getUserGroup(userId: number) {
  const response = await fetchWrapper.get(`user-group/${userId}`);
  const body = await response.json();
  const parsed = userGroupSchema.parse(body);
  console.log({ parsed });
  return parsed;
}

async function tryJoinGroup(inviteCode: number | undefined, userId: number) {
  const response = await fetchWrapper.post("user-group/join", {
    inviteCode,
    userId,
  });
  const body = await response.json();
  const { success } = z.object({ success: z.boolean() }).parse(body);
  if (!success) {
    throw new Error("Could not join group.");
  }
}

export function GroupInviteScreen() {
  const [inviteCode, setInviteCode] = React.useState<number | undefined>(
    undefined,
  );
  const { userId } = React.useContext(AuthContext);
  if (userId === undefined) {
    return (
      <View>
        <Text>you shouldnt be here.</Text>
        <Text>landed on group invite screen but userId is undefined</Text>
      </View>
    );
  }

  const { data: userGroup, isLoading } = useQuery({
    queryKey: [queryKeys.groups],
    queryFn: async () => getUserGroup(userId),
  });
  const { mutate } = useMutation({
    mutationKey: [queryKeys.groups],
    mutationFn: async () => tryJoinGroup(inviteCode, userId),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Joined group!" });
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Could not join group. Invalid invite code?",
      });
    },
  });

  if (userGroup === undefined || isLoading) {
    return <Loading message="Loading groups..." />;
  }
  function handleJoinGroup() {
    if (inviteCode === undefined) {
      Toast.show({ type: "error", text1: "No invite code provided." });
      return;
    }
    mutate();
  }

  return (
    <View>
      {userGroup.userGroupId === null ? (
        <View>
          <Text>To continue, join a group</Text>
          <TextInput
            placeholder="Enter invitation code"
            value={inviteCode?.toString()}
            // FIXME: I dont like this number cast
            onChangeText={(text) => setInviteCode(Number(text))}
            keyboardType="numeric"
            maxLength={6}
          />
          <Pressable
            onPress={handleJoinGroup}
            className="font-bold text-center bg-blue-300 flex"
          >
            <Text>Join Group</Text>
          </Pressable>
        </View>
      ) : (
        <Text>{`You are part of : ${userGroup.name}`}</Text>
      )}
    </View>
  );
}
