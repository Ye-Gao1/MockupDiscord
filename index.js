const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const token = process.env['TOKEN']

const generateMockupURL = (url) => {
    const mockupBaseURL = 'https://2s9e3bif52.execute-api.eu-central-1.amazonaws.com/production/screenshot';
    const bgColor = 'white';
    return `${mockupBaseURL}?url=${encodeURIComponent(url)}&color=${encodeURIComponent(bgColor)}`;
};

client.on('messageCreate', async (message) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content.match(urlRegex);

    if (urls) {
        for (const url of urls) {
            try {
                const mockupURL = generateMockupURL(url);
                const response = await axios.get(mockupURL, { responseType: 'arraybuffer' });

                const attachment = {
                    files: [
                        {
                            attachment: Buffer.from(response.data, 'binary'),
                            name: 'mockup.png',
                        },
                    ],
                };

                message.reply(attachment);
            } catch (error) {
                console.error('Error generating mockup:', error);
                message.reply('Sorry, there was an error generating the mockup.');
            }
        }
    }
});

client.login(token);
