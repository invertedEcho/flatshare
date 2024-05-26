import { Pressable, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export function LogoutButton({ onClick }: { onClick(): void }) {
  return (
    <Pressable className="flex flex-row p-4 items-center" onPress={onClick}>
      <Ionicons name="log-out-outline" className="ml-4" size={18} />
      <Text>Log out</Text>
    </Pressable>
  );
}
