import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, TextInput, Surface, useTheme, HelperText } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

// Import actions from auth slice
import { loginSuccess } from '../store/slices/authSlice';

const LoginScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (isSignUp && !name) {
      setError('Name is required');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful login
      const mockUser = {
        id: '123456789',
        username: email.split('@')[0],
        email,
        displayName: isSignUp ? name : email.split('@')[0],
      };
      
      // Dispatch login success action
      dispatch(loginSuccess({ 
        user: mockUser, 
        token: `mock_token_${Date.now()}` 
      }));
      
      // Navigate back to home
      navigation.goBack();
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSignUpMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        style={styles.headerGradient}
      >
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons 
            name="download-circle" 
            size={80} 
            color="white" 
          />
          <Text style={styles.appName}>Social Media Downloader</Text>
        </View>
      </LinearGradient>

      <Surface style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          {isSignUp 
            ? 'Sign up to save your downloads and sync across devices'
            : 'Sign in to access your downloads and connected accounts'
          }
        </Text>

        {isSignUp && (
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            autoCapitalize="words"
          />
        )}
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          mode="outlined"
          secureTextEntry
        />
        
        {error && (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>

        <View style={styles.socialLoginContainer}>
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
            <Text style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>
              or continue with
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
          </View>
          
          <View style={styles.socialButtonsRow}>
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => {}}
            >
              <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => {}}
            >
              <MaterialCommunityIcons name="facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.socialButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => {}}
            >
              <MaterialCommunityIcons name="apple" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={toggleSignUpMode} style={styles.toggleContainer}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            {isSignUp ? 'Already have an account? ' : 'Don\'t have an account? '}
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSkip} style={styles.skipContainer}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  appName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  formContainer: {
    flex: 1,
    marginTop: -36,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
  },
  socialLoginContainer: {
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 8,
    fontSize: 12,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  skipContainer: {
    alignItems: 'center',
  },
});

export default LoginScreen;