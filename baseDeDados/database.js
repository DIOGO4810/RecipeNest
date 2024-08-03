import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('app.db');

export const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('DROP TABLE IF EXISTS recipes');

      // Cria a tabela de ingredientes
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ingredients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE,
          quantity TEXT,
          unit TEXT,
          image TEXT
        );`,
        [],
        () => {
          console.log('Tabela ingredients criada com sucesso.');
        },
        (tx, error) => {
          console.error('Erro ao criar tabela ingredients:', error);
          reject(error);
        }
      );

      // Cria a tabela de receitas
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS recipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE,
          description TEXT,
          preparation_time INTEGER,
          image TEXT,
          category TEXT,
          ingredients TEXT
        );`,
        [],
        () => {
          console.log('Tabela recipes criada com sucesso.');
          resolve();
        },
        (tx, error) => {
          console.error('Erro ao criar tabela recipes:', error);
          reject(error);
        }
      );
    });
  });
};

export const getDb = () => db;
