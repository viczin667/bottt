
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require("discord.js")
const { produtos, Temporario, Emojis, configuracao } = require("../../DataBaseJson");
const { QuickDB } = require("quick.db");
const { EfiBankConfiguracao } = require("../../Functions/FormasDePagamentosConfig");

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {
        if (interaction.type == InteractionType.ModalSubmit) {
            if (interaction.customId === `alterarcredenciais`) {
                const clientid = interaction.fields.getTextInputValue("clientid")
                const clientsecret = interaction.fields.getTextInputValue("clientsecret")

                await interaction.update({ content: `Agora, envie o arquivo do certificado \`.p12\` como um anexo.`, embeds: [], components: [] }).then(async () => {
                    const filter = (m) => m.author.id === interaction.user.id
                    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 })
                    collector.on('collect', async (m) => {
                        if (m.attachments.first()) {
                            const file = m.attachments.first()
                            if (file.name.endsWith(".p12")) {
                                const fs = require("fs")
                                const path = require("path")
                                const https = require("https");
                                const axios = require("axios");

                                try {
                                    m.delete();

                                    const certificadoPath = path.join(`./Eventos/Sistema De Configuracao/${file.name}`);

                                    const response = await axios.get(file.url, { responseType: "arraybuffer" });
                                    fs.writeFileSync(certificadoPath, response.data);

                                    const certificadoBuffer = fs.readFileSync(certificadoPath);

                                    const authData = Buffer.from(`${clientid}:${clientsecret}`).toString("base64");
                                    const agent = new https.Agent({ pfx: certificadoBuffer, passphrase: "" });

                                    const tokenResponse = await axios.post(
                                        "https://pix.api.efipay.com.br/oauth/token",
                                        JSON.stringify({ grant_type: "client_credentials" }),
                                        {
                                            headers: {
                                                Authorization: `Basic ${authData}`,
                                                "Content-Type": "application/json",
                                            },
                                            httpsAgent: agent,
                                        }
                                    );
                                    const access_token = tokenResponse.data.access_token;

                                    const chavesPixResponse = await axios.get("https://pix.api.efipay.com.br/v2/gn/evp", {
                                        headers: {
                                            Authorization: `Bearer ${access_token}`,
                                            "Content-Type": "application/json",
                                        },
                                        httpsAgent: agent,
                                    });
                                    let chavepix = ``
                                    if (chavesPixResponse.data.chaves.length < 1) {
                                        const chavesPixResponse = await axios.post("https://pix.api.efipay.com.br/v2/gn/evp", {
                                            headers: {
                                                Authorization: `Bearer ${access_token}`,
                                                "Content-Type": "application/json",
                                            },
                                            httpsAgent: agent,
                                        });
                                        chavepix = chavesPixResponse.data.chaves[0]
                                    } else {
                                        chavepix = chavesPixResponse.data.chaves[0]
                                    }
                                    
                                    configuracao.set("pagamentos.EfiAPI", {
                                        client_id: clientid,
                                        client_secret: clientsecret,
                                        chavepix: chavepix,
                                        certificado: file.name,
                                    });
                                    configuracao.set("pagamentos.EfiOnOff", true);
                                    configuracao.set("pagamentos.MpOnOff", false);
                                    configuracao.set("pagamentos.MpSite", false);

                                    await interaction.editReply({
                                        content: `${Emojis.get("confirmed_emoji")} Certificado enviado com sucesso!`,
                                        embeds: [],
                                        components: [],
                                    });
                                    EfiBankConfiguracao(client, interaction, 1);
                                } catch (error) {
                                    console.error("Erro:", error.message);
                                    await interaction.editReply({
                                        content: `${Emojis.get("negative_emoji")} Houve um erro ao salvar as informações, tente novamente.`,
                                        embeds: [],
                                        components: [],
                                    });
                                    setTimeout(() => {
                                        EfiBankConfiguracao(client, interaction, 1);
                                    }, 3000);
                                }
                            } else {
                                await interaction.editReply({ content: `${Emojis.get(`negative_emoji`)} O arquivo enviado não é um certificado \`.p12\`!`, embeds: [], components: [] })
                                EfiBankConfiguracao(client, interaction, 1)
                            }
                        } else {
                            await interaction.editReply({ content: `${Emojis.get(`negative_emoji`)} Você não enviou nenhum arquivo!`, embeds: [], components: [] })
                            EfiBankConfiguracao(client, interaction, 1)
                        }
                    })
                })
            }
        }
        if (interaction.isButton()) {
            if (interaction.customId === `efionoff`) {
                let status = configuracao.get("pagamentos.EfiOnOff") || false
                configuracao.set("pagamentos.EfiOnOff", !status)
                EfiBankConfiguracao(client, interaction)
            }
            if (interaction.customId === `configurarefibank`) {
                EfiBankConfiguracao(client, interaction)
            }
            if (interaction.customId === `alterarcredenciais`) {
                const modal = new ModalBuilder()
                    .setCustomId(`alterarcredenciais`)
                    .setTitle(`Credenciais Efi Bank`)

                const clientid = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("clientid")
                        .setLabel("CLIENT ID")
                        .setPlaceholder("Client_id_XxxXxXx")
                        .setValue(`${configuracao.get("pagamentos.EfiAPI.client_id") || ""}`)
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                )

                const clientsecret = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId("clientsecret")
                        .setLabel("CLIENT SECRET")
                        .setPlaceholder("Client_secret_XxxXxXx")
                        .setValue(`${configuracao.get("pagamentos.EfiAPI.client_secret") || ""}`)
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short)
                )

                modal.addComponents(clientid, clientsecret)
                await interaction.showModal(modal)
            }
        }
    }
}
