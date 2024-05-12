import { TailSpin } from "react-loader-spinner";
import { Text, View } from "react-native";

type Props = {
  message: string;
};

export default function Loading({ message }: Props) {
  return (
    <View>
      <TailSpin />
      <Text>{message}</Text>
    </View>
  );
}
