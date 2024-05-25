import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated";

import React from "react";

function SlideView({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={{ height: "100%" }}>
      {children}
    </Animated.View>
  );
}

export default SlideView;
