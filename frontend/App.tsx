import { StatusBar } from "expo-status-bar";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <SafeAreaView className="text-black flex-1 items-center justify-center bg-red-50">
      <Text>WG App 123</Text>
      <StatusBar style="auto" />
      <FlatList
        data={["Test", "test2"]}
        renderItem={({ item }) => <ListItem title={item} />}
        className="flex-grow-0"
      ></FlatList>
    </SafeAreaView>
  );
}

function ListItem({ title }: { title: string }) {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}
