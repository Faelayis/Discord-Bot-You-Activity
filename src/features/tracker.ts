import { VoiceState, Presence, Activity, Collection, MessageEmbedOptions, MessageAttachment, TextChannel } from "discord.js";
import { client } from "..";
import log from "../util/logger";
import Osu from "../api/osu";
import { Profile } from "../types/api/osu";

const cooldowns = new Map();

export default class Tracker {
	constructor(oldData: any | Presence | VoiceState, newData: any | Presence | VoiceState) {
		log("tracker", "Running", "feat");
		this.update(oldData, newData);
	}

	async get(user: Activity, game: "osu!" | "valorant") {
		if (!user.assets) return;
		if (!user.assets.largeText) return;
		switch (game) {
			case "osu!":
				return await Osu(user.assets.largeText.split(" ")[0], user.assets.smallText);
			// case "valorant":
			// 	return;
		}
	}

	async update(oldData: any, data: any) {
		const channel = client.channels.cache.get(`${process.env.channels}`) as TextChannel,
			activity = data.member?.presence?.activities.find((activity: Activity) => {
				if (activity.type === "CUSTOM") return;
				if (activity.type === "WATCHING") return;
				return activity;
			}) as Activity;

		if (data.channelId !== undefined && !oldData.channelId) {
			log("tracker", `New Embeds User: ${data.member?.user.username}#${data.member?.user.discriminator}`, "feat");
			if (data.member.user.displayAvatarURL().match("[https://cdn.discordapp.com/embed/avatars/][0-5].png")) {
				channel.send({ content: `${data.channelId || data.member?.voice.channel?.id} ${data.member?.user.id}` });
			} else {
				channel.send({
					embeds: [
						{
							footer: {
								text: data.member.user.username,
								icon_url: data.member.user.displayAvatarURL(),
							},
						},
					],
				});
			}
		}

		if (!activity) {
			return channel.messages.fetch().then((message) => {
				if (!message.size) return;
				message.forEach((msg) => {
					if (
						(msg.content.split(" ")[1] === data.member?.user.id && msg.author.id === client.application?.id) ||
						msg.embeds[0].footer?.iconURL?.includes(`${data.member?.user.id}`)
					) {
						log("tracker", `Edit Embeds User: ${data.member?.user.username}#${data.member?.user.discriminator} = nothing`);
						return msg.edit({ embeds: [], files: [] });
					}
				});
			});
		}

		if (!cooldowns.has(data.member.user.id)) {
			cooldowns.set(data.member.user.id, new Collection());
		}
		const current_time = Date.now(),
			cooldown_time = cooldowns.get(data.member.user.id),
			cooldown_amount = 1 * 1000;
		if (cooldown_time.has(data.member.user.id)) {
			const expiration_time = cooldown_time.get(data.member.user.id) + cooldown_amount;
			if (current_time < expiration_time) {
				const time_left = (expiration_time - current_time) / 1000;
				return log("tracker", `Cooldown Time: ${time_left} User: ${data.member.user.username}#${data.member.user.discriminator}`, "feat");
			}
		}
		cooldown_time.set(data.member.user.id, current_time);
		setTimeout(() => cooldown_time.delete(data.member.user.id), cooldown_amount);

		if (activity.id === "spotify:1") {
			return this.send(channel, data, activity.name, {
				color: 0x1db954,
				author: {
					name: "Spotify Listening",
					icon_url: "https://avatars.githubusercontent.com/u/251374",
				},
				title: activity.details ?? "",
				url: `https://open.spotify.com/track/${activity.syncId}`,
				thumbnail: {
					url: `https://i.scdn.co/image/${activity.assets?.largeImage?.replace("spotify:", "")}`,
				},
				fields: [
					{
						name: "Artist",
						value: `\`${activity.state}\``,
						inline: true,
					},
				],
				timestamp: new Date(),
				footer: {
					text: data.member.user.username,
					icon_url: data.member.user.displayAvatarURL(),
				},
			});
		} else {
			switch (activity.applicationId) {
				case "367827983903490050":
					if (!activity.assets) return;
					// eslint-disable-next-line no-case-declarations
					const osu = (await this.get(activity, "osu!")) as Profile;
					return this.send(
						channel,
						data,
						activity.name,
						{
							color: 0xff66aa,
							title: osu.username,
							url: `https://osu.ppy.sh/users/${osu.user_id}`,
							author: {
								name: `Osu!${activity.assets.smallText?.split("!")[1].trim() ?? ""}`,
								icon_url: `https://cdn.discordapp.com/app-assets/${activity.applicationId}/${activity.assets.largeImage}.png`,
							},
							thumbnail: {
								url: `https://s.ppy.sh/a/${osu.user_id}`,
							},
							fields: [
								{
									name: `<:${osu.mode.emojiname}:${osu.mode.emoji}> Level`,
									value: `\`${osu.level}\``,
									inline: true,
								},
								{
									name: "Play Count",
									value: `\`${osu.playcount}\``,
									inline: true,
								},
								{
									name: "Accuracy",
									value: `\`${Number(osu.accuracy).toFixed(2)}%\``,
									inline: true,
								},
								{
									name: "Count 300",
									value: `\`${osu.count300}\``,
									inline: true,
								},
								{
									name: "Count 100",
									value: `\`${osu.count100}\``,
									inline: true,
								},
								{
									name: "Count 50",
									value: `\`${osu.count50}\``,
									inline: true,
								},
								{
									name: "Ranked Score",
									value: `\`${osu.ranked_score}\``,
									inline: true,
								},
								{
									name: "Total Score",
									value: `\`${osu.total_score}\``,
									inline: true,
								},
								{
									name: "PP Rank",
									value: `\`${osu.pp_rank}\``,
									inline: true,
								},
								{
									name: "Grade",
									value: `<:GradeA:986584510873354260> ${osu.count_rank_a}  <:GradeS:986584520864174100> ${osu.count_rank_s}  <:GradeS_Silver:986584524345475102> ${osu.count_rank_sh}  <:GradeSS_Silver:986584525884780615> ${osu.count_rank_ssh}  <:GradeSS:986584522638381106> ${osu.count_rank_ss}`,
									inline: true,
								},
								{
									name: "Graph",
									value: `${osu.graph.title}`,
								},
							],
							timestamp: new Date(osu.join_date).getTime(),
							image: {
								url: "attachment://graph.png",
							},
							footer: {
								text: `${osu.country} | Join date`,
								icon_url: data.member.user.displayAvatarURL(),
							},
						},
						new MessageAttachment(osu.graph.buffer, "graph.png"),
					);

				default:
					return channel.messages.fetch().then((message) => {
						if (!message.size) return;
						message.forEach((msg) => {
							if (
								(msg.content.split(" ")[1] === data.member?.user.id && msg.author.id === client.application?.id) ||
								msg.embeds[0].footer?.iconURL?.includes(`${data.member?.user.id}`)
							) {
								return this.send(channel, data, activity.name, {
									color: "GREEN",
									description: activity.details && activity.state ? `${activity.details}\n${activity.state}` : activity.details ?? "",
									author: {
										name: activity.name,
										icon_url:
											activity.applicationId && activity.assets?.largeImage
												? `https://cdn.discordapp.com/app-assets/${activity.applicationId}/${activity.assets?.largeImage}.png`
												: undefined,
									},
									footer: {
										text: data.member.user.username,
										icon_url: data.member.user.displayAvatarURL(),
									},
								});
							}
						});
					});
			}
		}
	}

	send(channel: TextChannel, data: any, application: string, embed: MessageEmbedOptions, file?: MessageAttachment) {
		channel.messages.fetch().then((message) => {
			if (!message.size) return;
			message.forEach((msg) => {
				if (
					(msg.content.split(" ")[1] === data.member?.user.id && msg.author.id === client.application?.id) ||
					msg.embeds[0].footer?.iconURL?.includes(`${data.member?.user.id}`)
				) {
					log("tracker", `Edit Embeds User: ${data.member?.user.username}#${data.member?.user.discriminator} = ${application}`, "feat");
					if (file) return msg.edit({ embeds: [embed], files: [file] });
					else return msg.edit({ embeds: [embed], files: [] });
				}
			});
		});
	}
}
