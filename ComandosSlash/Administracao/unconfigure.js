const { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { configuracao } = require("../../DataBaseJson"); // Certifique-se que o caminho está correto para o seu arquivo de banco

module.exports = {
  name: "desconfigurar",
  description: "[Admin] Desativa um canal de log específico.",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator, // Apenas Admins podem usar
  options: [
    {
      name: "funcao",
      description: "Qual log você deseja desativar?",
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: "Logs Mensagens", value: "mensagens" },
        { name: "Logs Voz/Tráfego", value: "tráfego" },
        { name: "Logs Perfil", value: "perfil" },
        { name: "Logs Segurança (VPN)", value: "segurança" }
      ]
    }
  ],

  run: async (client, interaction) => {
    const funcao = interaction.options.getString("funcao");

    // Remove o ID do canal do banco de dados (seta como null ou vazio)
    configuracao.set(`ConfigChannels.${funcao}`, null);

    const embed = new EmbedBuilder()
      .setTitle("⚙️ Configuração Removida")
      .setDescription(`O log de **${funcao}** foi desativado com sucesso. O bot não enviará mais notificações desta função.`)
      .setColor("Red")
      .setFooter({ text: "Xenza System" });

    await interaction.reply({ embeds: [embed], ephemeral: true });
    
    console.log(`[LOG] O administrador ${interaction.user.tag} desativou o log de ${funcao}.`);
  }
};
