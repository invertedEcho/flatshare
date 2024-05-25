import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated";

import React from "react";

function SlideView({ children }: { children: React.ReactNode }) {
  // Animation temporarily removed because `umountOnBlur` on Navigator causes layout shift and the animation only works once without it
  return <Animated.View style={{ height: "100%" }}>{children}</Animated.View>;
}

export default SlideView;
