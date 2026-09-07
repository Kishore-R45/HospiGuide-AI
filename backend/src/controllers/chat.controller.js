const { generateChatResponse } = require('../services/huggingface.service');
const { getRelevantContext } = require('../services/rag.service');

const handleChat = async (req, res) => {
    try {
        const { query, language, history } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const langPref = language === 'ta' ? 'Tamil' : 'English';

        // 1. Retrieve RAG Context
        const context = await getRelevantContext(query);

        // 2. Build the System Prompt
        const systemPrompt = `You are HospiGuide, a hospital assistant AI chatbot.

RULES — follow these strictly:
1. Answer the user's question using ONLY the "Context Database" below.
2. When a doctor's CURRENT STATUS says "AVAILABLE NOW", tell the user the doctor IS available right now and include the exact Room number and Timings.
3. When a doctor's CURRENT STATUS says "NOT AVAILABLE NOW", tell the user the doctor is NOT available right now but provide their scheduled Timings and Days so the user knows when to visit.
4. NEVER say "check with reception" or "I don't have that information" when the data IS present in the context below.
5. Always include the doctor's name, department, room number, and block/floor when answering venue or location questions.
6. Keep answers concise — 2 to 4 sentences maximum.
7. LANGUAGE: You MUST respond STRICTLY in ${langPref}. Even if the user writes in another language, your reply must be in ${langPref} only.

Context Database:
${context}
`;

        // 3. Construct Message Array for HF Model
        // Prepend system prompt to the beginning of the history
        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []),
            { role: 'user', content: query }
        ];

        // 4. Generate Response
        const responseText = await generateChatResponse(messages);

        res.json({ response: responseText });
    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({ 
            error: 'Failed to process chat query.', 
            details: error.message 
        });
    }
};

module.exports = {
    handleChat
};
