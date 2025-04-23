import React, { useRef, useEffect, useState } from 'react';
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
  Extrapolate,
  useDerivedValue
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SCREEN_EDGE_THRESHOLD = width * 0.15; // 15% of screen width visible from adjacent screens
const SWIPE_THRESHOLD = width / 3; // How far to swipe before triggering navigation
const RESISTANCE_FACTOR = 2.5; // Higher value = more resistance at edges
const SCALE_FACTOR = 0.92; // Scale factor for adjacent screens

interface SwipeableNavigationProps {
  children: React.ReactNode;
}

const SwipeableNavigation: React.FC<SwipeableNavigationProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const translateX = useSharedValue(0);
  const startX = useRef(0);
  const isNavigating = useSharedValue(false);
  
  // Define the screens in the swipe order
  const screens = [
    '/friends',
    '/home',
    '/habbits'
  ];

  // Get the current screen index
  const getCurrentIndex = () => {
    return screens.findIndex(screen => pathname === screen || pathname.startsWith(screen));
  };

  const currentIndex = useRef(getCurrentIndex());
  
  // Update current index when pathname changes
  useEffect(() => {
    currentIndex.current = getCurrentIndex();
    // Reset translation when navigation is complete
    if (isNavigating.value) {
      setTimeout(() => {
        translateX.value = withTiming(0, { duration: 0 });
        isNavigating.value = false;
      }, 50);
    }
  }, [pathname]);

  const navigateToScreen = (index: number) => {
    'worklet';
    if (index >= 0 && index < screens.length && !isNavigating.value) {
      const direction = index > currentIndex.current ? -1 : 1; // -1 for left, 1 for right
      
      // Mark that we're navigating
      isNavigating.value = true;
      
      // Animate to the edge of the screen
      translateX.value = withTiming(direction * width, 
        { duration: 250 }, 
        () => {
          // After animation completes, navigate to the new screen
          runOnJS(router.push)(screens[index]);
        }
      );
    }
  };

  // Calculate the position of adjacent screens
  const leftScreenX = useDerivedValue(() => {
    return translateX.value - width + SCREEN_EDGE_THRESHOLD;
  });

  const rightScreenX = useDerivedValue(() => {
    return translateX.value + width - SCREEN_EDGE_THRESHOLD;
  });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (!isNavigating.value) {
        startX.current = translateX.value;
      }
    })
    .onUpdate((event) => {
      if (isNavigating.value) return;
      
      // Get current index for boundary checks
      const idx = currentIndex.current;
      
      // Apply resistance at the edges
      let newTranslateX = startX.current + event.translationX;
      
      // Apply resistance when at the first or last screen
      if ((idx === 0 && newTranslateX > 0) || 
          (idx === screens.length - 1 && newTranslateX < 0)) {
        // Apply resistance - divide by RESISTANCE_FACTOR for stronger resistance
        newTranslateX = startX.current + event.translationX / RESISTANCE_FACTOR;
      }
      
      translateX.value = newTranslateX;
    })
    .onEnd((event) => {
      if (isNavigating.value) return;
      
      const idx = currentIndex.current;
      
      // Determine if we should navigate based on velocity and distance
      if (Math.abs(event.velocityX) > 500 || Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        if (event.velocityX > 0 || translateX.value > SWIPE_THRESHOLD) {
          // Swipe right - go to previous screen
          if (idx > 0) {
            navigateToScreen(idx - 1);
            return;
          }
        } else if (event.velocityX < 0 || translateX.value < -SWIPE_THRESHOLD) {
          // Swipe left - go to next screen
          if (idx < screens.length - 1) {
            navigateToScreen(idx + 1);
            return;
          }
        }
      }
      
      // Reset the translation if we didn't navigate
      translateX.value = withSpring(0, { damping: 15 });
    });

  // Create animated styles for the main container
  const mainScreenStyle = useAnimatedStyle(() => {
    // Calculate scale based on translation
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, width],
      [1, 0.98],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { translateX: translateX.value },
        { scale }
      ],
      zIndex: 2, // Main screen is on top
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: interpolate(
        Math.abs(translateX.value),
        [0, width / 4],
        [0, 0.1],
        Extrapolate.CLAMP
      ),
      shadowRadius: 10,
      elevation: 5,
    };
  });

  // Style for the left adjacent screen
  const leftScreenStyle = useAnimatedStyle(() => {
    // Only show left screen if we're not at the first screen
    const opacity = currentIndex.current > 0 ? 
      interpolate(
        translateX.value,
        [0, width / 2],
        [0, 1],
        Extrapolate.CLAMP
      ) : 0;
    
    // Scale effect for adjacent screen
    const scale = SCALE_FACTOR;

    return {
      transform: [
        { translateX: leftScreenX.value },
        { scale }
      ],
      opacity,
      zIndex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f9f9f9', // Match your app background
      borderRadius: 10 * opacity, // Subtle rounded corners when visible
    };
  });

  // Style for the right adjacent screen
  const rightScreenStyle = useAnimatedStyle(() => {
    // Only show right screen if we're not at the last screen
    const opacity = currentIndex.current < screens.length - 1 ? 
      interpolate(
        translateX.value,
        [-width / 2, 0],
        [1, 0],
        Extrapolate.CLAMP
      ) : 0;
    
    // Scale effect for adjacent screen
    const scale = SCALE_FACTOR;

    return {
      transform: [
        { translateX: rightScreenX.value },
        { scale }
      ],
      opacity,
      zIndex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f9f9f9', // Match your app background
      borderRadius: 10 * opacity, // Subtle rounded corners when visible
    };
  });

  return (
    <View style={styles.container}>
      {/* Left adjacent screen (previous) */}
      <Animated.View style={leftScreenStyle}>
        {currentIndex.current > 0 && (
          <View style={styles.adjacentScreenIndicator}>
            <View style={styles.screenEdge} />
          </View>
        )}
      </Animated.View>
      
      {/* Right adjacent screen (next) */}
      <Animated.View style={rightScreenStyle}>
        {currentIndex.current < screens.length - 1 && (
          <View style={[styles.adjacentScreenIndicator, styles.rightIndicator]}>
            <View style={styles.screenEdge} />
          </View>
        )}
      </Animated.View>
      
      {/* Main screen with gesture detector */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.mainScreen, mainScreenStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f9f9f9', // Match your app background
  },
  mainScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  adjacentScreenIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SCREEN_EDGE_THRESHOLD,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIndicator: {
    left: 'auto',
    right: 0,
  },
  screenEdge: {
    width: 4,
    height: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.5)', // Semi-transparent green
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default SwipeableNavigation;