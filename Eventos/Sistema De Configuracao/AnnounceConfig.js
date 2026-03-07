const { ActionRowBuilder, TextInputBuilder, TextInputStyle, InteractionType, ModalBuilder, ButtonBuilder, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, EmbedBuilder } = require("discord.js");
const { configuracao, Temporario, Emojis } = require("../../DataBaseJson");
const { AcoesAutomaticsConfigs } = require("../../Functions/AcoesAutomatics");
const { ContentAnnounce } = require("../../ComandosSlash/Administracao/announce");

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        if (interaction.isChannelSelectMenu()) {
            if (interaction.customId === `postaranuncio`) {
                const canalId = interaction.values[0];
                let canal = await client.channels.fetch(canalId).catch(() => null);
                if (!canal) return interaction.reply({ content: "Canal não encontrado ou sem permissão.", ephemeral: true });

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

                const updatemessage = {
                    content: content != `` ? content : ``,
                    embeds: embedexemple.length > 0 ? [embedexemple] : [],
                    files: contentimagem != `` ? [contentimagem] : []
                }

                canal.send(updatemessage).then(async (msg) => {
                    interaction.update({ content: `${Emojis.get(`confirmed_emoji`)} Anuncio enviado com sucesso.`, components: [], ephemeral: true })
                    Temporario.delete(`Anuncio`)
                }).catch(async (err) => {
                    await ContentAnnounce(client, interaction)
                    interaction.followUp({ content: `${Emojis.get(`negative_emoji`)} Erro ao enviar o anuncio.`, components: [], ephemeral: true })
                })
            }
        }
        if (interaction.isButton()) {
            if (interaction.customId === `postaranuncio`) {
                const botao = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setChannelTypes(ChannelType.GuildText)
                        .setCustomId(`postaranuncio`)
                        .setPlaceholder(`Selecione um canal`)
                        .setMaxValues(1)
                )

                interaction.update({ content: ``, components: [botao], embeds: [], files: [] })
            }
            if (interaction.customId === `limparmsganuncio`) {
                Temporario.delete(`Anuncio.content`)
                ContentAnnounce(client, interaction)
            }
            if (interaction.customId === `limparembedanuncio`) {
                Temporario.delete(`Anuncio.author`)
                Temporario.delete(`Anuncio.title`)
                Temporario.delete(`Anuncio.description`)
                Temporario.delete(`Anuncio.color`)
                Temporario.delete(`Anuncio.footer`)
                ContentAnnounce(client, interaction)
            }
            if (interaction.customId === `limparimagemanuncio`) {
                Temporario.delete(`Anuncio.contentimagem`)
                Temporario.delete(`Anuncio.imagem`)
                Temporario.delete(`Anuncio.thumbnail`)
                ContentAnnounce(client, interaction)
            }
            if (interaction.customId === `definirmsganuncio`) {
                const modal = new ModalBuilder()
                    .setCustomId(`definirmsganuncio`)
                    .setTitle(`Definir Mensagem`)

                const mensagem = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`content`)
                        .setLabel(`DEFINIR MENSAGEM`)
                        .setValue(`${Temporario.get(`Anuncio.content`) || ''}`)
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )

                modal.addComponents(mensagem)
                await interaction.showModal(modal)
            }
            if (interaction.customId === `definirembedanuncio`) {
                const modal = new ModalBuilder()
                    .setCustomId(`definirembedanuncio`)
                    .setTitle(`Definir Embed`)

                const author = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`author`)
                        .setLabel(`DEFINIR AUTHOR (OPCIONAL)`)
                        .setValue(`${Temporario.get(`Anuncio.author`) || ''}`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                )

                const title = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`title`)
                        .setLabel(`DEFINIR TITULO (OBRIGATORIO)`)
                        .setValue(`${Temporario.get(`Anuncio.title`) || ''}`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                )

                const description = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`description`)
                        .setLabel(`DEFINIR DESCRICAO (OBRIGATORIO)`)
                        .setValue(`${Temporario.get(`Anuncio.description`) || ''}`)
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )

                const color = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`color`)
                        .setLabel(`DEFINIR COR (OPCIONAL)`)
                        .setValue(`${Temporario.get(`Anuncio.color`) || ''}`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                )

                const footer = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`footer`)
                        .setLabel(`DEFINIR FOOTER (OPCIONAL)`)
                        .setValue(`${Temporario.get(`Anuncio.footer`) || ''}`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                )

                modal.addComponents(author, title, description, color, footer)
                await interaction.showModal(modal)
            }
            if (interaction.customId === `definirimagemanuncio`) {
                const modal = new ModalBuilder()
                    .setCustomId(`definirimagemanuncio`)
                    .setTitle(`Definir Imagem`)

                const contentimagem = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`contentimagem`)
                        .setLabel(`DEFINIR IMAGEM (OPCIONAL)`)
                        .setValue(`${Temporario.get(`Anuncio.contentimagem`) || ''}`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                )

                const imagem = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`imagem`)
                        .setLabel(`DEFINIR IMAGEM (OPCIONAL)`)
                        .setValue(`${Temporario.get(`Anuncio.imagem`) || ''}`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                )

                const thumbnail = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`thumbnail`)
                        .setLabel(`DEFINIR THUMBNAIL (OPCIONAL)`)
                        .setValue(`${Temporario.get(`Anuncio.thumbnail`) || ''}`)
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false)
                )

                modal.addComponents(contentimagem, imagem, thumbnail)
                await interaction.showModal(modal)
            }
        }
        if (interaction.type == InteractionType.ModalSubmit) {
            if (interaction.customId === `definirmsganuncio`) {
                Temporario.set(`Anuncio.content`, interaction.fields.getTextInputValue(`content`))
                ContentAnnounce(client, interaction)
            }
            if (interaction.customId === `definirembedanuncio`) {
                let author = interaction.fields.getTextInputValue(`author`) || ``
                let title = interaction.fields.getTextInputValue(`title`) || ``
                let description = interaction.fields.getTextInputValue(`description`) || ``
                let color = interaction.fields.getTextInputValue(`color`) || ``
                let footer = interaction.fields.getTextInputValue(`footer`) || ``

                if (author != ``) {
                    Temporario.set(`Anuncio.author`, author)
                }
                if (title != ``) {
                    Temporario.set(`Anuncio.title`, title)
                }
                if (description != ``) {
                    Temporario.set(`Anuncio.description`, description)
                }
                if (color != ``) {
                    Temporario.set(`Anuncio.color`, color)
                }
                if (footer != ``) {
                    Temporario.set(`Anuncio.footer`, footer)
                }


                ContentAnnounce(client, interaction)
            }
            if (interaction.customId === `definirimagemanuncio`) {
                let contentimagem = interaction.fields.getTextInputValue(`contentimagem`) || ``
                let imagem = interaction.fields.getTextInputValue(`imagem`) || ``
                let thumbnail = interaction.fields.getTextInputValue(`thumbnail`) || ``

                if (contentimagem != ``) {
                    Temporario.set(`Anuncio.contentimagem`, contentimagem)
                }
                if (imagem != ``) {
                    Temporario.set(`Anuncio.imagem`, imagem)
                }
                if (thumbnail != ``) {
                    Temporario.set(`Anuncio.thumbnail`, thumbnail)
                }


                ContentAnnounce(client, interaction)
            }
        }
    }
}