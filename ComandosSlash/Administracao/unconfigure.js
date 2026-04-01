const { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { configuracao } = require("../../DataBaseJson"); 
const colors = require("colors");

module.exports = {
  name: "desconfigurar",
  description: "[Admin] Desativa um canal de log específico.",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator, 
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
    // --- PREVINE O ERRO "O APLICATIVO NÃO RESPONDEU" ---
    // Isso dá ao Render tempo para processar o banco de dados
    await interaction.deferReply({ ephemeral: true });

    try {
        const funcao = interaction.options.getString("funcao");

        // --- ATUALIZAÇÃO DO BANCO DE DATOS ---
        // Remove o ID do canal para desativar a função
        configuracao.set(`ConfigChannels.${funcao}`, null);

        // --- CONSTRUÇÃO DA EMBED DE SUCESSO ---
        const embed = new EmbedBuilder()
          .setTitle("⚙️ Configuração Removida")
          .setDescription(`O sistema de **${funcao}** foi desativado com sucesso.\nO bot não enviará mais logs para este canal.`)
          .setColor("#FF0000") // Vermelho para indicar remoção
          .setTimestamp()
          .setFooter({ 
            text: `Executado por: ${interaction.user.username}`, 
            iconURL: client.user.displayAvatarURL() 
          });

        // --- ENVIO DA RESPOSTA FINAL ---
        await interaction.editReply({ embeds: [embed] });

        // Log no console do Render para conferência
        console.log(colors.yellow(`[LOGS] Configuração de ${funcao} removida por ${interaction.user.tag}`));

    } catch (error) {
        console.error(colors.red("❌ Erro no comando desconfigurar:"), error);
        
        // Caso ocorra um erro, avisa o usuário sem deixar o comando "carregando" pra sempre
        if (interaction.deferred) {
            await interaction.editReply({ 
                content: "❌ Ocorreu um erro interno ao tentar remover esta configuração. Verifique o console do Render." 
            });
        }
    }
  }
};
