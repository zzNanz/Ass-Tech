const express = require('express');
const router = express.Router();

const warrantiesController = require('../controllers/warrantiesController');
const authMiddleware = require('../middleware/authMiddleware'); 
const clientController = require('../controllers/clientController');

router.get('/', authMiddleware,warrantiesController.listWarranties)
router.post('/', authMiddleware, clientController.findorCreateClient, warrantiesController.addWarranty)
router.get('/:id', authMiddleware, warrantiesController.getWarrantyById)
router.put('/:id', authMiddleware, warrantiesController.updateWarranty)
router.delete('/:id', authMiddleware, warrantiesController.deleteWarranty)

module.exports = router;