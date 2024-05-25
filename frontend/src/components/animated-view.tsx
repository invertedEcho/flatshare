import Animated, { FadeIn } from "react-native-reanimated";

import React, { useEffect } from "react";

function SlideView({
  children,
  key,
}: {
  children: React.ReactNode;
  key: string;
}) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={{ height: "100%" }}>
      {children}
    </Animated.View>
  );
}

export default SlideView;
