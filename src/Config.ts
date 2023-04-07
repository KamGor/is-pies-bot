export class Config {
    public discordToken: string;
    public serverParams: {
        channelId: string[];
        serverId: string
    }[];
    public modelVersion: 1 | 2;
}