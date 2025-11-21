import mongoose, { Schema, model, models } from "mongoose";

// --- User Schema ---
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    householdSize: { type: Number, default: 1 },
    dietaryPreferences: [String],
    budgetRange: String,
    location: String,
    impactScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// --- SuperAdmin Schema (Restored from Code 1) ---
const SuperAdminSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    role: { type: String, default: "superadmin" },
  },
  { timestamps: true }
);

// --- Inventory Schema (Kept from Code 2 - includes Risk Analysis fields) ---
const InventorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: { type: [String], required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "pcs" },
    expirationDate: Date,
    costPerUnit: Number,
    // New fields from Code 2
    riskScore: { type: Number, default: 0 },
    riskLabel: { type: String, default: "Safe" },
    riskFactor: { type: String },
    lastRiskAnalysis: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["ACTIVE", "CONSUMED", "WASTED"],
      default: "ACTIVE",
    },
    imageUrl: String,
    aiTags: [String],
    source: { type: String, enum: ["MANUAL", "SCAN"], default: "MANUAL" },
  },
  { timestamps: true }
);

// --- ActionLog Schema ---
const ActionLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    inventoryId: { type: Schema.Types.ObjectId, ref: "Inventory" },
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

// --- FoodItem Schema ---
const FoodItemSchema = new Schema({
  name: String,
  category: [String],
  typicalExpiryDays: Number,
  costPerUnit: Number,
  unit: String,
  imageUrl: String,
});

// --- Resource Schema ---
const ResourceSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  url: String,
  category: { type: String, required: true },
  type: { type: String, enum: ["Article", "Video", "Tip"], required: true },
});

// --- Community Item Schema (From Code 2) ---
const CommunityItemSchema = new Schema(
  {
    name: { type: String, required: true },
    donor: String,    // User's display name
    donorId: String,  // Link to User ID
    distance: String, // e.g., "0.1 km"
    category: String,
    quantity: Number,
    unit: String,
    image: String,
    status: { type: String, default: "AVAILABLE" }, // AVAILABLE, CLAIMED
  },
  { timestamps: true }
);

// --- Exports ---
export const User = models.User || model("User", UserSchema);
export const SuperAdmin = models.SuperAdmin || model("SuperAdmin", SuperAdminSchema); // Restored
export const Inventory = models.Inventory || model("Inventory", InventorySchema);
export const ActionLog = models.ActionLog || model("ActionLog", ActionLogSchema);
export const Resource = models.Resource || model("Resource", ResourceSchema);
export const FoodItem = models.FoodItem || model("FoodItem", FoodItemSchema);
export const CommunityItem = models.CommunityItem || model("CommunityItem", CommunityItemSchema);