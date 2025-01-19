import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

import dotenv from 'dotenv';
dotenv.config(); 
// Access the API key


// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
// Initialize GoogleGenerativeAI
let apiKey = '';
app.post('/set-api-key', (req, res) => {
    const { apiKey: newApiKey } = req.body;
    if (!newApiKey) {
        return res.status(400).json({ error: "API Key is required" });
    }
    
    apiKey = newApiKey; // Store the API key
    console.log('API Key received:', apiKey);

    // Proceed to the next screen (in your case, maybe provide success response)
    res.status(200).json({ message: 'API Key set successfully' });
});


const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// API endpoint for detecting irrelevant content
app.post('/detect-irrelevant-content', async (req, res) => {
    console.log("called backend 1")
    const { content } = req.body;
    console.log("content is ");
    console.log(content);

    if (!content) {
        return res.status(400).json({ error: "Content is required" });
    }

    try {
        const irrelevantLines = await llm(content, true,"","");
        console.log("irrelevant lines ");
        console.log(irrelevantLines)
        return res.status(200).json({ irrelevantLines });
    } catch (error) {
        console.error('Error detecting irrelevant content:', error);
        return res.status(500).json({ error: "Error detecting irrelevant content" });
    }
});

// API endpoint for transforming ad content
app.post('/transform-ad-content', async (req, res) => {
    const { content,mode,pageContent } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Content is required" });
    }

    try {
        const transformedContent = await llm(content, false,mode,pageContent);
        console.log("input content ")
        console.log(content)
        console.log("transforming content")
        console.log(transformedContent)
        return res.status(200).json({ transformedContent });
    } catch (error) {
        console.error('Error transforming ad content:', error);
        return res.status(500).json({ error: "Error transforming ad content" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});




function convertToJson(inputString) {
    // Ensure the input string uses double quotes for valid JSON format
    // let validJsonString = inputString.replace(/'/g, '"');
    
    // Try parsing the string into a JSON array
    try {
        return JSON.parse(inputString);
    } catch (error) {
        console.error("Invalid JSON format:", error);
        return null;
    }
}


const schema = {
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.STRING,
        nullable: false,
    },
};

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
},
});

// Function to interact with the LLM
async function llm(innerData, detector = false,mode,pageContent) {
    let prompt = "";

    if (detector) {
        prompt = `given a innerHTML your task is give me a list of all blocks which contains advertisement or ads related content. Dont write code.
give me complete tags/divs along with their elements/data which contains ads
innerHTML:
${innerData}

Return a Array of strings, 
each string denoting an ad block/tag / div

Dont return just names of divs/tags, return complete data in it`;
    } else {
                switch (mode) {
                  case 'vampire':
                    prompt = `Create eerie, spooky, and monochrome-themed short content related to 🧛‍♂️ for each ad item in the array ${innerData}. This content should replace the existing advertisement text, aligning with an ominous and ghostly vibe. Ensure that the tone matches the theme of the content, maintaining a chilling atmosphere while subtly blending the transformation into the overall page structure, ${pageContent}. The newly generated text should convey that the ad has been blocked by an 'Ad Blocker' while still fitting into the dark, mysterious theme of the page. Keep the writing short and unsettling, with just the right amount of spookiness.`;
                    break;
                  case 'exorcism':
                    prompt = ''; // Content will be removed in the content script
                    break;
                  default:
                    prompt = `Transform the ad contents for each item provided in the array, ${innerData}, into ad description describing about ad which is being blocked by our ad blocker now, ensuring a cohesive and fluid presentation.Don't generate more then the given array of ads , one for each making sure output array length equal to input array.`;
                }

//         prompt = `Below is the inner text of a webpage:

// Now transform them into text-based entities that blend seamlessly with the rest of the webpage.
// Generate a short (maybe even spooky) description of the ad content.

// ${innerData}

// return generated short description.`;
    }
    console.log("prompt for this is ",prompt)

    const result = await model.generateContent(prompt);
    // return result.response.text();
    let jsonData = convertToJson(result.response.text()); // Ensure proper handling of async responses
    return jsonData;
}
