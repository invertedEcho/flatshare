import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";

function renderItem(item: { value: string; id: number }) {
  return (
    <View style={styles.item}>
      <Text style={styles.selectedTextStyle}>{item.value}</Text>
      <Ionicons style={styles.icon} color="black" name="person" size={20} />
    </View>
  );
}

type Props = {
  values: { value: string; id: number }[];
  selectedValues: string[];
  setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>;
  header: string;
};

export default function CustomMultiSelect({
  values,
  setSelectedValues,
  selectedValues,
  header,
}: Props) {
  return (
    <View style={styles.container}>
      <Text className="text-white mb-2">{header}</Text>
      <MultiSelect
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={values}
        labelField="value"
        valueField="id"
        placeholder="Select item"
        value={selectedValues}
        activeColor="#9bd4e4"
        search
        searchPlaceholder="Search..."
        onChange={(value) => {
          setSelectedValues(value);
        }}
        renderLeftIcon={() => (
          <Ionicons style={styles.icon} color="black" name="person" size={20} />
        )}
        renderItem={renderItem}
        renderSelectedItem={(item, unSelect) => (
          <TouchableOpacity onPress={() => unSelect && unSelect(item)}>
            <View style={styles.selectedStyle}>
              <Text style={styles.textSelectedStyle}>{item.value}</Text>
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
