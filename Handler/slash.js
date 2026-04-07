const fs = require("fs");
const path = require("path");
const colors = require("colors");

function csl() {
    // console.clear(); // No Render, o clear pode apagar logs importantes de carregamento
}

module.exports = {
    run: (client) => {
        const SlashsArray = [];

        // --- BUSCA DINÂMICA DE PASTA (Anti-Erro de Case Sensitive) ---
        let principalPath = path.join(__dirname, "../ComandosSlash");
        
        // Se não existir 'ComandosSlash', tenta a versão totalmente minúscula
        if (!fs.existsSync(principalPath)) {
            principalPath = path.join(__dirname, "../comandosslash");
        }

        if (!fs.existsSync(principalPath)) {
            return console.log(colors.red(`⚠️ [ERRO] Pasta de comandos Slash não encontrada em nenhum dos caminhos.`));
        }

        try {
            const pastas = fs.readdirSync(principalPath);

            pastas.forEach(subpasta => {
                const subpastaPath = path.join(principalPath, subpasta);

                if (fs.lstatSync(subpastaPath).isDirectory()) {
                    const arquivos = fs.readdirSync(subpastaPath).filter(f => f.endsWith('.js'));

                    arquivos.forEach(arquivo => {
                        try {
                            const cmdPath = path.join(subpastaPath, arquivo);
                            const cmd = require(cmdPath);

                            if (cmd && cmd.name) {
                                client.slashCommands.set(cmd.name, cmd);
                                SlashsArray.push(cmd);
                                console.log(colors.gray(`[CARREGADO] ${subpasta}/${arquivo}`));
                            }
                        } catch (err) {
                            console.error(colors.red(`❌ Erro no comando ${arquivo}:`), err.message);
                        }
                    });
                }
            });

            console.log(colors.cyan(`\n[SISTEMA] ${SlashsArray.length} comandos slash carregados localmente.`));

        } catch (erro) {
            console.error(colors.red('❌ Erro fatal ao ler diretório de comandos:'), erro);
        }

        // --- REGISTRO NO DISCORD (EVENTO READY) ---
        client.on("ready", async () => {
            // csl(); 
            
            try {
                // Sincroniza os comandos globalmente com a API do Discord
                await client.application.commands.set(SlashsArray);
                
                console.log(colors.green(`✅ Xenza Online | ${client.user.tag}`));
                console.log(colors.white(`🌍 Servidores: ${client.guilds.cache.size}`));
                console.log(colors.green(`✨ Comandos Slash sincronizados com sucesso!`));
            } catch (e) {
                console.error(colors.red("❌ Falha na sincronização dos comandos Slash:"), e.message);
            }
        });
    }
}
}
