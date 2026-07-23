import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const parseContactsWithGemini = async (rawText) => {
  if (!ai) {
    throw new Error("Gemini API key is not configured.");
  }

  if (!rawText || rawText.trim().length === 0) {
    return [];
  }

  const prompt = `
You are a highly accurate contact parsing assistant. The user will provide raw, unstructured text that contains contact information (such as an email signature, meeting notes, a pasted list of contacts, etc).

Extract all the individuals you can find into a JSON array of objects.
Each object should have the following keys (use empty string "" if a piece of information is missing):
- "firstName": The person's first name (e.g. "John")
- "lastName": The person's last name (e.g. "Smith")
- "email": The person's primary email address
- "secondaryEmail": Any secondary email address found
- "phone": The person's phone number
- "address": The person's physical address (street, city, state, zip combined into one string if possible)
- "notes": Any extra context or role (e.g., "CEO of Acme Corp", "Met at conference")

Only output the raw JSON array. Do not include markdown formatting like \`\`\`json. Do not include explanations.
If the text contains multiple people, return an object for each person.

Raw text to parse:
"""
${rawText}
"""
  `;

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });
    
    const responseText = result.text;
    // In case the model still outputs markdown backticks, strip them
    const cleanText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(cleanText);
    
    // Ensure it's an array
    if (Array.isArray(parsedData)) {
      return parsedData;
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      // If the model wrapped it in an object like { "contacts": [...] }
      for (const key in parsedData) {
        if (Array.isArray(parsedData[key])) {
          return parsedData[key];
        }
      }
      return [parsedData];
    }
    return [];
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw new Error("Failed to parse contacts using Gemini. Please try again or format the text differently.");
  }
};
