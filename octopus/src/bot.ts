import Telegraf, { ContextMessageUpdate } from "telegraf";

import { inlineQueryProcessor, chosenInlineResultProcessor } from "./bot/processors";
import watchlistRepo from "./bot/watchlist";
import config from "./config";

const bot = new Telegraf(config.botToken);
bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a sticker"));
bot.on("message", (ctx) => {
  console.log("ctx.message", ctx.message);
  ctx.reply("I'm done");
});

bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.on("inline_query", inlineQueryProcessor.process);
bot.on("chosen_inline_result", chosenInlineResultProcessor.process);
export default bot;

/**
 * inlineQueryProcessor.process(ctx, query);
 *
 */