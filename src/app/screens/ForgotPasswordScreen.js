import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Use HTTPS API endpoint consistent with the rest of the app
  const API_URL = 'https://app.petfurme.shop/PetFurMe-Application/api';

  // Add debug logging
  useEffect(() => {
    console.log('ForgotPasswordScreen initialized with API_URL:', API_URL);
  }, []);

  // Create axios instance with proper configuration
  const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Reusable function to send the OTP
  const sendOTPRequest = async () => {
    console.log('Sending OTP request to:', `${API_URL}/auth/send-otp.php`);
    
    const response = await axios.post(`${API_URL}/auth/send-otp.php`, {
      email: email.trim()
    });

    console.log('OTP request response:', response.data);

    if (response.data.success) {
      Alert.alert(
        'Code Sent!',
        'Check your email inbox (and spam folder) for your verification code.',
        [{ text: 'Got it' }]
      );
      setStep(2);
    } else {
      throw new Error(response.data.error || 'Failed to send OTP');
    }
  }

  // Try an alternative approach if the email verification fails
  const handleSendOTPDirectly = async () => {
    try {
      setLoading(true);

      // Skip email verification and try to send OTP directly
      console.log('Sending OTP request directly to:', `${API_URL}/auth/send-otp.php`);
      
      const response = await axios.post(`${API_URL}/auth/send-otp.php`, {
        email: email.trim()
      });

      console.log('Direct OTP request response:', response.data);

      if (response.data.success) {
        Alert.alert(
          'Code Sent!',
          'Check your email inbox (and spam folder) for your verification code.',
          [{ text: 'Got it' }]
        );
        setStep(2);
      } else {
        throw new Error(response.data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Direct OTP error:', error);
      
      if (error.response?.data?.error) {
        // Server provided an error message
        setError(`Error: ${error.response.data.error}`);
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet connection.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Could not send verification code. Please try again later or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      setError('');

      if (!email) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      console.log('Sending email verification request to:', `${API_URL}/auth/verify-email.php`);
      console.log('Email being verified:', email.trim());
      
      try {
        // First, verify if the email exists
        const verifyResponse = await axios.post(`${API_URL}/auth/verify-email.php`, {
          email: email.trim()
        });

        console.log('Email verification response:', verifyResponse.data);

        if (!verifyResponse.data.exists) {
          // Email doesn't exist in database - show registration option
          setError(
            <View style={styles.errorContent}>
              <Text style={styles.errorText}>
                Email address not found. Please check your email or{' '}
                <Text 
                  style={{color: '#8146C1', textDecorationLine: 'underline'}}
                  onPress={() => navigation.navigate('RegistrationScreen')}
                >
                  register
                </Text>
              </Text>
              <TouchableOpacity 
                style={styles.bypassButton}
                onPress={handleSendOTPDirectly}
              >
                <Text style={styles.bypassButtonText}>Try anyway</Text>
              </TouchableOpacity>
            </View>
          );
          setLoading(false);
          return;
        }

        // Email exists, proceed with sending OTP
        await sendOTPRequest();
        
      } catch (verifyError) {
        console.error('Email verification error:', verifyError);
        console.log('Attempting direct OTP send as fallback...');
        await handleSendOTPDirectly();
      }
    } catch (error) {
      console.error('Send OTP error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        config: error.config
      });
      
      if (error.code === 'ECONNABORTED') {
        setError('Connection timed out. Please try again.');
      } else if (error.code === 'ERR_NETWORK') {
        setError(`Network error. Please check your internet connection.`);
      } else {
        setError(error.response?.data?.error || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      setError('');

      if (!otp) {
        setError('Please enter the OTP');
        setLoading(false);
        return;
      }

      console.log('Sending OTP verification request to:', `${API_URL}/auth/verify-otp.php`);
      console.log('OTP verification data:', {
        email,
        otp: otp.trim()
      });

      const response = await axios.post(`${API_URL}/auth/verify-otp.php`, {
        email,
        otp: otp.trim()
      });

      console.log('OTP verification response:', response.data);

      if (response.data.success) {
        setStep(3);
      } else {
        setError(response.data.error || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        config: error.config
      });
      
      if (error.code === 'ECONNABORTED') {
        setError('Connection timed out. Please try again.');
      } else if (error.code === 'ERR_NETWORK') {
        setError(`Network error. Please check if the server is running at app.petfurme.shop:443`);
      } else {
        setError(error.response?.data?.error || 'Failed to verify OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      setError('');

      if (!newPassword || !confirmPassword) {
        setError('Please enter both passwords');
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Password strength validation (minimum 6 characters)
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      console.log('Sending reset password request to:', `${API_URL}/auth/reset-password.php`);
      console.log('Reset password data:', {
        email,
        hasPassword: !!newPassword
      });

      const response = await axios.post(`${API_URL}/auth/reset-password.php`, {
        email: email.trim(),
        newPassword
      });
      
      console.log('Reset password response:', response.data);

      if (response.data.success) {
        setLoading(false);
        
        Alert.alert(
          'Success',
          'Your password has been reset successfully.',
          [
            {
              text: 'Login Now',
              onPress: () => navigation.navigate('LoginScreen')
            }
          ]
        );
        return;
      } else {
        setError(response.data.error || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.headerText}>Forgot Password</Text>
            <Text style={styles.descriptionText}>
              Enter your email address to receive a verification code
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#8146C1" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholderTextColor="#8146C1"
                autoCapitalize="none"
              />
            </View>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.headerText}>Enter Code</Text>
            <Text style={styles.descriptionText}>
              We sent a code to your email.
              Don't see it? Check your spam folder.
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={20} color="#8146C1" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter verification code"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                placeholderTextColor="#8146C1"
              />
            </View>
            <TouchableOpacity onPress={handleSendOTP} style={styles.resendLink}>
              <Text style={styles.resendText}>Didn't get a code? Send again</Text>
            </TouchableOpacity>
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.headerText}>Reset Password</Text>
            <Text style={styles.descriptionText}>
              Enter your new password
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#8146C1" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#8146C1"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#8146C1"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#8146C1" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#8146C1"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#8146C1"
                />
              </TouchableOpacity>
            </View>
          </>
        );
    }
  };

  const handleActionButton = () => {
    switch (step) {
      case 1:
        return handleSendOTP();
      case 2:
        return handleVerifyOTP();
      case 3:
        return handleResetPassword();
    }
  };

  const getButtonText = () => {
    switch (step) {
      case 1:
        return 'Send OTP';
      case 2:
        return 'Verify OTP';
      case 3:
        return 'Reset Password';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/vetcare.png')}
            style={styles.logo}
          />
        </View>

        <View style={styles.formContainer}>
          {renderStep()}
          
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color="#FF4B4B" style={{marginRight: 5}} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          <TouchableOpacity
            style={[styles.actionButton, loading && styles.disabledButton]}
            onPress={handleActionButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.actionButtonText}>{getButtonText()}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
        </View>

        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Ionicons name="arrow-back" size={24} color="#8146C1" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  formContainer: {
    width: '92%',
    maxWidth: 400,
    padding: 25,
    backgroundColor: '#F5EBF9',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#8146C1',
    textAlign: 'center',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 15,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1ACDA',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    height: 55,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  actionButton: {
    backgroundColor: '#8146C1',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#8146C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 14,
    flex: 1,
  },
  resendLink: {
    alignSelf: 'center',
    marginTop: -5,
    marginBottom: 15,
  },
  resendText: {
    color: '#8146C1',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  backToLoginButton: {
    marginTop: 25,
    alignSelf: 'center',
  },
  backToLoginText: {
    color: '#8146C1',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButtonText: {
    color: '#8146C1',
    fontSize: 16,
    marginLeft: 5,
    fontWeight: '500',
  },
  errorContent: {
    width: '100%',
  },
  bypassButton: {
    backgroundColor: '#8146C1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  bypassButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ForgotPasswordScreen;