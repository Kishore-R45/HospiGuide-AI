const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

router.get('/', departmentController.getDepartments);
router.get('/:id/doctors', departmentController.getDoctorsByDepartment);

module.exports = router;
