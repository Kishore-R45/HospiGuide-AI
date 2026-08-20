const supabase = require('../config/supabase');

const getDepartments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*');

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

const getDoctorsByDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('department_id', id);

    if (error) {
      throw error;
    }

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
