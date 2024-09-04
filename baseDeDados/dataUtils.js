import { getDb } from './database';

export function removerAcentos(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Função para adicionar receitas
export const addRecipe = (name, description, preparationTime, image, category, ingredients,calories,protein,carbs,fats,isVegan) => {
  const db = getDb();

  if (!db) {
    console.error('Banco de dados não foi aberto corretamente');
    return;
  }

  // Converter ingredientes para JSON
  const ingredientsJSON = JSON.stringify(ingredients);

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
            'INSERT INTO recipes (name, description, preparation_time, image, category, ingredients,calories,protein,carbs,fats,isVegan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, preparationTime, image, category, ingredientsJSON,calories,protein,carbs,fats,isVegan],
            (_, result) => {
              
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




// Função para deletar receitas
export const deleteIngredient = (id) => {
  const db = getDb();

  if (!db) {
    console.error('Banco de dados não foi aberto corretamente');
    return;
  }

  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM ingredients WHERE id = ?',
      [id],
      (_, result) => {
        console.log('Ingrediente deletada com sucesso', result);
      },
      (tx, error) => {
        console.error('Erro ao deletar receita', error);
      }
    );
  });
};

export const checkIngredientsAvailability = async (recipeId) => {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM recipes WHERE id = ?',
        [recipeId],
        (_, { rows: recipeRows }) => {
          
          const recipe = recipeRows._array[0];
          if (!recipe) {
            console.log(`Receita com ID ${recipeId} não encontrada`);
            return resolve(false);
          }

          const recipeIngredients = JSON.parse(recipe.ingredients.replace(/\\"/g, '"').replace(/^"|"$/g, ''));

          db.transaction(tx2 => {          
            console.log("ENTROU");

            tx2.executeSql(
              'SELECT * FROM ingredients',
              [],
              (_, { rows: ingredientsRows }) => {
                
                const availableIngredients = ingredientsRows._array;
                const hasAllIngredients = recipeIngredients.every(recipeIngredient => {
                  const availableIngredient = availableIngredients.find(
                    ingredient => removerAcentos((ingredient.name.toLowerCase()).trim()) === recipeIngredient.name.toLowerCase().trim()
                  );

                  if (availableIngredient) {
                    const recipeQuantity = recipeIngredient.quantity === "Null" 
                      ? null 
                      : parseFloat(recipeIngredient.quantity);
                    const availableQuantity = availableIngredient.quantity === "Null"
                      ? null
                      : parseFloat(availableIngredient.quantity);

                    const recipeUnit = recipeIngredient.unit === "Null" ? null : recipeIngredient.unit;
                    const availableUnit = availableIngredient.unit === "Null" ? null : availableIngredient.unit;

                   // console.log(`Nome: ${recipeId}`);
                   // console.log(`Comparando ingrediente: ${recipeIngredient.name}`);
                   // console.log(`Quantidade necessária: ${recipeQuantity}, Quantidade disponível: ${availableQuantity}`);
                   // console.log(`Unidade necessária: ${recipeUnit}, Unidade disponível: ${availableUnit}`);

                    const quantityCheck = recipeQuantity === null || isNaN(recipeQuantity) || Number(availableQuantity) >= Number(recipeQuantity);
                    const unitCheck = (recipeUnit === null) || (availableUnit !== null && Number(availableUnit) >= Number(recipeUnit));
                    console.log(quantityCheck,unitCheck);
                    
                    return quantityCheck && unitCheck;
                  }

                  return false;
                });

                console.log('Todos os ingredientes estão disponíveis:', hasAllIngredients);
                resolve(hasAllIngredients);
              },
              (tx2, error) => {
                console.error('Erro ao buscar ingredientes:', error);
                reject(error);
              }
            );
          });
        },
        (tx, error) => {
          console.error('Erro ao buscar receita:', error);
          reject(error);
        }
      );
    });
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

//Funçao para limpar a tabela de receitas
export const clearIngredientTable = () => {
  const db = getDb();
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM ingredients',
      [],
      () => {
        console.log('Tabela ingredients limpa com sucesso.');
        // Reseta o contador de ID para 1
        tx.executeSql(
          'DELETE FROM sqlite_sequence WHERE name="ingredients"',
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
        console.error('Erro ao limpar tabela ingredients', error);
      }
    );
  });
};



