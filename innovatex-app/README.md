
# Eco-Loop 

## Sustainability Reimagined

Eco-Loop is an intelligent "operating system" for your kitchen designed to close the circle on consumption. It empowers users to track pantry inventory in real-time, reduce food waste through timely notifications, and automate their grocery cycle using AI-driven receipt scanning and impact scoring.

---

##  Tech Stack

**Frontend:**
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Animations: Framer Motion, GSAP
- Icons: React Icons (Phosphor family)

**Backend:**
- API: Next.js Server Routes (API Routes)
- Database: MongoDB
- ORM: Mongoose
- Authentication: NextAuth.js (v5)

**Integrations:**
- AI Analysis: Google Gemini API (gemini-2.0-flash model) for intelligent image scanning.
- Image Storage: Cloudinary for profile and food item images.

---

##  Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local installation or MongoDB Atlas connection string)
- Cloudinary Account (Free tier works fine)
- Google AI Studio API Key (For the scanning feature)

### 2. Installation

Clone the repository and install the dependencies:

```sh
git clonehttps://github.com/TestCase-Titans/BUBT-Hackathon.git
cd eco-loop
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory of the project. You can copy the structure below:

```env
# --- Database ---
# Connection string for your MongoDB database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecoloop

# --- Authentication (NextAuth) ---
# The full URL of your app (http://localhost:3000 for local dev)
NEXTAUTH_URL=http://localhost:3000
# Generate a random string (e.g., using `openssl rand -base64 32` in terminal)
NEXTAUTH_SECRET=your_super_secret_random_string_here



# --- Image Uploads ---
# Cloudinary credentials found in your dashboard
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

### 4. Running the Application

Start the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

##  Seed Data Usage

To fully utilize features like the Search (in Add Item) and the Library (Resources), you need to populate your database with some master data.

Since there is no automated seed script included yet, please insert the following data into your MongoDB database manually (using MongoDB Compass) or create a temporary script to insert them.

### 1. Food Database (`fooditems` collection)
This powers the search bar when manually adding items.

**Sample Document:**
```json
{
	"name": "Avocado",
	"category": ["Vegetable", "Fats"],
	"typicalExpiryDays": 4,
	"costPerUnit": 40,
	"unit": "pcs",
	"imageUrl": "https://images.unsplash.com/photo-1523049673856-006981129359?auto=format&fit=crop&w=100&q=80"
}
```

### 2. Resources Library (`resources` collection)
This powers the "Library" page recommendations.

**Sample Document:**
```json
{
	"title": "Zero Waste Challenge",
	"description": "Join 500+ locals reducing their footprint this week.",
	"url": "#",
	"category": "Waste Reduction",
	"type": "Article"
}
```

**Note:** User-specific data (Inventory, Logs, Profile) is created automatically as you use the app.

---

## ✨ Key Features

- **Smart Scan:** Upload a photo of groceries or a receipt. The app uses Google Gemini AI to identify items, categorize them, and estimate expiry dates automatically.
- **Dashboard Analytics:** View your "Impact Score," financial savings, and waste reduction metrics in real-time.
- **Inventory Management:** Visual indicators (Green/Red dots) show which items are fresh or expiring soon.
- **Intelligent Notifications:** Get stylish pop-ups when you log in or when items are about to expire (e.g., "Alert: 3 items expiring soon!").
- **Resource Recommendations:** The app suggests articles and tips based on the specific categories of food you currently have in stock.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
