const API_KEY = "AIzaSyDazpF45PB4YNxXeJriCS-WeeqkLf7fAac"; // আপনার দেওয়া Key

async function checkAvailableModels() {
  console.log("🔍 Checking valid models for this API Key...");
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("\n❌ API KEY ERROR:");
      console.error(JSON.stringify(data.error, null, 2));
      return;
    }

    if (!data.models) {
      console.log("\n⚠️ No models found. This Key has no access to Gemini.");
      return;
    }

    console.log("\n✅ SUCCESS! এই Key দিয়ে নিচের মডেলগুলো ব্যবহার করা যাবে:");
    console.log("------------------------------------------------");
    const availableModels = data.models.map(m => m.name.replace("models/", ""));
    availableModels.forEach(model => console.log(`- ${model}`));
    console.log("------------------------------------------------");

    // Check if Flash exists
    if (availableModels.includes("gemini-1.5-flash")) {
        console.log("\n👉 আপনার কোডে ব্যবহার করবেন: 'gemini-1.5-flash'");
    } else {
        console.log("\n⚠️ 'gemini-1.5-flash' পাওয়া যায়নি। উপরের লিস্ট থেকে যেকোনো একটি নাম বেছে নিন।");
    }

  } catch (error) {
    console.error("Network Error:", error);
  }
}

checkAvailableModels();