// Função para adicionar as receitas iniciais
export const addInitialRecipes = () => {
  
  const recipes = [
    {
        name: 'egg',
        description: 'Modo de preparo:\n\n1. Quebre os 3 ovos em uma tigela.\n2. Adicione a farinha aos ovos e misture bem.\n3. Adicione o pão picado e misture até incorporar todos os ingredientes.\n4. Cozinhe em uma frigideira por cerca de 10 minutos ou até que os ovos estejam totalmente cozidos.\n',
        preparationTime: 30,
        image: require('../assets/images/Recypes/spagheti.jpg'),
        category: 'refeicao',
        ingredients: JSON.stringify([
            { "name": "eggs", "quantity": "180", "unit": 3 },
            { "name": "flour", "quantity": "100", "unit": "0.1" },
            { "name": "pao", "quantity": "260", "unit": "5" }
        ]),
        calories: 250,
        protein: 15,
        carbs: 20,
        fats: 10,
        isVegan: 0
    },
    {
        name: 'cake',
        description: 'Good Cake. \n\nModo de preparo:\n1. Bata os 3 ovos em uma tigela.\n2. Adicione a farinha e misture bem até obter uma massa homogênea.\n3. Adicione o leite à mistura e continue mexendo até incorporar bem.\n4. Despeje a massa em uma forma e asse em forno pré-aquecido a 180°C por cerca de 25 minutos ou até dourar.',
        preparationTime: 30,
        image: require('../assets/images/Recypes/bolo.jpg'),
        category: 'sobremesa',
        ingredients: JSON.stringify([
            { "name": "eggs", "quantity": "Null", "unit": 3 },
            { "name": "flour", "quantity": "100", "unit": "Null" },
            { "name": "leite", "quantity": "300", "unit": "Null" }
        ]),
        calories: 300,
        protein: 5,
        carbs: 50,
        fats: 15,
        isVegan: 0
    },
    {
        name: 'eggss',
        description: 'Modo de preparo:\n\n1. Quebre os 3 ovos em uma tigela.\n2. Adicione a farinha aos ovos e misture bem.\n3. Adicione o pão picado e misture até incorporar todos os ingredientes.\n4. Cozinhe em uma frigideira por cerca de 10 minutos ou até que os ovos estejam totalmente cozidos.\n',
        preparationTime: 30,
        image: require('../assets/images/Recypes/spagheti.jpg'),
        category: 'refeicao',
        ingredients: JSON.stringify([
            { "name": "eggs", "quantity": "Null", "unit": 3 },
            { "name": "flour", "quantity": "100", "unit": "Null" },
            { "name": "pao", "quantity": "Null", "unit": "5" },
            { "name": "banana", "quantity": "Null", "unit": "5" },
            { "name": "pera", "quantity": "Null", "unit": "5" },
            { "name": "maca", "quantity": "Null", "unit": "5" }
        ]),
        calories: 250,
        protein: 15,
        carbs: 20,
        fats: 10,
        isVegan: 1
    },
    {
        name: 'cakes',
        description: 'Good Cake. \n\nModo de preparo:\n1. Bata os 3 ovos em uma tigela.\n2. Adicione a farinha e misture bem até obter uma massa homogênea.\n3. Adicione o leite à mistura e continue mexendo até incorporar bem.\n4. Despeje a massa em uma forma e asse em forno pré-aquecido a 180°C por cerca de 25 minutos ou até dourar.',
        preparationTime: 30,
        image: require('../assets/images/Recypes/bolo.jpg'),
        category: 'sobremesa',
        ingredients: JSON.stringify([
            { "name": "eggs", "quantity": "Null", "unit": 3 },
            { "name": "flour", "quantity": "100", "unit": "Null" },
            { "name": "leite", "quantity": "300", "unit": "Null" }
        ]),
        calories: 300,
        protein: 5,
        carbs: 50,
        fats: 15,
        isVegan: 0
    },
    {
        name: 'eggdd',
        description: 'Modo de preparo:\n\n1. Quebre os 3 ovos em uma tigela.\n2. Adicione a farinha aos ovos e misture bem.\n3. Adicione o pão picado e misture até incorporar todos os ingredientes.\n4. Cozinhe em uma frigideira por cerca de 10 minutos ou até que os ovos estejam totalmente cozidos.\n',
        preparationTime: 30,
        image: require('../assets/images/Recypes/spagheti.jpg'),
        category: 'refeicao',
        ingredients: JSON.stringify([
            { "name": "eggs", "quantity": "Null", "unit": 3 },
            { "name": "flour", "quantity": "100", "unit": "Null" },
            { "name": "pao", "quantity": "Null", "unit": "5" }
        ]),
        calories: 250,
        protein: 15,
        carbs: 20,
        fats: 10,
        isVegan: 0
    },
    {
        name: 'cakeddd',
        description: 'Good Cake. \n\nModo de preparo:\n1. Bata os 3 ovos em uma tigela.\n2. Adicione a farinha e misture bem até obter uma massa homogênea.\n3. Adicione o leite à mistura e continue mexendo até incorporar bem.\n4. Despeje a massa em uma forma e asse em forno pré-aquecido a 180°C por cerca de 25 minutos ou até dourar.',
        preparationTime: 30,
        image: require('../assets/images/Recypes/bolo.jpg'),
        category: 'sobremesa',
        ingredients: JSON.stringify([
            { "name": "eggs", "quantity": "Null", "unit": 3 },
            { "name": "flour", "quantity": "100", "unit": "Null" },
            { "name": "leite", "quantity": "300", "unit": "Null" }
        ]),
        calories: 300,
        protein: 5,
        carbs: 50,
        fats: 15,
        isVegan: 0
    },
    {
        name: 'eggfff',
        description: 'Modo de preparo:\n\n1. Quebre os 3 ovos em uma tigela.\n2. Adicione a farinha aos ovos e misture bem.\n3. Adicione o pão picado e misture até incorporar todos os ingredientes.\n4. Cozinhe em uma frigideira por cerca de 10 minutos ou até que os ovos estejam totalmente cozidos.\n',
        preparationTime: 30,
        image: require('../assets/images/Recypes/spagheti.jpg'),
        category: 'refeicao',
        ingredients: JSON.stringify([
            { "name": "eggs", "quantity": "Null", "unit": 3 },
            { "name": "flour", "quantity": "100", "unit": "Null" },
            { "name": "pao", "quantity": "Null", "unit": "5" }
        ]),
        calories: 250,
        protein: 15,
        carbs: 20,
        fats: 10,
        isVegan: 0
    },
    {
        name: 'cakefff',
        description: 'Good Cake. \n\nModo de preparo:\n1. Bata os 3 ovos em uma tigela.\n2. Adicione a farinha e misture bem até obter uma massa homogênea.\n3. Adicione o leite à mistura e continue mexendo até incorporar bem.\n4. Despeje a massa em uma forma e asse em forno pré-aquecido a 180°C por cerca de 25 minutos ou até dourar.',
        preparationTime: 30,
        image: require('../assets/images/Recypes/bolo.jpg'),
        category: 'sobremesa',
        ingredients: JSON.stringify([
            { "name": "eggs", "quantity": "Null", "unit": 3 },
            { "name": "flour", "quantity": "100", "unit": "Null" },
            { "name": "leite", "quantity": "300", "unit": "Null" },
            { "name": "abacate", "quantity": "Null", "unit": "2" },
            

        ]),
        calories: 300,
        protein: 5,
        carbs: 50,
        fats: 15,
        isVegan: 0
    },
    {
        name: 'Grilled Cheese Sandwich',
        description: 'Classic grilled cheese sandwich with a golden crust.',
        preparationTime: 10,
        image: require('../assets/images/Recypes/spagheti.jpg'),
        category: 'refeicao',
        ingredients: JSON.stringify([
            { name: 'bread', quantity: 'Null', unit: '2' },
            { name: 'cheese', quantity: '200', unit: 'Null' },
            { name: 'butter', quantity: '50', unit: 'Null' }
        ]),
        calories: 400,
        protein: 10,
        carbs: 40,
        fats: 30,
        isVegan: 0
    }
];


  recipes.forEach(recipe => {
    const ingredientsJSON = recipe.ingredients; // A lista de ingredientes já está em JSON
    addRecipe(recipe.name, recipe.description, recipe.preparationTime, recipe.image, recipe.category, ingredientsJSON,recipe.calories,recipe.protein,recipe.carbs,recipe.fats,recipe.isVegan);
  });
};

