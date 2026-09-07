const supabase = require('../config/supabase');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const getAllDoctors = async (req, res) => {
  try {
    const cacheKey = 'all_doctors';
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
        return res.json(cachedData);
    }

    const { data, error } = await supabase
      .from('doctors')
      .select('*');

    if (error) {
      throw error;
    }

    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

module.exports = {
  getAllDoctors
};
