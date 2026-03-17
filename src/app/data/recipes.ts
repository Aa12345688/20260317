// 食譜數據結構定義
export interface Recipe {
  id: string;
  name: string; // 菜名
  image: string; // 圖片連結
  time: string; // 烹飪時間
  difficulty: "easy" | "medium" | "hard"; // 難度
  category: "vegetable" | "fruit" | "meat" | "mixed"; // 分類
  requiredIngredients: string[]; // 必備食材
  optionalIngredients: string[]; // 可選/推薦搭配食材
  matchScore: number; // 匹配分數
  description: string; // 簡介
  steps?: { title: string; description: string }[];
  sustainabilityTip?: string;
  substitutionTip?: string;
}

export const recipeDatabase: Recipe[] = [
  // Vegetable Recipes
  {
    id: "tomato-pasta",
    name: "Zesty Tomato Pasta",
    image: "https://images.unsplash.com/photo-1714385988516-85f063e4fcdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwcGFzdGElMjB0b21hdG8lMjBzYXVjZXxlbnwxfHx8fDE3NzI2MTIxODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    time: "25 min",
    difficulty: "easy",
    category: "vegetable",
    requiredIngredients: ["Tomatoes"],
    optionalIngredients: ["Spinach", "Garlic", "Olive Oil"],
    matchScore: 35,
    description: "Fresh tomato pasta with aromatic herbs",
    steps: [{ title: "水煮麵條", description: "將義大利麵放入鹽水中煮熟。" }, { title: "調製醬汁", description: "將番茄與大蒜拌炒成醬。" }]
  },
  {
    id: "spinach-frittata",
    name: "Spinach-Tomato Frittata",
    image: "https://images.unsplash.com/photo-1766375884263-016cd780fa1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGluYWNoJTIwZnJpdHRhdGElMjBlZ2clMjBkaXNofGVufDF8fHx8MTc3MjYxMjE4NXww&ixlib=rb-4.1.0&q=80&w=1080",
    time: "20 min",
    difficulty: "easy",
    category: "vegetable",
    requiredIngredients: ["Spinach", "Tomatoes"],
    optionalIngredients: ["Cheese", "Onions"],
    matchScore: 40,
    description: "Protein-packed vegetable frittata",
    steps: [{ title: "炒蔬菜", description: "將菠菜與番茄略炒。" }, { title: "煎蛋餅", description: "倒入蛋液煎至金黃。" }]
  },
  {
    id: "mediterranean-salad",
    name: "Mediterranean Harvest Salad",
    image: "https://images.unsplash.com/photo-1769481614068-47cfb4d1f125?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwc2FsYWQlMjBmcmVzaCUyMHZlZ2V0YWJsZXN8ZW58MXx8fHwxNzcyNjEyMTg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    time: "15 min",
    difficulty: "easy",
    category: "vegetable",
    requiredIngredients: ["Spinach", "Tomatoes"],
    optionalIngredients: ["Cucumber", "Feta Cheese", "Olives"],
    matchScore: 30,
    description: "Fresh and healthy Mediterranean bowl",
    steps: [{ title: "準備食材", description: "將所有蔬菜切丁。" }, { title: "拌勻", description: "加入橄欖油與起司拌勻。" }]
  },
  {
    id: "veggie-stir-fry",
    name: "Asian Vegetable Stir-Fry",
    image: "https://images.unsplash.com/photo-1758979690131-11e2aa0b142b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFibGUlMjBzdGlyJTIwZnJ5JTIwYXNpYW58ZW58MXx8fHwxNzcyNjAxOTg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    time: "18 min",
    difficulty: "easy",
    category: "vegetable",
    requiredIngredients: ["Spinach", "Tomatoes", "Celery"],
    optionalIngredients: ["Soy Sauce", "Ginger", "Garlic"],
    matchScore: 45,
    description: "Quick and flavorful Asian-style stir-fry",
    steps: [{ title: "熱鍋", description: "爆香大蒜與生薑。" }, { title: "快炒", description: "快速拌炒所有食材。" }]
  },
  {
    id: "roasted-vegetables",
    name: "Roasted Vegetable Medley",
    image: "https://images.unsplash.com/photo-1762773302175-7583d34b79ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2FzdGVkJTIwdmVnZXRhYmxlcyUyMGNvbG9yZnVsJTIwbWVkbGV5fGVufDF8fHx8MTc3MjYxMjE4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    time: "35 min",
    difficulty: "easy",
    category: "vegetable",
    requiredIngredients: ["Tomatoes"],
    optionalIngredients: ["Bell Peppers", "Zucchini", "Olive Oil"],
    matchScore: 38,
    description: "Colorful oven-roasted vegetables",
    steps: [{ title: "預熱", description: "烤箱預熱至 200度。" }, { title: "烘烤", description: "將蔬菜淋油後烘烤 20分鐘。" }]
  },

  // Fruit Recipes
  {
    id: "fruit-salad",
    name: "Rainbow Fruit Salad",
    image: "https://images.unsplash.com/photo-1564093497595-593b96d80180?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcnVpdCUyMHNhbGFkJTIwYm93bCUyMGNvbG9yZnVsfGVufDF8fHx8MTc3MjYxNjUzNnww&ixlib=rb-4.1.0&q=80&w=1080",
    time: "10 min",
    difficulty: "easy",
    category: "fruit",
    requiredIngredients: ["Apple", "Banana", "Orange"],
    optionalIngredients: ["Honey", "Mint", "Berries"],
    matchScore: 25,
    description: "Fresh and vibrant fruit medley",
    steps: [{ title: "切塊", description: "將所有水果切成一口大小。" }]
  },
  {
    id: "berry-smoothie",
    name: "Berry Blast Smoothie Bowl",
    image: "https://images.unsplash.com/photo-1588068403046-169c80c69938?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZXJyeSUyMHNtb290aGllJTIwYm93bCUyMGZyZXNofGVufDF8fHx8MTc3MjYxNjUzNnww&ixlib=rb-4.1.0&q=80&w=1080",
    time: "8 min",
    difficulty: "easy",
    category: "fruit",
    requiredIngredients: ["Banana", "Strawberry"],
    optionalIngredients: ["Blueberry", "Yogurt", "Granola"],
    matchScore: 30,
    description: "Nutritious and delicious smoothie bowl",
    steps: [{ title: "攪打", description: "將食材放入果汁機攪碎。" }]
  },

  // Meat Recipes
  {
    id: "grilled-chicken",
    name: "Herb Grilled Chicken",
    image: "https://images.unsplash.com/photo-1753775290395-09e3cb0b6f70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMGJyZWFzdCUyMG1lYWx8ZW58MXx8fHwxNzcyNjE2NTM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    time: "30 min",
    difficulty: "medium",
    category: "meat",
    requiredIngredients: ["Chicken"],
    optionalIngredients: ["Rosemary", "Garlic", "Lemon"],
    matchScore: 20,
    description: "Juicy herb-marinated grilled chicken",
    steps: [{ title: "醃製", description: "用香料醃製雞肉 30分鐘。" }, { title: "燒烤", description: "將雞肉烤至全熟。" }]
  },
  {
    id: "beef-stir-fry",
    name: "Beef & Vegetable Stir-Fry",
    image: "https://images.unsplash.com/photo-1760504526069-ff0f8bf6e4ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWVmJTIwc3RpciUyMGZyeSUyMHZlZ2V0YWJsZXN8ZW58MXx8fHwxNzcyNjE2NTM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    time: "25 min",
    difficulty: "medium",
    category: "meat",
    requiredIngredients: ["Beef"],
    optionalIngredients: ["Bell Peppers", "Onions", "Soy Sauce"],
    matchScore: 28,
    description: "Savory beef with crisp vegetables",
    steps: [{ title: "醃肉", description: "將牛肉切片並醃漬。" }, { title: "熱炒", description: "大火快炒肉片與配菜。" }]
  },

  // Mixed Recipes (Meat + Vegetables)
  {
    id: "roasted-chicken-veggies",
    name: "Roasted Chicken & Garden Vegetables",
    image: "https://images.unsplash.com/photo-1762631383362-bad467f94a8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2FzdGVkJTIwY2hpY2tlbiUyMHZlZ2V0YWJsZXMlMjBkaW5uZXJ8ZW58MXx8fHwxNzcyNjE2NTM2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    time: "45 min",
    difficulty: "medium",
    category: "mixed",
    requiredIngredients: ["Chicken", "Tomatoes"],
    optionalIngredients: ["Spinach", "Carrots", "Potatoes"],
    matchScore: 42,
    description: "Complete meal with protein and veggies",
    steps: [{ title: "準備", description: "將所有食材切塊。" }, { title: "烹煮", description: "放入鍋中燉煮至食材軟爛。" }]
  },
];

