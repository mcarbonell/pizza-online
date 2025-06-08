
import type { AllergenDisplayInfo, AllergenCode } from '@/lib/types';

export const ALLERGEN_LIST: AllergenDisplayInfo[] = [
  { code: 'gluten', name: 'Gluten', iconName: 'gluten-icon', description: 'Trigo, centeno, cebada, avena, espelta, kamut o sus variedades híbridas y productos derivados.' },
  { code: 'crustaceos', name: 'Crustáceos', iconName: 'crustaceos-icon', description: 'Crustáceos y productos a base de crustáceos.' },
  { code: 'huevos', name: 'Huevos', iconName: 'huevos-icon', description: 'Huevos y productos a base de huevo.' },
  { code: 'pescado', name: 'Pescado', iconName: 'pescado-icon', description: 'Pescado y productos a base de pescado.' },
  { code: 'cacahuetes', name: 'Cacahuetes', iconName: 'cacahuetes-icon', description: 'Cacahuetes y productos a base de cacahuetes.' },
  { code: 'soja', name: 'Soja', iconName: 'soja-icon', description: 'Soja y productos a base de soja.' },
  { code: 'lacteos', name: 'Lácteos', iconName: 'lacteos-icon', description: 'Leche y sus derivados (incluida la lactosa).' },
  { code: 'frutos_sec_cascara', name: 'Frutos de cáscara', iconName: 'frutos_sec_cascara-icon', description: 'Almendras, avellanas, nueces, anacardos, pacanas, nueces de Brasil, pistachos, macadamias y productos derivados.' },
  { code: 'apio', name: 'Apio', iconName: 'apio-icon', description: 'Apio y productos derivados.' },
  { code: 'mostaza', name: 'Mostaza', iconName: 'mostaza-icon', description: 'Mostaza y productos derivados.' },
  { code: 'sesamo', name: 'Sésamo', iconName: 'sesamo-icon', description: 'Granos de sésamo y productos a base de granos de sésamo.' },
  { code: 'sulfitos', name: 'Sulfitos', iconName: 'sulfitos-icon', description: 'Dióxido de azufre y sulfitos en concentraciones superiores a 10 mg/kg o 10 mg/litro.' },
  { code: 'altramuces', name: 'Altramuces', iconName: 'altramuces-icon', description: 'Altramuces y productos a base de altramuces.' },
  { code: 'moluscos', name: 'Moluscos', iconName: 'moluscos-icon', description: 'Moluscos y productos a base de moluscos.' },
];

export const COMMON_PIZZA_ALLERGENS: AllergenCode[] = ['gluten', 'lacteos', 'sulfitos'];
