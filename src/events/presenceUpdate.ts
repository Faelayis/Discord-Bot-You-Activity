import { Presence, GuildChannelResolvable } from "discord.js";
import { Event } from "../structures/Event";
import tracker from "../features/tracker";

export default new Event("presenceUpdate", (oldPresence, newPresence: Presence) => {
	if (newPresence.member?.user.bot) return;
	if (newPresence.guild?.id !== process.env.guildId) return;
	if (newPresence.status === "offline") return;
	if (newPresence !== oldPresence && (newPresence.member?.voice.channel?.id as GuildChannelResolvable)) return new tracker(oldPresence, newPresence);
});
