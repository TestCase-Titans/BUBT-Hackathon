import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

const ResourceSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  category: String,
  type: String,
});

const InventorySchema = new mongoose.Schema({
  name: String,
  category: String,
  typicalExpiryDays: Number,
  costPerUnit: Number, // In BDT
  unit: String,
  imageUrl: String,
});

const Resource =
  mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);
const FoodItem =
  mongoose.models.FoodItem || mongoose.model("FoodItem", InventorySchema);

const resources = [
  // --- VEGETABLE ---
  {
    title: "Keeping Green Chilies Fresh",
    category: "Vegetable",
    type: "Tip",
    description:
      "Remove the stems and wrap in a paper towel before refrigerating to keep them fresh for weeks.",
    url: "#",
  },
  {
    title: "Storing Coriander Leaves (Dhonia Pata)",
    category: "Vegetable",
    type: "Tip",
    description:
      "Clean the roots, dry thoroughly, and store in an airtight box lined with tissue paper.",
    url: "#",
  },
  {
    title: "Reviving Wilting Spinach (Shak)",
    category: "Vegetable",
    type: "Tip",
    description:
      "Shock the leaves in ice-cold water for 15 minutes to bring the crunch back.",
    url: "#",
  },
  {
    title: "Zero Waste Vegetable Peels (Bhorta)",
    category: "Vegetable",
    type: "Article",
    description:
      "Don't throw away peels! Boil and mash bottle gourd or pumpkin skins for a delicious Bhorta.",
    url: "#",
  },

  // --- FRUIT ---
  {
    title: "Naturally Ripening Mangoes",
    category: "Fruit",
    type: "Article",
    description:
      "Place green mangoes in your rice drum (chaaler dram) to ripen them naturally without chemicals.",
    url: "#",
  },
  {
    title: "Preserving Jackfruit (Kathal)",
    category: "Fruit",
    type: "Tip",
    description:
      "Oil your knife before cutting. Freeze the seeds for curry and the flesh for smoothies.",
    url: "#",
  },
  {
    title: "Keeping Bananas Fresh",
    category: "Fruit",
    type: "Tip",
    description:
      "Wrap the stems in plastic wrap to slow down the ripening process.",
    url: "#",
  },

  // --- GRAIN ---
  {
    title: "Protecting Rice from Weevils (Poka)",
    category: "Grain",
    type: "Tip",
    description:
      "Place a few dried red chilies or neem leaves inside your rice container to repel bugs.",
    url: "#",
  },
  {
    title: "Crispy Puffed Rice (Muri)",
    category: "Grain",
    type: "Tip",
    description:
      "If Muri gets soggy, dry roast it in a pan for 2 minutes or microwave it to make it crispy again.",
    url: "#",
  },
  {
    title: "Storing Atta & Maida",
    category: "Grain",
    type: "Article",
    description:
      "Keep flour in the fridge during monsoon season to prevent fungus and lumps.",
    url: "#",
  },

  // --- PROTEIN (Fish/Meat) ---
  {
    title: "Storing Hilsa (Ilish) Fish",
    category: "Protein",
    type: "Article",
    description:
      "For long-term storage, cut the fish into pieces and freeze, or freeze whole if consuming within a week.",
    url: "#",
  },
  {
    title: "Beef Preservation Tips",
    category: "Protein",
    type: "Article",
    description:
      "Wash meat thoroughly, drain all water, and mix with a little oil before freezing to prevent freezer burn.",
    url: "#",
  },
  {
    title: "Egg Freshness Test",
    category: "Protein",
    type: "Tip",
    description:
      "Place the egg in water. If it sinks, it's fresh. If it floats, it's spoiled.",
    url: "#",
  },

  // --- DAIRY ---
  {
    title: "Homemade Ghee from Malai",
    category: "Dairy",
    type: "Video",
    description:
      "Save the cream (malai) from your milk daily to make pure homemade ghee.",
    url: "#",
  },
  {
    title: "Keeping Paneer/Chana Fresh",
    category: "Dairy",
    type: "Tip",
    description:
      "Store paneer immersed in water in the fridge and change the water every 2 days.",
    url: "#",
  },

  // --- SNACK ---
  {
    title: "Restoring Soggy Biscuits",
    category: "Snack",
    type: "Tip",
    description:
      "Bake them for 5 minutes or microwave briefly to restore crunchiness.",
    url: "#",
  },
  {
    title: "Chanachur Storage",
    category: "Snack",
    type: "Tip",
    description:
      "Always use a glass jar with a tight lid. Add a sugar cube to absorb excess moisture.",
    url: "#",
  },

  // --- BEVERAGE ---
  {
    title: "Storing Tea Leaves",
    category: "Beverage",
    type: "Tip",
    description:
      "Keep tea leaves away from spices to prevent them from absorbing strong odors.",
    url: "#",
  },
  {
    title: "Green Coconut Water",
    category: "Beverage",
    type: "Tip",
    description:
      "Drink immediately after opening. Freezing changes the taste significantly.",
    url: "#",
  },

  // --- CANNED & CONDIMENTS ---
  {
    title: "Fungus-Free Achar (Pickles)",
    category: "Canned",
    type: "Article",
    description:
      "Ensure a layer of oil always floats on top of the pickle. Put the jar in the sun occasionally.",
    url: "#",
  },
  {
    title: "Tomato Ketchup Hacks",
    category: "Canned",
    type: "Tip",
    description:
      "Store the bottle upside down to minimize air exposure and make dispensing easier.",
    url: "#",
  },

  // --- GENERAL / WASTE REDUCTION ---
  {
    title: "Preventing Spice Clumps",
    category: "General",
    type: "Tip",
    description:
      "Add a few grains of raw rice to your salt and spice shakers to absorb moisture.",
    url: "#",
  },
  {
    title: "Composting at Home",
    category: "Waste Reduction",
    type: "Article",
    description:
      "Use a clay pot (matir hari) on your balcony to turn vegetable scraps into fertilizer.",
    url: "#",
  },
];

