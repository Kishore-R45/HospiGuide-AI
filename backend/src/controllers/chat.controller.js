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
        const systemPrompt = `You are HospiGuide, a helpful AI assistant for a hospital. 
Use the following context to answer the user's question accurately.
If the answer is not in the context, politely inform the user that you don't have that information.
IMPORTANT: You MUST respond STRICTLY in ${langPref}. If the user asks in English but ${langPref} is selected, reply in ${langPref}.

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
