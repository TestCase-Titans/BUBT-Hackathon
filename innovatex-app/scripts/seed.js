import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

// --- 1. SCHEMAS ---

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  householdSize: { type: Number, default: 1 },
  dietaryPreferences: [String],
  budgetRange: String,
  location: String,
  image: String, 
  impactScore: { type: Number, default: 0 }, 
});

const ActionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
    itemName: String,
    category: [String],
    cost: Number,
    actionType: {
      type: String,
      enum: ["ADD", "CONSUME", "WASTE", "DELETE"],
      required: true,
    },
    quantityChanged: Number,
    unit: String,
    reason: String,
  },
  { timestamps: true }
);

const ResourceSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  category: String,
  type: String,
});

const FoodItemSchema = new mongoose.Schema({
  name: String,
  category: [String],
  typicalExpiryDays: Number,
  costPerUnit: Number,
  unit: String,
  imageUrl: String,
});

// [NEW] SuperAdmin Schema for Seeding
const SuperAdminSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, default: "superadmin" },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const ActionLog = mongoose.models.ActionLog || mongoose.model("ActionLog", ActionLogSchema);
const Resource = mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);
const FoodItem = mongoose.models.FoodItem || mongoose.model("FoodItem", FoodItemSchema);
const SuperAdmin = mongoose.models.SuperAdmin || mongoose.model("SuperAdmin", SuperAdminSchema);

// --- 2. STATIC DATA ---

