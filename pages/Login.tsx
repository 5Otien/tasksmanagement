import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Connexion: undefined;
  Dossiers: undefined;
  Taches: { dossierId: string; nomDossier: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ConnexionEcran() {
  const [utilisateur, setUtilisateur] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const navigation = useNavigation<NavigationProp>();

  async function connecter() {
    if (utilisateur === 'admin' && motDePasse === '1234') {
      setErreur('');
      await AsyncStorage.setItem('utilisateur', JSON.stringify({ utilisateur }));
      navigation.navigate('Dossiers');
    } else {
      setErreur('Identifiants incorrects');
    }
  }

  function reinitialiser() {
    setUtilisateur('');
    setMotDePasse('');
    setErreur('');
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ color: 'green', fontSize: 24, textAlign: 'center' }}>Connexion</Text>
      <TextInput
        placeholder="Nom d'utilisateur"
        value={utilisateur}
        onChangeText={setUtilisateur}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Mot de passe"
        value={motDePasse}
        onChangeText={setMotDePasse}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      {erreur ? <Text style={{ color: 'red' }}>{erreur}</Text> : null}
      <Button mode="contained" onPress={connecter}>
        Connexion
      </Button>
      <Button mode="outlined" onPress={reinitialiser} style={{ marginTop: 10 }}>
        Réinitialiser
      </Button>
    </SafeAreaView>
  );
}