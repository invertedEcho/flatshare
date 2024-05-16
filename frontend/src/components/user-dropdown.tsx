import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type Props = {
  data: { label: string; value: string }[];
  selectedUserId?: number;
  onChange(id: number): void;
};

const UserDropdown = ({ data, selectedUserId, onChange }: Props) => {
  const [isFocus, setIsFocus] = useState(false);

  return (
    <View style={styles.container}>
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? "Select item" : "..."}
        searchPlaceholder="Search..."
        value={String(selectedUserId)}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          onChange(Number(item.value));
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? "blue" : "black"}
            name="user"
            size={20}
          />
        )}
      />
    </View>
  );
};

export default UserDropdown;

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  dropdown: {
    height: 50,
    borderColor: "gray",
    backgroundColor: "white",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
