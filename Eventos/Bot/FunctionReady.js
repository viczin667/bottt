
const { carregarCache } = require('../../Handler/EmojiFunctions.js');
const { WebhookClient, ActivityType } = require('discord.js');
const { CloseThreds } = require('../../Functions/CloseThread');
const { VerificarPagamento } = require('../../Functions/VerficarPagamento');
const { EntregarPagamentos } = require('../../Functions/AprovarPagamento');
const { CheckPosition } = require('../../Functions/PosicoesFunction.js');
const { configuracao, Convites, GuildsInvites } = require('../../DataBaseJson');
const { restart } = require('../../Functions/Restart.js');
const { Varredura } = require('../../Functions/Varredura.js');
const colors = require("colors");
const { ClearAutomatic, SystemLockAndUnlock, SystemNukedChannels } = require('../../Functions/SistemaAutomatico.js');
const { CheckarPunicoes } = require('../Sistema De Logs/NewMessage.js');
const { UploadEmojis } = require('../../FunctionEmojis/EmojisFunction.js');
const { TodosInvites } = require('./Entrada.js');
const { SincronizarDados } = require('../../Functions/SincronizarDados.js');


module.exports = {
    name: 'ready',

    run: async (client, interaction) => {
        const configuracoes = ['Status1', 'Status2'];
        let indiceAtual = 0;

        TodosInvites(client)

        function setActivityWithInterval(client, configuracoes, type, interval) {
            setInterval(() => {
                const configuracaoKey = configuracoes[indiceAtual];
                const status = configuracao.get(configuracaoKey);

                if (status !== null) {
                    client.user.setActivity(status, { type, url: "https://www.twitch.tv/discord" });
                }

                indiceAtual = (indiceAtual + 1) % configuracoes.length;
            }, interval);
        }

        setActivityWithInterval(client, configuracoes, ActivityType.Streaming, 5000);

        if (client.guilds.cache.size > 1) {
            client.guilds.cache.forEach(guild => {
                try {
                    guild.leave()
                } catch (error) {
                    
                }
            });
        }

        const verifyPayments = () => {
            VerificarPagamento(client);
        };
        const deliverPayments = () => {
            EntregarPagamentos(client, interaction);
          const data = {
            description:"Bot de Vendas"
          }
        };
        const closeThreads = () => {
            CloseThreds(client);
        };

        restart(client)
        Varredura(client)
        SincronizarDados(client)
        VerificarChavesPixEfiBank(client)

        setInterval(() => {
            SincronizarDados(client)
            VerificarChavesPixEfiBank(client)
        }, 7200000);

        setInterval(() => {
            Varredura(client)
        }, 86400000);

        setInterval(verifyPayments, 10000);
        setInterval(deliverPayments, 14000);
        setInterval(closeThreads, 60000);

        console.log(`\x1b[36m[Bot]\x1b[0m ${client.user.tag} foi iniciado com sucesso!`);
        await UploadEmojis(client).then(() => console.log('\x1b[36m[Emojis]\x1b[0m Todos os emojis foram carregados com sucesso.')).catch(err => console.error('\x1b[31m[Emojis]\x1b[0m Erro ao carregar os emojis:', err));

        CheckPosition(client)
        carregarCache()

        // ClearAutomatic(client)
        setInterval(() => {
            ClearAutomatic(client)
            SystemLockAndUnlock(client)
            SystemNukedChannels(client)
            CheckarPunicoes(client)
        }, 10000);
    }
}


async function VerificarChavesPixEfiBank(client) {
    if (!configuracao.get('pagamentos.EfiAPI.client_id') || !configuracao.get('pagamentos.EfiAPI.client_secret')) return;
    try {
        const certificadoPath = path.join(`./Eventos/Sistema De Configuracao/${configuracao.get('pagamentos.EfiAPI.certificado')}`);

        const response = await axios.get(file.url, { responseType: "arraybuffer" });
        fs.writeFileSync(certificadoPath, response.data);
        const certificadoBuffer = fs.readFileSync(certificadoPath);
        const authData = Buffer.from(`${configuracao.get(`pagamentos.EfiAPI.client_id`)}:${configuracao.get(`pagamentos.EfiAPI.client_secret`)}`).toString("base64");
        const agent = new https.Agent({ pfx: certificadoBuffer, passphrase: "" });

        const tokenResponse = await axios.post(
            "https://pix.api.efipay.com.br/oauth/token",
            JSON.stringify({ grant_type: "client_credentials" }),
            {
                headers: {
                    Authorization: `Basic ${authData}`,
                    "Content-Type": "application/json",
                },
                httpsAgent: agent,
            }
        );
        const access_token = tokenResponse.data.access_token;

        const chavesPixResponse = await axios.get("https://pix.api.efipay.com.br/v2/gn/evp", {
            headers: {
                Authorization: `Bearer ${access_token}`,
                "Content-Type": "application/json",
            },
            httpsAgent: agent,
        });
        let chavepix = ``
        if (chavesPixResponse.data.chaves.length < 1) {
            const chavesPixResponse = await axios.post("https://pix.api.efipay.com.br/v2/gn/evp", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
                httpsAgent: agent,
            });
            chavepix = chavesPixResponse.data.chaves[0]
        } else {
            chavepix = chavesPixResponse.data.chaves[0]
        }

        configuracao.set("pagamentos.EfiAPI.chavepix", chavepix)
    } catch (error) {

    }   
}