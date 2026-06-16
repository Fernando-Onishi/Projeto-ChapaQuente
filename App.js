import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { useFonts } from 'expo-font';
import { Lalezar_400Regular } from '@expo-google-fonts/lalezar';
import { Lora_400Regular } from '@expo-google-fonts/lora';
import { LuckiestGuy_400Regular } from '@expo-google-fonts/luckiest-guy';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import { auth } from './Config/FireBaseConfig';
import TelaLogin from './TelaLogin/TelaLogin';
import TelaCadastro from './Cadastro/TelaCadastro';
import TelaHome from './TelaHome/TelaHome';
import TelaPerfil from './TelaPerfil/TelaPerfil';
import TelaFavorito from './TelaFavorito/TelaFavorito';
import TelaDescricao from './TelaDescricao/TelaDescricao';
import TelaAdmin from './TelaAdmin/TelaAdmin';
import TelaAdministrador from './TelaAdmin/TelaAdministrador';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Login');
  const [authChecked, setAuthChecked] = useState(false);
  const [fontsLoaded] = useFonts({
    'Luckiest Guy': LuckiestGuy_400Regular,
    'Lilita One': LilitaOne_400Regular,
    'Lalezar': Lalezar_400Regular,
    'Lora': Lora_400Regular,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setInitialRoute(user ? 'Home' : 'Login');
        setAuthChecked(true);
      },
      (error) => {
        console.warn('Erro no AuthStateChanged:', error);
        setInitialRoute('Login');
        setAuthChecked(true);
      }
    );

    return unsubscribe;
  }, []);

  if (!fontsLoaded || !authChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC6426" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="Cadastro" component={TelaCadastro} />
        <Stack.Screen name="Home" component={TelaHome} />
        <Stack.Screen name="TelaPerfil" component={TelaPerfil} />
        <Stack.Screen name="TelaFavorito" component={TelaFavorito} />
        <Stack.Screen name="TelaDescricao" component={TelaDescricao} />
        <Stack.Screen name="TelaAdmin" component={TelaAdmin} />
        <Stack.Screen name="TelaAdministrador" component={TelaAdministrador} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});