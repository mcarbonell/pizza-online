
import type { ProductSeedData } from '@/lib/types';

// Data parsed from docs/products.md
// This data will be used by the admin panel to import into Firestore.
// Firestore will generate the 'id' for each product document.

const PIZZA_BASE_DESCRIPTION = "Tomate, mozzarella y orégano";
const DEFAULT_FOOD_IMAGE = 'https://placehold.co/600x400.png';
const DEFAULT_DRINK_IMAGE = 'https://placehold.co/300x300.png';

export const initialProductData: ProductSeedData[] = [
  // Pizzas
  { name: 'MARGARITA', description: `${PIZZA_BASE_DESCRIPTION}.`, price: 8.50, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'margarita pizza' },
  { name: 'INFIERNO', description: `${PIZZA_BASE_DESCRIPTION}, cebolla, pepperoni, tabasco y boloñesa.`, price: 11.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'infierno pizza' },
  { name: '4 QUESOS', description: `${PIZZA_BASE_DESCRIPTION}, queso azul, emmental, manchego y maasdam.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'quesos pizza' },
  { name: 'CARBONARA', description: `${PIZZA_BASE_DESCRIPTION}, cebolla, nata, huevo y bacon.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'carbonara pizza' },
  { name: 'BOLOÑESA', description: `${PIZZA_BASE_DESCRIPTION}, salsa boloñesa.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'boloñesa pizza' },
  { name: 'PEPPERONI', description: `${PIZZA_BASE_DESCRIPTION}, jamón serrano y pepperoni.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'pepperoni pizza' },
  { name: 'NAPOLITANA', description: `${PIZZA_BASE_DESCRIPTION}, anchoas, aceitunas negras y pimiento rojo.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'napolitana pizza' },
  { name: 'VEGETARIANA', description: `${PIZZA_BASE_DESCRIPTION}, alcachofas, champiñón, cebolla y pimientos.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'vegetariana pizza' },
  { name: 'MARINERA', description: `${PIZZA_BASE_DESCRIPTION}, gambas, mejillones y atún.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'marinera pizza' },
  { name: 'HAWAI', description: `${PIZZA_BASE_DESCRIPTION}, jamón dulce y piña.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'hawai pizza' },
  { name: 'MAR Y TIERRA', description: `${PIZZA_BASE_DESCRIPTION}, bacon, jamón dulce, atún, huevo y gambas.`, price: 12.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'mar tierra pizza' },
  { name: 'JAMÓN YORK', description: `${PIZZA_BASE_DESCRIPTION}, jamón york.`, price: 9.50, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'jamon york pizza' },
  { name: 'FUNGHI', description: `${PIZZA_BASE_DESCRIPTION}, jamón york, champiñones y roquefort.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'funghi pizza' },
  { name: 'GRIEGA', description: `${PIZZA_BASE_DESCRIPTION}, pechuga de pollo y salsa de yogurt.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'griega pizza' },
  { name: 'KEBAB Pizza', description: `${PIZZA_BASE_DESCRIPTION}, pechuga de pollo y salsa de kebab.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'kebab pizza' }, // Renamed to avoid conflict with Kebab side
  { name: 'DIET', description: `${PIZZA_BASE_DESCRIPTION}, pechuga de pollo, alcachofas y piña.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'diet pizza' },
  { name: 'TEXAS', description: `${PIZZA_BASE_DESCRIPTION}, barbacoa, bacon y cebolla crujiente.`, price: 11.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'texas pizza' },
  { name: 'SERRANILLO', description: `${PIZZA_BASE_DESCRIPTION}, jamón dulce, jamón serrano, aceitunas verdes, tomate natural y extra de mozzarella.`, price: 11.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'serranillo pizza' },
  { name: '4 ESTACIONES', description: `${PIZZA_BASE_DESCRIPTION}, alcachofas, champiñón, pimiento rojo y jamón dulce.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'estaciones pizza' },
  { name: 'ATÚN Pizza', description: `${PIZZA_BASE_DESCRIPTION}, atún, pimiento rojo y cebolla.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'atun pizza' }, // Renamed
  { name: 'BARBACOA Pizza', description: `${PIZZA_BASE_DESCRIPTION}, carne picada con salsa barbacoa.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'barbacoa pizza' }, // Renamed
  { name: 'INFANTIL', description: `${PIZZA_BASE_DESCRIPTION}, jamón dulce y bacon.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'infantil pizza' },
  { name: 'MIXTA', description: `${PIZZA_BASE_DESCRIPTION}, jamón serrano, pepperoni y jamón dulce.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'mixta pizza' },
  { name: 'BACON Pizza', description: `${PIZZA_BASE_DESCRIPTION}, bacon, huevo y pimiento rojo.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'bacon pizza' }, // Renamed
  { name: 'RACHEL', description: `${PIZZA_BASE_DESCRIPTION}, cuatro quesos, nueces, jamón dulce y pasas.`, price: 12.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'rachel pizza' },
  { name: 'CAROLINA', description: `${PIZZA_BASE_DESCRIPTION}, lomo adobado, queso y huevo.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'carolina pizza' },
  { name: 'AINHOA', description: `${PIZZA_BASE_DESCRIPTION}, jamón serrano y bacon.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'ainhoa pizza' },
  { name: 'ALEX', description: `${PIZZA_BASE_DESCRIPTION}, atún, nata y jamón dulce.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'alex pizza' },
  { name: 'TROPICAL', description: `${PIZZA_BASE_DESCRIPTION}, J. york, piña y perlas de queso de cabra y dulce de membrillo.`, price: 11.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'tropical pizza' },
  { name: 'ROMANA', description: `${PIZZA_BASE_DESCRIPTION}, bacon, champiñones y huevo.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'romana pizza' },
  { name: 'CAPRICHO', description: `${PIZZA_BASE_DESCRIPTION}, J. york, atún, queso manchego, perlas de queso de cabra y dulce de membrillo.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'capricho pizza' },
  { name: 'DE LA HUERTA', description: `${PIZZA_BASE_DESCRIPTION}, champiñones, pimiento verde, aceitunas negras, alcachofas y cebolla crujiente.`, price: 10.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'huerta pizza' },
  { name: 'MOGOLLÓN', description: `${PIZZA_BASE_DESCRIPTION}, lomo adobado, bacon, champiñones, pepperoni, pimiento rojo y aceitunas negras.`, price: 12.00, category: 'Pizzas', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'mogollon pizza' },

  // Hamburguesas -> Category: Sides
  { name: 'HAMBURGUESA SIMPLE', description: 'Tomate, lechuga, cebolla y carne.', price: 4.00, category: 'Sides', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'hamburguesa simple' },
  { name: 'HAMBURGUESA COMPLETA', description: 'Tomate, lechuga, cebolla, queso y bacon.', price: 4.50, category: 'Sides', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'hamburguesa completa' },

  // Sandwiches -> Category: Sides
  { name: 'SANDWICH MIXTO', description: 'Jamón york y queso.', price: 3.50, category: 'Sides', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'sandwich mixto' },

  // Kebabs -> Category: Sides
  { name: 'KEBAB DE POLLO', description: 'Tomate, lechuga, cebolla y salsa.', price: 5.00, category: 'Sides', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'kebab pollo' },
  
  // Raciones -> Category: Sides
  { name: 'RACIÓN QUESO FRITO', description: 'Deliciosa ración de queso frito.', price: 9.00, category: 'Sides', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'queso frito' },
  { name: 'RACIÓN PATATAS BRAVAS/ALIOLI', description: 'Patatas con salsa brava o alioli.', price: 8.00, category: 'Sides', imageUrl: DEFAULT_FOOD_IMAGE, dataAiHint: 'patatas bravas' },

  // Bebidas -> Category: Drinks
  { name: 'LATA COCA-COLA', description: 'Lata de Coca-Cola (33cl).', price: 2.00, category: 'Drinks', imageUrl: DEFAULT_DRINK_IMAGE, dataAiHint: 'coca cola' },
  { name: 'BOTELLA COCA-COLA 2L', description: 'Botella de Coca-Cola (2L).', price: 4.00, category: 'Drinks', imageUrl: DEFAULT_DRINK_IMAGE, dataAiHint: 'coca cola botella' },
  { name: 'CERVEZA', description: 'Cerveza en lata o tercio.', price: 2.00, category: 'Drinks', imageUrl: DEFAULT_DRINK_IMAGE, dataAiHint: 'cerveza' },
  { name: 'AGUA MINERAL', description: 'Botella de agua mineral (50cl).', price: 1.00, category: 'Drinks', imageUrl: DEFAULT_DRINK_IMAGE, dataAiHint: 'agua mineral' },
];
