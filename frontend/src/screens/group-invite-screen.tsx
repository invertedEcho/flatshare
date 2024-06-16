import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { Pressable, Share, Text, View } from "react-native";
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

  async function onShare(inviteCode: string) {
    // TODO: env var
    const inviteLink = `https://wg.mainfraeme.com/?inviteCode=${inviteCode}`;
    await Share.share({
      message: `Join my Group on WG-Tasks App!\n${inviteLink}`,
    });
  }

  return (
    <View>
      <View>
        {generatedInviteCode ? (
          <>
            <Text className="text-white">Generated invite code:</Text>
            <Text className="text-white">{generatedInviteCode}</Text>
            <Pressable
              className="font-bold text-center bg-blue-300 flex rounded"
              onPress={() => onShare(generatedInviteCode)}
            >
              <Text>Share</Text>
            </Pressable>
          </>
        ) : (
          <GenerateInviteCode onPress={() => refetch()} />
        )}
      </View>
    </View>
  );
}
