const supabase = require('../config/supabase');
const { generateEmbedding } = require('./huggingface.service');
const { queryPinecone } = require('./pinecone.service');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 mins

// Reusable function to calculate realtime availability
const calculateAvailability = (doc) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const ist = new Date(utc + (3600000 * 5.5)); // IST is UTC+5:30
    
    const currentDayIndex = ist.getDay(); 
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let isAvailableNow = false;
    
    if (doc.days && doc.timing) {
      const timingClean = doc.timing.trim().toLowerCase();
      if (timingClean === '24 hours' || timingClean === '24 hrs' || timingClean === '00:00-24:00') {
        isAvailableNow = true;
      } else {
        const [startDay, endDay] = doc.days.split('-');
        const startIndex = daysMap.indexOf(startDay?.trim());
        const endIndex = daysMap.indexOf((endDay || startDay)?.trim());
        
        const validDays = [];
        if (startIndex !== -1 && endIndex !== -1) {
          let i = startIndex;
          while (true) {
            validDays.push(i);
            if (i === endIndex) break;
            i = (i + 1) % 7;
          }
        }
        
        if (validDays.includes(currentDayIndex)) {
          const [startTime, endTime] = doc.timing.split('-');
          if (startTime && endTime) {
             const currentTotalMinutes = ist.getHours() * 60 + ist.getMinutes();
             const [startH, startM] = startTime.split(':').map(Number);
             const startTotalMinutes = startH * 60 + startM;
             const [endH, endM] = endTime.split(':').map(Number);
             const endTotalMinutes = endH * 60 + endM;
             
             if (startTotalMinutes > endTotalMinutes) {
               if (currentTotalMinutes >= startTotalMinutes || currentTotalMinutes <= endTotalMinutes) isAvailableNow = true;
             } else {
               if (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes) isAvailableNow = true;
             }
          }
        }
      }
    }
    return isAvailableNow;
};

const getRelevantContext = async (query) => {
    try {
        let contextText = "";
        let relevantDocs = [];
        let relevantDepts = [];

        // 1. Try Pinecone Vector Search if API key exists
        if (process.env.PINECONE_API_KEY) {
            try {
                const queryEmbedding = await generateEmbedding(query);
                const matches = await queryPinecone(queryEmbedding, 8);
                
                if (matches && matches.length > 0) {
                    matches.forEach(match => {
                        // The text field in metadata contains the pre-formatted string
                        if (match.metadata && match.metadata.text) {
                            // Extract just the DB IDs so we can pull the live data with current availability
                            if (match.metadata.type === 'doctor') relevantDocs.push(match.metadata.id);
                            if (match.metadata.type === 'department') relevantDepts.push(match.metadata.id);
                        }
                    });
                }
            } catch (e) {
                console.log("Pinecone search failed, falling back to all DB fetch:", e.message);
            }
        }

        // Fetch Data (using cache for speed)
        let departments = cache.get('all_departments');
        if (!departments) {
            const { data } = await supabase.from('departments').select('*');
            departments = data || [];
            if (departments.length) cache.set('all_departments', departments);
        }

        let doctors = cache.get('all_doctors');
        if (!doctors) {
            const { data } = await supabase.from('doctors').select('*');
            doctors = data || [];
            if (doctors.length) cache.set('all_doctors', doctors);
        }

        // Filter based on Pinecone matches, or use all if Pinecone failed/empty
        const targetDepts = relevantDepts.length > 0 ? departments.filter(d => relevantDepts.includes(d.id)) : departments;
        const targetDocs = relevantDocs.length > 0 ? doctors.filter(d => relevantDocs.includes(d.id)) : doctors;

        if (targetDepts.length > 0) {
            contextText += "Hospital Departments Found:\n";
            targetDepts.forEach(dept => {
                contextText += `- ${dept.name} (Location: Block ${dept.block_id || 'Unknown'}, Floor ${dept.floor || 'Unknown'})\n`;
            });
            contextText += "\n";
        }
        
        if (targetDocs.length > 0) {
            contextText += "Doctors Found:\n";
            targetDocs.forEach(doc => {
                const deptName = departments.find(d => d.id === doc.department_id)?.name || 'Unknown Department';
                const isAvailable = calculateAvailability(doc);
                
                contextText += `- Dr. ${doc.name} (${deptName}). Specialty: ${doc.specialty || 'General'}. Location: Room ${doc.room_number || 'Unknown'}. Timings: ${doc.timing} (${doc.days}). CURRENT STATUS: ${isAvailable ? 'AVAILABLE NOW' : 'NOT AVAILABLE NOW'}.\n`;
            });
        }

        return contextText || "No specific context found.";
    } catch (error) {
        console.error('Error fetching context for RAG:', error);
        return "No context found due to an error.";
    }
};

module.exports = {
    getRelevantContext
};

