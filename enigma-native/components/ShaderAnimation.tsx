import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function ShaderAnimation() {
  const pulseA = useRef(new Animated.Value(0)).current;
  const pulseB = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopA = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseA, {
          toValue: 1,
          duration: 5200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseA, {
          toValue: 0,
          duration: 5200,
          useNativeDriver: true,
        }),
      ])
    );
    const loopB = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseB, {
          toValue: 1,
          duration: 6800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseB, {
          toValue: 0,
          duration: 6800,
          useNativeDriver: true,
        }),
      ])
    );

    loopA.start();
    loopB.start();

    return () => {
      loopA.stop();
      loopB.stop();
    };
  }, [pulseA, pulseB]);

  return (
    <View style={styles.wrap} pointerEvents='none'>
      <Animated.View
        style={[
          styles.glowA,
          {
            opacity: pulseA.interpolate({
              inputRange: [0, 1],
              outputRange: [0.12, 0.28],
            }),
            transform: [
              {
                scale: pulseA.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1.08],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.glowB,
          {
            opacity: pulseB.interpolate({
              inputRange: [0, 1],
              outputRange: [0.08, 0.22],
            }),
            transform: [
              {
                scale: pulseB.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1.15],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#03060a',
  },
  glowA: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: '#1ecfff',
    top: -140,
    left: -120,
  },
  glowB: {
    position: 'absolute',
    width: 620,
    height: 620,
    borderRadius: 310,
    backgroundColor: '#7a5eff',
    bottom: -200,
    right: -180,
  },
});
