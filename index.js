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

const generateVideoThumbnailURL = (url) => {
    const videoID = extractYouTubeID(url);
    if (videoID) {
        return `https://img.youtube.com/vi/${videoID}/hqdefault.jpg`;
    }
    return null;
};

const extractYouTubeID = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
};

client.on('messageCreate', async (message) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content.match(urlRegex);

    if (urls) {
        for (const url of urls) {
            let mockupURL = null;

            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                mockupURL = generateVideoThumbnailURL(url);
            } else {
                mockupURL = generateMockupURL(url);
            }

            if (mockupURL) {
                try {
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
    }
});

client.login(token);
