import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

const PRODUTOS_FAVORITOS = [
  {
    id: '1',
    nome: 'Curto-Circuito',
    preco: 'R$ 38,00',
    precoAntigo: 'R$ 42,00',
    desc: 'Um brownie denso de chocolate meio amargo, com interior super macio.',
    imagem: require('../assets/brownie.png'),
  },
  {
    id: '2',
    nome: 'Brasa Viva',
    preco: 'R$ 42,00',
    desc: 'Triplo burger bovino grelhado no fogo, bacon crocante e molho barbecue.',
    imagem: require('../assets/brasa viva.png'),
  },
  {
    id: '3',
    nome: 'Fusão Nuclear',
    preco: 'R$ 48,00',
    desc: 'Duplo burger bovino, cheddar derretido em dobro e cebola caramelizada.',
    imagem: require('../assets/Fusão Nuclear.png'),
  },
  {
    id: '4',
    nome: 'Chapa Fria',
    preco: 'R$ 16,00',
    precoAntigo: 'R$ 24,00',
    desc: 'Massa cremosa batida com morangos frescos selecionados e pedaços reais da fruta.',
    imagem: require('../assets/chapa fria.png'),
  },
];

export default function TelaFavorito({ navigation }) {
  const renderItem = ({ item }) => (
    <View style={styles.cardProduto}>
      <View style={styles.imagemWrapper}>
        <Image source={item.imagem} style={styles.imagemProduto} resizeMode="contain" />
      </View>
      <View style={styles.infoProduto}>
        <Text style={styles.nomeProduto}>{item.nome}</Text>
        <Text style={styles.descProduto}>{item.desc}</Text>
        <View style={styles.precoContainer}>
          <Text style={styles.precoProduto}>{item.preco}</Text>
          {item.precoAntigo ? (
            <Text style={styles.precoAntigoProduto}>{item.precoAntigo}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.coracaoIcon}>
        <Text style={styles.coracaoIconText}>♥</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.whitePanel}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left-circle" size={28} color="#632713" />
          </TouchableOpacity>
          <Text style={styles.titulo}>FAVORITOS</Text>
        </View>

        <FlatList
          data={PRODUTOS_FAVORITOS}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContainer}
          ListEmptyComponent={<Text style={styles.listaVazia}>Nenhum favorito ainda... 😢</Text>}
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  botaoVoltar: {
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
  textoBotaoVoltar: {
    color: '#632713',
    fontSize: 20,
    fontWeight: 'bold',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'LuckiestGuy_400Regular',
    lineHeight: 36,
  },
  listaContainer: {
    paddingBottom: 20,
  },
  cardProduto: {
    backgroundColor: '#FDE3CF',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imagemWrapper: {
    width: 92,
    height: 92,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginLeft: -12,
    overflow: 'hidden',
  },
  imagemProduto: {
    width: 72,
    height: 72,
  },
  infoProduto: {
    flex: 1,
    paddingRight: 8,
    paddingTop: 8,
    justifyContent: 'space-between',
  },
  nomeProduto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    fontFamily: 'LuckiestGuy_400Regular',
  },
  descProduto: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
    fontFamily: 'Nunito_400Regular',
  },
  precoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  precoProduto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EC6426',
    marginRight: 10,
    fontFamily: 'LilitaOne_400Regular',
  },
  precoAntigoProduto: {
    fontSize: 14,
    color: '#000',
    textDecorationLine: 'line-through',
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
