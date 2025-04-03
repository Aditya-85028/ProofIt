import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedStyle,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';


const { width } = Dimensions.get('window');

interface SwipeableNavigationProps {
  children: React.ReactNode;
}

const SwipeableNavigation: React.FC<SwipeableNavigationProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const translateX = useSharedValue(0);
  const startX = useRef(0);
  const isNavigating = useSharedValue(false);
  const targetScreen = useRef(-1);

  // Define the screens in the swipe order
  const screens = [
    '/friends',
    '/home',
    '/habbits'
  ];

  // Get the current screen index
  const getCurrentIndex = () => {
    'worklet';
    return screens.findIndex(screen => pathname === screen || pathname.startsWith(screen));
  };

  const navigateToScreen = (index: number) => {
    if (index >= 0 && index < screens.length && !isNavigating.value) {
      const currentIndex = getCurrentIndex();
      const direction = index > currentIndex ? -1 : 1; // -1 for left, 1 for right
      
      // Set the target screen and mark that we're navigating
      targetScreen.current = index;
      isNavigating.value = true;
      
      // Animate to the edge of the screen
      translateX.value = withTiming(direction * width, 
        { duration: 250 }, 
        () => {
          // After animation completes, navigate to the new screen
          runOnJS(performNavigation)(screens[index]);
        }
      );
    }
  };
  
  const performNavigation = (screenPath: string) => {
    router.push(screenPath);
  };
  
  // Reset animation when navigation is complete
  useEffect(() => {
    if (isNavigating.value) {
      // Small delay to ensure the new screen has loaded
      const timer = setTimeout(() => {
        translateX.value = withTiming(0, { duration: 0 });
        isNavigating.value = false;
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (!isNavigating.value) {
        startX.current = translateX.value;
      }
    })
    .onUpdate((event) => {
      if (isNavigating.value) return;
      
      // Limit the drag to prevent excessive movement
      const currentIndex = getCurrentIndex();

      const minTranslate = currentIndex === 0 ? 0 : -width;
      const maxTranslate = currentIndex === screens.length - 1 ? 0 : width;
      
      const newTranslateX = startX.current + event.translationX;
      translateX.value = Math.max(minTranslate, Math.min(maxTranslate, newTranslateX));
    })
    .onEnd((event) => {
      if (isNavigating.value) return;
      
      const currentIndex = getCurrentIndex();
      
      // Determine if we should navigate based on the velocity and distance
      if (Math.abs(event.velocityX) > 500 || Math.abs(translateX.value) > width / 3) {
        if (event.velocityX > 0 || translateX.value > width / 3) {
          // Swipe right - go to previous screen
          if (currentIndex > 0) {
            runOnJS(navigateToScreen)(currentIndex - 1);
            return;
          }
        } else if (event.velocityX < 0 || translateX.value < -width / 3) {
          // Swipe left - go to next screen
          if (currentIndex < screens.length - 1) {
            runOnJS(navigateToScreen)(currentIndex + 1);
            return;
          }
        }
      }
      
      // Reset the translation if we didn't navigate
      translateX.value = withSpring(0, { damping: 15 });
    });

  // Create animated styles for the container
  const animatedStyles = useAnimatedStyle(() => {
    // Calculate opacity based on translation
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, width * 0.8],
      [1, 0.7],
      Extrapolate.CLAMP
    );
    
    // Calculate scale based on translation
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [1, 0.95],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { translateX: translateX.value },
        { scale }
      ],
      opacity
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyles]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SwipeableNavigation;