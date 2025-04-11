import React from 'react';
import { Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

// This component handles platform differences for pickers
const PlatformPicker = (props) => {
  // Log platform info for debugging
  console.log(`Rendering PlatformPicker on ${Platform.OS}`);
  
  return <Picker {...props} />;
};

export default PlatformPicker; 