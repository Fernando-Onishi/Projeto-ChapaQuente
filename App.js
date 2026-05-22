import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, LuckiestGuy_400Regular } from '@expo-google-fonts/luckiest-guy';
import { Nunito_400Regular } from '@expo-google-fonts/nunito';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import TelaLogin from './TelaLogin/TelaLogin';
import TelaCadastro from './Cadastro/TelaCadastro';
import TelaHome from './TelaHome/TelaHome';
import TelaFavorito from './TelaFavorito/TelaFavorito';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    LuckiestGuy_400Regular,
    Nunito_400Regular,
    LilitaOne_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="Cadastro" component={TelaCadastro} />
        <Stack.Screen name="Home" component={TelaHome} />
        <Stack.Screen name="Favoritos" component={TelaFavorito} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});