import { View, Text, StyleSheet, ScrollView } from 'react-native';

const SettingsScreen = () => {
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
});

export default SettingsScreen;
