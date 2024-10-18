const express = require("express");
const router = express.Router();

const userController = require('../controller/userController');
const roleController = require('../controller/roleController');
const authController = require("../controller/authController");
const permissionsController = require('../controller/permissionsController');
const districtController = require('../controller/districtController');
const cityController = require('../controller/cityController');
const policeDistrictsController = require('../controller/policeDistrictsController');
const districtRevenueController = require('../controller/districtRevenueController');
const offenceController = require('../controller/offenceController');
const rolePermissionsController = require('../controller/rolePermissionsController'); // Ensure the path is correct
const offenceActController = require('../controller/offenceActController');
const casteCommunityController = require('../controller/casteCommunityController');


const firController = require('../controller/firController'); 

const firListController = require('../controller/firListController'); 




router.get('/api/rolepermissions/:roleId', rolePermissionsController.getRolePermissions);
// Get all users
router.get('/apps/users_new', userController.getAllUsers);
// Create a new user
router.post('/apps/users_new', userController.createUser);
router.put('/apps/users_new/:id', userController.updateUser);
router.delete('/apps/users_new/:id', userController.deleteUser);
router.put('/apps/users_new/:id/status', userController.toggleUserStatus);
router.get('/apps/roles', userController.getAllRoles);
router.get('/apps/rolesnew', roleController.getAllRoles);
router.post('/apps/rolesnew', roleController.addRole);
router.put('/apps/rolesnew/:id', roleController.updateRole);
router.delete('/apps/rolesnew/:id', roleController.deleteRole);
router.put('/apps/rolesnew/:id/status', roleController.toggleRoleStatus);
router.get('/apps/permissions/', permissionsController.getAllPermissions);
router.post('/apps/permissions/', permissionsController.addPermission);
router.put('/apps/permissions/:id', permissionsController.updatePermission);
router.delete('/apps/permissions/:id', permissionsController.deletePermission);
router.get('/apps/permissions/roles', permissionsController.getAllRoles);
router.get('/apps/permissions/:roleId/permissions', permissionsController.getPermissionsByRoleId);
router.put('/apps/permissions/:roleId/permissions/:permissionId', permissionsController.updateRolePermission);
router.post("/auth/login",authController.login);
router.post('/auth/send-otp', authController.sendOtp);
router.post('/auth/verify-otp', authController.verifyOtp);
router.post('/auth/reset-password', authController.resetPassword);



// Get all districts
router.get('/districts', districtController.getAllDistricts);

// Add a new district
router.post('/districts', districtController.addDistrict);

// Update a district
router.put('/districts/:id', districtController.updateDistrict);

// Delete a district
router.delete('/districts/:id', districtController.deleteDistrict);

// Toggle district status
router.patch('/districts/:id/toggleStatus', districtController.toggleDistrictStatus);

router.get('/cities', cityController.getAllCities);
router.post('/cities', cityController.addCity);


router.put('/cities/:id', cityController.updateCity);
router.delete('/cities/:id', cityController.deleteCity);
router.put('/cities/:id/status', cityController.toggleCityStatus);


// // Get all police districts
router.get('/api/police-division', policeDistrictsController.getAllPoliceDivisions);

// Get all districts for dropdown selection
router.get('/api/police-division/districts', policeDistrictsController.getAllDistricts);

// Add a new police district
router.post('/api/police-division', policeDistrictsController.addPoliceDivision);

// Update a specific police district
router.put('/api/police-division/:id', policeDistrictsController.updatePoliceDivision);

// Delete a specific police district
router.delete('/api/police-division/:id', policeDistrictsController.deletePoliceDivision);


// Get all revenue districts
router.get('/api/revenue-districts', districtRevenueController.getAllRevenueDistricts);

// Get all districts for dropdown selection
router.get('/api/districts', districtRevenueController.getAllDistricts);

// Add a new revenue district
router.post('/api/revenue-districts', districtRevenueController.addRevenueDistrict);

// Update a specific revenue district
router.put('/api/revenue-districts/:id', districtRevenueController.updateRevenueDistrict);

// Delete a specific revenue district
router.delete('/api/revenue-districts/:id', districtRevenueController.deleteRevenueDistrict);

// Get all offences
router.get('/api/offences', offenceController.getAllOffences);

// Add a new offence
router.post('/api/offences', offenceController.addOffence);

// Update a specific offence
router.put('/api/offences/:id', offenceController.updateOffence);

// Delete a specific offence
router.delete('/api/offences/:id', offenceController.deleteOffence);


// Define routes
router.get('/api/offenceact', offenceActController.getAllOffenceActs);
router.post('/api/offenceact', offenceActController.addOffenceAct);
router.put('/api/offenceact/:id', offenceActController.updateOffenceAct);
router.delete('/api/offenceact/:id', offenceActController.deleteOffenceAct);
router.patch('/api/offenceact/:id/toggle-status', offenceActController.toggleOffenceActStatus);

router.get('/api/caste', casteCommunityController.getAllCastes);
router.post('/api/caste', casteCommunityController.addCaste);
router.put('/api/caste/:id', casteCommunityController.updateCaste);
router.delete('/api/caste/:id', casteCommunityController.deleteCaste);
router.patch('/api/caste/:id/toggle-status', casteCommunityController.toggleCasteStatus);

// Route to get user details
router.post('/api/fir/user-details', firController.getUserDetails);

// Route to get police division details
router.get('/api/fir/police-division', firController.getPoliceDivisionDetails);

// Route to save a new FIR (Step 1)
router.post('/api/fir/save', firController.saveFir);

router.get('/api/fir/police-revenue', firController.getAllRevenues);

// Route to save an investigation officer
// router.post('/api/fir/save-officer', firController.saveInvestigationOfficer);

// Define routes for fetching data from tables
router.get('/api/fir/offences', firController.getAllOffences); // Fetch offence names from offence table
router.get('/api/fir/offence-acts', firController.getAllOffenceActs); // Fetch offence acts from offence_acts table
router.get('/api/fir/scst-sections', firController.getAllCastes); // Fetch SC/ST sections from caste_community table

// Route to get FIR details by ID
router.get('/api/fir/:id', firController.getFirById);


router.get('/api/fir_list/list', firListController.getFirList);


// Route to delete a FIR by ID
router.delete('/api/fir_list/delete/:id', firListController.deleteFir);

// Route to update FIR status
router.put('/api/fir_list/update-status/:id', firListController.updateFirStatus);

module.exports = router; 