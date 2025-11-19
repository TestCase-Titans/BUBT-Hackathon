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
  costPerUnit: Number,
  unit: String,
  imageUrl: String,
});

const Resource =
  mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);
const FoodItem =
  mongoose.models.FoodItem || mongoose.model("FoodItem", InventorySchema);

const resources = [
  {
    title: "Storing Leafy Greens",
    category: "Vegetable",
    type: "Tip",
    description: "Wrap in paper towel to absorb moisture.",
    url: "#",
  },
  {
    title: "Reviving Wilting Carrots",
    category: "Vegetable",
    type: "Tip",
    description: "Soak in ice water for 30 mins.",
    url: "#",
  },
  {
    title: "Freezing Bananas",
    category: "Fruit",
    type: "Article",
    description: "Peel before freezing for smoothies.",
    url: "#",
  },
  {
    title: "Milk Freshness Test",
    category: "Dairy",
    type: "Tip",
    description: "If it floats in water, it might be bad.",
    url: "#",
  },
  {
    title: "Understanding Expiration Dates",
    category: "General",
    type: "Article",
    description: "Difference between Best By and Use By.",
    url: "#",
  },
  {
    title: "Zero Waste Broth",
    category: "Vegetable",
    type: "Video",
    description: "Use scraps to make stock.",
    url: "#",
  },
  {
    title: "Composting 101",
    category: "Waste Reduction",
    type: "Article",
    description: "Start a bin in your apartment.",
    url: "#",
  },
  {
    title: "Meal Planning on a Budget",
    category: "Budget",
    type: "Article",
    description: "Plan meals around sales.",
    url: "#",
  },
  {
    title: "Storing Cheese",
    category: "Dairy",
    type: "Tip",
    description: "Wrap in wax paper, not plastic.",
    url: "#",
  },
  {
    title: "Bread Storage Hacks",
    category: "Grain",
    type: "Tip",
    description: "Freeze bread to keep it fresh for months.",
    url: "#",
  },
  {
    title: "Regrowing Green Onions",
    category: "Vegetable",
    type: "Video",
    description: "Place roots in water.",
    url: "#",
  },
  {
    title: "Canned Food Safety",
    category: "Canned",
    type: "Article",
    description: "Check for dents and rust.",
    url: "#",
  },
  {
    title: "Rice Storage",
    category: "Grain",
    type: "Tip",
    description: "Keep in airtight container to avoid weevils.",
    url: "#",
  },
  {
    title: "Egg Freshness Float Test",
    category: "Protein",
    type: "Tip",
    description: "Sink = Good, Float = Bad.",
    url: "#",
  },
  {
    title: "Freezing Leftover Sauce",
    category: "Condiment",
    type: "Tip",
    description: "Use ice cube trays.",
    url: "#",
  },
  {
    title: "Bulk Buying Guide",
    category: "Budget",
    type: "Article",
    description: "What to buy in bulk vs small.",
    url: "#",
  },
  {
    title: "Organization for Pantries",
    category: "General",
    type: "Video",
    description: "FIFO (First In, First Out) method.",
    url: "#",
  },
  {
    title: "Pickling Leftovers",
    category: "Vegetable",
    type: "Article",
    description: "Simple vinegar brine recipe.",
    url: "#",
  },
  {
    title: "Meat Freezing Times",
    category: "Protein",
    type: "Article",
    description: "How long chicken lasts in freezer.",
    url: "#",
  },
  {
    title: "Reusing Coffee Grounds",
    category: "Waste Reduction",
    type: "Tip",
    description: "Use as fertilizer or scrub.",
    url: "#",
  },
];

const foodItems = [
  {
    name: "Whole Milk",
    category: "Dairy",
    typicalExpiryDays: 7,
    costPerUnit: 1.2,
    unit: "L",
  },
  {
    name: "Cheddar Cheese",
    category: "Dairy",
    typicalExpiryDays: 30,
    costPerUnit: 4.5,
    unit: "block",
  },
  {
    name: "Yogurt",
    category: "Dairy",
    typicalExpiryDays: 14,
    costPerUnit: 0.9,
    unit: "cup",
  },
  {
    name: "Spinach",
    category: "Vegetable",
    typicalExpiryDays: 5,
    costPerUnit: 2.0,
    unit: "bunch",
  },
  {
    name: "Carrots",
    category: "Vegetable",
    typicalExpiryDays: 21,
    costPerUnit: 1.5,
    unit: "kg",
  },
  {
    name: "Potatoes",
    category: "Vegetable",
    typicalExpiryDays: 60,
    costPerUnit: 1.0,
    unit: "kg",
  },
  {
    name: "Bananas",
    category: "Fruit",
    typicalExpiryDays: 5,
    costPerUnit: 0.8,
    unit: "kg",
  },
  {
    name: "Apples",
    category: "Fruit",
    typicalExpiryDays: 30,
    costPerUnit: 2.5,
    unit: "kg",
  },
  {
    name: "Chicken Breast",
    category: "Protein",
    typicalExpiryDays: 2,
    costPerUnit: 6.0,
    unit: "kg",
  },
  {
    name: "Eggs",
    category: "Protein",
    typicalExpiryDays: 21,
    costPerUnit: 3.0,
    unit: "dozen",
  },
  {
    name: "Ground Beef",
    category: "Protein",
    typicalExpiryDays: 2,
    costPerUnit: 7.0,
    unit: "kg",
  },
  {
    name: "White Rice",
    category: "Grain",
    typicalExpiryDays: 365,
    costPerUnit: 1.5,
    unit: "kg",
  },
  {
    name: "Pasta",
    category: "Grain",
    typicalExpiryDays: 365,
    costPerUnit: 1.2,
    unit: "box",
  },
  {
    name: "Bread",
    category: "Grain",
    typicalExpiryDays: 7,
    costPerUnit: 2.0,
    unit: "loaf",
  },
  {
    name: "Canned Beans",
    category: "Canned",
    typicalExpiryDays: 700,
    costPerUnit: 0.8,
    unit: "can",
  },
  {
    name: "Tomatoes",
    category: "Vegetable",
    typicalExpiryDays: 7,
    costPerUnit: 2.0,
    unit: "kg",
  },
  {
    name: "Onions",
    category: "Vegetable",
    typicalExpiryDays: 30,
    costPerUnit: 1.0,
    unit: "kg",
  },
  {
    name: "Butter",
    category: "Dairy",
    typicalExpiryDays: 60,
    costPerUnit: 3.5,
    unit: "block",
  },
  {
    name: "Orange Juice",
    category: "Fruit",
    typicalExpiryDays: 10,
    costPerUnit: 3.0,
    unit: "L",
  },
  {
    name: "Tofu",
    category: "Protein",
    typicalExpiryDays: 14,
    costPerUnit: 2.5,
    unit: "block",
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