const foodItems = [
  // --- GRAINS & STAPLES ---
  {
    name: "Miniket Rice",
    category: "Grain",
    typicalExpiryDays: 365,
    costPerUnit: 75,
    unit: "kg",
    imageUrl: "🍚",
  },
  {
    name: "Nazirshail Rice",
    category: "Grain",
    typicalExpiryDays: 365,
    costPerUnit: 85,
    unit: "kg",
    imageUrl: "🍚",
  },
  {
    name: "Chinigura Rice",
    category: "Grain",
    typicalExpiryDays: 365,
    costPerUnit: 140,
    unit: "kg",
    imageUrl: "🍛",
  },
  {
    name: "Basmati Rice",
    category: "Grain",
    typicalExpiryDays: 365,
    costPerUnit: 350,
    unit: "kg",
    imageUrl: "🥘",
  },
  {
    name: "Atta (Flour)",
    category: "Grain",
    typicalExpiryDays: 90,
    costPerUnit: 60,
    unit: "kg",
    imageUrl: "🌾",
  },
  {
    name: "Maida (Refined Flour)",
    category: "Grain",
    typicalExpiryDays: 90,
    costPerUnit: 75,
    unit: "kg",
    imageUrl: "🥡",
  },
  {
    name: "Semolina (Suji)",
    category: "Grain",
    typicalExpiryDays: 180,
    costPerUnit: 80,
    unit: "kg",
    imageUrl: "🥣",
  },
  {
    name: "Puffed Rice (Muri)",
    category: "Grain",
    typicalExpiryDays: 60,
    costPerUnit: 90,
    unit: "kg",
    imageUrl: "🍿",
  },
  {
    name: "Flattened Rice (Chira)",
    category: "Grain",
    typicalExpiryDays: 90,
    costPerUnit: 80,
    unit: "kg",
    imageUrl: "🥣",
  },
  {
    name: "Spaghetti",
    category: "Grain",
    typicalExpiryDays: 730,
    costPerUnit: 120,
    unit: "pack",
    imageUrl: "🍝",
  },
  {
    name: "Instant Noodles",
    category: "Grain",
    typicalExpiryDays: 180,
    costPerUnit: 25,
    unit: "pack",
    imageUrl: "🍜",
  },

  // --- OILS & FATS ---
  {
    name: "Soybean Oil",
    category: "General",
    typicalExpiryDays: 365,
    costPerUnit: 165,
    unit: "L",
    imageUrl: "🛢️",
  },
  {
    name: "Mustard Oil",
    category: "General",
    typicalExpiryDays: 365,
    costPerUnit: 250,
    unit: "L",
    imageUrl: "🟡",
  },
  {
    name: "Olive Oil",
    category: "General",
    typicalExpiryDays: 540,
    costPerUnit: 1200,
    unit: "L",
    imageUrl: "🫒",
  },
  {
    name: "Butter (Local)",
    category: "Dairy",
    typicalExpiryDays: 30,
    costPerUnit: 400,
    unit: "block",
    imageUrl: "🧈",
  },
  {
    name: "Ghee",
    category: "Dairy",
    typicalExpiryDays: 365,
    costPerUnit: 1400,
    unit: "kg",
    imageUrl: "🍯",
  },

  // --- VEGETABLES ---
  {
    name: "Potato (Alu)",
    category: "Vegetable",
    typicalExpiryDays: 30,
    costPerUnit: 60,
    unit: "kg",
    imageUrl: "🥔",
  },
  {
    name: "Onion (Deshi)",
    category: "Vegetable",
    typicalExpiryDays: 21,
    costPerUnit: 100,
    unit: "kg",
    imageUrl: "🧅",
  },
  {
    name: "Onion (Indian)",
    category: "Vegetable",
    typicalExpiryDays: 21,
    costPerUnit: 80,
    unit: "kg",
    imageUrl: "🧅",
  },
  {
    name: "Garlic",
    category: "Vegetable",
    typicalExpiryDays: 60,
    costPerUnit: 220,
    unit: "kg",
    imageUrl: "🧄",
  },
  {
    name: "Ginger",
    category: "Vegetable",
    typicalExpiryDays: 30,
    costPerUnit: 200,
    unit: "kg",
    imageUrl: "🫚",
  },
  {
    name: "Green Chili",
    category: "Vegetable",
    typicalExpiryDays: 7,
    costPerUnit: 150,
    unit: "kg",
    imageUrl: "🌶️",
  },
  {
    name: "Tomato",
    category: "Vegetable",
    typicalExpiryDays: 7,
    costPerUnit: 60,
    unit: "kg",
    imageUrl: "🍅",
  },
  {
    name: "Eggplant (Brinjal)",
    category: "Vegetable",
    typicalExpiryDays: 5,
    costPerUnit: 70,
    unit: "kg",
    imageUrl: "🍆",
  },
  {
    name: "Cucumber",
    category: "Vegetable",
    typicalExpiryDays: 5,
    costPerUnit: 50,
    unit: "kg",
    imageUrl: "🥒",
  },
  {
    name: "Carrot",
    category: "Vegetable",
    typicalExpiryDays: 14,
    costPerUnit: 80,
    unit: "kg",
    imageUrl: "🥕",
  },
  {
    name: "Cauliflower",
    category: "Vegetable",
    typicalExpiryDays: 5,
    costPerUnit: 50,
    unit: "pc",
    imageUrl: "🥦",
  },
  {
    name: "Cabbage",
    category: "Vegetable",
    typicalExpiryDays: 10,
    costPerUnit: 40,
    unit: "pc",
    imageUrl: "🥬",
  },
  {
    name: "Spinach (Palong)",
    category: "Vegetable",
    typicalExpiryDays: 3,
    costPerUnit: 30,
    unit: "bunch",
    imageUrl: "🥬",
  },
  {
    name: "Red Amaranth (Lal Shak)",
    category: "Vegetable",
    typicalExpiryDays: 3,
    costPerUnit: 25,
    unit: "bunch",
    imageUrl: "🌿",
  },
  {
    name: "Bottle Gourd (Lau)",
    category: "Vegetable",
    typicalExpiryDays: 7,
    costPerUnit: 60,
    unit: "pc",
    imageUrl: "🥒",
  },
  {
    name: "Pumpkin (Mishti Kumra)",
    category: "Vegetable",
    typicalExpiryDays: 30,
    costPerUnit: 40,
    unit: "kg",
    imageUrl: "🎃",
  },
  {
    name: "Okra (Dherosh)",
    category: "Vegetable",
    typicalExpiryDays: 4,
    costPerUnit: 60,
    unit: "kg",
    imageUrl: "🌱",
  },
  {
    name: "Bitter Gourd (Korola)",
    category: "Vegetable",
    typicalExpiryDays: 5,
    costPerUnit: 80,
    unit: "kg",
    imageUrl: "🥒",
  },
  {
    name: "Lemon",
    category: "Vegetable",
    typicalExpiryDays: 10,
    costPerUnit: 10,
    unit: "pc",
    imageUrl: "🍋",
  },
  {
    name: "Coriander Leaves",
    category: "Vegetable",
    typicalExpiryDays: 3,
    costPerUnit: 20,
    unit: "bunch",
    imageUrl: "🌿",
  },

  // --- FRUITS ---
  {
    name: "Banana (Sagor)",
    category: "Fruit",
    typicalExpiryDays: 4,
    costPerUnit: 100,
    unit: "dozen",
    imageUrl: "🍌",
  },
  {
    name: "Mango (Seasonal)",
    category: "Fruit",
    typicalExpiryDays: 6,
    costPerUnit: 120,
    unit: "kg",
    imageUrl: "🥭",
  },
  {
    name: "Jackfruit",
    category: "Fruit",
    typicalExpiryDays: 5,
    costPerUnit: 300,
    unit: "pc",
    imageUrl: "🍈",
  },
  {
    name: "Guava",
    category: "Fruit",
    typicalExpiryDays: 5,
    costPerUnit: 80,
    unit: "kg",
    imageUrl: "🍈",
  },
  {
    name: "Apple (Gala)",
    category: "Fruit",
    typicalExpiryDays: 14,
    costPerUnit: 280,
    unit: "kg",
    imageUrl: "🍎",
  },
  {
    name: "Orange (Malta)",
    category: "Fruit",
    typicalExpiryDays: 10,
    costPerUnit: 220,
    unit: "kg",
    imageUrl: "🍊",
  },
  {
    name: "Grapes",
    category: "Fruit",
    typicalExpiryDays: 5,
    costPerUnit: 350,
    unit: "kg",
    imageUrl: "🍇",
  },
  {
    name: "Watermelon",
    category: "Fruit",
    typicalExpiryDays: 7,
    costPerUnit: 50,
    unit: "kg",
    imageUrl: "🍉",
  },
  {
    name: "Papaya (Ripe)",
    category: "Fruit",
    typicalExpiryDays: 4,
    costPerUnit: 150,
    unit: "kg",
    imageUrl: "🍈",
  },
  {
    name: "Green Coconut",
    category: "Fruit",
    typicalExpiryDays: 3,
    costPerUnit: 90,
    unit: "pc",
    imageUrl: "🥥",
  },
  {
    name: "Lychee (Seasonal)",
    category: "Fruit",
    typicalExpiryDays: 3,
    costPerUnit: 400,
    unit: "100pcs",
    imageUrl: "🔴",
  },

  // --- PROTEIN ---
  {
    name: "Broiler Chicken",
    category: "Protein",
    typicalExpiryDays: 2,
    costPerUnit: 200,
    unit: "kg",
    imageUrl: "🍗",
  },
  {
    name: "Sonali Chicken",
    category: "Protein",
    typicalExpiryDays: 2,
    costPerUnit: 320,
    unit: "kg",
    imageUrl: "🐓",
  },
  {
    name: "Beef (Bone-in)",
    category: "Protein",
    typicalExpiryDays: 3,
    costPerUnit: 780,
    unit: "kg",
    imageUrl: "🥩",
  },
  {
    name: "Beef (Boneless)",
    category: "Protein",
    typicalExpiryDays: 3,
    costPerUnit: 950,
    unit: "kg",
    imageUrl: "🥩",
  },
  {
    name: "Mutton",
    category: "Protein",
    typicalExpiryDays: 3,
    costPerUnit: 1100,
    unit: "kg",
    imageUrl: "🍖",
  },
  {
    name: "Farm Eggs",
    category: "Protein",
    typicalExpiryDays: 21,
    costPerUnit: 150,
    unit: "dozen",
    imageUrl: "🥚",
  },
  {
    name: "Duck Eggs",
    category: "Protein",
    typicalExpiryDays: 21,
    costPerUnit: 200,
    unit: "dozen",
    imageUrl: "🥚",
  },
  {
    name: "Rui Fish",
    category: "Protein",
    typicalExpiryDays: 2,
    costPerUnit: 450,
    unit: "kg",
    imageUrl: "🐟",
  },
  {
    name: "Hilsha Fish",
    category: "Protein",
    typicalExpiryDays: 2,
    costPerUnit: 1500,
    unit: "kg",
    imageUrl: "🐟",
  },
  {
    name: "Pangash Fish",
    category: "Protein",
    typicalExpiryDays: 2,
    costPerUnit: 180,
    unit: "kg",
    imageUrl: "🐟",
  },
  {
    name: "Tilapia Fish",
    category: "Protein",
    typicalExpiryDays: 2,
    costPerUnit: 220,
    unit: "kg",
    imageUrl: "🐟",
  },
  {
    name: "Shrimp (Chingri)",
    category: "Protein",
    typicalExpiryDays: 2,
    costPerUnit: 800,
    unit: "kg",
    imageUrl: "🦐",
  },
  {
    name: "Dried Fish (Shutki)",
    category: "Protein",
    typicalExpiryDays: 180,
    costPerUnit: 1200,
    unit: "kg",
    imageUrl: "🐟",
  },
  {
    name: "Lentils (Mosur Dal)",
    category: "Protein",
    typicalExpiryDays: 180,
    costPerUnit: 130,
    unit: "kg",
    imageUrl: "🥘",
  },
  {
    name: "Mug Dal",
    category: "Protein",
    typicalExpiryDays: 180,
    costPerUnit: 160,
    unit: "kg",
    imageUrl: "🥘",
  },
  {
    name: "Chickpeas (Chola)",
    category: "Protein",
    typicalExpiryDays: 365,
    costPerUnit: 110,
    unit: "kg",
    imageUrl: "🥣",
  },

  // --- DAIRY & OTHERS ---
  {
    name: "Liquid Milk (Packaged)",
    category: "Dairy",
    typicalExpiryDays: 2,
    costPerUnit: 90,
    unit: "L",
    imageUrl: "🥛",
  },
  {
    name: "Powder Milk (Dano/Marks)",
    category: "Dairy",
    typicalExpiryDays: 365,
    costPerUnit: 850,
    unit: "kg",
    imageUrl: "🥛",
  },
  {
    name: "Yogurt (Plain)",
    category: "Dairy",
    typicalExpiryDays: 7,
    costPerUnit: 180,
    unit: "kg",
    imageUrl: "🥣",
  },
  {
    name: "Paneer",
    category: "Dairy",
    typicalExpiryDays: 10,
    costPerUnit: 800,
    unit: "kg",
    imageUrl: "🧀",
  },

  // --- SPICES & CONDIMENTS ---
  {
    name: "Sugar",
    category: "General",
    typicalExpiryDays: 730,
    costPerUnit: 140,
    unit: "kg",
    imageUrl: "🧂",
  },
  {
    name: "Salt",
    category: "General",
    typicalExpiryDays: 730,
    costPerUnit: 40,
    unit: "kg",
    imageUrl: "🧂",
  },
  {
    name: "Turmeric Powder",
    category: "General",
    typicalExpiryDays: 365,
    costPerUnit: 300,
    unit: "kg",
    imageUrl: "🟠",
  },
  {
    name: "Chili Powder",
    category: "General",
    typicalExpiryDays: 365,
    costPerUnit: 450,
    unit: "kg",
    imageUrl: "🌶️",
  },
  {
    name: "Cumin Seeds",
    category: "General",
    typicalExpiryDays: 365,
    costPerUnit: 1200,
    unit: "kg",
    imageUrl: "🟤",
  },
  {
    name: "Tea Leaves",
    category: "General",
    typicalExpiryDays: 365,
    costPerUnit: 550,
    unit: "kg",
    imageUrl: "☕",
  },
  {
    name: "Tomato Ketchup",
    category: "Canned",
    typicalExpiryDays: 365,
    costPerUnit: 250,
    unit: "bottle",
    imageUrl: "🍅",
  },

  // --- SNACKS ---
  {
    name: "Chanachur",
    category: "General",
    typicalExpiryDays: 90,
    costPerUnit: 150,
    unit: "pack",
    imageUrl: "🥜",
  },
  {
    name: "Biscuits (Digestive)",
    category: "General",
    typicalExpiryDays: 180,
    costPerUnit: 120,
    unit: "pack",
    imageUrl: "🍪",
  },
  {
    name: "Toast Biscuit",
    category: "General",
    typicalExpiryDays: 60,
    costPerUnit: 80,
    unit: "pack",
    imageUrl: "🍞",
  },
];

console.log("Starting Seed...");

try {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to Database.");

  await Resource.deleteMany({});
  await FoodItem.deleteMany({});

  await Resource.insertMany(resources);
  await FoodItem.insertMany(foodItems);

  console.log(`Seeded ${resources.length} Resources.`);
  console.log(`Seeded ${foodItems.length} Food Items.`);
} catch (error) {
  console.error("Seeding Error:", error);
} finally {
  await mongoose.connection.close();
  console.log("Connection Closed.");
  process.exit();
}