const resources = [
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
  {
    title: "Storing Hilsa (Ilish) Fish",
    category: "Fish Protein",
    type: "Article",
    description:
      "For long-term storage, cut the fish into pieces and freeze, or freeze whole if consuming within a week.",
    url: "#",
  },
  {
    title: "Beef Preservation Tips",
    category: "Meat Protein",
    type: "Article",
    description:
      "Wash meat thoroughly, drain all water, and mix with a little oil before freezing to prevent freezer burn.",
    url: "#",
  },
  {
    title: "Egg Freshness Test",
    category: "Dairy Protein",
    type: "Tip",
    description:
      "Place the egg in water. If it sinks, it's fresh. If it floats, it's spoiled.",
    url: "#",
  },
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
  {
    name: "Miniket Rice",
    category: ["Grain"],
    typicalExpiryDays: 365,
    costPerUnit: 75,
    unit: "kg",
    imageUrl: "🍚",
  },
  {
    name: "Nazirshail Rice",
    category: ["Grain"],
    typicalExpiryDays: 365,
    costPerUnit: 85,
    unit: "kg",
    imageUrl: "🍚",
  },
  {
    name: "Chinigura Rice",
    category: ["Grain"],
    typicalExpiryDays: 365,
    costPerUnit: 140,
    unit: "kg",
    imageUrl: "🍛",
  },
  {
    name: "Basmati Rice",
    category: ["Grain"],
    typicalExpiryDays: 365,
    costPerUnit: 350,
    unit: "kg",
    imageUrl: "🥘",
  },
  {
    name: "Atta (Flour)",
    category: ["Grain"],
    typicalExpiryDays: 90,
    costPerUnit: 60,
    unit: "kg",
    imageUrl: "🌾",
  },
  {
    name: "Maida (Refined Flour)",
    category: ["Grain"],
    typicalExpiryDays: 90,
    costPerUnit: 75,
    unit: "kg",
    imageUrl: "🥡",
  },
  {
    name: "Semolina (Suji)",
    category: ["Grain"],
    typicalExpiryDays: 180,
    costPerUnit: 80,
    unit: "kg",
    imageUrl: "🥣",
  },
  {
    name: "Puffed Rice (Muri)",
    category: ["Grain", "Snack"],
    typicalExpiryDays: 60,
    costPerUnit: 90,
    unit: "kg",
    imageUrl: "🍿",
  },
  {
    name: "Flattened Rice (Chira)",
    category: ["Grain"],
    typicalExpiryDays: 90,
    costPerUnit: 80,
    unit: "kg",
    imageUrl: "🥣",
  },
  {
    name: "Spaghetti",
    category: ["Grain"],
    typicalExpiryDays: 730,
    costPerUnit: 120,
    unit: "pack",
    imageUrl: "🍝",
  },
  {
    name: "Instant Noodles",
    category: ["Grain", "Snack"],
    typicalExpiryDays: 180,
    costPerUnit: 25,
    unit: "pack",
    imageUrl: "🍜",
  },
  {
    name: "Potato (Alu)",
    category: ["Vegetable"],
    typicalExpiryDays: 30,
    costPerUnit: 60,
    unit: "kg",
    imageUrl: "🥔",
  },
  {
    name: "Onion (Deshi)",
    category: ["Vegetable"],
    typicalExpiryDays: 21,
    costPerUnit: 100,
    unit: "kg",
    imageUrl: "🧅",
  },
  {
    name: "Onion (Indian)",
    category: ["Vegetable"],
    typicalExpiryDays: 21,
    costPerUnit: 80,
    unit: "kg",
    imageUrl: "🧅",
  },
  {
    name: "Garlic",
    category: ["Vegetable"],
    typicalExpiryDays: 60,
    costPerUnit: 220,
    unit: "kg",
    imageUrl: "🧄",
  },
  {
    name: "Ginger",
    category: ["Vegetable"],
    typicalExpiryDays: 30,
    costPerUnit: 200,
    unit: "kg",
    imageUrl: "🫚",
  },
  {
    name: "Green Chili",
    category: ["Vegetable", "Spices"],
    typicalExpiryDays: 7,
    costPerUnit: 150,
    unit: "kg",
    imageUrl: "🌶️",
  },
  {
    name: "Tomato",
    category: ["Vegetable"],
    typicalExpiryDays: 7,
    costPerUnit: 60,
    unit: "kg",
    imageUrl: "🍅",
  },
  {
    name: "Eggplant (Brinjal)",
    category: ["Vegetable"],
    typicalExpiryDays: 5,
    costPerUnit: 70,
    unit: "kg",
    imageUrl: "🍆",
  },
  {
    name: "Cucumber",
    category: ["Vegetable"],
    typicalExpiryDays: 5,
    costPerUnit: 50,
    unit: "kg",
    imageUrl: "🥒",
  },
  {
    name: "Carrot",
    category: ["Vegetable"],
    typicalExpiryDays: 14,
    costPerUnit: 80,
    unit: "kg",
    imageUrl: "🥕",
  },
  {
    name: "Cauliflower",
    category: ["Vegetable"],
    typicalExpiryDays: 5,
    costPerUnit: 50,
    unit: "pc",
    imageUrl: "🥦",
  },
  {
    name: "Cabbage",
    category: ["Vegetable"],
    typicalExpiryDays: 10,
    costPerUnit: 40,
    unit: "pc",
    imageUrl: "🥬",
  },
  {
    name: "Spinach (Palong)",
    category: ["Vegetable"],
    typicalExpiryDays: 3,
    costPerUnit: 30,
    unit: "bunch",
    imageUrl: "🥬",
  },
  {
    name: "Red Amaranth (Lal Shak)",
    category: ["Vegetable"],
    typicalExpiryDays: 3,
    costPerUnit: 25,
    unit: "bunch",
    imageUrl: "🌿",
  },
  {
    name: "Bottle Gourd (Lau)",
    category: ["Vegetable"],
    typicalExpiryDays: 7,
    costPerUnit: 60,
    unit: "pc",
    imageUrl: "🥒",
  },
  {
    name: "Pumpkin (Mishti Kumra)",
    category: ["Vegetable"],
    typicalExpiryDays: 30,
    costPerUnit: 40,
    unit: "kg",
    imageUrl: "🎃",
  },
  {
    name: "Okra (Dherosh)",
    category: ["Vegetable"],
    typicalExpiryDays: 4,
    costPerUnit: 60,
    unit: "kg",
    imageUrl: "🌱",
  },
  {
    name: "Bitter Gourd (Korola)",
    category: ["Vegetable"],
    typicalExpiryDays: 5,
    costPerUnit: 80,
    unit: "kg",
    imageUrl: "🥒",
  },
  {
    name: "Lemon",
    category: ["Vegetable"],
    typicalExpiryDays: 10,
    costPerUnit: 10,
    unit: "pc",
    imageUrl: "🍋",
  },
  {
    name: "Coriander Leaves",
    category: ["Vegetable", "Spices"],
    typicalExpiryDays: 3,
    costPerUnit: 20,
    unit: "bunch",
    imageUrl: "🌿",
  },
  {
    name: "Banana (Sagor)",
    category: ["Fruit"],
    typicalExpiryDays: 4,
    costPerUnit: 100,
    unit: "dozen",
    imageUrl: "🍌",
  },
  {
    name: "Mango (Seasonal)",
    category: ["Fruit"],
    typicalExpiryDays: 6,
    costPerUnit: 120,
    unit: "kg",
    imageUrl: "🥭",
  },
  {
    name: "Jackfruit",
    category: ["Fruit"],
    typicalExpiryDays: 5,
    costPerUnit: 300,
    unit: "pc",
    imageUrl: "🍈",
  },
  {
    name: "Guava",
    category: ["Fruit"],
    typicalExpiryDays: 5,
    costPerUnit: 80,
    unit: "kg",
    imageUrl: "🍈",
  },
  {
    name: "Apple (Gala)",
    category: ["Fruit"],
    typicalExpiryDays: 14,
    costPerUnit: 280,
    unit: "kg",
    imageUrl: "🍎",
  },
  {
    name: "Orange (Malta)",
    category: ["Fruit"],
    typicalExpiryDays: 10,
    costPerUnit: 220,
    unit: "kg",
    imageUrl: "🍊",
  },
  {
    name: "Grapes",
    category: ["Fruit"],
    typicalExpiryDays: 5,
    costPerUnit: 350,
    unit: "kg",
    imageUrl: "🍇",
  },
  {
    name: "Watermelon",
    category: ["Fruit"],
    typicalExpiryDays: 7,
    costPerUnit: 50,
    unit: "kg",
    imageUrl: "🍉",
  },
  {
    name: "Papaya (Ripe)",
    category: ["Fruit"],
    typicalExpiryDays: 4,
    costPerUnit: 150,
    unit: "kg",
    imageUrl: "🍈",
  },
  {
    name: "Green Coconut",
    category: ["Fruit"],
    typicalExpiryDays: 3,
    costPerUnit: 90,
    unit: "pc",
    imageUrl: "🥥",
  },
  {
    name: "Lychee (Seasonal)",
    category: ["Fruit"],
    typicalExpiryDays: 3,
    costPerUnit: 400,
    unit: "100pcs",
    imageUrl: "🔴",
  },
  {
    name: "Broiler Chicken",
    category: ["Meat Protein"],
    typicalExpiryDays: 2,
    costPerUnit: 200,
    unit: "kg",
    imageUrl: "🍗",
  },
  {
    name: "Sonali Chicken",
    category: ["Meat Protein"],
    typicalExpiryDays: 2,
    costPerUnit: 320,
    unit: "kg",
    imageUrl: "🐓",
  },
  {
    name: "Beef (Bone-in)",
    category: ["Meat Protein"],
    typicalExpiryDays: 3,
    costPerUnit: 780,
    unit: "kg",
    imageUrl: "🥩",
  },
  {
    name: "Beef (Boneless)",
    category: ["Meat Protein"],
    typicalExpiryDays: 3,
    costPerUnit: 950,
    unit: "kg",
    imageUrl: "🥩",
  },
  {
    name: "Mutton",
    category: ["Meat Protein"],
    typicalExpiryDays: 3,
    costPerUnit: 1100,
    unit: "kg",
    imageUrl: "🍖",
  },
  {
    name: "Rui Fish",
    category: ["Fish Protein"],
    typicalExpiryDays: 2,
    costPerUnit: 450,
    unit: "kg",
    imageUrl: "🐟",
  },
  {
    name: "Hilsha Fish",
    category: ["Fish Protein"],
    typicalExpiryDays: 2,
    costPerUnit: 1500,
    unit: "kg",
    imageUrl: "🐟",
  },
  {
    name: "Pangash Fish",
    category: ["Fish Protein"],
    typicalExpiryDays: 2,
    costPerUnit: 180,
    unit: "kg",
    imageUrl: "🐟",
  },
  {
    name: "Tilapia Fish",
    category: ["Fish Protein"],
    typicalExpiryDays: 2,
    costPerUnit: 220,
    unit: "kg",
    imageUrl: "🐟",
  },
  {
    name: "Shrimp (Chingri)",
    category: ["Fish Protein"],
    typicalExpiryDays: 2,
    costPerUnit: 800,
    unit: "kg",
    imageUrl: "🦐",
  },
  {
    name: "Dried Fish (Shutki)",
    category: ["Fish Protein"],
    typicalExpiryDays: 180,
    costPerUnit: 1200,
    unit: "kg",
    imageUrl: "🐟",
  },
  {
    name: "Farm Eggs",
    category: ["Dairy Protein", "Protein"],
    typicalExpiryDays: 21,
    costPerUnit: 150,
    unit: "dozen",
    imageUrl: "🥚",
  },
  {
    name: "Duck Eggs",
    category: ["Dairy Protein", "Protein"],
    typicalExpiryDays: 21,
    costPerUnit: 200,
    unit: "dozen",
    imageUrl: "🥚",
  },
  {
    name: "Liquid Milk (Packaged)",
    category: ["Dairy", "Dairy Protein"],
    typicalExpiryDays: 2,
    costPerUnit: 90,
    unit: "L",
    imageUrl: "🥛",
  },
  {
    name: "Powder Milk (Dano/Marks)",
    category: ["Dairy", "Dairy Protein"],
    typicalExpiryDays: 365,
    costPerUnit: 850,
    unit: "kg",
    imageUrl: "🥛",
  },
  {
    name: "Yogurt (Plain)",
    category: ["Dairy", "Dairy Protein"],
    typicalExpiryDays: 7,
    costPerUnit: 180,
    unit: "kg",
    imageUrl: "🥣",
  },
  {
    name: "Paneer",
    category: ["Dairy Protein", "Dairy"],
    typicalExpiryDays: 10,
    costPerUnit: 800,
    unit: "kg",
    imageUrl: "🧀",
  },
  {
    name: "Butter (Local)",
    category: ["Dairy", "Fats"],
    typicalExpiryDays: 30,
    costPerUnit: 400,
    unit: "block",
    imageUrl: "🧈",
  },
  {
    name: "Ghee",
    category: ["Dairy", "Fats"],
    typicalExpiryDays: 365,
    costPerUnit: 1400,
    unit: "kg",
    imageUrl: "🍯",
  },
  {
    name: "Lentils (Mosur Dal)",
    category: ["Vegetable Protein", "Grain"],
    typicalExpiryDays: 180,
    costPerUnit: 130,
    unit: "kg",
    imageUrl: "🥘",
  },
  {
    name: "Mug Dal",
    category: ["Vegetable Protein", "Grain"],
    typicalExpiryDays: 180,
    costPerUnit: 160,
    unit: "kg",
    imageUrl: "🥘",
  },
  {
    name: "Chickpeas (Chola)",
    category: ["Vegetable Protein", "Grain"],
    typicalExpiryDays: 365,
    costPerUnit: 110,
    unit: "kg",
    imageUrl: "🥣",
  },
  {
    name: "Soybean Oil",
    category: ["Fats", "General"],
    typicalExpiryDays: 365,
    costPerUnit: 165,
    unit: "L",
    imageUrl: "🛢️",
  },
  {
    name: "Mustard Oil",
    category: ["Fats", "General"],
    typicalExpiryDays: 365,
    costPerUnit: 250,
    unit: "L",
    imageUrl: "🟡",
  },
  {
    name: "Olive Oil",
    category: ["Fats", "General"],
    typicalExpiryDays: 540,
    costPerUnit: 1200,
    unit: "L",
    imageUrl: "🫒",
  },
  {
    name: "Sugar",
    category: ["General"],
    typicalExpiryDays: 730,
    costPerUnit: 140,
    unit: "kg",
    imageUrl: "🧂",
  },
  {
    name: "Salt",
    category: ["General"],
    typicalExpiryDays: 730,
    costPerUnit: 40,
    unit: "kg",
    imageUrl: "🧂",
  },
  {
    name: "Turmeric Powder",
    category: ["Spices"],
    typicalExpiryDays: 365,
    costPerUnit: 300,
    unit: "kg",
    imageUrl: "🟠",
  },
  {
    name: "Chili Powder",
    category: ["Spices"],
    typicalExpiryDays: 365,
    costPerUnit: 450,
    unit: "kg",
    imageUrl: "🌶️",
  },
  {
    name: "Cumin Seeds",
    category: ["Spices"],
    typicalExpiryDays: 365,
    costPerUnit: 1200,
    unit: "kg",
    imageUrl: "🟤",
  },
  {
    name: "Tea Leaves",
    category: ["General"],
    typicalExpiryDays: 365,
    costPerUnit: 550,
    unit: "kg",
    imageUrl: "☕",
  },
  {
    name: "Tomato Ketchup",
    category: ["Canned"],
    typicalExpiryDays: 365,
    costPerUnit: 250,
    unit: "bottle",
    imageUrl: "🍅",
  },
  {
    name: "Chanachur",
    category: ["Snack"],
    typicalExpiryDays: 90,
    costPerUnit: 150,
    unit: "pack",
    imageUrl: "🥜",
  },
  {
    name: "Biscuits (Digestive)",
    category: ["Snack"],
    typicalExpiryDays: 180,
    costPerUnit: 120,
    unit: "pack",
    imageUrl: "🍪",
  },
  {
    name: "Toast Biscuit",
    category: ["Snack"],
    typicalExpiryDays: 60,
    costPerUnit: 80,
    unit: "pack",
    imageUrl: "🍞",
  },
];

