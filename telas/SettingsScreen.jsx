import { View, Text, StyleSheet, ScrollView, Linking} from 'react-native';
import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useFocus } from '../Contexts/FocusContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { setfocus } = useFocus(); // Use the focus context

  useFocusEffect(
    useCallback(() => {
      setfocus('Home');
    }, [navigation])
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.footerContent}>
        <Text style={styles.footerTitle}>Informações dos Donos</Text>
        <Text style={styles.footerText}>
          Nome dos Donos: Diogo José Ribeiro e Ribeiro {'\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t'} Carolina Silva Martins
        </Text>
        <Text style={styles.footerText}>E-mail: exemplo@dominio.com</Text>
        <Text style={styles.footerText}>
          Desenvolvido por: Diogo José Ribeiro e Ribeiro {'\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t'} Carolina Silva Martins
        </Text>

        {/* Credits Section */}
        <View style={styles.creditsContainer}>
          <Text style={styles.creditsText}>
            Icons made by{' '}
            <Text
              style={styles.link}
              onPress={() => Linking.openURL('https://www.flaticon.com/authors/photo3idea-studio')}
            >
              photo3idea_studio
            </Text>{' '}
            from{' '}
            <Text
              style={styles.link}
              onPress={() => Linking.openURL('https://www.flaticon.com/')}
            >
              www.flaticon.com
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
  },
  footerContent: {
    alignItems: 'flex-start',
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 5,
  },
  creditsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  creditsText: {
    fontSize: 12,
    color: '#555',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default SettingsScreen;
