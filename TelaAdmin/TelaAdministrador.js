import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AntDesign } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { db } from '../Config/FireBaseConfig';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const camposIniciais = {
  Produto: '',
  Preço: '',
  Descrição: '',
  Foto: '',
  Foto2: '',
  Foto3: '',
  ValorNormal: '',
  ValorDesconto: '',
  Desconto: '',
};

export default function TelaAdministrador({ navigation }) {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [novoProduto, setNovoProduto] = useState(camposIniciais);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
  const [mostrarModalSucesso, setMostrarModalSucesso] = useState(false);
  const sheetTranslateY = useRef(new Animated.Value(360)).current;

  const fecharFormulario = () => {
    Animated.timing(sheetTranslateY, {
      toValue: 360,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setMostrarFormulario(false);
      setEditandoId(null);
      setNovoProduto(camposIniciais);
    });
  };

  const abrirFormulario = (produto = null) => {
    if (produto) {
      setEditandoId(produto.id);
      setNovoProduto({
        Produto: produto.Produto || '',
        Preço: produto.Preço || '',
        Descrição: produto.Descrição || '',
        Foto: produto.Foto || '',
        Foto2: produto.Foto2 || '',
        Foto3: produto.Foto3 || '',
        ValorNormal: produto.ValorNormal || '',
        ValorDesconto: produto.ValorDesconto || '',
        Desconto: produto.Desconto || '',
      });
    } else {
      setEditandoId(null);
      setNovoProduto(camposIniciais);
    }

    setMostrarFormulario(true);
    sheetTranslateY.setValue(360);
    Animated.spring(sheetTranslateY, {
      toValue: 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          sheetTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.6) {
          fecharFormulario();
          return;
        }

        Animated.spring(sheetTranslateY, {
          toValue: 0,
          friction: 8,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    const produtosRef = collection(db, 'produtos');
    const desinscrever = onSnapshot(
      produtosRef,
      (querySnapshot) => {
        const lista = [];
        querySnapshot.forEach((docSnap) => {
          lista.push({ id: docSnap.id, ...docSnap.data() });
        });
        setProdutos(lista);
        setCarregando(false);
      },
      (erro) => {
        console.error('Erro ao buscar produtos:', erro);
        Alert.alert('Erro', 'Não foi possível carregar os produtos.');
        setCarregando(false);
      }
    );

    return () => desinscrever();
  }, []);

  const atualizarCampo = (campo, valor) => {
    setNovoProduto((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const parseNumero = (valor) => {
    if (valor === null || valor === undefined || valor === '') return NaN;
    const texto = String(valor).trim().replace(',', '.').replace('%', '');
    return Number(texto);
  };

  const calcularPrecoComDesconto = (valorNormal, descontoPercent) => {
    const precoNormal = parseNumero(valorNormal);
    const desconto = parseNumero(descontoPercent);

    if (Number.isNaN(precoNormal) || precoNormal <= 0 || Number.isNaN(desconto) || desconto < 0) {
      return null;
    }

    return Number((precoNormal * (1 - desconto / 100)).toFixed(2));
  };

  const atualizarPrecoAutomatico = (campo, valor) => {
    const valorDigitado = String(valor ?? '');
    const proximo = { ...novoProduto, [campo]: valorDigitado };
    const normal = parseNumero(proximo.ValorNormal);
    const percentual = parseNumero(proximo.Desconto);
    const valorDesconto = campo === 'ValorDesconto' ? parseNumero(valorDigitado) : parseNumero(proximo.ValorDesconto);

    if (Number.isNaN(normal) || normal <= 0) {
      setNovoProduto(proximo);
      return;
    }

    const percentualSeguro = Number.isNaN(percentual) ? 0 : Math.min(100, Math.max(0, percentual));
    const valorDescontoSeguro = Number.isNaN(valorDesconto) ? 0 : Math.min(normal, Math.max(0, valorDesconto));
    const valorDescontoTexto = campo === 'ValorDesconto' ? valorDigitado.replace(/[^\d,.-]/g, '') : proximo.ValorDesconto;
    const descontoTextoDigitado = campo === 'Desconto' ? valorDigitado.replace(/[^\d,%.-]/g, '') : proximo.Desconto;

    let precoFinal = null;
    let valorDescontoFinal = null;
    let descontoTexto = descontoTextoDigitado;

    if (campo === 'ValorDesconto') {
      precoFinal = Number(Math.max(0, normal - valorDescontoSeguro).toFixed(2));
      valorDescontoFinal = Number(valorDescontoSeguro.toFixed(2));
      descontoTexto = `${Math.min(100, Math.round((valorDescontoSeguro / normal) * 100))}%`;
    } else if (campo === 'Desconto') {
      precoFinal = calcularPrecoComDesconto(normal, percentualSeguro);
      valorDescontoFinal = Number((normal - (precoFinal ?? 0)).toFixed(2));
      descontoTexto = `${percentualSeguro.toFixed(0)}%`;
    } else if (campo === 'ValorNormal') {
      if (!Number.isNaN(percentual) && percentual >= 0) {
        precoFinal = calcularPrecoComDesconto(normal, percentualSeguro);
        valorDescontoFinal = Number((normal - (precoFinal ?? 0)).toFixed(2));
        descontoTexto = `${percentualSeguro.toFixed(0)}%`;
      } else if (!Number.isNaN(valorDesconto) && valorDesconto >= 0) {
        precoFinal = Number(Math.max(0, normal - valorDescontoSeguro).toFixed(2));
        valorDescontoFinal = Number(valorDescontoSeguro.toFixed(2));
        descontoTexto = `${Math.min(100, Math.round((valorDescontoSeguro / normal) * 100))}%`;
      } else {
        precoFinal = Number(normal.toFixed(2));
        valorDescontoFinal = 0;
        descontoTexto = '0%';
      }
    }

    if (precoFinal === null) {
      precoFinal = Number(normal.toFixed(2));
    }
    if (valorDescontoFinal === null) {
      valorDescontoFinal = 0;
    }

    setNovoProduto({
      ...proximo,
      Desconto: descontoTexto,
      ValorDesconto: campo === 'ValorDesconto'
        ? valorDescontoTexto
        : (valorDescontoFinal !== null ? String(valorDescontoFinal.toFixed(2)).replace('.', ',') : proximo.ValorDesconto),
      Desconto: campo === 'Desconto' ? descontoTextoDigitado : descontoTexto,
      Preço: precoFinal !== null ? String(precoFinal.toFixed(2)).replace('.', ',') : proximo.Preço,
    });
  };

  const iniciarEdicao = (produto) => {
    abrirFormulario(produto);
  };

  const salvarProduto = async () => {
    const { Produto, Preço, ValorNormal, ValorDesconto, Desconto } = novoProduto;
    const valorNormal = parseNumero(ValorNormal || Preço);
    const descontoPercent = parseNumero(Desconto);
    const valorDesconto = parseNumero(ValorDesconto);
    const precoCalculado = calcularPrecoComDesconto(ValorNormal || Preço, Desconto);

    const precoFinal = !Number.isNaN(precoCalculado) && precoCalculado >= 0
      ? precoCalculado
      : valorNormal > 0 && !Number.isNaN(valorDesconto)
      ? Number((valorNormal - valorDesconto).toFixed(2))
      : valorNormal > 0
      ? Number(valorNormal.toFixed(2))
      : parseNumero(Preço);

    if (!Produto.trim()) {
      Alert.alert('Atenção', 'Informe o nome do produto.');
      return;
    }

    if (Number.isNaN(valorNormal) || valorNormal <= 0) {
      Alert.alert('Atenção', 'Informe um valor normal válido maior que zero.');
      return;
    }

    if (Number.isNaN(precoFinal) || precoFinal < 0) {
      Alert.alert('Atenção', 'Não foi possível calcular o preço final do produto.');
      return;
    }

    if (!Number.isNaN(descontoPercent) && descontoPercent > 100) {
      Alert.alert('Atenção', 'O desconto não pode ser maior que 100%.');
      return;
    }

    if (!Number.isNaN(valorDesconto) && valorDesconto > valorNormal) {
      Alert.alert('Atenção', 'O valor do desconto não pode ser maior que o preço normal.');
      return;
    }

    setSalvando(true);
    try {
      const fotoFinal = novoProduto.Foto.trim()
        ? novoProduto.Foto
        : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60';
      const foto2Final = novoProduto.Foto2.trim();
      const foto3Final = novoProduto.Foto3.trim();
      const valorComDesconto = Number((precoFinal || 0).toFixed(2));
      const valorEconomia = Number((valorNormal - valorComDesconto).toFixed(2));
      const descontoTexto = !Number.isNaN(descontoPercent) && descontoPercent >= 0
        ? `${descontoPercent.toFixed(0)}%`
        : novoProduto.Desconto;

      if (editandoId) {
        const produtoRef = doc(db, 'produtos', editandoId);
        await updateDoc(produtoRef, {
          ...novoProduto,
          Preço: valorComDesconto,
          ValorNormal: valorNormal,
          ValorDesconto: !Number.isNaN(valorDesconto) && valorDesconto > 0 ? valorDesconto : valorEconomia,
          Desconto: descontoTexto,
          Foto: fotoFinal,
          Foto2: foto2Final,
          Foto3: foto3Final,
          updatedAt: new Date(),
        });
      } else {
        const produtosRef = collection(db, 'produtos');
        await addDoc(produtosRef, {
          ...novoProduto,
          Preço: valorComDesconto,
          ValorNormal: valorNormal,
          ValorDesconto: !Number.isNaN(valorDesconto) && valorDesconto > 0 ? valorDesconto : valorEconomia,
          Desconto: !Number.isNaN(descontoPercent) && descontoPercent >= 0 ? `${descontoPercent.toFixed(0)}%` : novoProduto.Desconto,
          Foto: fotoFinal,
          Foto2: foto2Final,
          Foto3: foto3Final,
          createdAt: new Date(),
        });

        setNovoProduto(camposIniciais);
        setEditandoId(null);
        fecharFormulario();
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
        return;
      }

      setNovoProduto(camposIniciais);
      setEditandoId(null);
      fecharFormulario();
    } catch (erro) {
      console.error('Erro ao salvar produto:', erro);
      Alert.alert('Erro', 'Não foi possível salvar o produto.');
    } finally {
      setSalvando(false);
    }
  };

  const abrirModalExcluir = (id, nome) => {
    setProdutoParaExcluir({ id, nome });
    setMostrarModalExcluir(true);
  };

  const cancelarExclusao = () => {
    setMostrarModalExcluir(false);
    setProdutoParaExcluir(null);
  };

  const confirmarExclusao = async () => {
    if (!produtoParaExcluir?.id) {
      Alert.alert('Erro', 'Não foi possível identificar o produto para excluir.');
      return;
    }

    setMostrarModalExcluir(false);

    try {
      await deleteDoc(doc(db, 'produtos', produtoParaExcluir.id));
      setProdutos((anterior) => anterior.filter((item) => item.id !== produtoParaExcluir.id));
      setMostrarModalSucesso(true);
    } catch (erro) {
      console.error('Erro ao deletar produto:', erro);
      Alert.alert('Erro', 'Não foi possível remover o produto.');
    } finally {
      setProdutoParaExcluir(null);
    }
  };

  const formatarMoeda = (valor) => {
    if (!valor && valor !== 0) return 'R$ 0,00';
    const num = parseFloat(String(valor).replace(',', '.'));
    if (Number.isNaN(num)) return `R$ ${valor}`;
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
  };

  const normalizarProduto = (item) => {
    const foto = item.Foto || item.foto || item.imagem || item.image || item.Foto2 || item.Foto3 || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60';

    return {
      ...item,
      nome: item.Produto || item.nome || item.name || 'Produto',
      descricao: item.Descrição || item.descricao || item.description || '',
      foto,
      preco: item.Preço || item.Preco || item.preco || item.price || '0',
      valorNormal: item.ValorNormal || item.valorNormal || item.originalPrice || '',
      valorDesconto: item.ValorDesconto || item.valorDesconto || item.savings || '',
      desconto: item.Desconto || item.desconto || '',
    };
  };

  const renderItem = ({ item }) => {
    const produto = normalizarProduto(item);
    let descontoTexto = produto.desconto;
    if (!descontoTexto && produto.valorNormal && produto.preco) {
      const normal = parseFloat(String(produto.valorNormal).replace(',', '.'));
      const preco = parseFloat(String(produto.preco).replace(',', '.'));
      if (!Number.isNaN(normal) && !Number.isNaN(preco) && normal > preco) {
        const perc = Math.round(((normal - preco) / normal) * 100);
        descontoTexto = `${perc}%`;
      }
    }

    const economiaValor = produto.valorDesconto
      ? produto.valorDesconto
      : produto.valorNormal && produto.preco
      ? Math.max(0, parseFloat(String(produto.valorNormal).replace(',', '.')) - parseFloat(String(produto.preco).replace(',', '.')))
      : null;

    return (
      <View style={estilos.card}>
        <View style={estilos.imagemContainer}>
          <Image source={{ uri: produto.foto }} style={estilos.imagemProduto} resizeMode="contain" />
          {descontoTexto ? (
            <View style={estilos.badgeDesconto}>
              <Text style={estilos.textoBadgeDesconto}>{descontoTexto} OFF</Text>
            </View>
          ) : null}
        </View>
        <View style={estilos.infoContainer}>
          <Text style={estilos.precoVenda}>{formatarMoeda(produto.preco)}</Text>
          {produto.valorNormal ? <Text style={estilos.precoNormal}>{formatarMoeda(produto.valorNormal)}</Text> : null}
          {economiaValor ? <Text style={estilos.economiaTexto}>Economize {formatarMoeda(economiaValor)}</Text> : null}
          <Text numberOfLines={2} style={estilos.nomeProduto}>{produto.nome.toUpperCase()}</Text>
          <View style={estilos.botaoAcoes}>
            <TouchableOpacity style={estilos.botaoEditar} onPress={() => iniciarEdicao(item)}>
              <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
              <Text style={estilos.textoBotaoEditar}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.botaoDeletarBaixo} onPress={() => abrirModalExcluir(item.id, produto.nome)}>
              <AntDesign name="delete" size={24} color="#fff" />
              <Text style={estilos.textoBotaoDeletarBaixo}>Deletar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={estilos.outerContainer}
    >
      <View style={estilos.surface}>
        <View style={estilos.header}>
          <TouchableOpacity style={estilos.backButton} onPress={() => navigation.goBack()}>
            <Entypo name="chevron-left" size={32} color="#231815" />
          </TouchableOpacity>
          <Text style={estilos.tituloTela}>Gerenciar Produtos</Text>
        </View>

        {mostrarFormulario && (
          <View style={estilos.sheetOverlay}>
            <TouchableWithoutFeedback onPress={fecharFormulario}>
              <View style={estilos.sheetBackdrop} />
            </TouchableWithoutFeedback>

            <Animated.View
              {...panResponder.panHandlers}
              style={[estilos.sheetContainer, { transform: [{ translateY: sheetTranslateY }] }]}
            >
              <View style={estilos.sheetHandle} />
              <View style={estilos.sheetHeader}>
                <View>
                  <Text style={estilos.sheetTitle}>{editandoId ? 'Editar Produto' : 'Novo Produto'}</Text>
                  <Text style={estilos.sheetSubtitle}>Arraste para baixo para fechar</Text>
                </View>
                <TouchableOpacity onPress={fecharFormulario} style={estilos.sheetCloseButton}>
                  <AntDesign name="close" size={24} color="red" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={estilos.formulario}
                contentContainerStyle={estilos.formularioContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={estilos.label}>Nome do produto</Text>
                <TextInput
                  placeholder="Digite o nome do produto"
                  placeholderTextColor="#AF8A72"
                  style={estilos.input}
                  value={novoProduto.Produto}
                  onChangeText={(valor) => atualizarCampo('Produto', valor)}
                />

                <Text style={estilos.label}>Descrição</Text>
                <TextInput
                  placeholder="Descreva o produto"
                  placeholderTextColor="#AF8A72"
                  style={[estilos.input, estilos.inputMultiline]}
                  value={novoProduto.Descrição}
                  onChangeText={(valor) => atualizarCampo('Descrição', valor)}
                  multiline
                  numberOfLines={4}
                />

                <View style={estilos.inputLinha}>
                  <View style={estilos.inputColuna}>
                    <Text style={estilos.label}>Preço de venda</Text>
                    <TextInput
                      placeholder="89,90"
                      placeholderTextColor="#AF8A72"
                      keyboardType="numeric"
                      style={[estilos.input, estilos.inputMeia]}
                      value={novoProduto.Preço}
                      editable={false}
                    />
                  </View>
                  <View style={estilos.inputColuna}>
                    <Text style={estilos.label}>Preço normal</Text>
                    <TextInput
                      placeholder="120,00"
                      placeholderTextColor="#AF8A72"
                      keyboardType="numeric"
                      style={[estilos.input, estilos.inputMeia]}
                      value={novoProduto.ValorNormal}
                      onChangeText={(valor) => atualizarPrecoAutomatico('ValorNormal', valor)}
                    />
                  </View>
                </View>

                <View style={estilos.inputLinha}>
                  <View style={estilos.inputColuna}>
                    <Text style={estilos.label}>Valor desconto</Text>
                    <TextInput
                      placeholder="20,00"
                      placeholderTextColor="#AF8A72"
                      keyboardType="numeric"
                      style={[estilos.input, estilos.inputMeia]}
                      value={novoProduto.ValorDesconto}
                      onChangeText={(valor) => atualizarPrecoAutomatico('ValorDesconto', valor)}
                    />
                  </View>
                  <View style={estilos.inputColuna}>
                    <Text style={estilos.label}>Desconto</Text>
                    <TextInput
                      placeholder="25%"
                      placeholderTextColor="#AF8A72"
                      style={[estilos.input, estilos.inputMeia]}
                      value={novoProduto.Desconto}
                      onChangeText={(valor) => atualizarPrecoAutomatico('Desconto', valor)}
                    />
                  </View>
                </View>

                <Text style={estilos.label}>Link da Foto principal</Text>
                <TextInput
                  placeholder="https://..."
                  placeholderTextColor="#AF8A72"
                  style={estilos.input}
                  value={novoProduto.Foto}
                  onChangeText={(valor) => atualizarCampo('Foto', valor)}
                />

                <Text style={estilos.label}>Foto 2 (opcional)</Text>
                <TextInput
                  placeholder="https://..."
                  placeholderTextColor="#AF8A72"
                  style={estilos.input}
                  value={novoProduto.Foto2}
                  onChangeText={(valor) => atualizarCampo('Foto2', valor)}
                />

                <Text style={estilos.label}>Foto 3 (opcional)</Text>
                <TextInput
                  placeholder="https://..."
                  placeholderTextColor="#AF8A72"
                  style={estilos.input}
                  value={novoProduto.Foto3}
                  onChangeText={(valor) => atualizarCampo('Foto3', valor)}
                />

                <View style={estilos.previewSection}>
                  <Text style={estilos.label}>Pré-visualização das imagens</Text>
                  <View style={estilos.previewGalleryRow}>
                    <View style={estilos.previewGalleryColumn}>
                      <View style={estilos.previewGalleryItem}>
                        {novoProduto.Foto?.trim().startsWith('http') ? (
                          <Image source={{ uri: novoProduto.Foto }} style={estilos.previewGalleryImage} resizeMode="contain" />
                        ) : (
                          <Text style={estilos.previewLabelSmall}>Foto 1</Text>
                        )}
                      </View>
                      <Text style={estilos.previewGalleryLabel}>Imagem principal</Text>
                    </View>
                    <View style={estilos.previewGalleryColumn}>
                      <View style={estilos.previewGalleryItem}>
                        {novoProduto.Foto2?.trim().startsWith('http') ? (
                          <Image source={{ uri: novoProduto.Foto2 }} style={estilos.previewGalleryImage} resizeMode="contain" />
                        ) : (
                          <Text style={estilos.previewLabelSmall}>Foto 2</Text>
                        )}
                      </View>
                      <Text style={estilos.previewGalleryLabel}>Imagem 2</Text>
                    </View>
                    <View style={estilos.previewGalleryColumn}>
                      <View style={estilos.previewGalleryItem}>
                        {novoProduto.Foto3?.trim().startsWith('http') ? (
                          <Image source={{ uri: novoProduto.Foto3 }} style={estilos.previewGalleryImage} resizeMode="contain" />
                        ) : (
                          <Text style={estilos.previewLabelSmall}>Foto 3</Text>
                        )}
                      </View>
                      <Text style={estilos.previewGalleryLabel}>Imagem 3</Text>
                    </View>
                  </View>
                </View>

                <View style={estilos.buttonRow}>
                  <TouchableOpacity
                    style={[estilos.botaoSalvar, salvando && estilos.botaoDesativado]}
                    onPress={salvarProduto}
                    disabled={salvando}
                  >
                    {salvando ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={estilos.textoBotaoSalvar}>
                        {editandoId ? 'Salvar alterações' : 'Salvar produto'}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={estilos.botaoCancelar} onPress={fecharFormulario}>
                    <Text style={estilos.textoBotaoCancelar}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        )}

        <Modal visible={mostrarModalExcluir} transparent animationType="fade">
          <View style={estilos.modalOverlay}>
            <View style={estilos.modalContainer}>
              <Text style={estilos.modalTitle}>Deseja realmente deletar o produto?</Text>
              <Text style={estilos.modalMessage}>{produtoParaExcluir?.nome}</Text>
              <View style={estilos.modalActions}>
                <TouchableOpacity style={estilos.modalButtonCancel} onPress={cancelarExclusao}>
                  <Text style={estilos.modalButtonCancelText}>Não</Text>
                </TouchableOpacity>
                <TouchableOpacity style={estilos.modalButtonConfirm} onPress={confirmarExclusao}>
                  <Text style={estilos.modalButtonConfirmText}>Sim</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={mostrarModalSucesso} transparent animationType="fade">
          <View style={estilos.successModalOverlay} pointerEvents="box-none">
            <View style={estilos.successModalContainer}>
              <Text style={estilos.successModalText}>🎉 Exclusão de Produto realizada com sucesso!</Text>
              <TouchableOpacity style={estilos.successModalClose} onPress={() => setMostrarModalSucesso(false)}>
                <Text style={estilos.successModalCloseText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {carregando ? (
          <View style={estilos.centralizado}>
            <ActivityIndicator size="large" color="#007BFF" />
            <Text style={estilos.textoCarregando}>Carregando produtos...</Text>
          </View>
        ) : produtos.length === 0 ? (
          <View style={estilos.semProdutos}>
            <Text style={estilos.textoSemProdutos}>Nenhum produto cadastrado no Firestore.</Text>
          </View>
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={2}
            columnWrapperStyle={estilos.linhaGrid}
            contentContainerStyle={estilos.lista}
          />
        )}

        <View style={estilos.bottomBar}>
          <TouchableOpacity style={estilos.bottomButton} activeOpacity={0.75} onPress={() => navigation.navigate('Home')}>
            <Entypo name="home" size={36} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={estilos.bottomButtonPrimary} activeOpacity={0.85} onPress={() => navigation.navigate('TelaAdmin')}>
            <AntDesign name="plus" size={36} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={estilos.bottomButton} activeOpacity={0.75} onPress={() => navigation.navigate('TelaFavorito')}>
            <FontAwesome name="heart" size={36} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F7D7BC',
  },
  surface: {
    flex: 1,
    marginTop: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 20,
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
  tituloTela: {
    fontSize: 26,
    fontWeight: '900',
    color: '#231815',
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: 'uppercase',
    fontFamily: 'Lilita One',
  },
  sheetOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 30,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheetContainer: {
    backgroundColor: '#FFF7F1',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '92%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  sheetHandle: {
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D9D9D9',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  sheetTitle: {
    fontSize: 18,
    color: '#231815',
    fontFamily: 'Lilita One',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#7A6E66',
    marginTop: 2,
    fontFamily: 'Lilita One',
  },
  sheetCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFEFDC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sheetCloseText: {
    color: '#EC6426',
    fontSize: 13,
    fontWeight: '700',
  },
  formulario: {
    backgroundColor: '#FFF7F1',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  formularioContent: {
    paddingBottom: 18,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Luckiest Guy',
    color: '#231815',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#F8E4D1',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 14,
    color: 'black',
    fontFamily: 'Lilita One',
  },
  inputMultiline: {
    minHeight: 82,
    textAlignVertical: 'top',
  },
  inputLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  inputColuna: {
    flex: 1,
  },
  inputMeia: {
    width: '100%',
  },
  previewSection: {
    marginTop: 4,
    marginBottom: 10,
  },
  previewGalleryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  previewGalleryColumn: {
    flex: 1,
    alignItems: 'center',
  },
  previewGalleryItem: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#F8E4D1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewGalleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  previewGalleryLabel: {
    marginTop: 4,
    color: '#6B5A4F',
    fontSize: 10,
    fontFamily: 'Lilita One',
    textAlign: 'center',
  },
  previewLabelSmall: {
    color: '#8F6F58',
    fontSize: 11,
    fontFamily: 'Lilita One',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 10,
  },
  botaoSalvar: {
    flex: 1,
    backgroundColor: '#EC6426',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
  },
  botaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#231815',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDesativado: {
    backgroundColor: '#94d3a2',
  },
  textoBotaoSalvar: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Lilita One',
  },
  textoBotaoCancelar: {
    color: '#231815',
    fontSize: 14,
    fontFamily: 'Lilita One',
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textoCarregando: {
    marginTop: 10,
    color: '#657786',
    fontSize: 14,
  },
  semProdutos: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  textoSemProdutos: {
    fontSize: 16,
    color: '#657786',
    textAlign: 'center',
    marginBottom: 20,
  },
  botaoPopular: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  textoBotaoPopular: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Lilita One',
  },
  lista: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 110,
  },
  linhaGrid: {
    justifyContent: 'space-between',
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
  card: {
    backgroundColor: '#fff5ec',
    width: '47%',
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  badgeDesconto: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: '#ff0000',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  textoBadgeDesconto: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  imagemContainer: {
    backgroundColor: '#fff5eb',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  imagemProduto: {
    width: '100%',
    height: 126,
    backgroundColor: '#f8f9fa',
  },
  infoContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'flex-start',
  },
  nomeProduto: {
    fontSize: 20,
    fontFamily: 'Lilita One',
    color: '#231815',
    lineHeight: 18,
  },
  precoNormal: {
    fontSize: 12,
    color: '#9b9b9b',
    textDecorationLine: 'line-through',
    marginTop: 4,
    fontFamily: 'Lilita One',
  },
  precoVenda: {
    fontSize: 22,
    fontFamily: 'Lilita One',
    color: '#FF8000',
  },
  economiaTexto: {
    fontSize: 13,
    color: '#F8A91F',
    fontWeight: '700',
    fontFamily: 'Lilita One',
    marginTop: 4,
    marginBottom: 8,
  },
  botaoAcoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  botaoEditar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9F43',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginTop: 8,
    marginRight: 6,
  },
  textoBotaoEditar: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  botaoDeletarBaixo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0000',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginTop: 8,
  },
  textoBotaoDeletarBaixo: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#231815',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: "Luckiest Guy",
    color: '#6B5A4F',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#E5FEFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    color: '#0A5A63',
    fontSize: 14,
    fontWeight: '700',
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#FF0000',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  successModalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  successModalText: {
    fontSize: 16,
    color: '#231815',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  successModalClose: {
    backgroundColor: '#FF0000',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  successModalCloseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
  