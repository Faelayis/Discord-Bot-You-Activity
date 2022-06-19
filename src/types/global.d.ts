declare global {
	namespace NodeJS {
		interface ProcessEnv {
			botToken: string;
			guildId: string;
			channels: string;
			osu_api: string;
		}
	}
}

export {};
