import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { Text, View } from "react-native";
import { fetchWrapper } from "../utils/fetchWrapper";
import { z } from "zod";
import { queryKeys } from "../utils/queryKeys";
import { GenerateInviteCode } from "../components/generate-invite-code";

const groupInviteSchema = z.object({
  inviteCode: z.string().length(8),
});

async function generateInviteCode(
  groupId: number | undefined,
): Promise<string | null> {
  if (groupId === undefined) return null;
  const response = await fetchWrapper.get(`user-group/invite-code/${groupId}`);
  const body = await response.json();
  const { inviteCode } = groupInviteSchema.parse(body);
  return inviteCode;
}

export function GroupInviteScreen({ groupId }: { groupId: number }) {
  const { data: generatedInviteCode, refetch } = useQuery({
    queryKey: [queryKeys.groups],
    queryFn: () => generateInviteCode(groupId),
    enabled: false,
  });

  return (
    <View>
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
    </View>
  );
}
