import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, FlatList, Dimensions, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../Config/FireBaseConfig';

export default function TelaHome({ navigation }) {
  const [userName, setUserName] = useState('Usuário');

  const produtos = [
    { id: '1', nome: 'Giga Planet', desc: 'Lanche premium com ingredientes especiais', imagem: require('../assets/hamburguer.png'), preco: '48,00' },
    { id: '2', nome: 'Supernova', desc: 'Lanche saboroso com toque especial',          imagem: require('../assets/hamburguer1.png'), preco: '38,00' },
    { id: '3', nome: 'Cheese Storm', desc: 'Queijo derretido em explosão de sabor',    imagem: require('../assets/hamburguer2.png'), preco: '48,00' },
    { id: '4', nome: 'Mega Melt', desc: 'Sanduíche gratinado com queijo extra',        imagem: require('../assets/hamburguer3.png'), preco: '42,00' },
    { id: '5', nome: 'Crispy Roll', desc: 'Crocrante por fora e macio por dentro',     imagem: require('../assets/hamburguer4.png'), preco: '36,00' },
    { id: '6', nome: 'Spicy Burst', desc: 'Pimenta na medida certa para aquecer',      imagem: require('../assets/hamburguer5.png'), preco: '44,00', precoAntigo: '52,00' },
    { id: '7', nome: 'Bacon Bliss', desc: 'Bacon crocante com sabor irresistível',     imagem: require('../assets/hamburguer6.png'), preco: '40,00', precoAntigo: '48,00' },
    { id: '8', nome: 'Veggie Delight', desc: 'Opção vegetariana leve e colorida',      imagem: require('../assets/sorvete.png'), preco: '34,00', precoAntigo: '42,00' },
    { id: '9', nome: 'Double Trouble', desc: 'Duplo hambúrguer para matar a fome',     imagem: require('../assets/brownie.png'), preco: '50,00', precoAntigo: '60,00' },
    { id: '10', nome: 'Mini Snack', desc: 'Lanchinho rápido e saboroso',               imagem: require('../assets/sorvete1.png'), preco: '30,00', precoAntigo: '35,00' },
  ];
  const featured = produtos.slice(5, 10);

  const { width } = Dimensions.get('window');
  const cardWidth = Math.round(width * 0.48);
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (label) => {
    setFavorites((prev) => {
      if (prev.includes(label)) return prev.filter((l) => l !== label);
      return [...prev, label];
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || 'Usuário');
          } else {
            setUserName('Usuário');
          }
        } catch (error) {
          setUserName('Usuário');
        }
      } else {
        setUserName('Usuário');
      }
    });

    return unsubscribe;
  }, []);

  const capitalizeFirst = (str) => {
    if (!str) return '';
    const s = str.trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const userNameDisplay = userName ? capitalizeFirst(userName) : 'Usuário';
  const userInitial = userNameDisplay ? userNameDisplay.charAt(0).toUpperCase() : 'U';

  // ERRO CORRIGIDO 1: Função para gerenciar imagens locais e strings vazias sem quebrar
  const renderizarImagem = (item) => {
    if (!item.imagem) return null;
    const source = typeof item.imagem === 'string' ? { uri: item.imagem } : item.imagem;
    return <Image source={source} style={styles.productImage} resizeMode="cover" />;
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.userCircle}>
          <Text style={styles.userInitial}>{userInitial}</Text>
        </View>
        <Text style={styles.headerTitle}>{userNameDisplay}</Text>
      </View>

      <View style={[styles.bannerCard, { width, marginLeft: -20, marginRight: -20 }]}> 
        <Image
          source={require('../assets/fundo.png')}
          style={[styles.bannerImage, { height: Math.round(width * 0.58) }]}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.sectionTitle}>Produtos</Text>
      <FlatList
        data={produtos.slice(0, 5)}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { width: cardWidth, marginRight: 10 }] }>
            <View style={styles.imagePlaceholder}>
              {renderizarImagem(item)}
              <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item.id)}>
                <AntDesign
                  name="heart"
                  size={24}
                  color={favorites.includes(item.id) ? '#e0245e' : 'black'}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardPriceLarge}>R$ {item.preco}</Text>
            <Text style={styles.cardLabel}>{item.nome}</Text>
          </View>
        )}
        snapToInterval={cardWidth + 10}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: 8, marginBottom: 24 }}
      />

      <Text style={styles.sectionTitle}>Em destaque</Text>
      <FlatList
        data={featured}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, styles.featuredCard, { width: cardWidth, marginRight: 12 }] }>
            <View style={styles.imagePlaceholder}>
              {renderizarImagem(item)}
              <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item.id)}>
                <AntDesign
                  name="heart"
                  size={24}
                  color={favorites.includes(item.id) ? '#e0245e' : 'black'}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.featuredInfo}>
              {item.precoAntigo ? <Text style={styles.featuredPriceOld}>R$ {item.precoAntigo}</Text> : null}
              <Text style={styles.featuredPriceNew}>R$ {item.preco}</Text>
            </View>
            <Text style={styles.cardLabel}>{item.nome}</Text>
          </View>
        )}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: 8, marginTop: 22, marginBottom: 18 }}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomButton} activeOpacity={0.75} onPress={() => {}}>
          <Text style={styles.bottomText}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomButtonPrimary}
          activeOpacity={0.85}
          onPress={() => {
            // TODO: conectar com a tela de adicionar produto / TelaProduto
            // navigation.navigate('TelaProduto');
          }}
        >
          <Text style={styles.bottomTextPrimary}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} activeOpacity={0.75} onPress={() => {}}>
          <Text style={styles.bottomText}>❤️ Favoritos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fffbf6',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  userCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff1e6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e7c5b7',
  },
  userInitial: {
    color: '#c25b2d',
    fontWeight: '700',
    fontSize: 18,
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 18,
    color: '#632713',
    fontWeight: '700',
  },
  bannerCard: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: 24,
  },
  bannerImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  bannerText: {
    flex: 1,
    paddingRight: 16,
  },
  bannerLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  bannerPrice: {
    color: '#fff7e7',
    fontSize: 12,
    marginBottom: 4,
  },
  bannerValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#c25b2d',
    fontWeight: '700',
  },
  bannerImagePlaceholder: {
    width: 110,
    height: 110,
    backgroundColor: '#ffd8b6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f2c9a1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#632713',
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  card: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#fff7f0',
    borderRadius: 28,
    padding: 0,
    borderWidth: 0,
    overflow: 'hidden',
  },
  featuredCard: {
    backgroundColor: '#fff4e9',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    backgroundColor: '#f8f0e7',
  },
  placeholderText: {
    color: '#b68369',
    fontSize: 13,
  },
  cardLabel: {
    fontSize: 18,
    color: '#231815',
    fontWeight: '900',
    marginBottom: 12,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  cardPriceLarge: {
    fontSize: 24,
    color: '#ff8b38',
    fontWeight: '900',
    marginTop: 14,
    paddingHorizontal: 14,
  },
  cardPrice: {
    fontSize: 13,
    color: '#8e6f53',
    paddingHorizontal: 14,
  },
  featuredInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    marginTop: 12,
  },
  featuredPriceOld: {
    fontSize: 12,
    color: '#9b6c4d',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  featuredPriceNew: {
    fontSize: 22,
    color: '#ff8b38',
    fontWeight: '900',
  },
  // ERRO CORRIGIDO 5: Adicionado estilo necessário para a tag Image preencher o bloco
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
  },
  favoriteText: {
    fontSize: 18,
    color: '#b68369',
  },
  favoriteActive: {
    color: '#e0245e',
  },
  bottomBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 10,
    height: 64,
    backgroundColor: '#fff',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 10,
  },
  bottomButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonPrimary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#c25b2d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: {
    color: '#8e6f53',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomTextPrimary: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '700',
  },
  
});