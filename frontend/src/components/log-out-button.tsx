import { Pressable, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export function LogoutButton({
  onClick,
  email,
}: {
  onClick(): void;
  email: string;
}) {
  return (
    <Pressable className="flex flex-row p-4 items-center" onPress={onClick}>
      <Ionicons name="log-out-outline" className="ml-4" size={18} />
      <Text className="whitespace-nowrap">Log out {email}</Text>
    </Pressable>
  );
}
