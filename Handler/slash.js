const fs = require("fs");
const path = require("path");
const colors = require("colors");

// --- FUNÇÃO ORIGINAL MANTIDA ---
function csl() {
  console.clear();
}

module.exports = {
  run: (client) => {
    const SlashsArray = [];

    // Definindo o caminho base de forma segura para o Render
    const principalPath = path.join(__dirname, "../ComandosSlash");

    try {
      // 1. Lendo as subpastas (Admin, Usuarios, etc.) de forma SÍNCRONA
      // Isso garante que o array não esteja vazio no momento do login
      const pastas = fs.readdirSync(principalPath);

      pastas.forEach(subpasta => {
        const subpastaPath = path.join(principalPath, subpasta);

        // Verifica se é uma pasta para evitar erros com arquivos soltos
        if (fs.lstatSync(subpastaPath).isDirectory()) {
          const arquivos = fs.readdirSync(subpastaPath);

          arquivos.forEach(arquivo => {
            if (!arquivo.endsWith('.js')) return;

            // 2. Importando o comando usando o caminho absoluto
            // Mantendo a lógica de verificação de 'cmd.name' do original
            const cmd = require(path.join(subpastaPath, arquivo));

            if (cmd && cmd.name) {
              client.slashCommands.set(cmd.name, cmd);
              SlashsArray.push(cmd);
              // Log opcional para você ver no console do Render o que está sendo carregado
              console.log(colors.gray(`[CARREGADO] ${subpasta}/${arquivo}`));
            }
          });
        }
      });

      console.log(colors.cyan(`\n[SISTEMA] ${SlashsArray.length} comandos slash prontos para registro.`));

    } catch (erro) {
      console.error(colors.red('❌ Erro ao ler diretório de comandos:'), erro);
    }

    // --- EVENTO READY ORIGINAL ---
    client.on("ready", async () => {
      // Executa o console.clear() original
      csl();

      try {
        // 3. Registrando os comandos no Discord
        // Agora o SlashsArray contém todos os comandos carregados acima
        await client.application.commands.set(SlashsArray);
        
        console.log(colors.green(`✅ Xenza Online | Comandos sincronizados com sucesso!`));
        console.log(colors.white(`Servidores: ${client.guilds.cache.size}`));
      } catch (e) {
        console.error(colors.red("❌ Erro ao sincronizar comandos no Discord:"), e);
      }
    });
  }
}
