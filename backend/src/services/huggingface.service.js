const { HfInference } = require('@huggingface/inference');

// Initialize Hugging Face Client
// Note: Requires HUGGINGFACE_API_KEY in .env
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const PRIMARY_MODEL = 'Qwen/Qwen2.5-72B-Instruct';
const FALLBACK_MODEL = 'Qwen/Qwen2.5-Coder-32B-Instruct';

/**
 * Generate chat completion using Hugging Face Models
 * with automatic fallback.
 */
const generateChatResponse = async (messages, useFallback = false) => {
    const modelToUse = useFallback ? FALLBACK_MODEL : PRIMARY_MODEL;

    try {
        console.log(`Generating response using model: ${modelToUse}`);
        
        const response = await hf.chatCompletion({
            model: modelToUse,
            messages: messages,
            max_tokens: 512,
            temperature: 0.3,
            top_p: 0.95
        });
        
        return response.choices[0].message.content.trim();

    } catch (error) {
        console.error(`Error with model ${modelToUse}:`, error.message);
        
        // If primary fails, try fallback
        if (!useFallback) {
            console.log('Attempting fallback model...');
            return await generateChatResponse(messages, true);
        }
        
        throw new Error('All LLM models failed. Please try again later.');
    }
};

/**
 * Generate embeddings for RAG retrieval
 */
const generateEmbedding = async (text) => {
    try {
        const response = await hf.featureExtraction({
            model: 'BAAI/bge-m3', // Multilingual embedding model
            inputs: text,
        });
        return response;
    } catch (error) {
        console.error('Error generating embeddings:', error);
        throw error;
    }
};

module.exports = {
    generateChatResponse,
    generateEmbedding
};
