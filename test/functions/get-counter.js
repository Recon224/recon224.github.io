// Serverless function running on Netlify (using Node.js)
const { GoogleGenAI } = require("@google/genai");

// The API key is securely loaded from environment variables (Netlify UI)
// NOTE: process.env.GEMINI_API_KEY is defined in the Netlify dashboard, NOT in your code!
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 

// The handler function that Netlify calls
exports.handler = async (event) => {
    // Only allow POST requests from the front-end fetch
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { character } = JSON.parse(event.body);

        if (!character) {
            return { statusCode: 400, body: "Missing character name." };
        }

        // 1. Construct the detailed prompt for the AI
        const prompt = `Provide me with the top 10 teams to counter the top squads for "${character}". Respond only with a single clear **Markdown table format** with columns for 'Counter Team', 'Key Strategy', and 'Win Rate (Est)'. Ensure the table is properly formatted using pipes and hyphens. You can draw information from swgoh.gg and other relevant indexed sites that are available.'.`;

        // 2. Call the Gemini API
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Fast and effective model
            contents: prompt,
            config: {
                temperature: 0.1, 
            }
        });

        // 3. Return the AI's Markdown response text (the table)
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ result: response.text }),
        };

    } catch (error) {
        console.error("API Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch counter data." }),
        };
    }
};
