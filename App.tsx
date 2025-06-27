import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Connexion from './pages/Login';
import Dossiers from './pages/Home';
import Taches from './pages/Tasks';

type RootStackParamList = {
  Connexion: undefined;
  Dossiers: undefined;
  Taches: { dossierId: string; nomDossier: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Appli() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Connexion">
        <Stack.Screen name="Connexion" component={Connexion} />
        <Stack.Screen name="Dossiers" component={Dossiers} />
        <Stack.Screen name="Taches" component={Taches} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}