// 智能食譜推薦算法
export function getRecommendedRecipes(
  userIngredients: Array<{ name: string; quantity: number; category?: string }>
): Array<Recipe & { matchScore: number; matchedIngredients: string[] }> {

  // 食材關鍵字定義，用於判斷用戶食材屬於哪一類
  const categoriesMap = {
    vegetables: ["Tomatoes", "Spinach", "Celery", "Lettuce", "Carrot", "Broccoli", "Cucumber", "Bell Pepper", "Onion", "Garlic"],
    fruits: ["Apple", "Banana", "Orange", "Strawberry", "Blueberry", "Grape", "Mango", "Pineapple"],
    meat: ["Chicken", "Beef", "Pork", "Fish", "Lamb"],
  };

  const userIngredientNames = userIngredients.map(i => i.name.toLowerCase());

  // 統計用戶手中的各類食材數量
  const userCategoryCounts: Record<string, number> = {
    vegetable: 0,
    fruit: 0,
    meat: 0,
    mixed: 0,
  };

  userIngredients.forEach(ingredient => {
    const name = ingredient.name.toLowerCase();
    if (categoriesMap.vegetables.some(v => name.includes(v.toLowerCase()))) {
      userCategoryCounts.vegetable++;
    } else if (categoriesMap.fruits.some(f => name.includes(f.toLowerCase()))) {
      userCategoryCounts.fruit++;
    } else if (categoriesMap.meat.some(m => name.includes(m.toLowerCase()))) {
      userCategoryCounts.meat++;
    }
  });

  // 對數據庫中每道食譜進行評分
  const scoredRecipes = recipeDatabase.map(recipe => {
    let matchScore = 0;
    const matchedIngredients: string[] = [];

    // 1. 比對「必要食材」：若匹配則加 40 分
    recipe.requiredIngredients.forEach(required => {
      if (userIngredientNames.some(ui =>
        ui.includes(required.toLowerCase()) || required.toLowerCase().includes(ui)
      )) {
        matchScore += 40;
        matchedIngredients.push(required);
      }
    });

    // 2. 比對「額外食材」：若匹配則加 10 分
    recipe.optionalIngredients.forEach(optional => {
      if (userIngredientNames.some(ui =>
        ui.includes(optional.toLowerCase()) || optional.toLowerCase().includes(ui)
      )) {
        matchScore += 10;
        matchedIngredients.push(optional);
      }
    });

    // 3. 類別獎勵：若用戶手中食材與食譜類別一致，加 20 分
    if (userCategoryCounts[recipe.category] > 0) {
      matchScore += 20;
    }

    // 4. 複合菜餚獎勵：若食譜是肉菜結合 (mixed) 且用戶剛好有肉有菜，加 30 分
    if (recipe.category === "mixed" && userCategoryCounts.meat > 0 && userCategoryCounts.vegetable > 0) {
      matchScore += 30;
    }

    return {
      ...recipe,
      matchScore,
      matchedIngredients,
    };
  });

  // 排序並過濾：分數越高越前面，最多回傳 6 道推薦菜
  return scoredRecipes
    .filter(r => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
}
