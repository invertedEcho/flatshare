import React from "react";
import { Animated, Pressable, Text, View } from "react-native";

import BouncyCheckbox from "react-native-bouncy-checkbox";

type ListItemProps = {
  title: string;
  description: string | null;
  interval?: string | null;
  isCompleted: boolean;
  id: number;
  disabled?: boolean;
  onPress(id: number): void;
};

export function AssignmentItem({
  title,
  description,
  isCompleted,
  id,
  disabled = false,
  onPress,
}: ListItemProps) {
  const [isPressed, setIsPressed] = React.useState(false);

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
          <Text
            className={`font-semibold text-slate-900 text-lg ${
              isCompleted && "line-through"
            }`}
          >
            {title}
          </Text>
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
