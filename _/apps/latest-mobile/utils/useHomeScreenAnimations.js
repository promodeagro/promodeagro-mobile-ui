import { useRef } from "react";
import { Animated } from "react-native";

export function useHomeScreenAnimations() {
  const scrollY = useRef(new Animated.Value(0));

  const headerOpacity = scrollY.current.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.current.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  const searchTranslateY = scrollY.current.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -30],
    extrapolate: "clamp",
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY.current } } }],
    { useNativeDriver: true }
  );

  // Fallback scroll handler if Animated.event fails
  const fallbackScrollHandler = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollY.current.setValue(y);
  };

  // Use fallback if Animated.event doesn't work
  const finalScrollHandler = typeof handleScroll === 'function' ? handleScroll : fallbackScrollHandler;

  return {
    scrollY: scrollY.current,
    headerOpacity,
    headerTranslateY,
    searchTranslateY,
    handleScroll: finalScrollHandler,
  };
}
