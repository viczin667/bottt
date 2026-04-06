const fs = require('fs');
const path = require('path');

module.exports = {
    run: (client) => {
        // Localiza a pasta 'Eventos' de forma segura, não importa onde o bot iniciou
        const eventosPath = path.join(__dirname, '..', 'Eventos');

        if (!fs.existsSync(eventosPath)) {
            console.error(`⚠️ [ERRO] A pasta de eventos não foi encontrada em: ${eventosPath}`);
            return;
        }

        const categorias = fs.readdirSync(eventosPath);

        categorias.forEach(local => {
            const subPastaPath = path.join(eventosPath, local);
            
            // Verifica se é uma pasta antes de tentar ler
            if (fs.lstatSync(subPastaPath).isDirectory()) {
                const eventFiles = fs.readdirSync(subPastaPath).filter(arquivo => arquivo.endsWith('.js'));

                for (const file of eventFiles) {
                    try {
                        // Importação usando caminho absoluto para evitar erro de 'require'
                        const event = require(path.join(subPastaPath, file));

                        if (event.name) {
                            if (event.once) {
                                client.once(event.name, (...args) => event.run(...args, client));
                            } else {
                                client.on(event.name, (...args) => event.run(...args, client));
                            }
                        }
                    } catch (error) {
                        console.error(`❌ Erro ao carregar o evento ${file}:`, error.message);
                    }
                }
            }
        });

        console.log(`✅ [XENZA] Todos os eventos de '${eventosPath}' foram processados.`);
    }
};
