const Pedido = require('../models/pedidoModel');

const STATUS_VALIDOS = [
    'NOVO',
    'EM_PREPARO',
    'PRONTO',
    'EM_ENTREGA',
    'ENTREGUE',
    'CANCELADO'
];

function transformarItens(body) {
    /*
     * O formulário antigo usa "items".
     * O novo formulário usará "itens".
     * Assim os dois formatos funcionam temporariamente.
     */
    const itensRecebidos =
        body.itens || body.items || [];

    const lista = Array.isArray(itensRecebidos)
        ? itensRecebidos
        : [itensRecebidos];

    return lista
        .filter((item) => {
            return item && item.id_produto;
        })
        .map((item) => {
            return {
                id_produto: Number(
                    item.id_produto
                ),

                quantidade: Number(
                    item.quantidade
                )
            };
        });
}

function validarPedido(dadosPedido) {
    if (
        !Number.isInteger(dadosPedido.id_cliente) ||
        dadosPedido.id_cliente <= 0
    ) {
        return 'Selecione um cliente válido.';
    }

    if (
        !['RETIRADA', 'ENTREGA'].includes(
            dadosPedido.tipo_entrega
        )
    ) {
        return 'O tipo de entrega é inválido.';
    }

    if (dadosPedido.itens.length === 0) {
        return 'O pedido precisa ter pelo menos um item.';
    }

    const itemInvalido = dadosPedido.itens.some(
        (item) => {
            return (
                !Number.isInteger(item.id_produto) ||
                item.id_produto <= 0 ||
                !Number.isInteger(item.quantidade) ||
                item.quantidade <= 0
            );
        }
    );

    if (itemInvalido) {
        return 'Os produtos e quantidades precisam ser válidos.';
    }

    return null;
}

const pedidoController = {
    listarPedidos: async (req, res) => {
        try {
            const pedidos =
                await Pedido.listarTodos();

            res.render('pedidos/index', {
                pedidos
            });
        } catch (erro) {
            res.status(500).json({
                mensagem: 'Erro ao buscar pedidos',
                erro: erro.message
            });
        }
    },

    exibirFormularioCadastro: async (
        req,
        res
    ) => {
        try {
            const dados =
                await Pedido.buscarDadosFormulario();

            res.render('pedidos/create', {
                clientes: dados.clientes,
                formas: dados.formas,
                produtos: dados.produtos
            });
        } catch (erro) {
            res.status(500).json({
                mensagem:
                    'Erro ao carregar o formulário',
                erro: erro.message
            });
        }
    },

    cadastrarPedido: async (req, res) => {
        try {
            const idFormaPagamento =
                req.body.id_forma_pagamento
                    ? Number(
                        req.body.id_forma_pagamento
                    )
                    : null;

            const dadosPedido = {
                id_cliente: Number(
                    req.body.id_cliente
                ),

                id_forma_pagamento:
                    idFormaPagamento,

                tipo_entrega:
                    req.body.tipo_entrega,

                observacao:
                    req.body.observacao
                        ? req.body.observacao.trim()
                        : null,

                itens: transformarItens(req.body)
            };

            const erroValidacao =
                validarPedido(dadosPedido);

            if (erroValidacao) {
                return res
                    .status(400)
                    .send(erroValidacao);
            }

            const resultado =
                await Pedido.criarCompleto(
                    dadosPedido
                );

            res.redirect(
                `/pedidos/${resultado.pedidoId}`
            );
        } catch (erro) {
            res.status(500).json({
                mensagem: 'Erro ao criar pedido',
                erro: erro.message
            });
        }
    },

    visualizarPedido: async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {
                return res
                    .status(400)
                    .send('ID de pedido inválido.');
            }

            const [pedido, itens] =
                await Promise.all([
                    Pedido.buscarPorId(id),
                    Pedido.buscarItens(id)
                ]);

            if (!pedido) {
                return res
                    .status(404)
                    .send('Pedido não encontrado.');
            }

            /*
             * Mantemos o nome "items" porque a tela
             * atual ainda utiliza essa variável.
             */
            res.render('pedidos/show', {
                pedido,
                items: itens,
                itens
            });
        } catch (erro) {
            res.status(500).json({
                mensagem: 'Erro ao buscar pedido',
                erro: erro.message
            });
        }
    },

    atualizarStatus: async (req, res) => {
        try {
            const id = Number(req.params.id);
            const status = req.body.status;

            if (!STATUS_VALIDOS.includes(status)) {
                return res
                    .status(400)
                    .send('Status inválido.');
            }

            const alterados =
                await Pedido.atualizarStatus(
                    id,
                    status
                );

            if (alterados === 0) {
                return res
                    .status(404)
                    .send('Pedido não encontrado.');
            }

            const destino =
    req.body.redirecionar_para === '/cozinha'
        ? '/cozinha'
        : `/pedidos/${id}`;

res.redirect(destino);
        } catch (erro) {
            res.status(500).json({
                mensagem:
                    'Erro ao atualizar o status',
                erro: erro.message
            });
        }
    },

    excluirPedido: async (req, res) => {
        try {
            const id = Number(req.params.id);

            const excluidos =
                await Pedido.excluir(id);

            if (excluidos === 0) {
                return res
                    .status(404)
                    .send('Pedido não encontrado.');
            }

            res.redirect('/pedidos');
        } catch (erro) {
            res.status(500).json({
                mensagem: 'Erro ao excluir pedido',
                erro: erro.message
            });
        }
    }
};

module.exports = pedidoController;