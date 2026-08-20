-- Insert Blocks
INSERT INTO blocks (id, name, primary_function, floors, key_services) VALUES
(1, 'Block 1', 'Pharmacy & Medicine Services', 'Ground, First, Second', 'Main Pharmacy, Dispensary, Medical Store'),
(2, 'Block 2', 'Dental & ENT Services', 'Ground, First, Second', 'Dental OP, Oral Surgery, ENT'),
(3, 'Block 3', 'Eye, General Medicine & Cardiology', 'Ground, First, Second', 'Eye, General Medicine, Cardiology'),
(4, 'Block 4', 'Orthopaedics, Neurology & Physiotherapy', 'Ground, First, Second', 'Bone/Joint, Neurology, Rehab'),
(5, 'Block 5', 'Women & Child Health', 'Ground, First, Second', 'Obstetrics, Gynaecology, Paediatrics');

-- Insert Departments
-- Block 1
INSERT INTO departments (id, name, block_id, floor, room, location_hint) VALUES
(1, 'Main Pharmacy', 1, 'Ground Floor', 'P-101', 'Near Main Gate; beside Registration'),
(2, 'Inpatient Pharmacy', 1, 'First Floor', 'P-201', 'Above Ground Pharmacy'),
(3, 'Medical Store', 1, 'Second Floor', 'P-301', 'Restricted service area');

-- Block 2
INSERT INTO departments (id, name, block_id, floor, room, location_hint) VALUES
(4, 'Dental', 2, 'Ground Floor', 'D-101, D-102', 'East side of campus'),
(5, 'Oral & Maxillofacial Surgery', 2, 'First Floor', 'D-201', 'Lift/Staircase from Dental OP'),
(6, 'ENT', 2, 'Second Floor', 'E-201, E-202', 'Above Dental First Floor');

-- Block 3
INSERT INTO departments (id, name, block_id, floor, room, location_hint) VALUES
(7, 'General Medicine', 3, 'Ground Floor', 'GM-101, GM-102', 'Central clinical zone'),
(8, 'Ophthalmology', 3, 'First Floor', 'OPH-101, OPH-102', 'Near central corridor'),
(9, 'Cardiology', 3, 'Second Floor', 'CAR-201, CAR-202', 'North side of Block 3');

-- Block 4
INSERT INTO departments (id, name, block_id, floor, room, location_hint) VALUES
(10, 'Orthopaedics', 4, 'Ground Floor', 'ORT-101, ORT-102', 'West side of campus'),
(11, 'Neurology', 4, 'First Floor', 'NEU-201, NEU-202', 'Above Orthopaedics'),
(12, 'Physiotherapy', 4, 'Second Floor', 'PHY-301, PHY-302', 'Near rear access road');

-- Block 5
INSERT INTO departments (id, name, block_id, floor, room, location_hint) VALUES
(13, 'Paediatrics', 5, 'Ground Floor', 'PED-101, PED-102', 'South side of campus'),
(14, 'Obstetrics', 5, 'First Floor', 'OBG-201', 'Women & Child Health zone'),
(15, 'Gynaecology', 5, 'First Floor', 'GYN-202', 'Women & Child Health zone'),
(16, 'Maternity', 5, 'Second Floor', 'MAT-301, MAT-302', 'Restricted ward floor');

