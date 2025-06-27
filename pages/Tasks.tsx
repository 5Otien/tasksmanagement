import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Connexion: undefined;
  Dossiers: undefined;
  Taches: { dossierId: string; nomDossier: string };
};

interface Tache {
  id: string;
  titre: string;
  termine: boolean;
  dateLimite?: string | null;
}

export default function TachesEcran({ route }: { route: { params: { dossierId: string; nomDossier: string } } }) {
  const { dossierId, nomDossier } = route.params;
  const [taches, setTaches] = useState<Tache[]>([]);
  const [titreTache, setTitreTache] = useState('');
  const [afficherDate, setAfficherDate] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    async function charger() {
      const data = await AsyncStorage.getItem(`taches_${dossierId}`);
      if (data) setTaches(JSON.parse(data));
    }
    charger();
  }, [dossierId]);

  async function sauvegarder(taches: Tache[]) {
    await AsyncStorage.setItem(`taches_${dossierId}`, JSON.stringify(taches));
    setTaches(taches);
    const dossiersData = await AsyncStorage.getItem('dossiers');
    if (dossiersData) {
      const dossiers = JSON.parse(dossiersData);
      const nouveauxDossiers = dossiers.map((d: { id: string; nom: string; nbTaches: number }) =>
        d.id === dossierId ? { ...d, nbTaches: taches.length } : d
      );
      await AsyncStorage.setItem('dossiers', JSON.stringify(nouveauxDossiers));
    }
  }

  function ajouterTache() {
    if (!titreTache.trim()) return Alert.alert('Erreur', 'Titre vide');
    const tache: Tache = { id: Date.now().toString(), titre: titreTache, termine: false, dateLimite: date ? date.toISOString() : null };
    sauvegarder([...taches, tache]);
    setTitreTache('');
    setDate(new Date());
    setAfficherDate(false);
  }

  function basculerTermine(id: string) {
    const nouvellesTaches = taches.map(t => (t.id === id ? { ...t, termine: !t.termine } : t));
    sauvegarder(nouvellesTaches);
  }

  function supprimerTache(id: string) {
    const nouvellesTaches = taches.filter(t => t.id !== id);
    sauvegarder(nouvellesTaches);
  }

  function modifierTache(id: string, nouveauTitre: string) {
    if (!nouveauTitre.trim()) return Alert.alert('Erreur', 'Titre vide');
    const nouvellesTaches = taches.map(t => (t.id === id ? { ...t, titre: nouveauTitre } : t));
    sauvegarder(nouvellesTaches);
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', color: 'green' }}>{nomDossier}</Text>
      <TextInput
        placeholder="Titre de la tâche"
        value={titreTache}
        onChangeText={setTitreTache}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <Button mode="contained" onPress={() => setAfficherDate(true)}>
        Date limite
      </Button>
      {afficherDate && (
        <DateTimePicker
          value={date}
          mode="datetime"
          onChange={(event, newDate) => {
            setAfficherDate(false);
            if (newDate) setDate(newDate);
          }}
        />
      )}
      <Button mode="contained" onPress={ajouterTache} style={{ marginTop: 10 }}>
        Ajouter
      </Button>
      <FlatList
        data={taches}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
            <Text
              style={{ textDecorationLine: item.termine ? 'line-through' : 'none' }}
              onPress={() => basculerTermine(item.id)}
            >
              {item.titre} {item.dateLimite ? `(${new Date(item.dateLimite).toLocaleString()})` : ''}
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Button
                mode="text"
                onPress={() => Alert.prompt('Modifier', 'Nouveau titre', titre => modifierTache(item.id, titre), 'plain-text', item.titre)}
              >
                Modifier
              </Button>
              <Button mode="text" onPress={() => supprimerTache(item.id)}>
                Supprimer
              </Button>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}