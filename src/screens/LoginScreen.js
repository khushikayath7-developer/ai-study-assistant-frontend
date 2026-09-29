import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getApiErrorMessage, loginUser } from '../api/api';
import { AuthContext } from '../context/AuthContext';
import AppAlert from '../components/AppAlert';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ visible: false, title: '', message: '', type: 'info' });
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    const nextErrors = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) nextErrors.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) nextErrors.email = 'Enter a valid email address';
    if (!password) nextErrors.password = 'Password is required';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser(cleanEmail, password);
      await login(res.data.access_token);
    } catch (err) {
      setPopup({
        visible: true,
        title: 'Login Failed',
        message: getApiErrorMessage(err, 'Unable to log in'),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
      <Text style={styles.title}>AI Study Assistant</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Enter your email address"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

      <Text style={styles.label}>Password</Text>
      <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Enter your password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
          }}
          autoCapitalize="none"
          secureTextEntry={!showPassword}
          textContentType="password"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
        >
          <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
        </TouchableOpacity>
      </View>
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <AppAlert
        {...popup}
        onClose={() => setPopup((current) => ({ ...current, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#4A47A3' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 24, color: '#666' },
  label: {
    color: '#374151', fontSize: 14, fontWeight: '600', marginBottom: 7,
  },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16,
    fontSize: 16, color: '#111827', backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: '#ddd', borderRadius: 8, marginBottom: 16, backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: '#111827',
  },
  eyeButton: { paddingHorizontal: 14, paddingVertical: 12 },
  eyeIcon: { fontSize: 19 },
  inputError: { borderColor: '#DC2626' },
  errorText: { color: '#DC2626', fontSize: 12, marginTop: -10, marginBottom: 12 },
  button: { backgroundColor: '#4A47A3', padding: 14, borderRadius: 8, marginTop: 8 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 16 },
  link: { color: '#4A47A3', textAlign: 'center', marginTop: 18 },
});
