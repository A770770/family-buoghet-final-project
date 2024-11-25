const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/create-child', auth, userController.createChildAccount);
router.patch('/:userId/budget', auth, userController.updateChildBudget);
router.get('/children', auth, userController.getChildren);

module.exports = router; 