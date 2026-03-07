const { PermissionFlagsBits, EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ComponentType } = require("discord.js");
const { pedidos, pagamentos, carrinhos, configuracao, produtos, Temporario } = require("../../DataBaseJson");
const { Emojis } = require("../../DataBaseJson");

module.exports = {
    name: "announce",
    description: "Use it to make an announcement via the bot.",
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: PermissionFlagsBits.Administrator,
    ContentAnnounce,

    run: async (client, interaction, message) => {

        if (interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({  content: `${Emojis.get(`negative_emoji`)} Faltam permissões.`, ephemeral: true });
        }

        ContentAnnounce(client, interaction)
    }
}

async function ContentAnnounce(client, interaction) {

    const anuncio = Temporario.get(`Anuncio`) || {}

    const {
        content = ``,
        contentimagem = ``,
        imagem = ``,
        thumbnail = ``,
        author = ``,
        title = ``,
        description = ``,
        color = ``,
        footer = ``,
    } = anuncio;


    const embedexemple = new EmbedBuilder()

    if (imagem != ``) {
        embedexemple.setImage(imagem)
    }
    if (thumbnail != ``) {
        embedexemple.setThumbnail(thumbnail)
    }
    if (author != ``) {
        embedexemple.setAuthor({ name: author })
    }
    if (title != ``) {
        embedexemple.setTitle(title)
    }
    if (description != ``) {
        embedexemple.setDescription(description)
    }
    if (color != ``) {
        embedexemple.setColor(color)
    }
    if (footer != ``) {
        embedexemple.setFooter({ text: footer })
    }


    const botao = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("definirmsganuncio")
            .setLabel('Definir mensagem')
            .setEmoji(`${Emojis.get(`_lapis_emoji`)}`)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId("limparmsganuncio")
            .setLabel('Limpar')
            .setEmoji(`${Emojis.get(`_trash_emoji`)}`)
            .setDisabled(!Temporario.get(`Anuncio.content`))
            .setStyle(4),
    )

    const botao2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("definirembedanuncio")
            .setLabel('Definir corpo do Embed')
            .setEmoji(`${Emojis.get(`_custom_emoji`)}`)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId("limparembedanuncio")
            .setLabel('Limpar')
            .setEmoji(`${Emojis.get(`_trash_emoji`)}`)
            .setDisabled(!Temporario.get(`Anuncio.title`))
            .setStyle(4),
    )

    const botao3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("definirimagemanuncio")
            .setLabel('Definir imagem')
            .setEmoji(`${Emojis.get(`photo_emoji`)}`)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId("limparimagemanuncio")
            .setLabel('Limpar')
            .setEmoji(`${Emojis.get(`_trash_emoji`)}`)
            .setDisabled(!Temporario.get(`Anuncio.contentimagem`) && !Temporario.get(`Anuncio.imagem`) && !Temporario.get(`Anuncio.thumbnail`))
            .setStyle(4),
    )

    const postar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("postaranuncio")
            .setLabel('Postar mensagem')
            .setEmoji(`${Emojis.get(`_confirm_emoji`)}`)
            .setDisabled(!Temporario.get(`Anuncio.title`) && !Temporario.get(`Anuncio.content`) && !Temporario.get(`Anuncio.contentimagem`))
            .setStyle(1),
    )

    const updatemessage = {
        content: content != `` ? content : ``,
        embeds: embedexemple.length > 0 ? [embedexemple] : [],
        components: [botao, botao2, botao3, postar],
        files: contentimagem != `` ? [contentimagem] : [],
        ephemeral: true
    }

    if (!interaction.message) {
        await interaction.reply(updatemessage)
    } else {
        await interaction.update(updatemessage)
    }
}
