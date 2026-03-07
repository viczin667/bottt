const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, AttachmentBuilder } = require("discord.js");
const { produtos, configuracao, Emojis } = require("../DataBaseJson");
const fs = require('fs');
const https = require('https');
const axios = require('axios');
const mercadopago = require('mercadopago');

async function configqrcode(interaction, client) {

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`qrcode-button`)
      .setLabel(`Enviar logo`)
      .setEmoji(`1238299494181896306`)
      .setStyle(1),
    new ButtonBuilder()
      .setCustomId(`qrcode-pisicao`)
      .setLabel(`Mudar Posição`)
      .setEmoji(`1256808767325081683`)
      .setStyle(1),

  )

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`qrcode-colors`)
      .setLabel(`Editar Cores`)
      .setEmoji(`${Emojis.get(`_pincel_emoji`)}`)
      .setStyle(1),
    new ButtonBuilder()
      .setCustomId(`qrcode-teste`)
      .setLabel(`Testar`)
      .setEmoji(`${Emojis.get(`_star_emoji`)}`)
      .setStyle(2),
  )

  const botoesvoltar = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("voltarsendlogo")
      .setLabel('Voltar')
      .setEmoji(`1238413255886639104`)
      .setStyle(2),
  )

  if (interaction.message) {
    await interaction.update({ content: `Aqui, você pode escolher o logo da sua marca, que será exibido nos QRCodes de pagamento criados.`, components: [row1, row2, botoesvoltar], embeds: [], ephemeral: true })
  }

}
async function TestarQRCode(interaction, client) {
  await interaction.reply({ content: `${Emojis.get(`loading_emoji`)} Aguarde...`, ephemeral: true, components: [], embeds: [] })

  if (!configuracao.get(`pagamentos.EfiOnOff`) && !configuracao.get(`pagamentos.MpOnOff`) && !configuracao.get(`pagamentos.MpSite`)) return interaction.editReply({ content: `${Emojis.get(`warn_emoji`)} Você não ativou nenhum método de pagamento automático.`, ephemeral: true })
  if (configuracao.get(`pagamentos.EfiOnOff`)) {

    interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Gerando QRCode teste...`, ephemeral: true, components: [], embeds: [] })
    let certificado = fs.readFileSync(`./Eventos/Sistema De Configuracao/${configuracao.get("pagamentos.EfiAPI.certificado")}`);

    const httpsAgent = new https.Agent({
      pfx: certificado,
      passphrase: "",
    });

    var data = JSON.stringify({ grant_type: "client_credentials" });
    var data_credentials = configuracao.get(`pagamentos.EfiAPI.client_id`) + ":" + configuracao.get(`pagamentos.EfiAPI.client_secret`);
    var auth = Buffer.from(data_credentials).toString("base64");


    var config = {
      method: "POST",
      url: "https://pix.api.efipay.com.br/oauth/token",
      headers: {
        Authorization: "Basic " + auth,
        "Content-Type": "application/json",
      },
      httpsAgent: httpsAgent,
      data: data,
    };

    let access_token = await axios(config).then(function (response) {
      return response.data.access_token
    }).catch(function (error) {
      console.log(`Novo erro: ${error}`)
    })

    let valor = 10

    interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Espere só mais um pouco...`, ephemeral: true, components: [], embeds: [] })


    var data = JSON.stringify({
      "calendario": {
        "expiracao": 10 * 60
      },
      "devedor": {
        "cpf": "12345678909",
        "nome": `${interaction.user.username}`,
      },
      "valor": {
        "original": `${valor.toFixed(2)}`,
      },
      "chave": `${configuracao.get(`pagamentos.EfiAPI.chavepix`)}`,
      "solicitacaoPagador": "Cobrança dos serviços prestados."
    });

    var config = {
      method: "post",
      url: "https://pix.api.efipay.com.br/v2/cob",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json"
      },
      httpsAgent: httpsAgent,
      data: data,
    };

    let response = await axios(config).then(function (response) {
      return response.data
    }).catch(function (error) {
      console.log(error.response.data)
    })

    const { qrGenerator } = require('../Lib/QRCodeLib')
    const qr = new qrGenerator({ imagePath: './Lib/aaaaa.png' })
    const qrcode = await qr.generate(response.pixCopiaECola)

    const buffer = Buffer.from(qrcode.response, "base64");
    const attachment = new AttachmentBuilder(buffer, { name: "payment.png" });

    const embed = new EmbedBuilder()
      .setColor(`${configuracao.get(`QRCode.principal`) || `#328dbc`}`)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) ? interaction.user.displayAvatarURL({ dynamic: true }) : null })
      .setTitle(`${Emojis.get(`pix_stamp_emoji`)} Pagamento via PIX criado`)
      .addFields(
        { name: `${Emojis.get(`time_emoji`)} Expira em:`, value: `<t:${Math.floor(Date.now() / 1000) + 600}:R>` },
        { name: `${Emojis.get(`information_emoji`)} Código Copia e Cola:`, value: `\`\`\`${response.pixCopiaECola}\`\`\`` }
      )
      .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) ? interaction.guild.iconURL({ dynamic: true }) : null })
      .setTimestamp()

    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("codigocopiaecola")
          .setLabel('Código copia e cola')
          .setEmoji(`1237902888592867358`)
          .setDisabled(true)
          .setStyle(2),
        new ButtonBuilder()
          .setCustomId("deletchannel")
          .setLabel('Cancelar')
          .setDisabled(true)
          .setStyle(4)

      )

    if (configuracao.get(`pagamentos.QRCode`) == `miniatura`) {
      embed.setDescription(`Se preferir pagar via QR code, basta clicar na imagem ao lado.`)
      embed.setThumbnail(`attachment://payment.png`)
    } else {
      embed.setImage('attachment://payment.png')
    }

    await interaction.editReply({ embeds: [embed], files: [attachment], content: ``, components: [row3] })
  } else {
    await interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Gerando QRCode teste...`, ephemeral: true, components: [] }).then(async tt => {

      let valor = 1

      var agora = new Date();
      agora.setMinutes(agora.getMinutes() + 10);
      agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset() + 240);
      agora.setHours(agora.getHours() - 5)
      var novaDataFormatada = agora.toISOString().replace('Z', '-04:00');

      var payment_data = {
        transaction_amount: Number(valor),
        description: `Testar QRCode - ${interaction.user.username}`,
        date_of_expiration: `${novaDataFormatada}`,
        payment_method_id: 'pix',
        payer: {
          email: `${interaction.user.username}@gmail.com`,
          first_name: `Teste Pix`,
          last_name: `NÃO PAGAR`,
          identification: {
            type: 'CPF',
            number: '12345678909'  // Substitua este número por um CPF válido
          },
          address: {
            zip_code: '86063190',
            street_name: 'Rua Jácomo Piccinin',
            street_number: '168',
            neighborhood: 'Pinheiros',
            city: 'Londrina',
            federal_unit: 'PR'
          }
        }
      }
      mercadopago.configurations.setAccessToken(configuracao.get('pagamentos.MpAPI'));
      await mercadopago.payment.create(payment_data)
        .then(async function (data) {
          interaction.editReply({ content: `${Emojis.get(`loading_emoji`)} Espere só mais um pouco...`, ephemeral: true, components: [], embeds: [] })

          const { qrGenerator } = require('../Lib/QRCodeLib')
          const qr = new qrGenerator({ imagePath: './Lib/aaaaa.png' })
          const qrcode = await qr.generate(data.body.point_of_interaction.transaction_data.qr_code)


          const buffer = Buffer.from(qrcode.response, "base64");
          const attachment = new AttachmentBuilder(buffer, { name: "payment.png" });

          const embed = new EmbedBuilder()
            .setColor(`${configuracao.get(`QRCode.principal`) || `#328dbc`}`)
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) ? interaction.user.displayAvatarURL({ dynamic: true }) : null })
            .setTitle(`${Emojis.get(`pix_stamp_emoji`)} Pagamento via PIX criado`)
            .addFields(
              { name: `${Emojis.get(`time_emoji`)} Expira em:`, value: `<t:${Math.floor(Date.now() / 1000) + 600}:R>` },
              { name: `${Emojis.get(`information_emoji`)} Código Copia e Cola:`, value: `\`\`\`${data.body.point_of_interaction.transaction_data.qr_code}\`\`\`` }
            )
            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) ? interaction.guild.iconURL({ dynamic: true }) : null })
            .setTimestamp()
            .setImage(`https://cdn.discordapp.com/attachments/1179498681481830542/1179499043777429615/qr_code.png?ex=657a0116&is=65678c16&hm=83a7242c9f6a72f9128da76b14ede8ee1df01f5ba0ed0799f8c753b92fa8ede0&`)



          const row3 = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId("codigocopiaecola")
                .setLabel('Código copia e cola')
                .setEmoji(`1237902888592867358`)
                .setDisabled(true)
                .setStyle(2),
              new ButtonBuilder()
                .setCustomId("deletchannel")
                .setLabel('Cancelar')
                .setDisabled(true)
                .setStyle(4)

            )

          if (configuracao.get(`pagamentos.QRCode`) == `miniatura`) {
            embed.setDescription(`Se preferir pagar via QR code, basta clicar na imagem ao lado.`)
            embed.setThumbnail(`attachment://payment.png`)
          } else {
            embed.setImage('attachment://payment.png')
          }

          await interaction.editReply({ embeds: [embed], files: [attachment], content: ``, components: [row3] })
        }).catch(function (error) {
          console.log(error)
        })
    }
    )
  }
}

module.exports = {
  configqrcode,
  TestarQRCode
}
