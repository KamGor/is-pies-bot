import { Config } from "./Config"
import { config as loadConfig } from 'dotenv';
import { camelCase } from 'lodash';

export class ConfigLoader {

    private _config: Config;

    constructor() {
        const parsedConfig = loadConfig();
        this._config = new Config();
        this._config.discordToken = parsedConfig.parsed.DISCORD_TOKEN;

        console.log(parsedConfig.parsed.MODEL_VERSION);

        // SERVER_1 SERVER_ID
        //          CHANNEL_ID_1
        //          CHANNEL_ID_2
        // SERVER_2
        // SERVER_3
        const serverParams = Object.keys(parsedConfig.parsed)
            .filter((key) => key.startsWith('SERVER'))
            .reduce<Array<{channelId: string[], serverId: string}>>((acc, key) => {
                const [,, serverNumber, parameter, object] = key.match(/(SERVER_)(\d+)_(SERVER_ID|CHANNEL_ID_)(\d*)/);
                if(typeof acc[Number(serverNumber)] === 'undefined') acc[Number(serverNumber)] = <{ channelId: string[]; serverId: string; }> {};
                if(object) {
                    if(typeof acc[Number(serverNumber)][camelCase(parameter)] === 'undefined') acc[Number(serverNumber)][camelCase(parameter)] = [];
                    acc[Number(serverNumber)][camelCase(parameter)][Number(object)] = parsedConfig.parsed[`SERVER_${serverNumber}_${parameter}${object ? `${object}` : ''}`];
                } else {
                    acc[Number(serverNumber)][camelCase(parameter)] = parsedConfig.parsed[`SERVER_${serverNumber}_${parameter}${object ? `${object}` : ''}`];
                }
                return acc;
            }, []);

        this._config.serverParams = serverParams;
    }

    public getConfig() {
        return this._config;
    }
}