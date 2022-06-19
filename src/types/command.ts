import { ChatInputApplicationCommandData, CommandInteraction, CommandInteractionOptionResolver, GuildMember, PermissionResolvable } from "discord.js";
import { ClassClient } from "../structures/Client";

export interface ExtendedInteraction extends CommandInteraction {
	member: GuildMember;
}

interface RunOptions {
	client: ClassClient;
	interaction: ExtendedInteraction;
	args: CommandInteractionOptionResolver;
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
	enable: boolean | false;
	userPermissions?: PermissionResolvable[];
	run: RunFunction;
} & ChatInputApplicationCommandData;
