import "dotenv/config";
export declare const streamers: Map<string, string>;
export declare function getAppToken(): Promise<string>;
export declare function subscribeToStreamer(userId: string): Promise<void>;
export declare function handleStreamOnline(data: any): Promise<void>;
//# sourceMappingURL=twitch.d.ts.map