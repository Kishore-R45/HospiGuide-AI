const supabase = require('../config/supabase');
const { generateEmbedding } = require('./huggingface.service');

/**
 * Perform RAG (Retrieval-Augmented Generation) retrieval.
 * Tries vector search first, falls back to semantic keyword filtering.
 */
const getRelevantContext = async (query) => {
    try {
        let contextText = "";
        
        // 1. Try Vector Search (Requires pgvector setup in Supabase)
        /* 
           To enable this fully, run this in Supabase SQL editor:
           create extension if not exists vector;
           create table documents (
             id bigserial primary key,
             content text,
             embedding vector(1024) -- BAAI/bge-m3 dimension
           );
           create or replace function match_documents (
             query_embedding vector(1024),
             match_threshold float,
             match_count int
           )
           returns table (id bigint, content text, similarity float)
           language sql stable
           as $$
             select
               documents.id,
               documents.content,
               1 - (documents.embedding <=> query_embedding) as similarity
             from documents
             where 1 - (documents.embedding <=> query_embedding) > match_threshold
             order by documents.embedding <=> query_embedding
             limit match_count;
           $$;
        */
        
        try {
            const queryEmbedding = await generateEmbedding(query);
            
            const { data: vectorData, error: vectorError } = await supabase.rpc('match_documents', {
                query_embedding: queryEmbedding,
                match_threshold: 0.5,
                match_count: 5
            });

            if (!vectorError && vectorData && vectorData.length > 0) {
                contextText = vectorData.map(d => d.content).join("\n");
                return contextText;
            }
        } catch (e) {
            console.log("Vector search RPC not found or failed, falling back to standard DB fetch.");
        }

        // 2. Fallback: Fetch all departments and doctors and let the LLM handle filtering
        // (Suitable for smaller datasets like hospital directories)
        const { data: departments } = await supabase.from('departments').select('*');
        const { data: doctors } = await supabase.from('doctors').select('*');

        if (departments && doctors) {
            contextText += "Hospital Departments:\n";
            departments.forEach(dept => {
                contextText += `- ${dept.name} (Location/Venue: ${dept.location || 'Unknown'})\n`;
            });
            
            contextText += "\nDoctors List:\n";
            doctors.forEach(doc => {
                const deptName = departments.find(d => d.id === doc.department_id)?.name || 'Unknown Department';
                contextText += `- Dr. ${doc.name} (${deptName}). Specialty: ${doc.specialty || 'General'}. Availability: ${doc.availability || 'Check with reception'}.\n`;
            });
        }

        return contextText || "No context found.";
    } catch (error) {
        console.error('Error fetching context for RAG:', error);
        return "No context found due to an error.";
    }
};

module.exports = {
    getRelevantContext
};