// --- 3. SEED HELPERS ---

async function seedHistory(userId) {
  const logs = [];
  const today = new Date();
  console.log("Generating 30 days of history...");

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayOfWeek = date.getDay();
    const createdAt = date.toISOString();

    // Staples (Rice)
    if (Math.random() > 0.5) {
      logs.push({
        userId,
        itemName: "Miniket Rice",
        category: ["Grain"],
        cost: 75 * 0.5,
        actionType: "CONSUME",
        quantityChanged: 0.5,
        unit: "kg",
        reason: "Lunch/Dinner",
        createdAt,
      });
    }

    // Waste on Fridays (Spinach)
    if (dayOfWeek === 5) {
      logs.push({
        userId,
        itemName: "Spinach (Palong)",
        category: ["Vegetable"],
        cost: 30,
        actionType: "WASTE",
        quantityChanged: 1,
        unit: "bunch",
        reason: "Wilted/Spoiled",
        createdAt,
      });
    }

    // Fruits on Weekends
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      logs.push({
        userId,
        itemName: "Mango",
        category: ["Fruit"],
        cost: 120,
        actionType: "CONSUME",
        quantityChanged: 1,
        unit: "kg",
        reason: "Weekend Snack",
        createdAt,
      });
    }

    // Random Dinner Veggies
    if (dayOfWeek <= 4) {
      logs.push({
        userId,
        itemName: "Potato (Alu)",
        category: ["Vegetable"],
        cost: 60 * 0.2,
        actionType: "CONSUME",
        quantityChanged: 0.2,
        unit: "kg",
        reason: "Dinner",
        createdAt,
      });
    }
  }
  await ActionLog.insertMany(logs);
  console.log(`Added ${logs.length} historical logs.`);
}

