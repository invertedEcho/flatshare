import React from "react";
import { Animated, Pressable, Text, View } from "react-native";

import BouncyCheckbox from "react-native-bouncy-checkbox";
import { Assignment } from "../screens/assignments";
import { Ionicons } from "@expo/vector-icons";

type ListItemProps = {
  assignment: Assignment;
  disabled?: boolean;
  onPress(id: number): void;
};

export function AssignmentItem({
  assignment: { id, title, description, isCompleted, isOneOff },
  disabled = false,
  onPress,
}: ListItemProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const scaleIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const scaleOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        className={`p-2 bg-white justify-between items-center rounded-lg flex flex-row`}
        onPress={() => onPress(id)}
        onPressIn={scaleIn}
        onPressOut={scaleOut}
        disabled={disabled}
      >
        <View>
          <View className="flex flex-row items-center gap-1">
            <Text
              className={`font-semibold text-slate-900 text-lg ${
                isCompleted && "line-through"
              }`}
            >
              {title}
            </Text>
            {!isOneOff && (
              <Ionicons name="repeat-outline" size={20} color="tomato" />
            )}
          </View>
          <Text className="text-slate-500 text-lg">{description}</Text>
        </View>
        <BouncyCheckbox
          size={25}
          unFillColor="#FFFFFF"
          fillColor="#7cc6f4"
          iconStyle={{ borderColor: "black" }}
          innerIconStyle={{ borderWidth: 2 }}
          isChecked={isCompleted}
          disabled={disabled}
          onPress={() => onPress(id)}
          className="justify-center"
        />
      </Pressable>
    </Animated.View>
  );
}
