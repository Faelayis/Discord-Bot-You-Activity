import { ApplicationCommandDataResolvable, Client, ClientEvents, Collection } from "discord.js";
import { CommandType } from "../types/command";
import { promisify } from "util";
import { RegisterCommandsOptions } from "../types/client";
import { Event } from "./Event";
import log from "../util/logger";
import glob from "glob";

const globPromise = promisify(glob);

export class ClassClient extends Client {
	commands: Collection<string, CommandType> = new Collection();

	constructor() {
		super({ intents: 32767 });
	}

	start() {
		this.registerModules();
		this.login(process.env.botToken);
	}

	async importFile(filePath: string) {
		return (await import(filePath))?.default;
	}

	async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
		if (guildId) {
			this.guilds.cache.get(guildId)?.commands.set(commands);
			log("registerCommands", `Registering commands to ${guildId}`, "client");
		} else {
			this.application?.commands.set(commands);
			log("registerCommands", "Registering global commands", "client");
		}
	}

	async registerModules() {
		const slashCommands: ApplicationCommandDataResolvable[] = [];
		const commandFiles = await globPromise(`${__dirname}/../commands/*/*{.ts,.js}`);
		commandFiles.forEach(async (filePath) => {
			const command: CommandType = await this.importFile(filePath);
			if (!command.name) return;
			log("Loaded", `command ${command.name} ${command.enable ? "(Enable)" : "(Disable)"}`, "client");
			if (!command.enable) return;
			this.commands.set(command.name, command);
			slashCommands.push(command);
		});

		this.on("ready", () => {
			if (slashCommands.length) {
				this.registerCommands({
					commands: slashCommands,
					guildId: process.env.guildId,
				});
			}
		});

		const eventFiles = await globPromise(`${__dirname}/../events/*{.ts,.js}`);
		eventFiles.forEach(async (filePath) => {
			const event: Event<keyof ClientEvents> = await this.importFile(filePath);
			if (!event.event) return;
			log("Loaded", `event ${event.event}`, "client");
			this.on(event.event, event.run);
		});
	}
}