-- Insert Doctors
INSERT INTO doctors (name, department_id, specialty, specialization, room_number, timing, days) VALUES
('Dr. Meena Krishnan', 4, 'Dental', 'General Dentist', 'D-101', '09:00-16:00', 'Mon-Sat'),
('Dr. Arjun Kumar', 4, 'Dental', 'General & Emergency Dentist', 'D-102', '16:00-22:00', 'Mon-Sat'),
('Dr. Nivetha Raman', 5, 'Dental', 'Oral & Maxillofacial Surgeon', 'D-201', '10:00-15:00', 'Mon-Fri'),
('Dr. Karthik Raj', 5, 'Dental', 'Prosthodontist', 'D-202', '09:00-14:00', 'Mon-Sat'),
('Dr. Priya Menon', 6, 'ENT', 'ENT Specialist', 'E-201', '09:00-15:00', 'Mon-Sat'),
('Dr. Rahul Dev', 6, 'ENT', 'ENT Specialist', 'E-202', '15:00-21:00', 'Mon-Sat'),
('Dr. Suresh Babu', 7, 'General Medicine', 'General Physician', 'GM-101', '09:00-16:00', 'Mon-Sat'),
('Dr. Asha Devi', 7, 'General Medicine', 'General Physician', 'GM-102', '16:00-22:00', 'Mon-Sat'),
('Dr. Lakshmi Narayan', 8, 'Ophthalmology', 'Ophthalmologist', 'OPH-101', '09:00-16:00', 'Mon-Sat'),
('Dr. Vivek Anand', 8, 'Ophthalmology', 'Ophthalmologist', 'OPH-102', '16:00-21:00', 'Mon-Sat'),
('Dr. Hari Prasad', 9, 'Cardiology', 'Cardiologist', 'CAR-201', '09:00-15:00', 'Mon-Fri'),
('Dr. Sneha Iyer', 9, 'Cardiology', 'Cardiologist', 'CAR-202', '15:00-21:00', 'Mon-Fri'),
('Dr. Manoj Kumar', 10, 'Orthopaedics', 'Orthopaedic Surgeon', 'ORT-101', '09:00-16:00', 'Mon-Sat'),
('Dr. Deepa Shah', 10, 'Orthopaedics', 'Orthopaedic Specialist', 'ORT-102', '16:00-22:00', 'Mon-Sat'),
('Dr. Vinoth Kumar', 11, 'Neurology', 'Neurologist', 'NEU-201', '09:00-14:00', 'Mon-Fri'),
('Dr. Anjali Rao', 11, 'Neurology', 'Neurologist', 'NEU-202', '14:00-20:00', 'Mon-Fri'),
('Dr. Farah Ali', 12, 'Physiotherapy', 'Physiotherapist', 'PHY-301', '09:00-15:00', 'Mon-Sat'),
('Dr. Naveen Kumar', 12, 'Physiotherapy', 'Physiotherapist', 'PHY-302', '15:00-21:00', 'Mon-Sat'),
('Dr. Kavitha Rao', 13, 'Paediatrics', 'Paediatrician', 'PED-101', '09:00-16:00', 'Mon-Sat'),
('Dr. Imran Sheikh', 13, 'Paediatrics', 'Paediatrician', 'PED-102', '16:00-22:00', 'Mon-Sat'),
('Dr. Revathi Menon', 14, 'Obstetrics', 'Obstetrician', 'OBG-201', '09:00-16:00', 'Mon-Sat'),
('Dr. Swetha R', 15, 'Gynaecology', 'Gynaecologist', 'GYN-202', '16:00-22:00', 'Mon-Sat'),
('Dr. Priyanka Das', 16, 'Maternity', 'Obstetrician', 'MAT-301', '09:00-15:00', 'Mon-Sat'),
('Dr. Joseph Mathew', 16, 'Maternity', 'Obstetrician', 'MAT-302', '15:00-21:00', 'Mon-Sat'),
('Pharm. Ramesh Kumar', 1, 'Pharmacy', 'Chief Pharmacist', 'P-101', '08:00-16:00', 'Mon-Sat'),
('Pharm. Sangeetha V', 1, 'Pharmacy', 'Clinical Pharmacist', 'P-101', '16:00-22:00', 'Mon-Sat'),
('Pharm. Vijay Anand', 1, 'Pharmacy', 'Night Pharmacist', 'P-101', '22:00-08:00', 'Mon-Sun'),
('Pharm. Divya Bharathi', 1, 'Pharmacy', 'Sunday Pharmacist', 'P-101', '08:00-22:00', 'Sun'),
('Pharm. Abdul Rahman', 2, 'Pharmacy', 'Inpatient Pharmacist', 'P-201', '08:00-20:00', 'Mon-Sun'),
('Pharm. Karthik M', 2, 'Pharmacy', 'Night Inpatient Pharmacist', 'P-201', '20:00-08:00', 'Mon-Sun'),
('Pharm. Venkatesh', 3, 'Pharmacy', 'Store Manager', 'P-301', '08:00-18:00', 'Mon-Sat'),
('Dr. Vikram Sethi', 7, 'General Medicine', 'Night Duty Physician', 'GM-101', '22:00-09:00', 'Mon-Sun'),
('Dr. Gayatri Sundaram', 7, 'General Medicine', 'Sunday General Physician', 'GM-102', '09:00-22:00', 'Sun'),
('Dr. Shalini Mukund', 13, 'Paediatrics', 'Emergency Paediatrician', 'PED-101', '22:00-09:00', 'Mon-Sun');

