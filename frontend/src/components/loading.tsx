import { Text, View } from "react-native";

type Props = {
  message: string;
};

export default function Loading({ message }: Props) {
  return (
    <View className="p-2">
      <Text className="text-white text-center">{message}</Text>
    </View>
  );
}
