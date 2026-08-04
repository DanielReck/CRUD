const Cliente = require('../models/clienteModel');

const clienteController = {
    listarClientes: (req, res) => {
        Cliente.getAll((erro, clientes) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: 'Erro ao buscar clientes',
                    erro: erro.message
                });
            }

            res.render('clientes/index', { clientes });
        });
    },

    buscarClientePorId: (req, res) => {
        const clienteId = req.params.id;

        Cliente.findById(clienteId, (erro, cliente) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: 'Erro ao buscar cliente',
                    erro: erro.message
                });
            }

            if (!cliente) {
                return res.status(404).send('Cliente não encontrado');
            }

            res.render('clientes/show', { cliente });
        });
    },

    exibirFormularioCadastro: (req, res) => {
        res.render('clientes/create');
    },

    cadastrarCliente: (req, res) => {
        const novoCliente = {
            nome: req.body.nome,
            email: req.body.email,
            telefone: req.body.telefone,
            cpf: req.body.cpf,
            instituicao: req.body.instituicao,
            id_endereco: req.body.id_endereco || null
        };

        if (!novoCliente.nome || novoCliente.nome.trim() === '') {
            return res.status(400).send('O nome do cliente é obrigatório');
        }

        Cliente.create(novoCliente, (erro) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: 'Erro ao cadastrar cliente',
                    erro: erro.message
                });
            }

            res.redirect('/clientes');
        });
    },

    exibirFormularioEdicao: (req, res) => {
        const clienteId = req.params.id;

        Cliente.findById(clienteId, (erro, cliente) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: 'Erro ao buscar cliente',
                    erro: erro.message
                });
            }

            if (!cliente) {
                return res.status(404).send('Cliente não encontrado');
            }

            res.render('clientes/edit', { cliente });
        });
    },

    atualizarCliente: (req, res) => {
        const clienteId = req.params.id;

        const clienteAtualizado = {
            nome: req.body.nome,
            email: req.body.email,
            telefone: req.body.telefone,
            cpf: req.body.cpf,
            instituicao: req.body.instituicao,
            id_endereco: req.body.id_endereco || null
        };

        if (
            !clienteAtualizado.nome ||
            clienteAtualizado.nome.trim() === ''
        ) {
            return res.status(400).send(
                'O nome do cliente é obrigatório'
            );
        }

        Cliente.update(
            clienteId,
            clienteAtualizado,
            (erro) => {
                if (erro) {
                    return res.status(500).json({
                        mensagem: 'Erro ao atualizar cliente',
                        erro: erro.message
                    });
                }

                res.redirect('/clientes');
            }
        );
    },

    excluirCliente: (req, res) => {
        const clienteId = req.params.id;

        Cliente.delete(clienteId, (erro) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: 'Erro ao excluir cliente',
                    erro: erro.message
                });
            }

            res.redirect('/clientes');
        });
    },

    pesquisarClientes: (req, res) => {
        const pesquisa = req.query.search || '';

        Cliente.searchByName(pesquisa, (erro, clientes) => {
            if (erro) {
                return res.status(500).json({
                    mensagem: 'Erro ao pesquisar clientes',
                    erro: erro.message
                });
            }

            res.json({ clientes });
        });
    }
};

module.exports = clienteController;