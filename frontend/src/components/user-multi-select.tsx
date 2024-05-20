import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";

type MultiSelectItemProps = {
  username: string;
};

function MultiSelectItem({ username }: MultiSelectItemProps) {
  return (
    <View style={styles.item}>
      <Text style={styles.selectedTextStyle}>{username}</Text>
      <Ionicons style={styles.icon} color="black" name="person" size={20} />
    </View>
  );
}

type MultiSelectProps = {
  users: { username: string; id: number }[];
  selectedUserIds: number[];
  setSelectedUserIds: React.Dispatch<React.SetStateAction<number[]>>;
  header: string;
};

export default function UserMultiSelect({
  users,
  setSelectedUserIds: setSelectedValues,
  selectedUserIds: selectedValues,
  header,
}: MultiSelectProps) {
  return (
    <View className="py-2">
      <Text className="text-white mb-2">{header}</Text>
      <MultiSelect
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={users}
        labelField="username"
        valueField="id"
        placeholder="Select item"
        value={selectedValues.map((value) => value.toString())}
        activeColor="#9bd4e4"
        search
        searchPlaceholder="Search..."
        onChange={(values) => {
          setSelectedValues(values.map((value) => Number(value)));
        }}
        renderLeftIcon={() => (
          <Ionicons style={styles.icon} color="black" name="person" size={20} />
        )}
        renderItem={MultiSelectItem}
        renderSelectedItem={(item, unSelect) => (
          <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
            <View style={styles.selectedStyle}>
              <Text style={styles.textSelectedStyle}>{item.username}</Text>
              <Ionicons color="black" name="trash-bin-outline" size={17} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "white",
    shadowColor: "#000",
    marginTop: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  textSelectedStyle: {
    marginRight: 5,
    fontSize: 16,
  },
});
