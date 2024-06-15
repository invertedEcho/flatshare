import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { dropdownStyles } from "./user-dropdown";

type MultiSelectItemProps = {
  username: string;
};

function MultiSelectItem(
  { username }: MultiSelectItemProps,
  selected?: boolean,
) {
  return (
    <View style={styles.item}>
      <Text style={selected ? styles.selectedTextStyle : styles.itemTextStyle}>
        {username}
      </Text>
      <Ionicons
        style={styles.icon}
        color={selected ? "#24a0ed" : "black"}
        name="person"
        size={20}
      />
    </View>
  );
}

type MultiSelectProps = {
  users: { id: number; username: string }[];
  selectedUserIds: number[];
  setSelectedUserIds: React.Dispatch<React.SetStateAction<number[]>>;
  header: string;
};

export default function UserMultiSelect({
  users,
  setSelectedUserIds,
  selectedUserIds,
  header,
}: MultiSelectProps) {
  return (
    <View>
      <Text className="text-white mb-2">{header}</Text>
      <MultiSelect
        style={styles.dropdown}
        containerStyle={dropdownStyles.container}
        placeholderStyle={styles.placeholderStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={users}
        labelField="username"
        valueField="id"
        placeholder="Select user"
        value={selectedUserIds}
        activeColor="white"
        onChange={setSelectedUserIds}
        renderLeftIcon={() => (
          <Ionicons style={styles.icon} color="black" name="person" size={20} />
        )}
        renderItem={MultiSelectItem}
        renderSelectedItem={(item, unSelect) => (
          <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
            <View style={styles.selectedStyle}>
              <Text style={{ fontSize: 12 }}>{item.username}</Text>
              <Ionicons color="#ff3333" name="trash-outline" size={17} />
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
    fontWeight: "bold",
  },
  itemTextStyle: {
    fontWeight: "normal",
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
    borderRadius: 8,
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
    gap: 4,
  },
});
