import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, FlatList, Dimensions, Image, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../Config/FireBaseConfig';

export default function TelaHome({ navigation }) {
  const [userName, setUserName] = useState('Usuário');
  const [userPhoto, setUserPhoto] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const featured = produtos.slice(5, 10);

  const { width } = Dimensions.get('window');
  const cardWidth = Math.round(width * 0.42);
  const [favorites, setFavorites] = useState([]);

  const obterProdutoDestaque = () => {
    return produtos.find(
      (prod) =>
        prod.nome &&
        prod.nome.toLowerCase().includes('fusão') &&
        prod.nome.toLowerCase().includes('nuclear')
    );
  };

  const toggleFavorite = (label) => {
    setFavorites((prev) => {
      if (prev.includes(label)) return prev.filter((l) => l !== label);
      return [...prev, label];
    });
  };

  useEffect(() => {
    const unsubscribeProdutos = onSnapshot(
      collection(db, 'produtos'),
      (snapshot) => {
        const lista = snapshot.docs.map((docSnap) => {
          const item = docSnap.data();
          const foto = item.Foto || item.foto || item.imagem || item.image || item.Foto2 || item.Foto3 || null;
          const foto2 = item.Foto2 || item.foto2 || item.imagem2 || item.image2 || null;
          const foto3 = item.Foto3 || item.foto3 || item.imagem3 || item.image3 || null;

          return {
            id: docSnap.id,
            ...item,
            nome: item.Produto || item.nome || item.name || 'Produto',
            descricao: item.Descrição || item.descricao || item.description || '',
            imagem: foto,
            imagem2: foto2,
            imagem3: foto3,
            preco: item.Preço || item.Preco || item.preco || item.price || '0',
            precoAntigo: item.ValorNormal || item.valorNormal || item.originalPrice || null,
            desconto: item.Desconto || item.desconto || '',
          };
        });

        setProdutos(lista);
      },
      () => {
        setProdutos([]);
      },
    );

    return () => unsubscribeProdutos();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || 'Usuário');
            setUserPhoto(userDoc.data().foto || userDoc.data().fotoUrl || user.photoURL || null);
          } else {
            setUserName('Usuário');
            setUserPhoto(user.photoURL || null);
          }
        } catch (error) {
          setUserName('Usuário');
          setUserPhoto(user?.photoURL || null);
        }
      } else {
        setUserName('Usuário');
        setUserPhoto(null);
      }
    });

    return unsubscribe;
  }, []);

  const capitalizeFirst = (str) => {
    if (!str) return '';
    const s = str.trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const getFirstName = (str) => {
    if (!str) return '';
    return str.trim().split(' ')[0] || '';
  };

  const formatPrice = (value) => {
    const normalized = String(value).replace(',', '.').replace(/[^[0-9].]/g, '');
    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? '0,00' : parsed.toFixed(2).replace('.', ',');
  };

  const getSavings = (original, current) => {
    if (!original || !current) return null;
    const originalValue = parseFloat(String(original).replace(',', '.'));
    const currentValue = parseFloat(String(current).replace(',', '.'));
    if (Number.isNaN(originalValue) || Number.isNaN(currentValue) || originalValue <= currentValue) return null;
    return (originalValue - currentValue).toFixed(2).replace('.', ',');
  };

  const getDiscountBadge = (item) => {
    if (item.desconto) return item.desconto;
    if (!item.precoAntigo || !item.preco) return null;
    const originalValue = parseFloat(String(item.precoAntigo).replace(',', '.'));
    const currentValue = parseFloat(String(item.preco).replace(',', '.'));
    if (Number.isNaN(originalValue) || Number.isNaN(currentValue) || originalValue <= currentValue) return null;
    return `${Math.round(((originalValue - currentValue) / originalValue) * 100)}% OFF`;
  };

  const firstName = getFirstName(userName);
  const userNameDisplay = firstName ? capitalizeFirst(firstName) : 'Usuário';
  const userInitial = userNameDisplay ? userNameDisplay.charAt(0).toUpperCase() : 'U';

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sair no momento. Tente novamente.');
    }
  };

  const renderizarImagem = (item) => {
    if (!item.imagem) {
      return <View style={styles.placeholderImage}><Text style={styles.placeholderText}>Sem imagem</Text></View>;
    }

    const source = typeof item.imagem === 'string' ? { uri: item.imagem } : item.imagem;
    return <Image source={source} style={styles.productImage} resizeMode="contain" />;
  };

  const renderProductCard = (item, width) => {
    const precoFormatado = formatPrice(item.preco);
    const precoAntigo = item.precoAntigo ? formatPrice(item.precoAntigo) : null;
    const economize = getSavings(item.precoAntigo, item.preco);
    const badge = getDiscountBadge(item);

    return (
      <TouchableOpacity onPress={() => navigation.navigate('TelaDescricao', { produto: item })} activeOpacity={0.8}>
        <View style={[styles.card, { width, marginRight: 10 }] }>
          <View style={styles.imagePlaceholder}>
            {renderizarImagem(item)}
            {badge ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{badge}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.priceRow}>
              <Text style={styles.cardPriceLarge}>R$ {precoFormatado}</Text>
              <TouchableOpacity style={styles.favoriteButtonSmall} onPress={() => toggleFavorite(item.id)}>
                <AntDesign
                  name={favorites.includes(item.id) ? 'heart' : 'hearto'}
                  size={18}
                  color={favorites.includes(item.id) ? '#e0245e' : '#231815'}
                />
              </TouchableOpacity>
            </View>
            {precoAntigo ? <Text style={styles.cardPriceOld}>R$ {precoAntigo}</Text> : null}
            {economize ? <Text style={styles.saveText}>Economize R$ {economize}</Text> : null}
            <Text style={styles.cardLabel}>{item.nome}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} activeOpacity={0.8} onPress={() => navigation.navigate('TelaPerfil')}>
          {userPhoto ? (
            <TouchableOpacity style={styles.headerAvatarShell} activeOpacity={0.8} onPress={() => navigation.navigate('TelaPerfil')}>
              <Image source={{ uri: userPhoto }} style={styles.headerAvatar} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.userCircle} activeOpacity={0.8} onPress={() => navigation.navigate('TelaPerfil')}>
              <Text style={styles.userInitial}>{userInitial}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{userNameDisplay}</Text>
        </TouchableOpacity>
        {/* logout button removed from header as requested */}
      </View>

      <View style={[styles.bannerCard, { width, marginLeft: -20, marginRight: -20 }]}> 
        <View style={[styles.bannerSplit, { height: Math.round(width * 0.46) }]}> 
          <LinearGradient
            colors={["#FF8000", "#FF8000", "#EC6426"]}
            start={[0, 0]}
            end={[1, 0]}
            locations={[0, 0.7, 1]}
            style={styles.bannerHalfLeft}
          >
            <View style={styles.promoContainer}>
              <Text style={styles.promoLabel}>NOVO LANÇAMENTO</Text>
              <Text style={styles.promoTitle}>FUSÃO NUCLEAR</Text>
              <Text style={styles.promoSmall}>Por apenas:</Text>
              <View style={styles.promoPriceRow}>
                <Text style={styles.promoCurrency}>R$</Text>
                <Text style={styles.promoPrice}>40,50</Text>
              </View>
              <TouchableOpacity style={styles.promoButton} onPress={() => {
                const produtoDestaque = obterProdutoDestaque();
                navigation.navigate('TelaDescricao', { produto: produtoDestaque });
              }}>
                <Text style={styles.promoButtonText}>Ver mais</Text>
                <SimpleLineIcons name="arrow-right" size={14} color="#fff" style={{ marginLeft: 10 }} />
              </TouchableOpacity>
            </View>
            <Image
              source={require('../assets/hamburguer.png')}
              style={styles.promoBurger}
              resizeMode="contain"
            />
          </LinearGradient>

          <View style={styles.bannerHalfRight}>
            <Image
              source={require('../assets/fundo.png')}
              style={styles.promoRightImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Produtos</Text>
      <FlatList
        data={produtos.slice(0, 5)}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderProductCard(item, cardWidth)}
        snapToInterval={cardWidth + 10}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={{ paddingLeft: 0, paddingRight: 20, marginBottom: 24 }}
      />

      <Text style={styles.sectionTitle}>Em destaque</Text>
      <FlatList
        data={featured}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderProductCard(item, cardWidth)}
        snapToInterval={cardWidth + 12}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={{ paddingLeft: 0, paddingRight: 20, marginTop: 22, marginBottom: 18 }}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomButton} activeOpacity={0.75} onPress={() => navigation.navigate('TelaFavorito')}>
          <FontAwesome name="heart" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomButtonPrimary}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('TelaAdmin')}
        >
          <AntDesign name="plus" size={28} color="#1f1f1f" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomButton} activeOpacity={0.75} onPress={() => navigation.navigate('TelaAdministrador')}>
          <FontAwesome name="gear" size={28} color="#fff" />
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
    paddingBottom: 100,
    paddingLeft: 20,
    paddingRight: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EC6426',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginLeft: -20,
    marginRight: -20,
    marginBottom: 0,
    zIndex: 50,
    elevation: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  headerAvatarShell: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#EC6426',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  userInitial: {
    color: '#EC6426',
    fontWeight: '700',
    fontSize: 18,
  },
  headerTitle: {
    marginLeft: 12,
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  bannerCard: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: 50,
    marginTop: -33,
  },
  bannerImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  bannerSplit: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 33,
    overflow: 'visible',
  },
  bannerHalfLeft: {
    flex: 0.58,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  bannerHalfRight: {
    marginLeft: -25,
    flex: 0.5,
    overflow: 'hidden',
  },
  promoContainer: {
    position: 'absolute',
    left: 18,
    top: 18,
    right: 18,
    bottom: 18,
  },
  promoLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    opacity: 0.95,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  promoSmall: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 6,
  },
  promoPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  promoCurrency: {
    fontFamily: 'Lilita One',
    fontSize: 14,
    marginRight: 6,
    color: '#fff',
  },
  promoPrice: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'Lilita One',
  },
  promoButton: {
    marginTop: 20,
    backgroundColor: '#3a2114',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  promoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
  },
  promoBurger: {
    position: 'absolute',
    top: 60,
    left: 100,
    bottom: 24,
    width: '66%',
    height: '66%',
  },
  promoRightImage: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  bannerPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  rightBurgerTop: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: '46%',
    height: '46%',
    transform: [{ rotate: '0deg' }],
  },
  rightBurgerMid: {
    position: 'absolute',
    top: '28%',
    right: 6,
    width: '56%',
    height: '56%',
    zIndex: 2,
  },
  rightBurgerBottom: {
    position: 'absolute',
    bottom: 6,
    right: 18,
    width: '48%',
    height: '48%',
    zIndex: 3,
  },
  promoRightFullImage: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EC6426',
    marginBottom: 12,
    fontFamily: 'Luckiest Guy',
  },
  card: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#FAE3D0',
    borderRadius: 18,
    paddingBottom: 6,
    paddingTop: 0,
    paddingLeft: 0,
    paddingRight: 0,
    borderWidth: 1,
    borderColor: '#F0D8C4',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  featuredCard: {
    backgroundColor: '#FAE3D0',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#F6E5D9',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EE3D52',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 6,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Lalezar',
  },
  favoriteButtonSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#231815',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    marginTop: 10,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardLabel: {
    fontSize: 20,
    lineHeight: 22,
    color: '#231815',
    marginTop: 4,
    textTransform: 'uppercase',
    paddingHorizontal: 0,
    fontFamily: 'Luckiest Guy',
  },
  cardDescription: {
    fontSize: 11,
    color: '#5f4c3b',
    lineHeight: 16,
    paddingHorizontal: 0,
    paddingBottom: 8,
    fontFamily: 'Nunito',
  },
  cardPriceLarge: {
    fontSize: 20,
    color: '#EC6426',
    fontWeight: '900',
    marginTop: 6,
    alignSelf: 'flex-start',
    fontFamily: 'Lilita One',
  },
  cardPriceOld: {
    fontSize: 11,
    color: '#9b6c4d',
    textDecorationLine: 'line-through',
    marginTop: 4,
    alignSelf: 'flex-start',
    fontFamily: 'Lilita One',
  },
  saveText: {
    fontSize: 14,
    color: '#EC6426',
    marginTop: 4,
    paddingHorizontal: 0,
    fontFamily: 'Lalezar',
    fontWeight: '800',
  },
  featuredInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
    marginTop: 4,
  },
  featuredPriceOld: {
    fontSize: 9,
    color: '#9b6c4d',
    textDecorationLine: 'line-through',
    marginRight: 4,
    paddingHorizontal: 0,
    alignSelf: 'flex-start',
  },
  featuredPriceNew: {
    fontSize: 13,
    color: '#EC6426',
    fontWeight: '900',
    fontFamily: 'Lalezar',
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#efe2d7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  placeholderText: {
    color: '#8d6b55',
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Lilita One',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff8f2',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e7c5b7',
  },
  logoutText: {
    color: '#c25b2d',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Lalezar',
  },
  bottomBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 10,
    height: 64,
    backgroundColor: '#EC6426',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  bottomButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonPrimary: {
    width: 50,
    height: 50,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: {
    color: '#8e6f53',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Lalezar',
  },
  bottomTextPrimary: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '700',
    fontFamily: 'Lalezar',
  },
  
});