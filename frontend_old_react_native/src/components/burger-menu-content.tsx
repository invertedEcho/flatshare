import { Pressable, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export function MenuAnchor({ onPress }: { onPress(): void }) {
  return (
    <View>
      <Pressable onPress={onPress} className="mr-8 flex flex-row w-full">
        <Ionicons name="reorder-three" size={25} />
      </Pressable>
    </View>
  );
}
