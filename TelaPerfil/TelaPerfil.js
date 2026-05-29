import React, { useEffect, useState } from 'react';
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
import { auth as autenticacao, db as bancoDados } from '../Config/FireBaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

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
    <ScrollView style={estilos.scroll} contentContainerStyle={estilos.scrollContent}>
      <View style={[estilos.card, { minHeight: windowHeight - 24 }]}> 
        <View style={estilos.cardHeader}>
          <TouchableOpacity style={estilos.backButton} onPress={() => navigation.goBack()}>
            <Text style={estilos.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={estilos.title}>Tela do Usuário</Text>
          <View style={estilos.headerSpacer} />
        </View>

        <View style={estilos.avatarContainer}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={estilos.avatar} />
          ) : (
            <View style={[estilos.avatar, estilos.avatarPlaceholder]}>
              <Text style={estilos.avatarText}>FOTO</Text>
            </View>
          )}
          {editando && (
            <View style={estilos.photoActionsRow}>
              <TouchableOpacity
                style={estilos.photoActionButton}
                onPress={() => setMostrarUrlFoto(true)}
              >
                <Text style={estilos.photoActionText}>Trocar Foto</Text>
              </TouchableOpacity>
              {photoUrl ? (
                <TouchableOpacity
                  style={estilos.removePhotoButton}
                  onPress={removerFotoPerfil}
                >
                  <Text style={estilos.removePhotoText}>Remover Foto</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>

        {mostrarUrlFoto && (
          <View style={estilos.fieldBlock}>
            <Text style={estilos.fieldLabel}>URL da Foto</Text>
            <TextInput
              style={[estilos.input, !editando && estilos.inputDisabled]}
              value={photoUrl || ''}
              onChangeText={setPhotoUrl}
              editable={editando}
              placeholder="https://..."
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        <View style={estilos.fieldBlock}>
          <Text style={estilos.fieldLabel}>Nome</Text>
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
          <Text style={estilos.fieldLabel}>Endereço (Rua e Número)</Text>
          <TextInput
            style={[estilos.input, !editando && estilos.inputDisabled, estilos.addressInput]}
            value={perfil.rua}
            onChangeText={(valor) => atualizarCampo('rua', valor)}
            editable={editando}
            multiline
            autoCapitalize="sentences"
          />
        </View>

        <View style={estilos.actionArea}>
          {editando ? (
            <>
              <TouchableOpacity style={[estilos.actionButton, estilos.primaryButton]} onPress={salvarPerfil} disabled={salvando}>
                <Text style={estilos.actionButtonText}>{salvando ? 'Salvando...' : 'Salvar Perfil'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[estilos.actionButton, estilos.secondaryButton]} onPress={() => setEditando(false)}>
                <Text style={estilos.secondaryButtonText}>CANCELAR</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[estilos.actionButton, estilos.primaryButton]} onPress={() => setEditando(true)}>
              <Text style={estilos.actionButtonText}>Alterar Perfil</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fff3ea',
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
    backgroundColor: '#fff',
    borderRadius: 34,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f3d4b0',
  },
  backButtonText: {
    fontSize: 18,
    color: '#EC6426',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#2d2a24',
    textTransform: 'uppercase',
  },
  headerSpacer: {
    width: 34,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 22,
  },
  avatar: {
    width: 132,
    height: 132,
    borderRadius: 66,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#f7e4d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#b7a89e',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  photoActionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  photoActionButton: {
    backgroundColor: '#f37910',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  photoActionText: {
    color: '#fff',
    fontWeight: '700',
  },
  removePhotoButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f37910',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  removePhotoText: {
    color: '#f37910',
    fontWeight: '700',
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#2d2a24',
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f4e3d5',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#2d2a24',
    fontSize: 16,
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
  actionButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#f37910',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f37910',
  },
  secondaryButtonText: {
    color: '#f37910',
    fontWeight: '700',
    fontSize: 14,
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});