# Eco-Loop
**Sustainability Reimagined**

Eco-Loop is an intelligent "operating system" for your kitchen designed to close the circle on consumption. It empowers users to track pantry inventory in real-time, reduce food waste through timely notifications, and automate their grocery cycle using AI-driven receipt scanning and impact scoring.

---

## 🛠 Tech Stack

**Frontend:**
- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Animations: Framer Motion, GSAP
- UI Components: Radix UI, Lucide React
- Visualization: Recharts

**Backend:**
- API: Next.js Server Actions & API Routes
- Database: MongoDB
- ORM: Mongoose
- Authentication: NextAuth.js (v5)

---

## External API Services

This project relies on the following external services:

| Service            | Purpose                                                                                      | Setup Link                |
|--------------------|----------------------------------------------------------------------------------------------|---------------------------|
| Google Gemini API  | Powered by gemini-2.0-flash model. Used for "Smart Scan" to identify food items from images. | [Get API Key](https://aistudio.google.com/) |
| Cloudinary         | Cloud-based image management for profile and food item images.                               | [Sign Up](https://cloudinary.com/) |
| MongoDB Atlas      | Cloud database hosting for persistent inventory and user data.                               | [Create Cluster](https://www.mongodb.com/atlas/database) |
| Dice Bar           | Random avatar generator                                                                      |                                                          |

---

##  Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local instance or Atlas connection string)
- Cloudinary Account
- Google AI Studio API Key

### 2. Installation

Clone the repository and install dependencies:

```sh
git clone https://github.com/TestCase-Titans/BUBT-Hackathon.git
cd eco-loop
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory. Example template:

```env
# --- Database ---
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecoloop

# --- Authentication (NextAuth) ---
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_random_string_here

# --- Image Uploads (Cloudinary) ---
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset

# --- AI Analysis (Google) ---
GOOGLE_API_KEY=your_google_gemini_api_key
```

### 4. Running the Application

Start the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Seed Data Usage

To fully utilize features like Search and the Resource Library, you need to populate your database with master data.

Since there is no automated seed script included yet, please insert the following data into your MongoDB database manually (using MongoDB Compass) or create a script to insert them.

### 1. Food Database (`fooditems` collection)

Powers the autocomplete and search when manually adding items.

**Sample Document:**
```json
{
    "name": "Avocado",
    "category": ["Vegetable", "Fats"],
    "typicalExpiryDays": 4,
    "costPerUnit": 40,
    "unit": "pcs",
    "imageUrl": ""
}
```

### 2. Resources Library (`resources` collection)

Powers the "Library" page recommendations.

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

**Note:** User-specific collections (Inventory, Logs, Profile) are created automatically as you use the app.

---

## ✨ Key Features

- **Smart Scan:** Upload a photo of groceries or a receipt. The app uses Google Gemini AI to identify items, categorize them, and estimate expiry dates automatically.
- **Dashboard Analytics:** View your "Impact Score," financial savings, and waste reduction metrics in real-time.
- **Inventory Management:** Visual indicators (Green/Red dots) show which items are fresh or expiring soon.
- **Intelligent Notifications:** Get stylish alerts when items are about to expire.
- **Resource Recommendations:** The app suggests articles and tips based on the specific categories of food you currently have in stock.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
