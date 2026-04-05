const { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { configuracao, configauth } = require("../../DataBaseJson"); 
const colors = require("colors");

module.exports = {
  name: "unconfigure",
  description: "⚙️ [ADMIN] Remove configurações de logs ou sistemas de vendas.",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator, 
  options: [
    {
      name: "funcao",
      description: "O que você deseja desativar?",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "Logs Mensagens", value: "mensagens" },
        { name: "Logs Voz/Tráfego", value: "tráfego" },
        { name: "Logs Perfil", value: "perfil" },
        { name: "Logs Segurança (VPN)", value: "seguranca" },
        { name: "Sistema de Vendas (Neste Canal)", value: "vendas_canal" } // NOVA OPÇÃO
      ]
    }
  ],

  run: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    try {
        const funcao = interaction.options.getString("funcao");
        let infoAdicional = "";

        // --- LÓGICA DE REMOÇÃO ---
        if (funcao === "seguranca") {
            configauth.delete(`${interaction.guild.id}.logs`);
            infoAdicional = "Configuração de VPN removida da AuthDB.";
        } 
        else if (funcao === "vendas_canal") {
            // Remove especificamente a config do canal onde o comando foi usado
            if (configuracao.has(`VendasAtivas.${interaction.channelId}`)) {
                configuracao.delete(`VendasAtivas.${interaction.channelId}`);
                infoAdicional = "Este canal não é mais um ponto de vendas.";
            } else {
                return interaction.editReply({ content: "❌ Este canal não possui uma configuração de vendas ativa." });
            }
        } 
        else {
            // Remove logs padrão (mensagens, tráfego, perfil)
            configuracao.delete(`ConfigChannels.${funcao}`);
            infoAdicional = `Logs de ${funcao} desativados no banco de dados.`;
        }

        // --- EMBED DE SUCESSO ---
        const embed = new EmbedBuilder()
          .setTitle("⚙️ Configuração Removida")
          .setDescription(`O sistema de **${funcao.replace('_', ' ')}** foi limpo com sucesso.\n\n> ${infoAdicional}`)
          .setColor("#FF0000") 
          .setTimestamp()
          .setFooter({ 
            text: `Xenza V270 - ${interaction.user.username}`, 
            iconURL: client.user.displayAvatarURL() 
          });

        await interaction.editReply({ embeds: [embed] });
        console.log(colors.yellow(`[CONFIG] ${funcao.toUpperCase()} removida por ${interaction.user.tag}`));

    } catch (error) {
        console.error(colors.red("❌ Erro no comando desconfigurar:"), error);
        await interaction.editReply({ content: "❌ Erro ao processar a limpeza na DataBaseJson." });
    }
  }
};
