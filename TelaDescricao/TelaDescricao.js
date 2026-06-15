import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';

const { width } = Dimensions.get('window');

const IMAGENS_CARROSEL = [
  require('../assets/hamburguer.png'),
  require('../assets/batata.png'),
  require('../assets/refri.png'),
];

const OPTIONALS = [
  { id: 'batata', nome: 'Batata frita crocante', preco: 5.0, imagem: require('../assets/batata.png') },
  { id: 'bigbigorna', nome: 'Big bigorna', preco: 42.0, imagem: require('../assets/hamburguer1.png') },
  { id: 'refri', nome: 'Refrigerante gelado', preco: 7.0, imagem: require('../assets/refri.png') },
];

export default function TelaDescricao({ navigation }) {
  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const basePrice = 38.0;

  const optionsTotal = selectedOptions.reduce((sum, id) => {
    const option = OPTIONALS.find((item) => item.id === id);
    return sum + (option?.preco || 0);
  }, 0);

  const totalPrice = ((basePrice * quantity) + optionsTotal).toFixed(2);

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

  return (
    <View style={styles.container}>
      <View style={styles.whitePanel}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBack}>
            <Feather name="arrow-left-circle" size={28} color="#632713" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>

        <View style={styles.carouselWrap}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
          >
            {IMAGENS_CARROSEL.map((src, i) => (
              <View style={styles.imageSlide} key={i}>
                <Image source={src} style={styles.mainImage} resizeMode="contain" />
              </View>
            ))}
          </ScrollView>
          <View style={styles.indicators}>
            {IMAGENS_CARROSEL.map((_, i) => (
              <View key={i} style={[styles.dot, i === index ? styles.dotActive : null]} />
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>SUPERNOVA</Text>
            <View style={styles.priceBox}>
              <Text style={styles.price}>R$38.00</Text>
            </View>
          </View>

          <Text style={styles.description}>
            Pão brioche macio; Hambúrguer artesanal 100% bovino; Queijo cheddar derretido; Alface
            fresca; Tomate em rodelas; Cebola caramelizada.
          </Text>

          <View style={styles.optionsTitleRow}>
            <Text style={styles.optionsTitle}>Escolha o produto</Text>
            <Text style={styles.optionsOptional}>Opcional</Text>
          </View>

          <View style={styles.optionsList}>
            {OPTIONALS.map((item) => {
              const isSelected = selectedOptions.includes(item.id);
              return (
                <View style={styles.optionCard} key={item.id}>
                  <Image source={item.imagem} style={styles.optionImage} resizeMode="cover" />
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionName}>{item.nome}</Text>
                    <View style={styles.optionRight}>
                      <TouchableOpacity
                        style={[
                          styles.optionSelectButton,
                          isSelected && styles.optionSelectButtonActive,
                        ]}
                        onPress={() => toggleOption(item.id)}
                      >
                        {isSelected ? <View style={styles.optionSelectDot} /> : null}
                      </TouchableOpacity>
                      <Text style={styles.optionPriceSmall}>+ R$ {item.preco.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
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

        <TouchableOpacity style={styles.addButton} onPress={() => {}}>
          <Text style={styles.addButtonText}>Adicionar</Text>
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
  iconBack: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FDE3CF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
    fontWeight: '700',
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
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
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
});
