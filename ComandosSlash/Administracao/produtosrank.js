const { MessageEmbed, MessageActionRow, MessageButton, ApplicationCommandType } = require('discord.js');
const { estatisticas, Emojis } = require("../../DataBaseJson");

module.exports = {
    name: 'produtos-populares',
    description: 'Mostra os produtos mais vendidos',
    type: ApplicationCommandType.ChatInput,
    
    async run(client, interaction) {
        console.log("Dados recebidos:", JSON.stringify(estatisticas, null, 2));

        // Verificar se estatisticas é um objeto
        if (typeof estatisticas !== 'object' || estatisticas === null) {
            console.log("estatisticas não é um objeto válido:", estatisticas);
            return interaction.reply("Erro ao carregar os dados de vendas. Por favor, tente novamente mais tarde.");
        }

        // Processar os dados
        const produtosVendidos = {};
        Object.entries(estatisticas).forEach(([key, venda]) => {
            console.log(`Processando venda: ${key}`, venda);
            if (venda && typeof venda === 'object' && 'produto' in venda) {
                if (!produtosVendidos[venda.produto]) {
                    produtosVendidos[venda.produto] = {
                        quantidade: 0,
                        valor: 0
                    };
                }
                produtosVendidos[venda.produto].quantidade += venda.quantidade || 1;
                produtosVendidos[venda.produto].valor += venda.valor || 0;
            } else {
                console.log(`Venda inválida encontrada: ${key}`, venda);
            }
        });

        console.log("Produtos processados:", produtosVendidos);

        // Verificar se há produtos para exibir
        if (Object.keys(produtosVendidos).length === 0) {
            console.log("Nenhum produto encontrado para exibir");
            return interaction.reply(`${Emojis.get(`negative_emoji`)} Não há produtos vendidos para exibir no momento.`);
        }

        // Ordenar produtos por quantidade vendida
        const produtosOrdenados = Object.entries(produtosVendidos)
            .sort((a, b) => b[1].quantidade - a[1].quantidade)
            .map(([nome, dados]) => ({ nome, ...dados }));

        const produtosPorPagina = 5;
        const paginas = Math.ceil(produtosOrdenados.length / produtosPorPagina);

        let paginaAtual = 0;

        // Função para criar a embed
        const criarEmbed = (pagina) => {
            const inicio = pagina * produtosPorPagina;
            const fim = inicio + produtosPorPagina;
            const produtosPagina = produtosOrdenados.slice(inicio, fim);

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🏆 Produtos Mais Vendidos 🏆')
                .setDescription('Confira os produtos mais populares da nossa loja!')
                .setFooter({ text: `Página ${pagina + 1} de ${paginas}` });

            produtosPagina.forEach((produto, index) => {
                embed.addFields({
                    name: `${inicio + index + 1}. ${produto.nome}`,
                    value: `Vendas: ${produto.quantidade} | Valor Total: R$ ${produto.valor.toFixed(2)}`,
                    inline: false
                });
            });

            return embed;
        };

        // Criar botões
        const botoes = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('anterior')
                    .setLabel('Anterior')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('1309904120068702288'),
                new ButtonBuilder()
                    .setCustomId('proximo')
                    .setLabel('Próximo')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('1309903091088494632')
            );

        // Enviar mensagem inicial
        const mensagem = await interaction.reply({
            embeds: [criarEmbed(paginaAtual)],
            components: [botoes],
            fetchReply: true
        });

        // Criar coletor de interações
        const coletor = mensagem.createMessageComponentCollector({
            filter: i => i.user.id === interaction.user.id,
            time: 60000
        });

        coletor.on('collect', async i => {
            if (i.customId === 'anterior') {
                paginaAtual = (paginaAtual - 1 + paginas) % paginas;
            } else if (i.customId === 'proximo') {
                paginaAtual = (paginaAtual + 1) % paginas;
            }

            await i.update({
                embeds: [criarEmbed(paginaAtual)],
                components: [botoes]
            });
        });

        coletor.on('end', () => {
            botoes.components.forEach(button => button.setDisabled(true));
            interaction.editReply({ components: [botoes] });
        });
    },
};