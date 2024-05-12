import { Pressable, Text, View } from "react-native";

import BouncyCheckbox from "react-native-bouncy-checkbox";

type ListItemProps = {
  title: string;
  description: string;
  interval?: string | null;
  isCompleted: boolean;
  onPress(id: number): void;
  id: number;
};

export function AssignmentItem({
  title,
  description,
  isCompleted,
  id,
  onPress,
}: ListItemProps) {
  return (
    <View className="p-2 bg-slate-900 flex-row justify-between items-start rounded-lg">
      <Pressable
        className="bg-slate-900 flex-col items-start rounded-lg"
        onPress={() => onPress(id)}
      >
        <Text
          className={`font-semibold text-lg text-gray-200 ${
            isCompleted && "line-through"
          }`}
        >
          {title}
        </Text>
        <Text className="text-gray-100 text-lg">{description}</Text>
      </Pressable>
      <BouncyCheckbox
        size={25}
        unFillColor="#FFFFFF"
        iconStyle={{ borderColor: "black" }}
        innerIconStyle={{ borderWidth: 2 }}
        isChecked={isCompleted}
        onPress={() => onPress(id)}
        className="justify-center"
      />
    </View>
  );
}
