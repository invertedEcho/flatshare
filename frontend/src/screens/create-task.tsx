import * as React from "react";

import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 2,
    borderColor: "gray",
  },
});

export function CreateTaskScreen() {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  return (
    <SafeAreaView style={{ backgroundColor: "red" }}>
      <Text>Create a new task</Text>
      <View style={styles.container}>
        <Text>Title:</Text>
        <TextInput
          className="border-black border bg-white"
          value={title}
          onChangeText={(newText) => setTitle(newText)}
        />
        <Text>Description:</Text>
        <TextInput
          className="border-black border bg-white"
          value={description}
          onChangeText={(newDescription) => setDescription(newDescription)}
        />
      </View>
    </SafeAreaView>
  );
}
