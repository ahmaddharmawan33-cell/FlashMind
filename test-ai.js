const Groq = require("groq-sdk");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    try {
        const completion = await client.chat.completions.create({
            messages: [{ role: "user", content: "Say hello world" }],
            model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        });
        console.log("Success:", completion.choices[0].message.content);
    } catch (err) {
        console.error("Error:", err);
    }
}

main();
