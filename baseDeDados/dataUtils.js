import { getDb } from './database';

// Função para adicionar receitas
export const addRecipe = (name, description, preparationTime, image,category) => {
  const db = getDb();

  if (!db) {
    console.error('Banco de dados não foi aberto corretamente');
    return;
  }

  db.transaction(tx => {
    // Verificar se a receita já existe
    tx.executeSql(
      'SELECT id FROM recipes WHERE name = ?',
      [name],
      (_, result) => {
        if (result.rows.length > 0) {
          console.log('Receita já existe. Não será adicionada.');
        } else {
          // Adicionar receita se não existir
          tx.executeSql(
            'INSERT INTO recipes (name, description, preparation_time, image,category) VALUES (?, ?, ?, ?, ?)',
            [name, description, preparationTime, image,category],
            (_, result) => {
              console.log('Receita adicionada com sucesso', result);
            },
            (tx, error) => {
              console.error('Erro ao adicionar receita', error);
            }
          );
        }
      },
      (tx, error) => {
        console.error('Erro ao verificar receita', error);
      }
    );
  });
};



// Função para deletar receitas
export const deleteRecipe = (id) => {
  const db = getDb();

  if (!db) {
    console.error('Banco de dados não foi aberto corretamente');
    return;
  }

  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM recipes WHERE id = ?',
      [id],
      (_, result) => {
        console.log('Receita deletada com sucesso', result);
      },
      (tx, error) => {
        console.error('Erro ao deletar receita', error);
      }
    );
  });
};





//Funçao para limpar a tabela de receitas
export const clearRecipesTable = () => {
  const db = getDb();
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM recipes',
      [],
      () => {
        console.log('Tabela recipes limpa com sucesso.');
        // Reseta o contador de ID para 1
        tx.executeSql(
          'DELETE FROM sqlite_sequence WHERE name="recipes"',
          [],
          () => {
            console.log('Contador de ID resetado para 1.');
          },
          (tx, error) => {
            console.error('Erro ao resetar o contador de ID', error);
          }
        );
      },
      (tx, error) => {
        console.error('Erro ao limpar tabela recipes', error);
      }
    );
  });
};




//Funçao para adicionar as receitas iniciais
export const addInitialRecipes = () => {
  const recipes = [
    { name: 'Spaghetti Bolognese', description: 'Delicious spaghetti with meat sauce.', preparationTime: 30, image: require('../assets/images/Recypes/spagheti.jpg'), category: 'refeicao' },
    { name: 'Chicken Curry', description: 'Spicy and flavorful chicken curry.', preparationTime: 45, image: require('../assets/images/Recypes/spagheti.jpg'), category: 'refeicao' },
    { name: 'Grilled Cheese Sandwich', description: 'Classic grilled cheese sandwich with a golden crust.', preparationTime: 10, image: require('../assets/images/Recypes/spagheti.jpg'), category: 'refeicao' },
    { name: 'Caesar Salad', description: 'Fresh salad with Caesar dressing and croutons.', preparationTime: 15, image: require('../assets/images/Recypes/spagheti.jpg'), category: 'refeicao' },
    { name: 'Beef Tacos', description: 'Tasty beef tacos with fresh toppings.', preparationTime: 20, image: require('../assets/images/Recypes/spagheti.jpg'), category: 'refeicao' },
    { name: 'Chocolate Cake', description: 'Rich and moist chocolate cake.', preparationTime: 60, image: require('../assets/images/Recypes/bolo.jpg'), category: 'sobremesa' },
    { name: 'Apple Pie', description: 'Classic apple pie with a flaky crust.', preparationTime: 90, image: require('../assets/images/Recypes/bolo.jpg'), category: 'sobremesa' },
    { name: 'Lemon Tart', description: 'Tangy lemon tart with a buttery crust.', preparationTime: 45, image: require('../assets/images/Recypes/bolo.jpg'), category: 'sobremesa' },
    { name: 'Vanilla Ice Cream', description: 'Creamy vanilla ice cream made with real vanilla beans.', preparationTime: 120, image: require('../assets/images/Recypes/bolo.jpg'), category: 'sobremesa' },
    { name: 'Brownies', description: 'Fudgy brownies with a crackly top.', preparationTime: 40, image: require('../assets/images/Recypes/bolo.jpg'), category: 'sobremesa' }
  ];

  recipes.forEach(recipe => {
    addRecipe(recipe.name, recipe.description, recipe.preparationTime, recipe.image, recipe.category);
  });
};
