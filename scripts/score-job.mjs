import process from "node:process";

const runAt = new Date().toISOString();
const gameweek = process.env.GAMEWEEK ?? "unknown";

console.log(`[score-job] start: ${runAt}`);
console.log(`[score-job] gameweek: ${gameweek}`);
console.log("[score-job] TODO: implement scoring pipeline using Supabase service role.");
console.log("[score-job] done");

