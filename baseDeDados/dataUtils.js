import { getDb } from './database';

// Função para adicionar receitas
export const addRecipe = (name, description, preparationTime, image, category, ingredients) => {
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
            'INSERT INTO recipes (name, description, preparation_time, image, category, ingredients) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, preparationTime, image, category, ingredientsJSON],
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
                    ingredient => ingredient.name.toLowerCase() === recipeIngredient.name.toLowerCase()
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

                    console.log(`Comparando ingrediente: ${recipeIngredient.name}`);
                    console.log(`Quantidade necessária: ${recipeQuantity}, Quantidade disponível: ${availableQuantity}`);
                    console.log(`Unidade necessária: ${recipeUnit}, Unidade disponível: ${availableUnit}`);

                    const quantityCheck = recipeQuantity === null || isNaN(recipeQuantity) || Number(availableQuantity) >= Number(recipeQuantity);
                    const unitCheck = (recipeUnit === null) || (availableUnit !== null && Number(availableUnit) >= Number(recipeUnit));
                    console.log(quantityCheck,unitCheck);
                    console.log(availableUnit >= recipeUnit);
                    console.log(availableUnit);
                    console.log(recipeUnit);
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
      description: 'Egg dish.',
      preparationTime: 30,
      image: require('../assets/images/Recypes/spagheti.jpg'),
      category: 'refeicao',
      ingredients: JSON.stringify([
        {  "name": "eggs", "quantity": "Null", "unit": 3 }, // Requer 3 ovos
        {  "name": "flour", "quantity": "100", "unit": "Null" } // Requer 100 gramas de farinha
      ]
      )
    },
    {
      name: 'cake',
      description: 'Good Cake.',
      preparationTime: 30,
      image: require('../assets/images/Recypes/spagheti.jpg'),
      category: 'sobremesa',
      ingredients: JSON.stringify([
        {  "name": "eggs", "quantity": "Null", "unit": 3 }, // Requer 3 ovos
        {  "name": "flour", "quantity": "100", "unit": "Null" }, // Requer 100 gramas de farinha
        { "name": "leite", "quantity": "300", "unit": "Null" }
      ]
      )
    },
    {
      name: 'Spaghetti Bolognese',
      description: 'Delicious spaghetti with meat sauce.',
      preparationTime: 30,
      image: require('../assets/images/Recypes/spagheti.jpg'),
      category: 'refeicao',
      ingredients: JSON.stringify([
        { name: 'spaghetti', quantity: '200', unit: 'grams' },
        { name: 'ground beef', quantity: '300', unit: 'grams' },
        { name: 'tomato sauce', quantity: '1', unit: 'cup' },
        { name: 'onion', quantity: '1', unit: 'unit' },
        { name: 'garlic', quantity: '3', unit: 'cloves' },
        { name: 'olive oil', quantity: '2', unit: 'tablespoons' },
        { name: 'salt', quantity: '1', unit: 'teaspoon' },
        { name: 'pepper', quantity: '0.5', unit: 'teaspoon' }
      ])
    },
    {
      name: 'Chicken Curry',
      description: 'Spicy and flavorful chicken curry.',
      preparationTime: 45,
      image: require('../assets/images/Recypes/spagheti.jpg'),
      category: 'refeicao',
      ingredients: JSON.stringify([
        { name: 'chicken', quantity: '500', unit: 'grams' },
        { name: 'curry powder', quantity: '2', unit: 'tablespoons' },
        { name: 'coconut milk', quantity: '1', unit: 'cup' },
        { name: 'onion', quantity: '1', unit: 'unit' },
        { name: 'garlic', quantity: '3', unit: 'cloves' },
        { name: 'ginger', quantity: '1', unit: 'inch piece' },
        { name: 'salt', quantity: '1', unit: 'teaspoon' },
        { name: 'pepper', quantity: '0.5', unit: 'teaspoon' }
      ])
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
      ])
    },
    {
      name: 'Caesar Salad',
      description: 'Fresh salad with Caesar dressing and croutons.',
      preparationTime: 15,
      image: require('../assets/images/Recypes/spagheti.jpg'),
      category: 'refeicao',
      ingredients: JSON.stringify([
        { name: 'romaine lettuce', quantity: '1', unit: 'head' },
        { name: 'croutons', quantity: '1', unit: 'cup' },
        { name: 'Caesar dressing', quantity: '1/2', unit: 'cup' },
        { name: 'parmesan cheese', quantity: '1/4', unit: 'cup' }
      ])
    },
    {
      name: 'Beef Tacos',
      description: 'Tasty beef tacos with fresh toppings.',
      preparationTime: 20,
      image: require('../assets/images/Recypes/spagheti.jpg'),
      category: 'refeicao',
      ingredients: JSON.stringify([
        { name: 'ground beef', quantity: '300', unit: 'grams' },
        { name: 'taco shells', quantity: '8', unit: 'shells' },
        { name: 'lettuce', quantity: '1', unit: 'cup' },
        { name: 'tomato', quantity: '1', unit: 'unit' },
        { name: 'cheese', quantity: '1/2', unit: 'cup' },
        { name: 'sour cream', quantity: '1/4', unit: 'cup' }
      ])
    },
    {
      name: 'Chocolate Cake',
      description: 'Rich and moist chocolate cake.',
      preparationTime: 60,
      image: require('../assets/images/Recypes/bolo.jpg'),
      category: 'sobremesa',
      ingredients: JSON.stringify([
        { name: 'flour', quantity: '1.5', unit: 'cups' },
        { name: 'sugar', quantity: '1', unit: 'cup' },
        { name: 'cocoa powder', quantity: '0.75', unit: 'cup' },
        { name: 'baking powder', quantity: '1.5', unit: 'teaspoons' },
        { name: 'eggs', quantity: '2', unit: 'units' },
        { name: 'milk', quantity: '1', unit: 'cup' },
        { name: 'butter', quantity: '0.5', unit: 'cup' }
      ])
    },
    {
      name: 'Apple Pie',
      description: 'Classic apple pie with a flaky crust.',
      preparationTime: 90,
      image: require('../assets/images/Recypes/bolo.jpg'),
      category: 'sobremesa',
      ingredients: JSON.stringify([
        { name: 'apples', quantity: '6', unit: 'units' },
        { name: 'flour', quantity: '1.5', unit: 'cups' },
        { name: 'sugar', quantity: '0.75', unit: 'cup' },
        { name: 'butter', quantity: '0.5', unit: 'cup' },
        { name: 'cinnamon', quantity: '1', unit: 'teaspoon' },
        { name: 'pie crust', quantity: '2', unit: 'crusts' }
      ])
    },
    {
      name: 'Lemon Tart',
      description: 'Tangy lemon tart with a buttery crust.',
      preparationTime: 45,
      image: require('../assets/images/Recypes/bolo.jpg'),
      category: 'sobremesa',
      ingredients: JSON.stringify([
        { name: 'lemons', quantity: '4', unit: 'units' },
        { name: 'flour', quantity: '1', unit: 'cup' },
        { name: 'sugar', quantity: '0.75', unit: 'cup' },
        { name: 'butter', quantity: '0.5', unit: 'cup' },
        { name: 'eggs', quantity: '3', unit: 'units' }
      ])
    },
    {
      name: 'Vanilla Ice Cream',
      description: 'Creamy vanilla ice cream made with real vanilla beans.',
      preparationTime: 120,
      image: require('../assets/images/Recypes/bolo.jpg'),
      category: 'sobremesa',
      ingredients: JSON.stringify([
        { name: 'milk', quantity: '2', unit: 'cups' },
        { name: 'cream', quantity: '1', unit: 'cup' },
        { name: 'sugar', quantity: '0.75', unit: 'cup' },
        { name: 'vanilla beans', quantity: '2', unit: 'beans' }
      ])
    },
    {
      name: 'Brownies',
      description: 'Fudgy brownies with a crackly top.',
      preparationTime: 40,
      image: require('../assets/images/Recypes/bolo.jpg'),
      category: 'sobremesa',
      ingredients: JSON.stringify([
        { name: 'flour', quantity: '1', unit: 'cup' },
        { name: 'sugar', quantity: '1', unit: 'cup' },
        { name: 'cocoa powder', quantity: '0.5', unit: 'cup' },
        { name: 'butter', quantity: '0.5', unit: 'cup' },
        { name: 'eggs', quantity: '2', unit: 'units' },
        { name: 'chocolate', quantity: '0.5', unit: 'cup' }
      ])
    }
  ];

  recipes.forEach(recipe => {
    const ingredientsJSON = recipe.ingredients; // A lista de ingredientes já está em JSON
    addRecipe(recipe.name, recipe.description, recipe.preparationTime, recipe.image, recipe.category, ingredientsJSON);
  });
};

