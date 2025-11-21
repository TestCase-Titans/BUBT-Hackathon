import mongoose, { Schema, model, models } from "mongoose";

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
    // --- FIX: Add this field so scores are saved ---
    impactScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const InventorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    category: { type: [String], required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "pcs" },
    expirationDate: Date,
    costPerUnit: Number,
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

const FoodItemSchema = new Schema({
  name: String,
  category: [String],
  typicalExpiryDays: Number,
  costPerUnit: Number,
  unit: String,
  imageUrl: String,
});

const ResourceSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  url: String,
  category: { type: String, required: true },
  type: { type: String, enum: ["Article", "Video", "Tip"], required: true },
});

export const User = models.User || model("User", UserSchema);
export const Inventory =
  models.Inventory || model("Inventory", InventorySchema);
export const ActionLog =
  models.ActionLog || model("ActionLog", ActionLogSchema);
export const Resource = models.Resource || model("Resource", ResourceSchema);
export const FoodItem = models.FoodItem || model("FoodItem", FoodItemSchema);
