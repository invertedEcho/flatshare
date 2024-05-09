import { Pressable, Text, View } from "react-native";

import BouncyCheckbox from "react-native-bouncy-checkbox";

type ListItemProps = {
  title: string;
  description: string;
  assignee: string;
  isCompleted: boolean;
  id: number;
  onPress(id: number): void;
};

export function ListItem({
  title,
  description,
  isCompleted,
  id,
  onPress,
}: ListItemProps) {
  return (
    <View>
      <Pressable
        className="p-2  bg-slate-900 flex-row items-center justify-between rounded-lg"
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
        <BouncyCheckbox
          size={25}
          unFillColor="#FFFFFF"
          iconStyle={{ borderColor: "black" }}
          innerIconStyle={{ borderWidth: 2 }}
          isChecked={isCompleted}
          onPress={() => onPress(id)}
        />
      </Pressable>
    </View>
  );
}
