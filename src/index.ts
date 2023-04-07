import { Client, Events, GatewayIntentBits } from 'discord.js';
import { ImageLoader } from './ImageLoader';
import { load } from '@tensorflow-models/mobilenet';
import { DogRecognizer } from './DogRecognizer';
import { ConfigLoader } from './ConfigLoader';
import { Config } from './Config';

(async () => {
    const configLoader: ConfigLoader = new ConfigLoader();
    const config: Config = configLoader.getConfig();

    const isProperServer = (guildId: string) => {
        return !!config.serverParams.reduce((acc, serverParams) => {
            return acc || (serverParams.serverId == guildId);
        }, false);
    };

    const isProperChannel = (incomingChannelId: string) => {
        return config.serverParams.reduce((acc, serverParams) => {
            return acc || serverParams.channelId.includes(incomingChannelId);
        }, false)
        
    };

    const client: Client = new Client({ intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ]});
    const model = await load({
        version: 2,
        alpha: 0.5,
    });
    const imageLoader = new ImageLoader();
    const dogRecognizer = new DogRecognizer(model, imageLoader);
    
    client.once(Events.ClientReady, c => {
        console.log('isPies ready!');
    });
    
    client.on(Events.MessageCreate, async (message) => {
        if(!isProperServer(message.guildId) || !isProperChannel(message.channelId)) return;
        if(message.attachments.size <= 0) return;

        const isPies: boolean = await dogRecognizer.isDog(message.attachments.first().url);

        if(isPies) {
            message.react("✅");
        } else {
            message.react("❌");
        }

        message.channel.send({
            reply: {
                messageReference: message,
            },
            content: `isPies: ${isPies}`,
        });
        return;
    });
    
    client.login(config.discordToken);
})();