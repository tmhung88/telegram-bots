import config from "./config";
import Telegraf from "telegraf";
import tmdbMovieClient from "./bot/tmdb-movie-client";
import watchlistRepo from "./bot/watchlist";

const bot = new Telegraf(config.botToken);
bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on("message", (ctx) => {
  console.log("ctx.message", ctx.message);
  ctx.reply("I'm done");
});

bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.on("inline_query", async (ctx) => {
  const query = ctx.inlineQuery.query.toLowerCase().trim();
  const hasWatchlist = query.indexOf("watchlist ") == 0;
  const hasAdd = query.indexOf("add ") == "watchlist ".length;
  const keyword = query.substring("watchlist add ".length).trim();
  console.log(`Query ${query}`);
  console.log(`hasWatchlist: ${hasWatchlist} | hasAdd: ${hasAdd} | keyword: ${keyword}`);
  if (query == "watchlist") {
    const inlineResults = watchlistRepo.getAll().map(result => result.toInlineArticle());
    ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, inlineResults, {cache_time: 5});
    return;
  }

  if (!hasWatchlist || !hasAdd || keyword.length == 0) {
    return;
  }
  const searchResults = await tmdbMovieClient.find(keyword);
  const inlineResults = searchResults.map(result => result.toInlineArticle());
    ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, inlineResults, {cache_time: 5});

  });

  bot.on("chosen_inline_result", ctx => {
    const {query, result_id} = ctx.update.chosen_inline_result;
    const hasWatchlist = query.indexOf("watchlist ") == 0;
    const hasAdd = query.indexOf("add ") == "watchlist ".length;
    if (!hasWatchlist || !hasAdd) {
      return;
    }
    watchlistRepo.add(Number(result_id));
  });
export default bot;