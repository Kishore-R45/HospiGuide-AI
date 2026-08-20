const supabase = require('../config/supabase');

const getAllDoctors = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*');

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

module.exports = {
  getAllDoctors
};
