import { Pressable, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export function GenerateInviteCode({ onPress }: { onPress(): void }) {
  return (
    <Pressable onPress={onPress} className="p-4 flex flex-row items-center">
      <MaterialCommunityIcons name="qrcode-plus" size={24} color="white" />
      <Text className="text-white">Generate a new invite code</Text>
    </Pressable>
  );
}
