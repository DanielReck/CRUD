const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const router = express.Router();

router.get('/', pedidoController.index);
router.get('/new', pedidoController.renderCreate);
router.post('/', pedidoController.create);
router.get('/:id', pedidoController.show);
router.delete('/:id', pedidoController.delete);

module.exports = router;
