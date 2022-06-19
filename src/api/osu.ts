import { ChartConfiguration } from "chart.js";
import { Profile, UserBest } from "../types/api/osu";
import log from "../util/logger";
import Osu from "node-osu";
import ChartJSImage from "chart.js-image";

interface ObjectAdd {
	[key: string]: any;
}

const osuApi = new Osu.Api(`${process.env.osu_api}`, {
	notFoundAsError: false,
	completeScores: true,
	parseNumeric: false,
});

export default async (user: string, mode?: string | null) => {
	log("Osu!", `Processing.. \nuser: ${user}\nmode: ${mode}`, "api");
	const osuMode = ["osu!", "osu!taiko", "osu!catch", "osu!mania"].indexOf(`${mode}`) as 0 | 1 | 2 | 3,
		osu: ObjectAdd = await osuApi.apiCall("/get_user", { u: user, m: osuMode }).then((value: any) => {
			value[0].mode = {
				name: mode,
				emojiname: ["osu", "osu_taiko", "osu_catch", "osu_mania"][osuMode],
				emoji: ["986588017521197126", "986588019358334976", "986588014035759104", "986588015742844928"][osuMode],
			};
			return value;
		}),
		best: UserBest = {
			pp: [],
			rank: [],
			counts: {
				"100": [],
				"50": [],
				miss: [],
			},
			accuracy: [],
		};

	await osuApi.getUserBest({ u: user, m: osuMode, limit: 100 }).then((value) => {
		osu[0].graph = {
			title: `Best Performance ${value.length > 99 ? "" : `(${value.length})`}`,
		};
		value.forEach((data: Osu.Score) => {
			best.pp.push(data.pp);
			best.rank.push(data.rank);
			best.counts[50].push(data.counts[50]);
			best.counts[100].push(data.counts[100]);
			best.counts.miss.push(data.counts.miss);
			best.accuracy.push(Number(data.accuracy ?? 0) * 100);
		});
	});

	const config_default = {
			backgroundColor: "transparent",
			tension: 0.1,
			fill: false,
		} as any,
		chartJS = {
			type: "line",
			data: {
				labels: best.rank,
				datasets: [
					{
						...config_default,
						borderColor: "rgb(70,255,0)",
						data: best.accuracy,
						label: "Accuracy",
					},
					{
						...config_default,
						borderColor: "rgb(0,236,255)",
						data: best.pp,
						label: "PP",
					},
					{
						...config_default,
						borderColor: "rgb(137,203,143)",
						data: best.counts[100],
						label: "100",
					},
					{
						...config_default,
						borderColor: "rgb(215,185,115)",
						data: best.counts[50],
						label: "50",
					},
					{
						...config_default,
						borderColor: "rgb(240,124,121)",
						data: best.counts.miss,
						label: "Miss",
					},
				],
			},
		} as ChartConfiguration;

	await new ChartJSImage()
		.chart(chartJS as any)
		.backgroundColor("rgb(47,49,54)")
		.width(`${1000}`)
		.height(`${200}`)
		.toBuffer()
		.then((value: Buffer) => (osu[0].graph.buffer = value));

	return osu[0] as Profile;
};
