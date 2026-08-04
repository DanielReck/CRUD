const express = require('express');
const clienteController = require('../controllers/clienteController');

const router = express.Router();

router.get('/', clienteController.getAllUsers);
router.get('/search', clienteController.searchUsers);
router.get('/new', clienteController.renderCreateForm);
router.post('/', clienteController.createUser);
router.get('/:id', clienteController.getUserById);
router.get('/:id/edit', clienteController.renderEditForm);
router.put('/:id', clienteController.updateUser);
router.delete('/:id', clienteController.deleteUser);

module.exports = router;