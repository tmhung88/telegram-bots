import Telegraf, { ContextMessageUpdate } from "telegraf";
import config from "./config";
import {
    ChosenInlineResultProcessor,
    chosenInlineResultProcessor,
    InlineQueryProcessor,
    inlineQueryProcessor
} from "./bot/processors";

class Bot {
    constructor(public telegraf: Telegraf<ContextMessageUpdate>,
                public inlineQueryProcessor: InlineQueryProcessor,
                public chosenInlineResultProcessor: ChosenInlineResultProcessor) {
    }

    launch = (): void => {
        this.telegraf.start((ctx) => ctx.reply("Welcome"));
        this.telegraf.help((ctx) => ctx.reply("Some instructions ..."));
        this.telegraf.on("message", (ctx) => {
            ctx.reply("I'm done");
        });

        this.telegraf.on("inline_query", this.inlineQueryProcessor.process);
        this.telegraf.on("chosen_inline_result", this.chosenInlineResultProcessor.process);
        this.telegraf.launch();
    };
}

const bot = new Bot(new Telegraf(config.botToken), inlineQueryProcessor, chosenInlineResultProcessor);
export default bot;
export { Bot };
/**
 * inlineQueryProcessor.process(ctx, query);
 *
 */