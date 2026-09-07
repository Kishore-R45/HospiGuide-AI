const supabase = require('../config/supabase');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

const getDepartments = async (req, res) => {
  try {
    const cacheKey = 'all_departments';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const { data, error } = await supabase
      .from('departments')
      .select('*');

    if (error) {
      throw error;
    }

    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

const getDoctorsByDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `doctors_dept_${id}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('department_id', id);

    if (error) {
      throw error;
    }

    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching doctors by department:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

module.exports = {
  getDepartments,
  getDoctorsByDepartment
};
