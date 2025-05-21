import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { login, socialLogin } from '../services/api';
import { useAppDispatch } from '../store';
import { setUser } from '../store/slices/authSlice';
import Header from '../components/Header';
import SocialMediaIcon from '../components/SocialMediaIcon';

type LoginScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await login(email, password);
      if (response.success) {
        dispatch(setUser({ email, token: response.token }));
        navigation.goBack();
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialLogin = async (platform: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await socialLogin(platform);
      if (response.success) {
        dispatch(setUser({ email: response.email || 'user@example.com', token: response.token }));
        navigation.goBack();
      } else {
        setError(response.error || `${platform} login failed`);
      }
    } catch (err) {
      console.error(`${platform} login error:`, err);
      setError(`${platform} login failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSkip = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Login" showBackButton onBackPress={() => navigation.goBack()} />
        
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.logoContainer}>
            <Feather name="download-cloud" size={64} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text }]}>SocialSaver</Text>
          </View>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email" />}
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon 
                icon={secureTextEntry ? "eye" : "eye-off"} 
                onPress={() => setSecureTextEntry(!secureTextEntry)} 
              />
            }
          />
          
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            loading={isLoading}
            disabled={isLoading}
          >
            Login
          </Button>
          
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            <Text style={[styles.dividerText, { color: theme.colors.text }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
          </View>
          
          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#E4405F' }]}
              onPress={() => handleSocialLogin('Instagram')}
              disabled={isLoading}
            >
              <SocialMediaIcon platform="Instagram" size={24} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Instagram</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#FF0000' }]}
              onPress={() => handleSocialLogin('YouTube')}
              disabled={isLoading}
            >
              <SocialMediaIcon platform="YouTube" size={24} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>YouTube</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: '#1DA1F2' }]}
              onPress={() => handleSocialLogin('Twitter')}
              disabled={isLoading}
            >
              <SocialMediaIcon platform="Twitter" size={24} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Twitter</Text>
            </TouchableOpacity>
          </View>
          
          <Button
            mode="text"
            onPress={handleSkip}
            style={styles.skipButton}
          >
            Skip Login
          </Button>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
    width: '100%',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 16,
  },
  loginButton: {
    width: '100%',
    marginTop: 8,
    paddingVertical: 6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialContainer: {
    width: '100%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  skipButton: {
    marginTop: 16,
  },
});
