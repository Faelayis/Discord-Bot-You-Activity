// https://docs.henrikdev.xyz/valorant.html#

export interface Api {
	get: "account" | "mmr" | "matches" | "mmr-history" | "leaderboard";
	version?: "v1" | "v2" | "v3";
	region?: "ap" | "eu" | "ea" | "kr";
	username: string;
	tagline: string;
	filter?: "escalation" | "spikerush" | "deathmatch" | "competitive" | "unrated" | "replication";
}
