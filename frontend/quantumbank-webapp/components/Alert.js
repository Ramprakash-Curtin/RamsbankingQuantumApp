import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

// Optional: You can later import icon libraries like react-native-vector-icons if needed
// or even pass icons as props.

const Alert = ({
  visible,
  message,
  type = 'info', // success | error | warning | info
  onClose,
  duration = 3000
}) => {
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(-20);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#2ecc71';
      case 'error':
        return '#e74c3c';
      case 'warning':
        return '#f39c12';
      case 'info':
      default:
        return '#003c46';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.alert, { backgroundColor: getBackgroundColor() }]}>
        <Text
          accessibilityRole="alert"
          style={styles.message}
        >
          {message}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close alert"
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

export default Alert;
