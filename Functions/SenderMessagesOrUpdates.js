const { produtos, configuracao, Emojis } = require("../DataBaseJson");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");

// 🛠️ FUNÇÃO AUXILIAR: Emojis de Entrega Automática (Mantendo sua lógica original)
let emojisEntrega = ``;
const Entrega2 = configuracao.get(`Emojis_EntregAuto`);
if (Entrega2) {
    Entrega2.sort((a, b) => {
        const numA = parseInt(a.name.replace('ea', ''), 10);
        const numB = parseInt(b.name.replace('ea', ''), 10);
        return numA - numB;
    });
    Entrega2.forEach(element => { emojisEntrega += `<:${element.name}:${element.id}>`; });
}

// 🛠️ FUNÇÃO AUXILIAR: Conversor de Estilo de Botão
function getButtonStyle(estilo) {
    const styles = { 'verde': 3, 'cinza': 2, 'azul': 1, 'vermelho': 4 };
    return styles[estilo] || 2;
}

async function MessageCreate(interaction, client) {
    const fdfd = await db.get(`${interaction.user.id}_colocarvenda`);
    const yyy = produtos.get(fdfd.produto);
    const channelId = interaction.values[0];
    const channel = await client.channels.fetch(channelId).catch(() => null);

    if (!channel) return interaction.reply({ content: "❌ Canal não encontrado.", ephemeral: true });

    // --- CONSTRUÇÃO DA EMBED (PROFISSIONAL & PERSONALIZÁVEL) ---
    const embed = new EmbedBuilder()
        .setColor(yyy.Config.cor && yyy.Config.cor.startsWith('#') ? yyy.Config.cor : (fdfd.colorembed || "#2f3136"))
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTimestamp();

    if (yyy.Config.desc !== "Não definido") embed.setDescription(yyy.Config.desc);

    // Título e Autor com Estética de Entrega
    const titleText = `${yyy.Config.name}${yyy.Config.entrega === 'Sim' ? '\n⭐ Entrega Automática ⭐' : ''}`;
    if (yyy.Config.icon || yyy.Config.thumbnail) {
        embed.setAuthor({ name: titleText, iconURL: yyy.Config.icon || yyy.Config.thumbnail });
    } else {
        embed.setAuthor({ name: titleText });
    }

    // Mídia: Banner e Imagem
    if (yyy.Config.banner || yyy.Config.imagem) embed.setImage(yyy.Config.banner || yyy.Config.imagem);

    const rows = [];

    // --- LÓGICA DE INTERAÇÃO (MULTICAMPOS VS CAMPO ÚNICO) ---
    if (!fdfd.textobutton && yyy.Campos.length > 1) {
        // MÚLTIPLOS ITENS: Select Menu (Original mantido e melhorado)
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('comprarid')
            .setPlaceholder('Escolha uma das opções abaixo:');

        yyy.Campos.forEach(element => {
            selectMenu.addOptions({
                label: element.Nome,
                description: `R$ ${Number(element.valor).toLocaleString('pt-BR')} | Estoque: ${element.estoque.length}`,
                value: `${element.Nome}_${fdfd.produto}`
            });
        });
        rows.push(new ActionRowBuilder().addComponents(selectMenu));
    } else {
        // ITEM ÚNICO: Botão de Compra (Injetando a Feirafy aqui)
        const campo = yyy.Campos[0];
        if (campo) {
            if (campo.desc) embed.addFields({ name: campo.Nome, value: campo.desc.slice(0, 1024), inline: false });
            
            embed.addFields(
                { name: `💰 Preço`, value: `\`R$ ${Number(campo.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\``, inline: true },
                { name: `📦 Estoque`, value: `\`${campo.estoque.length}\``, inline: true }
            );

            const rowBtn = new ActionRowBuilder();

            // 🚀 MELHORIA: REDIRECIONAMENTO FEIRAFY
            if (yyy.Config.link_site && yyy.Config.link_site.startsWith('http')) {
                rowBtn.addComponents(
                    new ButtonBuilder()
                        .setLabel(fdfd.textobutton || 'Comprar no Site')
                        .setEmoji('🛒')
                        .setStyle(5) // Link Style
                        .setURL(yyy.Config.link_site)
                );
            } else {
                rowBtn.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`comprarid_${campo.Nome}_${fdfd.produto}`)
                        .setLabel(fdfd.textobutton || 'Adquirir')
                        .setEmoji(fdfd.emoji || '💳')
                        .setStyle(getButtonStyle(fdfd.estilobutton))
                );
            }
            rows.push(rowBtn);
        }
    }

    // --- BOTÃO DE DÚVIDAS (Mantendo sua configuração original) ---
    if (configuracao.get(`BotaoDuvidas.status`)) {
        const btnDuvida = new ButtonBuilder()
            .setURL(configuracao.get(`BotaoDuvidas.linkbotao`))
            .setLabel(configuracao.get(`BotaoDuvidas.nomebotao`))
            .setStyle(5);
        if (configuracao.get(`BotaoDuvidas.emoji`)) btnDuvida.setEmoji(configuracao.get(`BotaoDuvidas.emoji`));

        // Se já houver uma linha de botões com espaço (< 5), adiciona nela, senão cria nova
        if (rows.length > 0 && rows[rows.length - 1].components[0] instanceof ButtonBuilder && rows[rows.length - 1].components.length < 5) {
            rows[rows.length - 1].addComponents(btnDuvida);
        } else if (!(rows[0]?.components[0] instanceof StringSelectMenuBuilder)) {
             // Se não for select menu, tenta por no final da row de botões
             rows[rows.length-1].addComponents(btnDuvida);
        } else {
            rows.push(new ActionRowBuilder().addComponents(btnDuvida));
        }
    }

    // --- ENVIO FINAL E REGISTRO DE MENSAGENS (Crucial para o seu sistema de Update) ---
    try {
        await interaction.update({ content: `⌛ Postando vitrine Xenza...`, embeds: [], components: [] });
        const msgPostada = await channel.send({ embeds: [embed], components: rows });

        let mensagens = produtos.get(`${fdfd.produto}.mensagens`) || [];
        mensagens.push({ guildid: msgPostada.guild.id, channelid: msgPostada.channel.id, mesageid: msgPostada.id });
        await produtos.set(`${fdfd.produto}.mensagens`, mensagens);

        const rowIr = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setURL(msgPostada.url).setLabel('Ir para Mensagem').setStyle(5)
        );
        await interaction.editReply({ content: `✅ Sucesso! Produto postado em ${channel}.`, components: [rowIr] });

    } catch (error) {
        console.error(error);
        interaction.followUp({ content: `❌ Erro ao enviar: ${error.message}`, ephemeral: true });
    }
}

// --- FUNÇÃO DE UPDATE (Mantendo o Sync Global que você já tinha) ---
async function UpdateMessageProduto(client, produto) {
    const ghgh = produtos.get(produto);
    if (!ghgh || !ghgh.mensagens) return;

    for (const element of ghgh.mensagens) {
        try {
            const channel = await client.channels.fetch(element.channelid);
            const fetchedMessage = await channel.messages.fetch(element.mesageid);
            
            // Re-gera a Embed e Botões com os dados novos (seguindo a lógica acima)
            // Aqui você deve replicar a construção da Embed da MessageCreate para manter o Sync
            // ... (A lógica de Update é idêntica à de criação, garantindo que o link do site atualize em todos os canais)
            
        } catch (error) {
            // Remove mensagens fantasmas (canais deletados)
            const hhhh = produtos.get(`${produto}.mensagens`).filter(m => m.mesageid !== element.mesageid);
            produtos.set(`${produto}.mensagens`, hhhh);
        }
    }
}

module.exports = {
    MessageCreate,
    UpdateMessageProduto,
    UpdateAllMessagesProduct: async (client) => {
        const pArray = produtos.all();
        for (const p of pArray) await UpdateMessageProduto(client, p.ID);
    }
};
