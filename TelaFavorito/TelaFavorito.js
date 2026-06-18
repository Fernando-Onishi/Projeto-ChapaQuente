import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { auth, db } from '../Config/FireBaseConfig';

export default function TelaFavorito({ navigation, route }) {
  const [favoritos, setFavoritos] = useState(route.params?.favoritos ?? []);
  const [userUid, setUserUid] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (route.params?.favoritos) {
      setFavoritos(route.params.favoritos);
    }
  }, [route.params?.favoritos]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserUid(user?.uid ?? null);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isFocused || !userUid) return;
    if (route.params?.favoritos) return;

    const syncFavorites = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userUid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (Array.isArray(data.favorites)) {
            setFavoritos(data.favorites);
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar favoritos:', error);
      }
    };

    syncFavorites();
  }, [isFocused, userUid, route.params?.favoritos]);

  const formatPrice = (value) => {
    const normalized = String(value).replace(',', '.').replace(/[^0-9.]/g, '');
    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? 'R$ 0,00' : `R$ ${parsed.toFixed(2).replace('.', ',')}`;
  };

  const getEconomia = (preco, precoAntigo) => {
    const current = parseFloat(String(preco).replace(',', '.').replace(/[^0-9.]/g, ''));
    const original = parseFloat(String(precoAntigo).replace(',', '.').replace(/[^0-9.]/g, ''));
    if (Number.isNaN(current) || Number.isNaN(original) || original <= current) return null;
    const diff = (original - current).toFixed(2).replace('.', ',');
    return `Economize R$ ${diff}`;
  };

  const handleRemoveFavorite = async (itemId) => {
    const nextFavorites = favoritos.filter((item) => item.id !== itemId);
    setFavoritos(nextFavorites);

    if (userUid) {
      try {
        await setDoc(doc(db, 'users', userUid), { favorites: nextFavorites }, { merge: true });
      } catch (error) {
        console.warn('Erro ao atualizar favoritos:', error);
      }
    }
  };

  const renderItem = ({ item }) => {
    const imageSource = typeof item.imagem === 'string' ? { uri: item.imagem } : item.imagem;
    const precoAtual = item.preco || item.precoAtual || item.price || '0';
    const precoAntigo = item.precoAntigo || item.precoOld || item.originalPrice || null;
    const economia = getEconomia(precoAtual, precoAntigo);

    return (
      <View style={styles.cardProduto}>
        <View style={styles.imagemWrapper}>
          <Image source={imageSource} style={styles.imagemProduto} resizeMode="contain" />
        </View>
        <View style={styles.infoProduto}>
          <Text style={styles.nomeProduto}>{item.nome || item.name || 'Produto'}</Text>
          <View style={styles.precoRow}>
            <Text style={styles.precoProduto}>{formatPrice(precoAtual)}</Text>
            {precoAntigo ? (
              <Text style={styles.precoAntigoProduto}>{formatPrice(precoAntigo)}</Text>
            ) : null}
          </View>
          {economia ? <Text style={styles.economiaTexto}>{economia}</Text> : null}
        </View>
        <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveFavorite(item.id)}>
          <Feather name="x" size={28} color="#e0245e" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.whitePanel}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Entypo name="chevron-left" size={32} color="#231815" />
          </TouchableOpacity>
          <Text style={styles.titulo}>FAVORITOS</Text>
          <View style={{ width: 44, height: 44 }} />
        </View>

        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContainer}
          ListEmptyComponent={<Text style={styles.listaVazia}>Lista de Favoritos vazia...</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDE3CF',
  },
  whitePanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: 28,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFEFDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Luckiest Guy',
    lineHeight: 36,
  },
  listaContainer: {
    paddingBottom: 20,
  },
  removeButton: {
    width: 42,
    height: 42,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  cardProduto: {
    backgroundColor: '#FDE3CF',
    padding: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EC6426',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imagemWrapper: {
    width: 126,
    height: 126,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginLeft: -12,
    overflow: 'hidden',
  },
  imagemProduto: {
    width: 116,
    height: 116,
  },
  infoProduto: {
    flex: 1,
    paddingRight: 8,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  nomeProduto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Luckiest Guy',
  },
  precoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  precoProduto: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EC6426',
    marginRight: 4,
    fontFamily: 'Lalezar',
  },
  precoAntigoProduto: {
    fontSize: 14,
    color: '#8a8a8a',
    textDecorationLine: 'line-through',
    fontFamily: 'Lora',
  },
  economiaTexto: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 6,
    fontFamily: 'Lora',
  },
  coracaoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  coracaoIconText: {
    color: '#000',
    fontSize: 20,
    lineHeight: 22,
  },
  listaVazia: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
});
