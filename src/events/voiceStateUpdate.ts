import { VoiceState, TextChannel, Message } from "discord.js";
import { Event } from "../structures/Event";
import log from "../util/logger";
import { client } from "..";
import tracker from "../features/tracker";

export default new Event("voiceStateUpdate", async (oldVoiceState, newVoiceState: VoiceState) => {
	if (newVoiceState.guild?.id !== process.env.guildId) return;
	if (newVoiceState.channel) {
		log("voiceStateUpdate", `${newVoiceState.member?.user.tag} Connected to ${newVoiceState.channel.name}.`, "event");
		tracker(oldVoiceState, newVoiceState);
	} else if (oldVoiceState.channel) {
		log("voiceStateUpdate", `${oldVoiceState.member?.user.tag} Disconnected from ${oldVoiceState.channel.name}.`, "event");
		const channel = client.channels.cache.get(`${process.env.channels}`) as TextChannel;
		channel.messages.fetch().then((message) => {
			if (!message.size) return;
			message.forEach((msg: Message) => {
				if (msg.content.split(" ")[1] === oldVoiceState.member?.user.id) msg.delete();
			});
		});
	}
});
