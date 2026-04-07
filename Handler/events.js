const fs = require('fs');
const path = require('path');

module.exports = {
    run: (client) => {
        // Localiza a pasta 'Eventos' de forma absoluta (sobe uma pasta a partir de 'handlers')
        const eventosPath = path.join(__dirname, '..', 'Eventos');

        if (!fs.existsSync(eventosPath)) {
            console.error(`⚠️ [ERRO] A pasta de eventos não foi encontrada em: ${eventosPath}`);
            return;
        }

        const categorias = fs.readdirSync(eventosPath);

        categorias.forEach(local => {
            const subPastaPath = path.join(eventosPath, local);
            
            // Verifica se é uma pasta antes de tentar ler (ignora arquivos soltos na raiz de Eventos)
            if (fs.lstatSync(subPastaPath).isDirectory()) {
                const eventFiles = fs.readdirSync(subPastaPath).filter(arquivo => arquivo.endsWith('.js'));

                for (const file of eventFiles) {
                    try {
                        const filePath = path.join(subPastaPath, file);
                        
                        // Limpa o cache do require para evitar conflitos de nomes iguais
                        delete require.cache[require.resolve(filePath)];
                        const event = require(filePath);

                        // Verifica se o evento tem nome e a função run para não crashar
                        if (event && event.name && typeof event.run === 'function') {
                            if (event.once) {
                                client.once(event.name, (...args) => event.run(...args, client));
                            } else {
                                client.on(event.name, (...args) => event.run(...args, client));
                            }
                        }
                    } catch (error) {
                        console.error(`❌ [XENZA] Erro ao carregar o evento '${file}' em '${local}':`, error.message);
                    }
                }
            }
        });

        console.log(`✅ [SISTEMA] Processamento da pasta 'Eventos' finalizado.`);
    }
};
