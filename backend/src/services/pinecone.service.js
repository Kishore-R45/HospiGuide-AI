const { Pinecone } = require('@pinecone-database/pinecone');

let pineconeClient = null;
let index = null;

const initPinecone = () => {
    if (!pineconeClient && process.env.PINECONE_API_KEY) {
        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        // Assumes index name is "hospiguide-index"
        index = pineconeClient.Index(process.env.PINECONE_INDEX || 'hospiguide-index');
        console.log("Pinecone client initialized");
    }
};

const queryPinecone = async (queryEmbedding, topK = 5) => {
    if (!index) {
        initPinecone();
    }
    
    if (!index) {
        throw new Error("Pinecone is not initialized. Missing API key or index.");
    }

    try {
        const queryResponse = await index.query({
            vector: queryEmbedding,
            topK: topK,
            includeMetadata: true,
        });
        
        return queryResponse.matches;
    } catch (error) {
        console.error("Error querying Pinecone:", error);
        throw error;
    }
};

module.exports = {
    initPinecone,
    queryPinecone
};
