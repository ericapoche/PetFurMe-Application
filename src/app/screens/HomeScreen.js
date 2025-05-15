import React, { useState, useEffect, useRef } from "react";
import {
  Image,
  StyleSheet,
  View,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { Fredoka_400Regular } from "@expo-google-fonts/fredoka";

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const scaleAnimation = useRef(new Animated.Value(0.9)).current;
  const opacityAnimation = useRef(new Animated.Value(0)).current;
  const logoOpacityAnimation = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
  });

  useEffect(() => {
    const animations = [
      // Logo fade in and scale up
      Animated.sequence([
        Animated.timing(logoOpacityAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnimation, {
          toValue: 1,
          tension: 10,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
      // Brand name fade in
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ];

    // Start all animations
    Animated.parallel(animations).start();

    // Navigate to login screen after delay
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacityAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacityAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.replace("LoginScreen");
      });
    }, 1800);

    return () => {
      clearTimeout(timer);
    };
  }, [navigation]);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={["#A259B5", "#8146C1", "#5E3B96"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacityAnimation,
              transform: [{ scale: scaleAnimation }],
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/finallogo.png")}
              style={styles.logo}
            />
          </View>
        </Animated.View>
        
        <Animated.View style={[
          styles.brandContainer,
          {
            opacity: opacityAnimation,
            transform: [
              { translateY: opacityAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0]
              })}
            ]
          }
        ]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandBackground}
          />
          <Image
            source={require("../../assets/images/animal.png")}
            style={styles.brandImage}
          />
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: Math.min(width * 0.45, 180),
    height: Math.min(width * 0.45, 180),
    borderRadius: Math.min(width * 0.45, 180) / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  logo: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },
  brandContainer: {
    marginTop: height * 0.04,
    padding: Math.min(width * 0.04, 20),
    paddingVertical: Math.min(width * 0.05, 24),
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: Math.min(width * 0.85, 320),
    elevation: 2,
  },
  brandBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  brandImage: {
    width: '100%',
    height: Math.min(width * 0.15, 60),
    resizeMode: 'contain',
  },
});

export default HomeScreen;