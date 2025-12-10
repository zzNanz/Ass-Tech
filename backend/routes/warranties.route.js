const express = require('express');
const router = express.Router();

const warrantiesController = require('../controllers/warrantiesController');
const clientController = require('../controllers/clientController');

router.get('/', warrantiesController.listWarranties)
router.post('/', warrantiesController.addWarranty)
router.get('/:id', warrantiesController.getWarrantyById)
router.put('/:id', warrantiesController.updateWarranty)
router.delete('/:id', warrantiesController.deleteWarranty)


module.exports = router;