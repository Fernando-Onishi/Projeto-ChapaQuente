import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../Config/FireBaseConfig';

export default function TelaCadastro({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setValidationError('Preencha todos os campos para continuar.');
      return;
    }

    setLoading(true);
    setValidationError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: name.trim(),
        email: email.trim(),
        createdAt: serverTimestamp(),
      });
      Alert.alert('Cadastro realizado', 'Seu usuário foi criado com sucesso.');
      navigation.replace('Home');
    } catch (error) {
      const message = error.code === 'auth/email-already-in-use'
        ? 'Este e-mail já está em uso.'
        : error.code === 'auth/invalid-email'
        ? 'Digite um e-mail válido.'
        : error.code === 'auth/weak-password'
        ? 'A senha deve ter pelo menos 6 caracteres.'
        : error.message;
      setValidationError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#632713", "#C94F27"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.helpButton} activeOpacity={0.8}>
          <MaterialIcons name="help-outline" size={20} color="#FDE3CF" />
        </TouchableOpacity>
        <KeyboardAvoidingView
          style={styles.keyboardAvoiding}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/leaozinho.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.card}>
              <View style={styles.inputRow}>
                <MaterialIcons name="person" size={20} color="#8e6f53" />
                <TextInput
                  style={styles.inputText}
                  placeholder="Nome"
                  placeholderTextColor="#8e6f53"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="email" size={20} color="#8e6f53" />
                <TextInput
                  style={styles.inputText}
                  placeholder="E-mail"
                  placeholderTextColor="#8e6f53"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="lock" size={20} color="#8e6f53" />
                <TextInput
                  style={styles.inputText}
                  placeholder="Senha"
                  placeholderTextColor="#8e6f53"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={handleRegister}>
                <Text style={styles.buttonText}>{loading ? 'Cadastrando...' : 'Cadastrar'}</Text>
              </TouchableOpacity>
              {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}
            </View>

            <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.backButtonText}>Voltar para o login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerDivider} />

          <Text style={styles.footerText}>
            Ao continuar, você concorda com os Termos de Uso e está ciente da Declaração de Privacidade
          </Text>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 6,
  },
  logo: {
    width: 200,
    height: 200,
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -70,
    paddingHorizontal: 12,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.17)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 14,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#3c2a1e',
    paddingLeft: 8,
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EC6426',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'transparent',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  smallText: {
    color: '#ffe6ce',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
  },
  linkText: {
    color: '#ffe6ce',
    textDecorationLine: 'underline',
  },
  helpButton: {
    position: 'absolute',
    top: 18,
    right: 12,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 13,
    marginTop: 10,
    textAlign: 'center',
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#FDE3CF',
    width: '105%',
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 12,
    borderRadius: 1,
  },
  footerText: {
    color: '#ffe6ce',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 22,
    alignSelf: 'stretch',
    marginHorizontal: 0,
  },
});
