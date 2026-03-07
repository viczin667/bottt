const { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { configuracao } = require("../DataBaseJson");

async function ClearAutomatic(client) {
    try {
        let info = configuracao.get(`AutomaticSettings.LimpezaAutomatica`);
        if (!info || !info?.status || !info?.canais || info?.canais?.length === 0 || !info?.primeira || !info.segunda) return;

        let agora = new Date();
        let horaAtual = agora.getHours();
        let minutoAtual = agora.getMinutes();

        // Ajustando a hora para o fuso horário 'America/Sao_Paulo'
        let [horaPrimeira, minutoPrimeira] = info.primeira.split(":").map(Number);
        let [horaSegunda, minutoSegunda] = info.segunda.split(":").map(Number);

        // Definir horário correto para comparação no fuso horário de São Paulo
        const tzOptions = { timeZone: 'America/Sao_Paulo', hour12: false };
        let horaAtualSP = new Date().toLocaleTimeString('pt-BR', { ...tzOptions, hour: '2-digit', minute: '2-digit' });
        let [horaAtualSPHoras, minutoAtualSP] = horaAtualSP.split(":").map(Number);

        let execucaoPrimeira = configuracao.get(`AutomaticSettings.LimpezaAutomatica.execucaoprimeira`);
        let execucaoSegunda = configuracao.get(`AutomaticSettings.LimpezaAutomatica.execucaosegunda`);

        // Verificação para a primeira execução
        if (horaAtualSPHoras === horaPrimeira && minutoAtualSP === minutoPrimeira && !execucaoPrimeira) {
            configuracao.set(`AutomaticSettings.LimpezaAutomatica.execucaoprimeira`, true);
            await limparCanais(client, info.canais);
            configuracao.set(`AutomaticSettings.LimpezaAutomatica.execucaosegunda`, false);
        }

        // Verificação para a segunda execução
        if (horaAtualSPHoras === horaSegunda && minutoAtualSP === minutoSegunda && !execucaoSegunda) {
            configuracao.set(`AutomaticSettings.LimpezaAutomatica.execucaosegunda`, true);
            await limparCanais(client, info.canais);
            configuracao.set(`AutomaticSettings.LimpezaAutomatica.execucaoprimeira`, false);
        }

    } catch (error) {
        console.error(`Erro ao limpar automaticamente: ${error.message}`);
    }
}

async function limparCanais(client, canais) {
    const embedConcluido = new EmbedBuilder()
        .setAuthor({ name: 'Limpeza Automática', iconURL: 'https://cdn.discordapp.com/emojis/1230562932044070922.webp?size=44&quality=lossless' })
        .setTitle("Limpeza concluída com sucesso")
        .setColor(`${configuracao.get(`Cores.Sucesso`) == null ? `#7464ff` : configuracao.get(`Cores.Sucesso`)}`) // .setColor("#00FF00");

    // Cria o botão de "Mensagem do Sistema Desativado"
    const botaoDesativado = new ButtonBuilder()
        .setCustomId('mensagem_sistema_desativado')
        .setLabel('Mensagem do Sistema')
        .setStyle(ButtonStyle.Secondary) // Cor cinza
        .setDisabled(true);

    // Cria a ActionRow com o botão
    const row = new ActionRowBuilder().addComponents(botaoDesativado);

    for (const canalId of canais) {
        try {
            const channel = await client.channels.fetch(canalId);

            let totalDeletado = 0;

            // Loop para deletar todas as mensagens, independentemente de serem antigas
            let mensagens;
            do {
                mensagens = await channel.messages.fetch({ limit: 100 });
                const bulkDeleted = await channel.bulkDelete(mensagens, true); // Remove mensagens recentes
                totalDeletado += bulkDeleted.size;

                // Remover mensagens antigas ou que falharam no bulkDelete
                const restantes = mensagens.filter(msg => !bulkDeleted.has(msg.id));
                for (const message of restantes.values()) {
                    try {
                        if (message.deletable) {
                            await message.delete();
                            totalDeletado++;
                        }
                    } catch (error) {
                        console.error(`Erro ao deletar mensagem ${message.id}: ${error.message}`);
                    }
                }
            } while (mensagens.size > 0); // Continua até que não hajam mais mensagens

            // Após concluir a limpeza, envia a embed de conclusão com o botão
            embedConcluido.setDescription(`Total de **${totalDeletado}** mensagens deletadas no canal.`);
            await channel.send({ embeds: [embedConcluido], components: [row] });

        } catch (error) {
            console.error(`Erro ao limpar o canal ${canalId}: ${error.message}`);
        }
    }
}
async function SystemLockAndUnlock(client) {
    let info = configuracao.get(`AutomaticSettings.GerenciarCanais`);
    if (!info || !info?.status || !info?.canais || info?.canais?.length === 0 || !info?.abertura || !info.fechamento) return;

    let horarioatual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' });
    let horarioabertura = info.abertura;
    let horariofechamento = info.fechamento;

    if (horarioatual === horarioabertura) {
        configuracao.set(`AutomaticSettings.GerenciarCanais.tipo`, "aberto");
        if (info?.tipo == "aberto") return;
        await UnlockChannels(client, info.canais)
    } else if (horarioatual === horariofechamento) {
        configuracao.set(`AutomaticSettings.GerenciarCanais.tipo`, "fechado");
        if (info?.tipo == "fechado") return;
        await LockChannels(client, info.canais)

    }
}

async function UnlockChannels(client, canais) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Canal Aberto Pelo Sistema', iconURL: 'https://cdn.discordapp.com/emojis/1230562932044070922.webp?size=44&quality=lossless' })
        .setColor(`${configuracao.get(`Cores.Sucesso`) == null ? `#7464ff` : configuracao.get(`Cores.Sucesso`)}`) // .setColor('#41ffa1')

      const botaoDesativado = new ButtonBuilder()
        .setCustomId('mensagem_sistema_desativado')
        .setLabel('Mensagem do Sistema')
        .setStyle(ButtonStyle.Secondary) // Cor cinza
        .setDisabled(true);

      const row = new ActionRowBuilder().addComponents(botaoDesativado);
    let ids = [];
    for (const canal of canais) {
        try {
            const channel = await client.channels.fetch(canal);

            // Limpar mensagens antes de desbloquear
            let totalDeletado = 0;
            let mensagens;
            do {
                mensagens = await channel.messages.fetch({ limit: 100 });
                const bulkDeleted = await channel.bulkDelete(mensagens, true); // Remove mensagens recentes
                totalDeletado += bulkDeleted.size;

                // Remover mensagens antigas ou que falharam no bulkDelete
                const restantes = mensagens.filter(msg => !bulkDeleted.has(msg.id));
                for (const message of restantes.values()) {
                    try {
                        if (message.deletable) {
                            await message.delete();
                            totalDeletado++;
                        }
                    } catch (error) {
                        console.error(`Erro ao deletar mensagem ${message.id}: ${error.message}`);
                    }
                }
            } while (mensagens.size > 0); // Continua até que não hajam mais mensagens

            // Após concluir a limpeza, envia a embed de conclusão
            embed.setDescription(`- Este canal foi aberto automaticamente pelo sistema.\n- Agora você pode enviar mensagens.\n- Total de **${totalDeletado}** mensagens deletadas no canal.`);

            // Agora, desbloqueia o canal
            await channel.permissionOverwrites.edit(channel.guild.id, { SendMessages: true });

            const msgIds = configuracao.get('AutomaticSettings.GerenciarCanais.mensagem') || [];
            for (const mensagemId of msgIds) {
                try {
                    const message = await client.channels.cache.get(canal).messages.fetch(mensagemId);
                    await message.delete();
                } catch (error) {
                    // Ignora erros de mensagem deletada
                }
            }

            const msg = await channel.send({ embeds: [embed], components: [row] });
            ids.push(msg.id);
        } catch (error) {
            console.error(`Erro ao abrir canal ${canal}: ${error.message}`);
        }
    }
    configuracao.set('AutomaticSettings.GerenciarCanais.mensagem', ids);
}

async function LockChannels(client, canais) {
    const abertura = configuracao.get('AutomaticSettings.GerenciarCanais.abertura') || 'não definida';
    const embed = new EmbedBuilder()
        .setAuthor({ name: 'Canal Fechado Pelo Sistema', iconURL: 'https://cdn.discordapp.com/emojis/1230562904424845322.webp?size=44&quality=lossless' })
        .setColor(`${configuracao.get(`Cores.Erro`) == null ? `#7464ff` : configuracao.get(`Cores.Erro`)}`) // .setColor('#ff5251')

    const botaoDesativado = new ButtonBuilder()
        .setCustomId('mensagem_sistema_desativado')
        .setLabel('Mensagem do Sistema')
        .setStyle(ButtonStyle.Secondary) // Cor cinza
        .setDisabled(true);

    const row = new ActionRowBuilder().addComponents(botaoDesativado);
    let ids = [];
    for (const canal of canais) {
        try {
            const channel = await client.channels.fetch(canal);

            // Limpar mensagens antes de bloquear
            let totalDeletado = 0;
            let mensagens;
            do {
                mensagens = await channel.messages.fetch({ limit: 100 });
                const bulkDeleted = await channel.bulkDelete(mensagens, true); // Remove mensagens recentes
                totalDeletado += bulkDeleted.size;

                // Remover mensagens antigas ou que falharam no bulkDelete
                const restantes = mensagens.filter(msg => !bulkDeleted.has(msg.id));
                for (const message of restantes.values()) {
                    try {
                        if (message.deletable) {
                            await message.delete();
                            totalDeletado++;
                        }
                    } catch (error) {
                        console.error(`Erro ao deletar mensagem ${message.id}: ${error.message}`);
                    }
                }
            } while (mensagens.size > 0); // Continua até que não hajam mais mensagens

            // Após concluir a limpeza, envia a embed de conclusão
            embed.setDescription(`- Este canal foi fechado automaticamente. Ele será reaberto às \`${abertura}\`.\n- Total de **${totalDeletado}** mensagens deletadas no canal.`);

            // Agora, bloqueia o canal
            await channel.permissionOverwrites.edit(channel.guild.id, { SendMessages: false });

            const msgIds = configuracao.get('AutomaticSettings.GerenciarCanais.mensagem') || [];
            for (const mensagemId of msgIds) {
                try {
                    const message = await client.channels.cache.get(canal).messages.fetch(mensagemId);
                    await message.delete();
                } catch (error) {
                    // Ignora erros de mensagem deletada
                }
            }

            const msg = await channel.send({ embeds: [embed], components: [row] });
            ids.push(msg.id);
        } catch (error) {
            console.error(`Erro ao fechar canal ${canal}: ${error.message}`);
        }
    }
    configuracao.set('AutomaticSettings.GerenciarCanais.mensagem', ids);
}

async function SystemNukedChannels(client) {
    let info = configuracao.get(`AutomaticSettings.SistemaNukar`);
    if (!info || !info?.status || !info?.canais || info?.canais?.length === 0 || !info?.horario) return;

    let hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' });

    if (hora === info.horario) {
        let data = `${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} - ${hora}`;
        if (info?.data == data) return;
        configuracao.set(`AutomaticSettings.SistemaNukar.data`, data)
        let ids = [];
        for (const canal of info.canais) {  
            try {
                const channel = await client.channels.fetch(canal);
                await channel.clone({ reason: 'Canal nukado automaticamente pelo sistema.' }).then(async (channel) => {
                    ids.push(channel.id);
                    await channel.send({ content: `\`Channel Nuked by: System\`` });
                });
                await channel.delete({ reason: 'Canal nukado automaticamente pelo sistema.' });
            } catch (error) {
                console.error(`Erro ao nukar canal ${canal}: ${error.message}`);
            }
        }
        configuracao.set('AutomaticSettings.SistemaNukar.canais', ids);
    }
}






module.exports = {
    ClearAutomatic,
    SystemLockAndUnlock,
    SystemNukedChannels
}