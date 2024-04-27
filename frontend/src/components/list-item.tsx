import { Pressable, Text, View } from "react-native";

// wtf?
import BouncyCheckbox from "react-native-bouncy-checkbox/build/dist/BouncyCheckbox";

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
  assignee,
  isCompleted,
  id,
  onPress,
}: ListItemProps) {
  return (
    <Pressable
      className="p-2  bg-slate-900 flex-row items-center justify-between rounded-lg"
      onPress={() => onPress(id)}
    >
      <View>
        <Text
          className={`font-semibold text-lg text-gray-200 ${
            isCompleted && "line-through"
          }`}
        >
          {title}
        </Text>
        <Text className="text-gray-100">{description}</Text>
      </View>
      <BouncyCheckbox
        size={25}
        unFillColor="#FFFFFF"
        iconStyle={{ borderColor: "black" }}
        innerIconStyle={{ borderWidth: 2 }}
        isChecked={isCompleted}
        onPress={() => onPress(id)}
      />
    </Pressable>
  );
}
