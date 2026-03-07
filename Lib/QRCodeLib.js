const QRCode = require('qrcode');
const canvas = require('canvas');
const { configuracao } = require('../DataBaseJson');
const fs = require('fs');
const path = require('path');

class qrGenerator {
    constructor({ imagePath }) {
        this.imagePath = imagePath;
    }

    generate = async function (data) {
        try {
            // Configurações do QR Code
            let corprincipal = configuracao.get(`QRCode.principal`) || `#328dbc`;
            let corlateral = configuracao.get(`QRCode.lateral`) || `#000203`;
            
            // Cria um canvas
            const canvasEl = canvas.createCanvas(1000, 1000);
            const ctx = canvasEl.getContext('2d');

            // Preenche o fundo branco
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 1000, 1000);

            // Gera o QR Code no canvas
            await QRCode.toCanvas(canvasEl, data, {
                width: 900,
                margin: 2,
                color: {
                    dark: corprincipal,
                    light: '#FFFFFF'
                }
            });

            // Se tem imagem de logo, adiciona no centro
            if (this.imagePath && fs.existsSync(this.imagePath)) {
                try {
                    const img = await canvas.loadImage(this.imagePath);
                    const size = 200;
                    const x = (1000 - size) / 2;
                    const y = (1000 - size) / 2;
                    ctx.drawImage(img, x, y, size, size);
                } catch (error) {
                    console.log('Erro ao carregar logo do QR Code:', error.message);
                }
            }

            // Converte para base64
            const buffer = canvasEl.toBuffer('image/png');
            
            return {
                status: 'success',
                response: buffer.toString('base64')
            };
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            return {
                status: 'error',
                response: error.message
            };
        }
    }
}

module.exports.qrGenerator = qrGenerator;