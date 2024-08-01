import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('app.db');

export const initializeDatabase = () => {
  db.transaction(tx => {


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
        category TEXT
      );`,
      [],
      () => {
        console.log('Tabela recipes criada com sucesso.');
      },
      (tx, error) => {
        console.error('Erro ao criar tabela recipes:', error);
      }
    );
  });
};

export const getDb = () => db;
