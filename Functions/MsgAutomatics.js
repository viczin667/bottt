const { ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder } = require("discord.js");
const { msgsauto } = require("../DataBaseJson");
const colors = require("colors");

async function sendMessage(client) {
    // Busca as configurações do banco de dados
    const intervalMinutes = msgsauto.get('intervalMinutes') || 3; 
    const interval = intervalMinutes * 60 * 1000; 

    const channels = msgsauto.get('channels');

    // Validações iniciais
    if (!channels || channels.length === 0) {
        setTimeout(() => sendMessage(client), interval); // Mantém o loop ativo
        return;
    }

    if (!Array.isArray(channels)) {
        console.error(colors.red('[SISTEMA] Erro: a lista de canais em msgsauto.json não é um Array.'));
        setTimeout(() => sendMessage(client), interval);
        return;
    }

    for (const channelInfo of channels) {
        // Busca o canal no cache ou na rede
        const channel = await client.channels.fetch(channelInfo.id).catch(e => {
            console.error(colors.red(`[XENZA] Erro ao buscar o canal: ${channelInfo.id}`), e.message);
            return null;
        });

        if (!channel) continue; 

        // Deleta a mensagem anterior para manter o chat limpo
        if (channelInfo.lastMessageId) {
            try {
                const messageToDelete = await channel.messages.fetch(channelInfo.lastMessageId);
                if (messageToDelete) await messageToDelete.delete();
            } catch (error) {
                // Silencia erro se a mensagem já foi deletada manualmente
            }
        }

        // Cria o botão de identificação (padrão do seu código original)
        const button = new ButtonBuilder()
            .setCustomId('system_message')
            .setLabel('Mensagem Automática')
            .setStyle(ButtonStyle.Secondary) // Style 2
            .setDisabled(true);

        const row = new ActionRowBuilder().addComponents(button);
        
        const options = {
            content: channelInfo.message,
            components: [row]
        };

        // --- CORREÇÃO DO ERRO DE JSON (HTML DETECTED) ---
        if (channelInfo.file && typeof channelInfo.file === 'string' && channelInfo.file.startsWith('http')) {
            try {
                const attachment = new AttachmentBuilder(channelInfo.file);
                options.files = [attachment];
            } catch (error) {
                console.error(colors.yellow(`[AVISO] Link de arquivo inválido no canal ${channelInfo.id}. Enviando apenas texto.`));
            }
        }

        // Envia a nova mensagem
        try {
            const sentMessage = await channel.send(options);
            channelInfo.lastMessageId = sentMessage.id; 
            
            // Atualiza o banco de dados com o novo ID da mensagem
            msgsauto.set('channels', channels); 
        } catch (error) {
            console.error(colors.red(`[ERRO CRÍTICO] Falha ao enviar mensagem no canal ${channelInfo.id}:`), error.message);
            // Aqui o try/catch impede que o "Unexpected token <" derrube o bot
        }
    }

    // Loop recursivo para a próxima postagem
    setTimeout(() => sendMessage(client), interval);
}

module.exports = {
    sendMessage
};
