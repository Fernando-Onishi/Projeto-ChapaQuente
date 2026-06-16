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
  const [descontoPercent, setDescontoPercent] = useState('');
  const [valorDesconto, setValorDesconto] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [imagemPrincipal, setImagemPrincipal] = useState('');
  const [imagem2, setImagem2] = useState('');
  const [imagem3, setImagem3] = useState('');
  const [ultimaImagemPreenchida, setUltimaImagemPreenchida] = useState('');
  const [saving, setSaving] = useState(false);

  const precoNormalNumber = Number(precoNormal.trim().replace(',', '.'));
  const descontoPercentNumber = Number(descontoPercent.trim());
  const valorDescontoNumber = Number(valorDesconto.trim().replace(',', '.'));

  const handlePrecoNormalChange = (value) => {
    setPrecoNormal(value);
    const precoNum = Number(value.replace(',', '.'));
    if (!Number.isNaN(precoNum) && descontoPercentNumber > 0) {
      const novoDesconto = Number((precoNum * descontoPercentNumber / 100).toFixed(2));
      setValorDesconto(String(novoDesconto).replace('.', ','));
      const novoPrecoVenda = Number((precoNum - novoDesconto).toFixed(2));
      setPrecoVenda(String(novoPrecoVenda).replace('.', ','));
    }
  };

  const handleDescontoPercentChange = (value) => {
    // keep only digits in state; display will show '%' appended
    const cleaned = String(value).replace(/[^0-9]/g, '');
    setDescontoPercent(cleaned);
    const descontoNum = Number(cleaned);
    if (!Number.isNaN(precoNormalNumber) && !Number.isNaN(descontoNum) && descontoNum >= 0) {
      const novoDesconto = Number((precoNormalNumber * descontoNum / 100).toFixed(2));
      setValorDesconto(String(novoDesconto).replace('.', ','));
      const novoPrecoVenda = Number((precoNormalNumber - novoDesconto).toFixed(2));
      setPrecoVenda(String(novoPrecoVenda).replace('.', ','));
    }
  };

  const handleValorDescontoChange = (value) => {
    setValorDesconto(value);
    const descontoNum = Number(value.replace(',', '.'));
    if (!Number.isNaN(precoNormalNumber) && !Number.isNaN(descontoNum) && descontoNum >= 0) {
      const novoPrecoVenda = Number((precoNormalNumber - descontoNum).toFixed(2));
      setPrecoVenda(String(novoPrecoVenda).replace('.', ','));
      const novoDescontoPercent = precoNormalNumber > 0 ? Number(((descontoNum / precoNormalNumber) * 100).toFixed(0)) : 0;
      setDescontoPercent(String(novoDescontoPercent));
    }
  };

  const handleImagemPrincipalChange = (value) => {
    setImagemPrincipal(value);
    if (value.trim()) {
      setUltimaImagemPreenchida(value);
    }
  };

  const handleImagem2Change = (value) => {
    setImagem2(value);
    if (value.trim()) {
      setUltimaImagemPreenchida(value);
    }
  };

  const handleImagem3Change = (value) => {
    setImagem3(value);
    if (value.trim()) {
      setUltimaImagemPreenchida(value);
    }
  };

  const handleSave = async () => {
    const nome = titulo.trim();
    const desc = descricao.trim();
    const precoVendaRaw = precoVenda.trim().replace(',', '.');
    const precoNormalRaw = precoNormal.trim().replace(',', '.');
    const valorDescontoRaw = valorDesconto.trim().replace(',', '.');
    const descontoPercentRaw = descontoPercent.trim();
    const imagemUrl = imagemPrincipal.trim();
    const imagem2Url = imagem2.trim();
    const imagem3Url = imagem3.trim();

    if (!nome || !desc || !precoVendaRaw || !precoNormalRaw || !valorDescontoRaw || !descontoPercentRaw || !imagemUrl || !imagem2Url || !imagem3Url) {
      Alert.alert('Atenção', 'Preencha todos os campos para salvar o produto.');
      return;
    }

    const precoVendaNumber = Number(precoVendaRaw);
    const precoNormalNumber = Number(precoNormalRaw);
    const valorDescontoNumber = Number(valorDescontoRaw);
    const descontoPercentNumber = Number(descontoPercentRaw);

    if (Number.isNaN(precoVendaNumber) || precoVendaNumber <= 0) {
      Alert.alert('Atenção', 'Informe um preço de venda válido maior que zero.');
      return;
    }

    if (Number.isNaN(precoNormalNumber) || precoNormalNumber <= 0) {
      Alert.alert('Atenção', 'Informe um preço normal válido maior que zero.');
      return;
    }

    if (precoVendaNumber >= precoNormalNumber) {
      Alert.alert('Atenção', 'O preço de venda deve ser menor que o preço normal.');
      return;
    }

    if (!imagemUrl.startsWith('http://') && !imagemUrl.startsWith('https://')) {
      Alert.alert('Atenção', 'Informe um link de imagem válido que comece com http ou https.');
      return;
    }

    if (!imagem2Url.startsWith('http://') && !imagem2Url.startsWith('https://')) {
      Alert.alert('Atenção', 'Informe um link de imagem 2 válido que comece com http ou https.');
      return;
    }

    if (!imagem3Url.startsWith('http://') && !imagem3Url.startsWith('https://')) {
      Alert.alert('Atenção', 'Informe um link de imagem 3 válido que comece com http ou https.');
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, 'produtos'), {
        nome,
        desc,
        precoVenda: precoVendaNumber,
        precoNormal: precoNormalNumber,
        valorDesconto: Number(valorDescontoNumber.toFixed(2)),
        desconto: descontoPercentNumber,
        precoComDesconto: precoVendaNumber,
        preco: precoVendaNumber,
        imagem: imagemUrl,
        imagem2: imagem2Url,
        imagem3: imagem3Url,
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

          <Text style={styles.label}>descrição</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Digite a descrição"
            placeholderTextColor="#AF8A72"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Preço Venda (ex: 89,90)</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            placeholder="00,00"
            placeholderTextColor="#AF8A72"
            value={precoVenda}
            editable={false}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Preço Normal (ex: 120,00)</Text>
          <TextInput
            style={styles.input}
            placeholder="00,00"
            placeholderTextColor="#AF8A72"
            value={precoNormal}
            onChangeText={handlePrecoNormalChange}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Valor Desconto R$</Text>
          <TextInput
            style={styles.input}
            placeholder="00,00"
            placeholderTextColor="#AF8A72"
            value={valorDesconto}
            onChangeText={handleValorDescontoChange}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Desconto (ex:25%)</Text>
          <TextInput
            style={styles.input}
            placeholder="00%"
            placeholderTextColor="#AF8A72"
            value={descontoPercent ? `${descontoPercent}%` : ''}
            onChangeText={handleDescontoPercentChange}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Link da Imagem da principal</Text>
          <TextInput
            style={styles.input}
            placeholder="https://"
            placeholderTextColor="#AF8A72"
            value={imagemPrincipal}
            onChangeText={handleImagemPrincipalChange}
          />

          <Text style={styles.label}>Link da Imagem 2</Text>
          <TextInput
            style={styles.input}
            placeholder="https://"
            placeholderTextColor="#AF8A72"
            value={imagem2}
            onChangeText={handleImagem2Change}
          />

          <Text style={styles.label}>Link da Imagem 3</Text>
          <TextInput
            style={styles.input}
            placeholder="https://"
            placeholderTextColor="#AF8A72"
            value={imagem3}
            onChangeText={handleImagem3Change}
          />

          <View style={styles.previewBox}>
            {ultimaImagemPreenchida.trim().startsWith('http') ? (
              <Image source={{ uri: ultimaImagemPreenchida }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <Text style={styles.previewLabel}>Preview da imagem</Text>
            )}
          </View>

          <View style={styles.previewRow}>
            <View style={styles.previewItem}>
              {imagemPrincipal.trim().startsWith('http') ? (
                <Image source={{ uri: imagemPrincipal }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <Text style={styles.previewLabelSmall}>Prévia da Foto Principal</Text>
              )}
            </View>
            <View style={styles.previewItem}>
              {imagem2.trim().startsWith('http') ? (
                <Image source={{ uri: imagem2 }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <Text style={styles.previewLabelSmall}>Prévia da Foto 2</Text>
              )}
            </View>
            <View style={styles.previewItem}>
              {imagem3.trim().startsWith('http') ? (
                <Image source={{ uri: imagem3 }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <Text style={styles.previewLabelSmall}>Prévia da Foto 3</Text>
              )}
            </View>
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
    fontFamily: 'Luckiest Guy',
  },
  label: {
    fontSize: 19,
    fontWeight: '900',
    color: '#231815',
    marginBottom: 10,
    fontFamily: 'Lalezar',
  },
  input: {
    backgroundColor: '#F8E4D1',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#231815',
    marginBottom: 20,
    fontFamily: 'Lora',
  },
  inputDisabled: {
    backgroundColor: '#E9D2B7',
    color: '#8F6F58',
    fontFamily: 'Lora',
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  previewBox: {
    height: 180,
    borderRadius: 24,
    backgroundColor: '#F8E4D1',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  previewItem: {
    flex: 1,
    height: 140,
    borderRadius: 18,
    backgroundColor: '#F8E4D1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewLabelSmall: {
    color: '#8F6F58',
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Lora',
    paddingHorizontal: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewLabel: {
    color: '#8F6F58',
    fontSize: 14,
    fontFamily: 'Lora',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Lalezar',
    textTransform: 'uppercase',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#231815',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  cancelText: {
    color: '#231815',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Lalezar',
    textTransform: 'uppercase',
  },
});