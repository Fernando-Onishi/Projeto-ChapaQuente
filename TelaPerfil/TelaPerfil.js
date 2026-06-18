import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { auth as autenticacao, db as bancoDados } from '../Config/FireBaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile, signOut } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';

const camposIniciais = {
  nome: '',
  sobrenome: '',
  rua: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  telefone: '',
};

const capitalizarTexto = (texto) => {
  if (!texto) return '';
  return texto
    .split(' ')
    .map((palavra) => {
      if (palavra.length === 0) return '';
      const conectores = ['de', 'da', 'do', 'dos', 'das', 'e'];
      if (conectores.includes(palavra.toLowerCase())) {
        return palavra.toLowerCase();
      }
      return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
    })
    .join(' ');
};

const aplicarMascaraCep = (valor) => {
  const apenasNumeros = valor.replace(/\D/g, '');
  const limitado = apenasNumeros.substring(0, 8);

  if (limitado.length > 5) {
    return `${limitado.substring(0, 5)}-${limitado.substring(5, 8)}`;
  }
  return limitado;
};

export default function TelaPerfil({ navigation }) {
  const [perfil, setPerfil] = useState(camposIniciais);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [mostrarUrlFoto, setMostrarUrlFoto] = useState(false);
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const usuario = autenticacao.currentUser;
  const windowHeight = Dimensions.get('window').height;
  const urlFotoRef = useRef(null);

  useEffect(() => {
    const carregarDados = async () => {
      if (!usuario) {
        setCarregando(false);
        return;
      }

      try {
        const perfilRef = doc(bancoDados, 'users', usuario.uid);
        const perfilSnap = await getDoc(perfilRef);

        if (perfilSnap.exists()) {
          const dados = perfilSnap.data();
          const novosDados = {
            nome: dados.nome || dados.name || '',
            sobrenome: dados.sobrenome || '',
            rua: dados.rua || dados.endereco || '',
            bairro: dados.bairro || '',
            cidade: dados.cidade || '',
            estado: dados.estado || '',
            cep: aplicarMascaraCep(dados.cep || ''),
            telefone: dados.telefone || '',
          };

          setPerfil(novosDados);
          setNomeCompleto(capitalizarTexto(dados.name || dados.nome || usuario.displayName || ''));
          setPhotoUrl(dados.foto || dados.fotoUrl || usuario.photoURL || null);
          setMostrarUrlFoto(false);
          setEditando(false);
        } else {
          const [primeiroNome, ...rest] = (usuario.displayName || '').split(' ');
          const dadosPadrao = {
            nome: primeiroNome || '',
            sobrenome: rest.join(' ') || '',
            rua: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
            telefone: '',
          };
          setPerfil(dadosPadrao);
          setNomeCompleto(capitalizarTexto(`${dadosPadrao.nome} ${dadosPadrao.sobrenome}`.trim()));
          setPhotoUrl(usuario.photoURL || null);
          setMostrarUrlFoto(false);
          setEditando(true);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, [usuario]);


  const removerFotoPerfil = async () => {
    if (!usuario) return;

    setSalvando(true);
    try {
      await updateProfile(usuario, { photoURL: '' });
      await setDoc(
        doc(bancoDados, 'users', usuario.uid),
        { foto: null, fotoUrl: null, updatedAt: new Date() },
        { merge: true }
      );
      setPhotoUrl(null);
      setMostrarUrlFoto(true);
      Alert.alert('Sucesso', 'Foto removida com sucesso.');
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      Alert.alert('Erro', 'Não foi possível remover a foto. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const sair = async () => {
    try {
      await signOut(autenticacao);
      navigation.replace('Login');
    } catch (error) {
      console.error('Erro ao sair:', error);
      Alert.alert('Erro', 'Não foi possível sair no momento. Tente novamente.');
    }
  };

  const salvarPerfil = async () => {
    if (!usuario) return;

    setSalvando(true);

    try {
      const uploadedUrl = photoUrl && photoUrl.trim() !== '' ? photoUrl.trim() : null;
      const nomeCompletoFormatado = capitalizarTexto(nomeCompleto.trim());
      const [primeiroNome, ...rest] = nomeCompletoFormatado.split(' ');
      const sobrenome = rest.join(' ');

      const novosDados = {
        nome: primeiroNome,
        sobrenome: sobrenome,
        name: nomeCompletoFormatado,
        rua: capitalizarTexto(perfil.rua.trim()) || null,
        bairro: perfil.bairro || null,
        cidade: perfil.cidade || null,
        estado: perfil.estado || null,
        cep: perfil.cep.replace(/\D/g, ''),
        telefone: perfil.telefone || null,
        foto: uploadedUrl || null,
        fotoUrl: uploadedUrl || null,
        updatedAt: new Date(),
      };

      const usuarioAtualizado = {};
      if (nomeCompletoFormatado) usuarioAtualizado.displayName = nomeCompletoFormatado;
      if (uploadedUrl !== null) {
        usuarioAtualizado.photoURL = uploadedUrl;
      } else if (usuario.photoURL) {
        usuarioAtualizado.photoURL = null;
      }
      
      if (Object.keys(usuarioAtualizado).length > 0) {
        await updateProfile(usuario, usuarioAtualizado);
      }

      await setDoc(doc(bancoDados, 'users', usuario.uid), novosDados, { merge: true });

      setPerfil({
        nome: novosDados.nome,
        sobrenome: novosDados.sobrenome,
        rua: novosDados.rua || '',
        bairro: novosDados.bairro || '',
        cidade: novosDados.cidade || '',
        estado: novosDados.estado || '',
        cep: aplicarMascaraCep(novosDados.cep),
        telefone: novosDados.telefone || '',
      });
      setNomeCompleto(nomeCompletoFormatado);
      setPhotoUrl(uploadedUrl);
      setMostrarUrlFoto(false);
      setEditando(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const atualizarCampo = (campo, valor) => {
    if (campo === 'nomeCompleto') {
      setNomeCompleto(valor);
      return;
    }
    if (campo === 'cep') {
      // 🟢 Intercepta a digitação e injeta o traço do CEP em tempo real
      setPerfil((anterior) => ({ ...anterior, cep: aplicarMascaraCep(valor) }));
      return;
    }
    setPerfil((anterior) => ({ ...anterior, [campo]: valor }));
  };

  if (carregando) {
    return (
      <View style={estilos.centralizado}>
        <ActivityIndicator size="large" color="#f37910" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FFF6EE', '#FFF', '#FFE9D8']} style={estilos.container}>
      <ScrollView style={estilos.scroll} contentContainerStyle={estilos.scrollContent}>
        <View style={[estilos.card, { minHeight: windowHeight - 24 }]}> 
          <View style={estilos.cardHeader}>
            <TouchableOpacity style={estilos.backButton} onPress={() => navigation.goBack()}>
              <Entypo name="chevron-left" size={32} color="#231815" />
            </TouchableOpacity>
            <Text style={estilos.title}>Meu perfil</Text>
            <TouchableOpacity style={estilos.logoutButton} onPress={sair}>
              <Ionicons name="log-out-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={estilos.avatarContainer}>
            <View style={estilos.avatarShell}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={estilos.avatar} />
              ) : (
                <View style={[estilos.avatar, estilos.avatarPlaceholder]}>
                  <Text style={estilos.avatarText}>{(nomeCompleto || 'USUÁRIO').slice(0, 2).toUpperCase()}</Text>
                </View>
              )}
            </View>
          </View>
          {editando ? (
            <View style={estilos.photoActionsRow}>
              <TouchableOpacity style={estilos.photoActionButton} onPress={() => setMostrarUrlFoto(true)}>
                <Text style={estilos.photoActionText}>Trocar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={estilos.removePhotoButton} onPress={removerFotoPerfil}>
                <Text style={estilos.removePhotoText}>Remover Foto</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {editando ? (
            <View style={estilos.formPanel}>
              {mostrarUrlFoto && (
                <View style={estilos.fieldBlock}>
                  <Text style={estilos.fieldLabel}>URL da Foto</Text>
                  <TextInput
                    ref={urlFotoRef}
                    style={[estilos.input, !editando && estilos.inputDisabled]}
                    value={photoUrl || ''}
                    onChangeText={setPhotoUrl}
                    editable={editando}
                    placeholder="https://..."
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectTextOnFocus={true}
                  />
                </View>
              )}

              <View style={estilos.fieldBlock}>
                <Text style={estilos.fieldLabel}>Nome completo</Text>
                <TextInput
                  style={[estilos.input, !editando && estilos.inputDisabled]}
                  value={nomeCompleto}
                  onChangeText={(valor) => atualizarCampo('nomeCompleto', valor)}
                  editable={editando}
                  autoCapitalize="words"
                />
              </View>

              <View style={estilos.fieldBlock}>
                <Text style={estilos.fieldLabel}>CEP</Text>
                <TextInput
                  style={[estilos.input, !editando && estilos.inputDisabled]}
                  value={perfil.cep}
                  onChangeText={(valor) => atualizarCampo('cep', valor)}
                  editable={editando}
                  keyboardType="numeric"
                  placeholder="00000-000"
                  maxLength={9}
                />
              </View>

              <View style={estilos.fieldBlock}>
                <Text style={estilos.fieldLabel}>Endereço</Text>
                <TextInput
                  style={[estilos.input, !editando && estilos.inputDisabled, estilos.addressInput]}
                  value={perfil.rua}
                  onChangeText={(valor) => atualizarCampo('rua', valor)}
                  editable={editando}
                  multiline
                  autoCapitalize="sentences"
                />
              </View>

              <View style={estilos.actionAreaRow}>
                <TouchableOpacity style={[estilos.actionButton, estilos.primaryButton, estilos.actionButtonHalf]} onPress={salvarPerfil} disabled={salvando}>
                  <Text style={estilos.actionButtonText}>{salvando ? 'Salvando...' : 'Salvar Perfil'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[estilos.actionButton, estilos.secondaryButton, estilos.actionButtonHalf]} onPress={() => setEditando(false)}>
                  <Text style={estilos.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={estilos.infoPanel}>
              <View style={estilos.infoCards}>
                <View style={estilos.infoCard}>
                  <Text style={estilos.infoLabel}>Nome</Text>
                  <Text style={estilos.infoValue}>{nomeCompleto || 'Não informado'}</Text>
                </View>
                <View style={estilos.infoCard}>
                  <Text style={estilos.infoLabel}>CEP</Text>
                  <Text style={estilos.infoValue}>{perfil.cep || 'Não informado'}</Text>
                </View>
                <View style={estilos.infoCard}>
                  <Text style={estilos.infoLabel}>Endereço</Text>
                  <Text style={estilos.infoValue}>{perfil.rua || 'Não informado'}</Text>
                </View>
              </View>
              <View style={estilos.footerAction}>
                <TouchableOpacity style={[estilos.actionButton, estilos.primaryButton]} onPress={() => setEditando(true)}>
                  <Text style={estilos.actionButtonText}>Editar perfil</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 0,
    flexGrow: 1,
  },
  card: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 34,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FF0000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#EC6426',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#2d2a24',
    textTransform: 'uppercase',
    fontFamily: 'Luckiest Guy',
  },
  headerSpacer: {
    width: 34,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarShell: {
    padding: 4,
    borderRadius: 70,
    backgroundColor: '#FFF',
    shadowColor: '#EC6426',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: '#FFF4EB',
  },
  avatarPlaceholder: {
    backgroundColor: '#f7e4d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontFamily: 'Lalezar',
  },
  nomeUsuario: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2d2a24',
    marginTop: 6,
    fontFamily: 'Luckiest Guy',
    display: 'none',
  },
  photoActionsRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  photoActionButton: {
    flex: 1,
    backgroundColor: '#f37910',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  photoActionText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'Lalezar',
    fontSize: 14,
  },
  removePhotoButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f37910',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  removePhotoText: {
    color: '#f37910',
    fontWeight: '700',
    fontFamily: 'Lalezar',
    fontSize: 14,
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  formPanel: {
    paddingTop: 2,
  },
  infoPanel: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 10,
  },
  infoCards: {
    gap: 10,
  },
  footerAction: {
    marginTop: 20,
  },
  infoCard: {
    borderRadius: 18,
    backgroundColor: '#FFF7F2',
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3DEC9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  infoLabel: {
    color: '#8A705B',
    fontSize: 12,
    fontFamily: 'Lalezar',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#2d2a24',
    fontSize: 15,
    marginTop: 4,
    fontFamily: 'Lora',
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#2d2a24',
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Lalezar',
  },
  input: {
    backgroundColor: '#f4e3d5',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#2d2a24',
    fontSize: 16,
    fontFamily: 'Lora',
  },
  inputDisabled: {
    backgroundColor: '#f7f0e8',
    color: '#7f7b74',
  },
  addressInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  actionArea: {
    marginTop: 10,
  },
  actionAreaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  actionButtonHalf: {
    flex: 1,
  },
  actionButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#f37910',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Lalezar',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f37910',
  },
  secondaryButtonText: {
    color: '#f37910',
    fontSize: 14,
    fontFamily: 'Lalezar',
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});