-- Insert Pharmacy Services
INSERT INTO pharmacy_services (service_name, block_id, floor, room_number, timing, description) VALUES
('Main Pharmacy', 1, 'Ground Floor', 'P-101', '08:00-22:00', 'Prescription medicines and routine dispensing'),
('Emergency Pharmacy Counter', 1, 'Ground Floor', 'P-102', '24 hours', 'Emergency medicines; subject to hospital policy'),
('Inpatient Pharmacy', 1, 'First Floor', 'P-201', '08:00-20:00', 'Medicines for admitted patients'),
('Drug Information Desk', 1, 'First Floor', 'P-202', '09:00-17:00', 'Medicine-related information'),
('Medical Store', 1, 'Second Floor', 'P-301', '08:00-18:00', 'Bulk stock; not general public counter');

-- Insert Symptom Mappings (RAG Knowledge)
INSERT INTO symptom_mappings (symptom, department_id, doctor_type, rag_routing_note) VALUES
('Severe tooth pain', 4, 'General Dentist / Emergency Dentist', 'If after 16:00, recommend Dr. Arjun Kumar'),
('Swollen gums', 4, 'General Dentist / Emergency Dentist', 'Dental evaluation'),
('Broken or impacted tooth', 5, 'Oral & Maxillofacial Surgeon', 'Recommend oral surgery consultation'),
('Need dentures / replacement teeth', 5, 'Prosthodontist', 'Prosthodontic consultation'),
('Ear pain', 6, 'ENT Specialist', 'Choose based on current time'),
('Hearing difficulty', 6, 'ENT Specialist / Audiology', 'Audiology testing available'),
('Eye pain / blurred vision', 8, 'Ophthalmologist', 'Choose available doctor'),
('Chest pain', 9, 'Cardiologist', 'For severe/emergency symptoms, direct to emergency services rather than routine OP'),
('Fever / general illness', 7, 'General Physician', 'Choose available doctor'),
('Knee pain', 10, 'Orthopaedic Specialist', 'Physiotherapy may be recommended after evaluation'),
('Back pain', 10, 'Orthopaedic Specialist', 'Choose available doctor'),
('Headache with neurological symptoms', 11, 'Neurologist', 'Urgent symptoms should be escalated to emergency care'),
('Child fever', 13, 'Paediatrician', 'For children'),
('Pregnancy', 14, 'Obstetrician', 'Antenatal clinic'),
('Women''s reproductive health issue', 15, 'Gynaecologist', 'Routine consultation');

-- Insert Navigation Hints
INSERT INTO navigation_hints (landmark_destination, purpose, block_id, nearby_direction_hint) VALUES
('Main Gate', 'Starting landmark', 1, 'Block 1 is closest to the Main Gate'),
('Registration Counter', 'Registration', 1, 'Near Block 1 Ground Floor'),
('Block 1 Pharmacy', 'Pharmacy', 1, 'Ground Floor'),
('Block 2 Dental', 'Dental', 2, 'East clinical zone; next to the central corridor'),
('Block 2 ENT', 'ENT', 2, 'Second Floor'),
('Block 3 General Medicine', 'General Medicine', 3, 'Central clinical zone'),
('Block 3 Eye', 'Ophthalmology', 3, 'First Floor'),
('Block 3 Cardiology', 'Cardiology', 3, 'Second Floor'),
('Block 4 Orthopaedics', 'Orthopaedics', 4, 'West clinical zone'),
('Block 4 Neurology', 'Neurology', 4, 'First Floor'),
('Block 4 Physiotherapy', 'Physiotherapy', 4, 'Second Floor'),
('Block 5 Paediatrics', 'Paediatrics', 5, 'South clinical zone'),
('Block 5 Obstetrics', 'Obstetrics', 5, 'First Floor'),
('Block 5 Maternity', 'Maternity', 5, 'Second Floor');
