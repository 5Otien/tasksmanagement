import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Connexion: undefined;
  Dossiers: undefined;
  Taches: { dossierId: string; nomDossier: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Dossier {
  id: string;
  nom: string;
  nbTaches: number;
}

export default function DossiersEcran() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [nouveauDossier, setNouveauDossier] = useState('');
  const navigation = useNavigation<NavigationProp>();

  useFocusEffect(
    React.useCallback(() => {
      async function chargerDossiers() {
        const data = await AsyncStorage.getItem('dossiers');
        if (data) setDossiers(JSON.parse(data));
      }
      chargerDossiers();
    }, [])
  );

  async function sauvegarderDossiers(dossiers: Dossier[]) {
    await AsyncStorage.setItem('dossiers', JSON.stringify(dossiers));
    setDossiers(dossiers);
  }

  function ajouterDossier() {
    if (!nouveauDossier.trim()) return Alert.alert('Erreur', 'Nom vide');
    if (dossiers.some(d => d.nom === nouveauDossier)) return Alert.alert('Erreur', 'Nom existe déjà');
    sauvegarderDossiers([...dossiers, { id: Date.now().toString(), nom: nouveauDossier, nbTaches: 0 }]);
    setNouveauDossier('');
  }

  function supprimerDossier(id: string) {
    Alert.alert('Confirmer', 'Supprimer ce dossier ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const nouveauxDossiers = dossiers.filter(d => d.id !== id);
          await AsyncStorage.removeItem(`taches_${id}`);
          sauvegarderDossiers(nouveauxDossiers);
        },
      },
    ]);
  }

  function renommerDossier(id: string, nouveauNom: string) {
    if (!nouveauNom.trim()) return Alert.alert('Erreur', 'Nom vide');
    if (dossiers.some(d => d.nom === nouveauNom && d.id !== id)) return Alert.alert('Erreur', 'Nom existe déjà');
    const nouveauxDossiers = dossiers.map(d => (d.id === id ? { ...d, nom: nouveauNom } : d));
    sauvegarderDossiers(nouveauxDossiers);
  }

  async function deconnexion() {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Connexion' }] });
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', color: 'green' }}>Dossiers</Text>
      <TextInput
        placeholder="Nom du dossier"
        value={nouveauDossier}
        onChangeText={setNouveauDossier}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <Button mode="contained" onPress={ajouterDossier}>
        Ajouter
      </Button>
      <Button mode="outlined" onPress={deconnexion} style={{ marginTop: 10 }}>
        Déconnexion
      </Button>
      <FlatList
        data={dossiers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
            <Text onPress={() => navigation.navigate('Taches', { dossierId: item.id, nomDossier: item.nom })}>
              {item.nom} ({item.nbTaches})
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Button
                mode="text"
                onPress={() => Alert.prompt('Renommer', 'Nouveau nom', nom => renommerDossier(item.id, nom), 'plain-text', item.nom)}
              >
                Renommer
              </Button>
              <Button mode="text" onPress={() => supprimerDossier(item.id)}>
                Supprimer
              </Button>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}