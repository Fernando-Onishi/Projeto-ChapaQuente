import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../Config/FireBaseConfig';

const { width } = Dimensions.get('window');

const OPTIONALS = [
  { id: 'batata', nome: 'Batata frita crocante', preco: 5.0, imagem: require('../assets/batata.png') },
  { id: 'bigbigorna', nome: 'Big bigorna', preco: 42.0, imagem: require('../assets/hamburguer1.png') },
  { id: 'refri', nome: 'Refrigerante gelado', preco: 7.0, imagem: require('../assets/refri.png') },
];

export default function TelaDescricao({ navigation, route }) {
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [userUid, setUserUid] = useState(null);
  const produto = route?.params?.produto || {};

  const imagens = [];
  if (produto.imagem) imagens.push(produto.imagem);
  if (produto.imagem2) imagens.push(produto.imagem2);
  if (produto.imagem3) imagens.push(produto.imagem3);

  const imagenesCarrosel = imagens.length > 0 ? imagens : ['https://via.placeholder.com/300'];
  const precoVenda = Number(String(produto.preco || 0).replace(',', '.'));

  // Criar animação contínua sincronizada com o scroll
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const page = Math.round(value / width);
      setIndex(page);
    });

    return () => scrollX.removeListener(listener);
  }, [scrollX]);

  const optionsTotal = selectedOptions.reduce((sum, id) => {
    const option = OPTIONALS.find((item) => item.id === id);
    return sum + (option?.preco || 0);
  }, 0);

  const totalPrice = ((precoVenda * quantity) + optionsTotal).toFixed(2);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.uid) {
        setUserUid(user.uid);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const data = userDoc.exists() ? userDoc.data() : {};
          setFavorites(Array.isArray(data.favorites) ? data.favorites : []);
        } catch (error) {
          console.warn('Erro ao carregar favoritos:', error);
        }
      } else {
        setUserUid(null);
        setFavorites([]);
      }
    });

    return unsubscribe;
  }, []);

  const produtoAdicionado = produto?.id ? favorites.some((item) => item?.id === produto.id) : false;

  const handleAddFavorite = async () => {
    if (!userUid) {
      Alert.alert('Atenção', 'Faça login para salvar favoritos.');
      return;
    }

    const nextFavorites = produtoAdicionado
      ? favorites.filter((item) => item?.id !== produto.id)
      : [...favorites, { ...produto, id: produto.id }];

    setFavorites(nextFavorites);

    try {
      await setDoc(doc(db, 'users', userUid), { favorites: nextFavorites }, { merge: true });
    } catch (error) {
      console.warn('Erro ao atualizar favoritos:', error);
    }
  };

  const toggleOption = (optionId) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => Math.max(1, q - 1));

  function onMomentumScrollEnd(e) {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(page);
  }

  const renderImage = (imagemUrl) => {
    if (!imagemUrl) return null;
    if (typeof imagemUrl === 'string' && (imagemUrl.startsWith('http://') || imagemUrl.startsWith('https://'))) {
      return <Image source={{ uri: imagemUrl }} style={styles.mainImage} resizeMode="contain" />;
    }
    return <Text style={styles.imagemPlaceholder}>Sem imagem</Text>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.whitePanel}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <AntDesign name="arrowleft" size={22} color="#231815" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>

        <View style={styles.carouselWrap}>
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
          >
            {imagenesCarrosel.map((src, i) => (
              <View style={styles.imageSlide} key={i}>
                {renderImage(src)}
              </View>
            ))}
          </Animated.ScrollView>
          <View style={styles.indicators}>
            {imagenesCarrosel.map((_, i) => {
              const dotWidth = scrollX.interpolate({
                inputRange: [
                  (i - 1) * width,
                  i * width,
                  (i + 1) * width,
                ],
                outputRange: [8, 24, 8],
                extrapolate: 'clamp',
              });
              const dotBackgroundColor = scrollX.interpolate({
                inputRange: [
                  (i - 1) * width,
                  i * width,
                  (i + 1) * width,
                ],
                outputRange: ['#eee', '#EC6426', '#eee'],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      width: dotWidth,
                      backgroundColor: dotBackgroundColor,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{produto.nome || 'PRODUTO'}</Text>
            <View style={styles.priceBox}>
              <Text style={styles.price}>R$ {String(precoVenda.toFixed(2)).replace('.', ',')}</Text>
            </View>
          </View>

          <Text style={styles.description}>
            {produto.descricao || 'Descrição do produto não disponível'}
          </Text>

          <View style={styles.optionsTitleRow}>
            <Text style={styles.optionsTitle}>Escolha o produto</Text>
            <Text style={styles.optionsOptional}>Opcional</Text>
          </View>

          <View style={styles.optionsList}>
            {OPTIONALS.map((item) => {
              const isSelected = selectedOptions.includes(item.id);
              return (
                <TouchableOpacity
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => toggleOption(item.id)}
                >
                  <Image source={item.imagem} style={styles.optionImage} resizeMode="cover" />
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionName}>{item.nome}</Text>
                    <View style={styles.optionRight}>
                      <View
                        style={[
                          styles.optionSelectButton,
                          isSelected && styles.optionSelectButtonActive,
                        ]}
                      >
                        {isSelected ? <View style={styles.optionSelectDot} /> : null}
                      </View>
                      <Text style={styles.optionPriceSmall}>+ R$ {item.preco.toFixed(2)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.bottomActionBar}>
        <View style={styles.qtyControl}>
          <TouchableOpacity onPress={decrement} style={styles.qtyBtn}>
            <Entypo name="minus" size={18} color="#231815" />
          </TouchableOpacity>
          <Text style={styles.qtyNumber}>{quantity}</Text>
          <TouchableOpacity onPress={increment} style={styles.qtyBtn}>
            <Entypo name="plus" size={18} color="#231815" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addButton, produtoAdicionado && styles.addButtonAdded]}
          onPress={handleAddFavorite}
        >
          <Text style={styles.addButtonText}>
            {produtoAdicionado ? 'Adicionado' : 'Adicionar'}
          </Text>
        </TouchableOpacity>

        <View style={styles.totalBox}>
          <Text style={styles.totalText}>R$ {totalPrice}</Text>
        </View>
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
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFEFDC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  carouselWrap: {
    height: 220,
  },
  imageSlide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainImage: {
    width: width - 48,
    height: 220,
    borderRadius: 16,
  },
  indicators: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eee',
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: '#EC6426',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Luckiest Guy',
    color: '#000',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceBox: {},
  price: {
    backgroundColor: '#EC6426',
    color: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    fontFamily: 'Lalezar',
    fontWeight: '700',
    fontSize: 18,
  },
  description: {
    marginTop: 12,
    color: '#444',
    lineHeight: 20,
    fontFamily: 'Lora',
  },
  optionsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  optionsTitle: {
    fontSize: 14,
    color: '#632713', 
    fontFamily: 'Lalezar',
  },
  optionsOptional: {
    color: '#999',
    fontSize: 12,
  },
  optionsList: {
    marginTop: 6,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff4e9',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  optionImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  optionTextWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionName: {
    color: '#231815',
    fontWeight: '700',
    fontFamily: 'Lora',
    flex: 1,
    marginRight: 10,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionSelectButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EC6426',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  optionSelectButtonActive: {
    backgroundColor: '#EC6426',
  },
  optionSelectDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  optionPriceSmall: {
    color: '#8e6f53',
    fontFamily: 'Lora',
  },
  bottomActionBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 10,
    borderWidth: 4,
    borderColor: '#EC6426',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0d6c3',
  },
  qtyBtnText: {
    fontSize: 20,
    color: '#231815',
    fontWeight: '700',
  },
  qtyNumber: {
    marginHorizontal: 10,
    fontSize: 18,
    fontWeight: '700',
  },
  addButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 8,
    backgroundColor: '#EC6426',
    borderRadius: 18,
  },
  addButtonAdded: {
    backgroundColor: '#28a745',
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Lalezar',
    fontSize: 14,
  },
  totalBox: {
    backgroundColor: '#EC6426',
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 12,
    textAlign: 'center'
  },
  totalText: {
    color: '#fff',
    fontFamily: 'Lalezar',
    fontSize: 16,
  },
  imagemPlaceholder: {
    color: '#8e6f53',
    fontSize: 14,
    fontFamily: 'Lora',
  },
});
