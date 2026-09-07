require('dotenv').config({ path: '../../.env' });
const supabase = require('../config/supabase');
const { Pinecone } = require('@pinecone-database/pinecone');
const { generateEmbedding } = require('../services/huggingface.service');

async function seedPinecone() {
    if (!process.env.PINECONE_API_KEY) {
        console.error("Missing PINECONE_API_KEY in .env");
        process.exit(1);
    }
    
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexName = process.env.PINECONE_INDEX || 'hospiguide-index';
    
    console.log(`Connecting to Pinecone index: ${indexName}...`);
    const index = pinecone.Index(indexName);

    console.log("Fetching data from Supabase...");
    const { data: departments } = await supabase.from('departments').select('*');
    const { data: doctors } = await supabase.from('doctors').select('*');
    
    if (!departments || !doctors) {
        console.error("Failed to fetch data from Supabase.");
        process.exit(1);
    }

    const vectors = [];

    // Seed Departments
    for (const dept of departments) {
        const text = `Department: ${dept.name}. Location: Block ${dept.block_id || 'Unknown'}, Floor ${dept.floor || 'Unknown'}.`;
        console.log(`Generating embedding for: ${dept.name}`);
        const embedding = await generateEmbedding(text);
        vectors.push({
            id: `dept_${dept.id}`,
            values: embedding,
            metadata: { type: 'department', id: dept.id, name: dept.name, text: text }
        });
    }

    // Seed Doctors
    for (const doc of doctors) {
        const deptName = departments.find(d => d.id === doc.department_id)?.name || 'Unknown Department';
        const text = `Doctor: ${doc.name}. Department: ${deptName}. Specialty: ${doc.specialty || 'General'}. Room: ${doc.room_number || 'Unknown'}. Timings: ${doc.timing} on ${doc.days}.`;
        console.log(`Generating embedding for: Dr. ${doc.name}`);
        const embedding = await generateEmbedding(text);
        vectors.push({
            id: `doc_${doc.id}`,
            values: embedding,
            metadata: { type: 'doctor', id: doc.id, name: doc.name, department_id: doc.department_id, text: text }
        });
    }

    console.log(`Uploading ${vectors.length} vectors to Pinecone...`);
    // Upload in batches of 100 (if large)
    for (let i = 0; i < vectors.length; i += 100) {
        const batch = vectors.slice(i, i + 100);
        await index.upsert(batch);
    }

    console.log("Successfully seeded Pinecone index!");
    process.exit(0);
}

seedPinecone();
