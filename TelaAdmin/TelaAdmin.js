import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../Config/FireBaseConfig';

export default function TelaAdmin() {
  const navigation = useNavigation();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoNormal, setPrecoNormal] = useState('');
  const [desconto, setDesconto] = useState('');
  const [precoComDesconto, setPrecoComDesconto] = useState('');
  const [imagem, setImagem] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const nome = titulo.trim();
    const desc = descricao.trim();
    const precoNormalRaw = precoNormal.trim().replace(',', '.');
    const descontoRaw = desconto.trim().replace(',', '.');
    const imagemUrl = imagem.trim();

    const precoNormalNumber = Number(precoNormalRaw);
    const descontoNumber = Number(descontoRaw);
    const precoFinalNumber = Number((precoNormalNumber - descontoNumber).toFixed(2));

    if (!nome || !desc || !precoNormalRaw || !descontoRaw || !imagemUrl) {
      Alert.alert('Atenção', 'Preencha todos os campos para salvar o produto.');
      return;
    }

    if (Number.isNaN(precoNormalNumber) || precoNormalNumber <= 0) {
      Alert.alert('Atenção', 'Informe um preço normal válido maior que zero.');
      return;
    }

    if (Number.isNaN(descontoNumber) || descontoNumber < 0) {
      Alert.alert('Atenção', 'Informe um valor de desconto válido.');
      return;
    }

    if (descontoNumber >= precoNormalNumber) {
      Alert.alert('Atenção', 'O desconto deve ser menor que o preço normal.');
      return;
    }

    if (!imagemUrl.startsWith('http://') && !imagemUrl.startsWith('https://')) {
      Alert.alert('Atenção', 'Informe um link de imagem válido que comece com http ou https.');
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, 'produtos'), {
        nome,
        desc,
        precoNormal: precoNormalNumber,
        desconto: descontoNumber,
        precoComDesconto: precoFinalNumber,
        preco: precoFinalNumber,
        imagem: imagemUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Sucesso', 'Produto salvo com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.warn('Erro ao salvar produto:', error);
      Alert.alert('Erro', 'Não foi possível salvar o produto. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={22} color="#231815" />
          </TouchableOpacity>

          <Text style={styles.title}>PAINEL DE ADMINISTRATIVO</Text>

          <Text style={styles.label}>Título do Produto</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome do produto"
            placeholderTextColor="#AF8A72"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Digite a descrição"
            placeholderTextColor="#AF8A72"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Preço Normal (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="00,00"
            placeholderTextColor="#AF8A72"
            value={precoNormal}
            onChangeText={(value) => {
              setPrecoNormal(value);
              const precoValue = Number(value.replace(',', '.'));
              const descontoValue = Number(desconto.replace(',', '.'));
              if (!Number.isNaN(precoValue) && !Number.isNaN(descontoValue)) {
                const finalValue = precoValue - descontoValue;
                setPrecoComDesconto(finalValue >= 0 ? String(finalValue.toFixed(2)).replace('.', ',') : '');
              } else {
                setPrecoComDesconto('');
              }
            }}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Desconto (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="00,00"
            placeholderTextColor="#AF8A72"
            value={desconto}
            onChangeText={(value) => {
              setDesconto(value);
              const precoValue = Number(precoNormal.replace(',', '.'));
              const descontoValue = Number(value.replace(',', '.'));
              if (!Number.isNaN(precoValue) && !Number.isNaN(descontoValue)) {
                const finalValue = precoValue - descontoValue;
                setPrecoComDesconto(finalValue >= 0 ? String(finalValue.toFixed(2)).replace('.', ',') : '');
              } else {
                setPrecoComDesconto('');
              }
            }}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Valor com desconto (R$)</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            placeholder="00,00"
            placeholderTextColor="#AF8A72"
            value={precoComDesconto}
            editable={false}
          />

          <Text style={styles.label}>Link da imagem</Text>
          <TextInput
            style={styles.input}
            placeholder="https://"
            placeholderTextColor="#AF8A72"
            value={imagem}
            onChangeText={setImagem}
          />

          <View style={styles.previewBox}>
            {imagem.trim().startsWith('http') ? (
              <Image source={{ uri: imagem }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <Text style={styles.previewLabel}>Preview da imagem</Text>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.85} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FFEFDC',
  },
  container: {
    paddingHorizontal: 0,
    paddingVertical: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
    width: '100%',
    alignSelf: 'stretch',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFEFDC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#231815',
    marginBottom: 28,
    textTransform: 'uppercase',
    fontFamily: 'LuckiestGuy-Regular',
  },
  label: {
    fontSize: 19,
    fontWeight: '900',
    color: '#231815',
    marginBottom: 10,
    
    fontFamily: 'Nunito-Bold',
  },
  input: {
    backgroundColor: '#F8E4D1',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#231815',
    marginBottom: 20,
    fontFamily: 'Nunito-Regular',
  },
  inputDisabled: {
    backgroundColor: '#E9D2B7',
    color: '#8F6F58',
    fontFamily: 'Nunito-Regular',
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  previewBox: {
    height: 180,
    borderRadius: 24,
    backgroundColor: '#F8E4D1',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  previewLabel: {
    color: '#8F6F58',
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#EC6426',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginRight: 10,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Nunito-Bold',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#231815',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#231815',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Nunito-Bold',
  },
});