import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useFocus } from '../Contexts/FocusContext';

const HelpScreen = () => {
  const navigation = useNavigation();
  const { setfocus } = useFocus(); // Usa o contexto de foco

  useFocusEffect(
    useCallback(() => {
      setfocus('Home');
    }, [navigation])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Ajuda</Text>

      <Text style={styles.subheader}>Visão Geral</Text>
      <Text style={styles.text}>
          Bem-vindo ao nosso aplicativo de receitas! Este aplicativo foi projetado para ajudar você a preparar refeições deliciosas com os ingredientes que você já tem em casa e a manter sua lista de compras organizada.
      </Text>

      <Text style={styles.subheader}>Ingredientes</Text>
      <Text style={styles.text}>
          Na página de **Ingredientes**, você pode adicionar os ingredientes que você tem disponíveis em casa. Isso ajudará o aplicativo a sugerir receitas que você pode fazer com os itens que já possui.
      </Text>

      <Text style={styles.subheader}>Receitas</Text>
      <Text style={styles.text}>
          Nas páginas de **Refeições** e **Sobremesas**, você verá uma lista de receitas armazenadas na base de dados que podem ser preparadas com os ingredientes que você tem disponíveis. Ao clicar em uma receita, você verá detalhes adicionais sobre como prepará-la.
      </Text>

      <Text style={styles.subheader}>Todas as Receitas</Text>
      <Text style={styles.text}>
          A página **Todas as Receitas** mostra tanto as receitas que podem ser feitas com os ingredientes que você tem quanto aquelas que não podem ser preparadas com o que está disponível no momento. Isso ajuda você a planejar melhor suas refeições futuras.
      </Text>

      <Text style={styles.subheader}>Lista de Compras</Text>
      <Text style={styles.text}>
          Na página **Lista de Compras**, você pode adicionar ingredientes que precisa comprar. Quando você marcar um ingrediente como comprado, ele será automaticamente transferido para a página de **Ingredientes**, facilitando o gerenciamento do que já está disponível.
      </Text>

      <Text style={styles.subheader}>Detalhes da Receita</Text>
      <Text style={styles.text}>
          Em cada página de receita, ao clicar em uma receita específica, você obterá informações detalhadas sobre como prepará-la. Lembre-se de que as receitas são fornecidas como diretrizes gerais e podem precisar de ajustes para atender ao seu gosto pessoal. Não nos responsabilizamos pela execução perfeita das receitas.
      </Text>

      <Text style={styles.subheader}>Nota Importante</Text>
      <Text style={styles.text}>
          As receitas fornecidas são adequadas para um público com pouco conhecimento culinário. Sinta-se à vontade para adaptar as receitas conforme necessário e experimente diferentes variações.
      </Text>

      <Text style={styles.text}>
          Se precisar de mais assistência, não hesite em entrar em contato com o suporte ou consultar os recursos adicionais disponíveis no aplicativo.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subheader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#555',
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    lineHeight: 24,
    textAlign:'justify'

  },
});

export default HelpScreen;
