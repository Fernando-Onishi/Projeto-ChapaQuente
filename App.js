import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import * as Font from 'expo-font';
import { auth } from './Config/FireBaseConfig';
import TelaLogin from './TelaLogin/TelaLogin';
import TelaCadastro from './Cadastro/TelaCadastro';
import TelaHome from './TelaHome/TelaHome';
import TelaPerfil from './TelaPerfil/TelaPerfil';
import TelaFavorito from './TelaFavorito/TelaFavorito';
import TelaDescricao from './TelaDescricao/TelaDescricao';
import TelaAdmin from './TelaAdmin/TelaAdmin';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Login');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Luckiest Guy': 'https://fonts.gstatic.com/s/luckiestguy/v1/Yc2l0hlHoYX8uo0dDvx7xdvSQ9Qu8BcSEwTPsJqI9FM.ttf',
          'Lilita One': 'https://fonts.gstatic.com/s/lilitaone/v8/i7dPIFZ9Sd9QOQ4NUVLjYEKjMz4.ttf',
        });
      } catch (error) {
        console.warn('Falha ao carregar fontes:', error);
      } finally {
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

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
        <ActivityIndicator size="large" color="#C94F27" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="Cadastro" component={TelaCadastro} />
        <Stack.Screen name="Home" component={TelaHome} />
        <Stack.Screen name="Perfil" component={TelaPerfil} />
        <Stack.Screen name="TelaFavorito" component={TelaFavorito} />
        <Stack.Screen name="TelaDescricao" component={TelaDescricao} />
        <Stack.Screen name="TelaAdmin" component={TelaAdmin} />
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