import { Text, View } from "react-native";

type Props = {
  message: string;
};

export default function Loading({ message }: Props) {
  return (
    <View>
      <Text className="text-white">{message}</Text>
    </View>
  );
}