async function seedLeaderboard() {
  console.log("Seeding Leaderboard Dummy Data...");
  const names = [
    "Aisha",
    "Rahim",
    "Karim",
    "Fatima",
    "Nusrat",
    "Tanvir",
    "Sara",
    "Omar",
    "Zara",
    "Ali",
  ];
  const locations = ["Dhaka", "Chittagong", "Sylhet", "Khulna", "Rajshahi"];

  // Generate 15 users
  const users = [];
  for (let i = 0; i < 15; i++) {
    const name = names[i % names.length] + " " + String.fromCharCode(65 + i);
    const email = `dummy${i}@example.com`;
    const password = await bcrypt.hash("123456", 10);

    users.push({
      name,
      email,
      password,
      householdSize: Math.floor(Math.random() * 5) + 1,
      location: locations[i % locations.length],
      impactScore: Math.floor(Math.random() * 100), // Random score
      dietaryPreferences: [],
      budgetRange: "Medium",
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, // Random Avatar
    });
  }

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) await User.create(u);
  }
  console.log("Leaderboard seeded.");
}

// --- 4. MAIN EXECUTION ---

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to Database.");

    // Clear old static data
    await Resource.deleteMany({});
    await FoodItem.deleteMany({});

    // Insert static data
    await Resource.insertMany(resources);
    await FoodItem.insertMany(foodItems);
    console.log("Resources and Food Items seeded.");
    await SuperAdmin.deleteMany({});

    // Setup Demo User
    const demoEmail = "demo@ecoloop.com";
    // Wipe old data to ensure clean schema
    await User.deleteMany({ email: demoEmail });
    await ActionLog.deleteMany({});

    const hashedPassword = await bcrypt.hash("Qwerty@123", 10);

    const demoUser = await User.create({
      name: "Demo User",
      email: demoEmail,
      password: hashedPassword,
      householdSize: 4,
      dietaryPreferences: ["Halal"],
      budgetRange: "Medium",
      location: "Dhaka",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=abp", // Demo Avatar
      impactScore: 75, // Initial Score
    });

    console.log(`Created Demo User: ${demoEmail} / Qwerty@123`);

    // [NEW] Hardcode this user as Super Admin
    await SuperAdmin.create({ userId: demoUser._id });
    console.log("Assigned SuperAdmin privileges to Demo User.");

    await seedHistory(demoUser._id);
    await seedLeaderboard();
  } catch (error) {
    console.error("Seeding Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Connection Closed.");
    process.exit();
  }
}

main();