
import type { ProductSeedData, AllergenCode } from '@/lib/types';
import { COMMON_PIZZA_ALLERGENS } from './allergens';

const PIZZA_BASE_DESCRIPTION = "Tomate, mozzarella y orégano";
const DEFAULT_FOOD_IMAGE = 'https://placehold.co/600x400.png';
const DEFAULT_DRINK_IMAGE = 'https://placehold.co/300x300.png';

export const initialProductData: ProductSeedData[] = [
  // Pizzas
  { name: 'MARGARITA', description: `${PIZZA_BASE_DESCRIPTION}.`, price: 8.50, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'margarita pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'INFIERNO', description: `${PIZZA_BASE_DESCRIPTION}, cebolla, pepperoni, tabasco y boloñesa.`, price: 11.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'infierno pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'apio', 'soja'] }, // Boloñesa puede tener apio/soja
  { name: '4 QUESOS', description: `${PIZZA_BASE_DESCRIPTION}, queso azul, emmental, manchego y maasdam.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'quesos pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'CARBONARA', description: `${PIZZA_BASE_DESCRIPTION}, cebolla, nata, huevo y bacon.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'carbonara pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'huevos'] },
  { name: 'BOLOÑESA', description: `${PIZZA_BASE_DESCRIPTION}, salsa boloñesa.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'boloñesa pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'apio', 'soja'] }, // Boloñesa puede tener apio/soja
  { name: 'PEPPERONI', description: `${PIZZA_BASE_DESCRIPTION}, jamón serrano y pepperoni.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'pepperoni pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'NAPOLITANA', description: `${PIZZA_BASE_DESCRIPTION}, anchoas, aceitunas negras y pimiento rojo.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'napolitana pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'pescado'] },
  { name: 'VEGETARIANA', description: `${PIZZA_BASE_DESCRIPTION}, alcachofas, champiñón, cebolla y pimientos.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'vegetariana pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'MARINERA', description: `${PIZZA_BASE_DESCRIPTION}, gambas, mejillones y atún.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'marinera pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'crustaceos', 'moluscos', 'pescado'] },
  { name: 'HAWAI', description: `${PIZZA_BASE_DESCRIPTION}, jamón dulce y piña.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'hawai pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'MAR Y TIERRA', description: `${PIZZA_BASE_DESCRIPTION}, bacon, jamón dulce, atún, huevo y gambas.`, price: 12.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'mar tierra pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'crustaceos', 'pescado', 'huevos'] },
  { name: 'JAMÓN YORK', description: `${PIZZA_BASE_DESCRIPTION}, jamón york.`, price: 9.50, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'jamon york pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'FUNGHI', description: `${PIZZA_BASE_DESCRIPTION}, jamón york, champiñones y roquefort.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'funghi pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'GRIEGA', description: `${PIZZA_BASE_DESCRIPTION}, pechuga de pollo y salsa de yogurt.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'griega pizza', allergens: COMMON_PIZZA_ALLERGENS }, // Yogurt es lácteo, ya incluido
  { name: 'KEBAB Pizza', description: `${PIZZA_BASE_DESCRIPTION}, pechuga de pollo y salsa de kebab.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'kebab pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'soja', 'apio', 'mostaza'] }, // Salsa kebab puede tener varios
  { name: 'DIET', description: `${PIZZA_BASE_DESCRIPTION}, pechuga de pollo, alcachofas y piña.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'diet pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'TEXAS', description: `${PIZZA_BASE_DESCRIPTION}, barbacoa, bacon y cebolla crujiente.`, price: 11.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'texas pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'mostaza', 'soja'] }, // Salsa BBQ
  { name: 'SERRANILLO', description: `${PIZZA_BASE_DESCRIPTION}, jamón dulce, jamón serrano, aceitunas verdes, tomate natural y extra de mozzarella.`, price: 11.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'serranillo pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: '4 ESTACIONES', description: `${PIZZA_BASE_DESCRIPTION}, alcachofas, champiñón, pimiento rojo y jamón dulce.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'estaciones pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'ATÚN Pizza', description: `${PIZZA_BASE_DESCRIPTION}, atún, pimiento rojo y cebolla.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'atun pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'pescado'] },
  { name: 'BARBACOA Pizza', description: `${PIZZA_BASE_DESCRIPTION}, carne picada con salsa barbacoa.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'barbacoa pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'mostaza', 'soja', 'apio'] }, // Salsa BBQ y carne picada
  { name: 'INFANTIL', description: `${PIZZA_BASE_DESCRIPTION}, jamón dulce y bacon.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'infantil pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'MIXTA', description: `${PIZZA_BASE_DESCRIPTION}, jamón serrano, pepperoni y jamón dulce.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'mixta pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'BACON Pizza', description: `${PIZZA_BASE_DESCRIPTION}, bacon, huevo y pimiento rojo.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'bacon pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'huevos'] },
  { name: 'RACHEL', description: `${PIZZA_BASE_DESCRIPTION}, cuatro quesos, nueces, jamón dulce y pasas.`, price: 12.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'rachel pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'frutos_sec_cascara'] },
  { name: 'CAROLINA', description: `${PIZZA_BASE_DESCRIPTION}, lomo adobado, queso y huevo.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'carolina pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'huevos'] },
  { name: 'AINHOA', description: `${PIZZA_BASE_DESCRIPTION}, jamón serrano y bacon.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'ainhoa pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'ALEX', description: `${PIZZA_BASE_DESCRIPTION}, atún, nata y jamón dulce.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'alex pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'pescado'] }, // Nata es lácteo
  { name: 'TROPICAL', description: `${PIZZA_BASE_DESCRIPTION}, J. york, piña y perlas de queso de cabra y dulce de membrillo.`, price: 11.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'tropical pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'ROMANA', description: `${PIZZA_BASE_DESCRIPTION}, bacon, champiñones y huevo.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'romana pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'huevos'] },
  { name: 'CAPRICHO', description: `${PIZZA_BASE_DESCRIPTION}, J. york, atún, queso manchego, perlas de queso de cabra y dulce de membrillo.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'capricho pizza', allergens: [...COMMON_PIZZA_ALLERGENS, 'pescado'] },
  { name: 'DE LA HUERTA', description: `${PIZZA_BASE_DESCRIPTION}, champiñones, pimiento verde, aceitunas negras, alcachofas y cebolla crujiente.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'huerta pizza', allergens: COMMON_PIZZA_ALLERGENS },
  { name: 'MOGOLLÓN', description: `${PIZZA_BASE_DESCRIPTION}, lomo adobado, bacon, champiñones, pepperoni, pimiento rojo y aceitunas negras.`, price: 12.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'mogollon pizza', allergens: COMMON_PIZZA_ALLERGENS },

  // Hamburguesas -> Category: Sides
  { name: 'HAMBURGUESA SIMPLE', description: 'Tomate, lechuga, cebolla y carne.', price: 4.00, category: 'Sides', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'hamburguesa simple', allergens: ['gluten', 'sesamo', 'soja', 'mostaza', 'sulfitos'] }, // Pan, carne procesada
  { name: 'HAMBURGUESA COMPLETA', description: 'Tomate, lechuga, cebolla, queso y bacon.', price: 4.50, category: 'Sides', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'hamburguesa completa', allergens: ['gluten', 'lacteos', 'sesamo', 'soja', 'mostaza', 'sulfitos'] }, // Queso

  // Sandwiches -> Category: Sides
  { name: 'SANDWICH MIXTO', description: 'Jamón york y queso.', price: 3.50, category: 'Sides', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'sandwich mixto', allergens: ['gluten', 'lacteos', 'soja', 'sulfitos'] }, // Pan, queso, jamón

  // Kebabs -> Category: Sides
  { name: 'KEBAB DE POLLO', description: 'Tomate, lechuga, cebolla y salsa.', price: 5.00, category: 'Sides', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'kebab pollo', allergens: ['gluten', 'lacteos', 'soja', 'apio', 'mostaza', 'sesamo', 'sulfitos'] }, // Pan, carne, salsa
  
  // Raciones -> Category: Sides
  { name: 'RACIÓN QUESO FRITO', description: 'Deliciosa ración de queso frito.', price: 9.00, category: 'Sides', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'queso frito', allergens: ['gluten', 'lacteos', 'huevos'] }, // Rebozado, queso
  { name: 'RACIÓN PATATAS BRAVAS/ALIOLI', description: 'Patatas con salsa brava o alioli.', price: 8.00, category: 'Sides', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'patatas bravas', allergens: ['huevos', 'mostaza', 'sulfitos', 'soja'] }, // Alioli (huevo, mostaza), Brava (sulfitos, soja)

  // Bebidas -> Category: Drinks (Generally no allergens, but some might have specifics if they are complex drinks)
  { name: 'LATA COCA-COLA', description: 'Lata de Coca-Cola (33cl).', price: 2.00, category: 'Drinks', imageUrl: DEFAULT_DRINK_IMAGE, dataAiHint: 'coca cola', allergens: [] },
  { name: 'BOTELLA COCA-COLA 2L', description: 'Botella de Coca-Cola (2L).', price: 4.00, category: 'Drinks', imageUrl: DEFAULT_DRINK_IMAGE, dataAiHint: 'coca cola botella', allergens: [] },
  { name: 'CERVEZA', description: 'Cerveza en lata o tercio.', price: 2.00, category: 'Drinks', imageUrl: DEFAULT_DRINK_IMAGE, dataAiHint: 'cerveza', allergens: ['gluten'] }, // Cerveza contiene gluten
  { name: 'AGUA MINERAL', description: 'Botella de agua mineral (50cl).', price: 1.00, category: 'Drinks', imageUrl: DEFAULT_DRINK_IMAGE, dataAiHint: 'agua mineral', allergens: [] },
];
