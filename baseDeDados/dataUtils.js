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
            //console.log("ENTROU");

            tx2.executeSql(
              'SELECT * FROM ingredients',
              [],
              (_, { rows: ingredientsRows }) => {
                
                const availableIngredients = ingredientsRows._array;
                const hasAllIngredients = recipeIngredients.every(recipeIngredient => {
                  const availableIngredient = availableIngredients.find(
                    ingredient => removerAcentos((ingredient.name.toLowerCase()).trim()) === removerAcentos(recipeIngredient.name.toLowerCase().trim())
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
                    
                    //console.log(`Nome: ${recipeId}`);
                    //console.log(`Comparando ingrediente: ${recipeIngredient.name}`);
                    //console.log(`Quantidade necessária: ${recipeQuantity}, Quantidade disponível: ${availableQuantity}`);
                    //console.log(`Unidade necessária: ${recipeUnit}, Unidade disponível: ${availableUnit}`);

                  //  const quantityCheck = recipeQuantity === null || isNaN(recipeQuantity) || Number(availableQuantity) >= Number(recipeQuantity);
                    //const unitCheck = (recipeUnit === null) || (availableUnit !== null && Number(availableUnit) >= Number(recipeUnit));
                    //console.log(quantityCheck,unitCheck);
                    
                       const check = (availableQuantity===null || isNaN(availableQuantity))
                       ? (Number(availableUnit) >= Number(recipeUnit))
                       : (Number(availableQuantity) >= Number(recipeQuantity));
                       
                       return check;
                   
                  }

                  return false;
                });

                //console.log('Todos os ingredientes estão disponíveis:', hasAllIngredients);
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
      name: "Massa com Atum Simples",
      description: "Modo de preparo:\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n1. Cozinhe a massa em água com sal até ficar no seu ponto preferido, escorra a água da massa, e se quiser pode adicionar molho de tomate á massa a gosto.\n2. Escorra o atum enlatado e adicione à massa cozida.\n3. Tempere com sal, pimenta e azeite a gosto. Misture bem e sirva.",
      preparationTime: 15,
      image: require('../assets/images/Recypes/massa_atum.jpg'),
      category: "refeicao",
      ingredients: JSON.stringify([
          { "name": "massa", "quantity": 80, "unit": 0.16 },  // 80g de massa, 0.16 de um pacote de 500g
          { "name": "atum", "quantity": 120, "unit": 1 }  // 120g de atum enlatado, 1 lata
      ]),
      calories: 350,
      protein: 25,
      carbs: 60,
      fats: 8,
      isVegan: 0
  },  
  
  {
    name: "Maçã Assada",
    description: "Modo de preparo:\n1. Preaqueça o forno a 180°C.\n2. Lave e retire o miolo das maçãs com uma faca ou um descaroçador, formando uma cavidade no centro.\n3. Coloque as maçãs em uma assadeira.\n4. Polvilhe um pouco de canela e açúcar (opcional) dentro de cada maçã.\n5. Coloque uma pequena quantidade de manteiga ou margarina no centro de cada maçã.\n6. Asse as maçãs no forno por cerca de 20-25 minutos, ou até que estejam macias.\n7. Sirva quente, sozinha ou com uma bola de sorvete de baunilha, se desejar.",
    preparationTime: 30,
    image: "path/to/image.jpg",
    category: "sobremesa",
    ingredients: JSON.stringify([
        { "name": "Maçã", "quantity": 1, "unit": 1 },  // 1 maçã

    ]),
    calories: 150,  // Total aproximado, considerando 1 maçã com açúcar e manteiga
    protein: 0.5,   // Total aproximado
    carbs: 39,      // Total aproximado
    fats: 5,        // Total aproximado (considerando manteiga)
    isVegan: 0      // Receita não vegana devido à manteiga
},

    {
      name: "Omelete com Salsicha e Salada",
      description: "Modo de preparo:\n1. Bata os ovos em uma tigela e tempere com sal e pimenta a gosto.\n2. Aqueça uma frigideira com um pouco de óleo e adicione os ovos batidos.\n3. Adicione as salsichas cortadas em rodelas sobre os ovos e cozinhe por 2-3 minutos até dourar de um lado.\n4. Vire a omelete e cozinhe por mais 1-2 minutos até que esteja completamente cozida.\n5. Para a salada, misture folhas verdes (alface, rúcula) com tomate e pepino fatiados. Tempere com azeite e vinagre a gosto.\n6. Sirva a omelete acompanhada da salada.",
      preparationTime: 20,
      image: require('../assets/images/Recypes/Omelete_salchicha_salada.jpg'),
      category: "refeicao",
      ingredients: JSON.stringify([
          { "name": "ovo", "quantity": 180, "unit": 3 },  // 3 ovos (aproximadamente 60g cada)
          { "name": "salsicha", "quantity": 100, "unit": 2 },  // 2 salsichas (100g no total)
          { "name": "alface", "quantity": 50, "unit": 1 },  // 50g de alface
          { "name": "tomate", "quantity": 100, "unit": 1 },  // 1 tomate (100g)
          { "name": "pepino", "quantity": 50, "unit": 0.5 }  // Meio pepino (50g)
      ]),
      calories: 400,
      protein: 25,
      carbs: 10,
      fats: 30,
      isVegan: 0
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
        name: 'Medalhões de pescada com arroz',
        description: "Modo de preparo:\n1. Aqueça 1 colher de sopa de óleo em uma panela e refogue o arroz por 1 minuto, mexendo bem.\n2. Adicione o dobro de água por porção de arroz e uma pitada de sal. Deixe ferver.\n3. Quando ferver, reduza o fogo, tampe e cozinhe por 15-18 minutos, até a água ser absorvida e o arroz ficar macio. Deixe descansar 5 minutos com a panela tampada.\n4. Tempere os medalhões de pescada com sal e pimenta.\n5. Aqueça óleo em uma frigideira e frite os medalhões por 3-4 minutos de cada lado, até dourarem.",
        preparationTime: 30,
        image: require('../assets/images/Recypes/Medalhoes.jpg'),
        category: 'refeicao',
        ingredients: JSON.stringify([
            { "name": "pescadinha", "quantity": 200, "unit": 2 },
            { "name": "arroz", "quantity": 50, "unit": 0.05 },
          
        ]),
        calories: 340,
        protein: 36,
        carbs: 40,
        fats: 5,
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
      name: "Arroz de Frango Simples",
      description: "Modo de preparo:\n1. Em uma panela grande, aqueça 1 colher de sopa de óleo e frite 2 bifes de frango até que estejam bem cozidos e dourados.\n2. Retire os bifes de frango da panela e desfie-os em pedaços menores.\n3. Volte o frango desfiado para a panela, adicione 100g de arroz cru e misture bem.\n4. Despeje 200ml de água (ou o dobro da quantidade de arroz), tempere com sal e pimenta a gosto e misture.\n5. Cozinhe em fogo baixo, com a panela tampada, por aproximadamente 15-20 minutos ou até que o arroz esteja macio e a água tenha sido absorvida.\n6. Solte o arroz com um garfo e sirva.",
      preparationTime: 30,
      image: require('../assets/images/Recypes/Arroz_frango.jpg'),
      category: "refeicao",
      ingredients: JSON.stringify([
          { "name": "frango", "quantity": 200, "unit": 2 },  // 2 bifes de frango (totalizando 200g)
          { "name": "arroz", "quantity": 100, "unit": 0.1 },  // 100g de arroz cru
      ]),
      calories: 650,  
      protein: 40,    
      carbs: 100,     
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

