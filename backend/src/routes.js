const express = require('express');
const router = express.Router();

const { authenticateToken, requireRole } = require('./middleware/auth');
const { validateUserFields, validatePasswordOnly } = require('./middleware/validate');

const authController = require('./controllers/authController');
const adminController = require('./controllers/adminController');
const storeController = require('./controllers/storeController');
const ownerController = require('./controllers/ownerController');

// --- AUTHENTICATION ROUTES ---
router.post('/auth/signup', validateUserFields, authController.signup);
router.post('/auth/login', authController.login);
router.put('/auth/password', authenticateToken, validatePasswordOnly, authController.updatePassword);

// --- ADMIN ROUTES ---
router.get('/admin/stats', authenticateToken, requireRole(['ADMIN']), adminController.getDashboardStats);
router.post('/admin/users', authenticateToken, requireRole(['ADMIN']), validateUserFields, adminController.addUser);
router.post('/admin/stores', authenticateToken, requireRole(['ADMIN']), validateUserFields, adminController.addStore);
router.get('/admin/users', authenticateToken, requireRole(['ADMIN']), adminController.getUsers);
router.get('/admin/stores', authenticateToken, requireRole(['ADMIN']), adminController.getStores);

// --- NORMAL USER ROUTES ---
router.get('/users/stores', authenticateToken, requireRole(['NORMAL']), storeController.getStoresForUser);
router.post('/users/stores/:id/rate', authenticateToken, requireRole(['NORMAL']), storeController.submitOrModifyRating);

// --- STORE OWNER ROUTES ---
router.get('/owner/dashboard', authenticateToken, requireRole(['STORE_OWNER']), ownerController.getOwnerDashboard);

module.exports = router;
