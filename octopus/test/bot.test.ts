import { instance, mock, reset, verify } from "ts-mockito";
import { ChosenInlineResultProcessor, InlineQueryProcessor } from "../src/bot/processors";
import { Bot } from "../src/bot";
import { mockTelegraf } from "./mock-utilities";
import { ContextMessageUpdate } from "telegraf";

describe("[Bot]", () => {
    const ctx = mock<ContextMessageUpdate>();
    const [telegraf, trigger] = mockTelegraf<ContextMessageUpdate>();
    const inlineQueryProcessor = mock(InlineQueryProcessor);
    const chosenInlineResultProcessor = mock(ChosenInlineResultProcessor);
    const bot = new Bot(instance(telegraf), instance(inlineQueryProcessor), instance(chosenInlineResultProcessor));
    beforeEach(() => {
        reset(inlineQueryProcessor);
        reset(chosenInlineResultProcessor);
    });
    describe("[launch()]", () => {
        bot.launch();
        it("reply welcome when getting started", () => {
            trigger.start(instance(ctx));
            verify(ctx.reply("Welcome")).called();
        });
        it("reply instructions when users need help", () => {
            trigger.help(instance(ctx));
            verify(ctx.reply("Welcome")).called();
        });
        it("reply done when it's a message", () => {
            trigger.on["message"](instance(ctx));
            verify(ctx.reply("I'm done")).called();
        });
        it("call inlineQueryProcess done when it's an inline query", () => {
            const context = instance(ctx);
            trigger.on["inline_query"](context);
            verify(inlineQueryProcessor.process(context)).called();
        });
        it("call chosen_inline_result done when it's an chosen inline result", () => {
            const context = instance(ctx);
            trigger.on["chosen_inline_result"](context);
            verify(chosenInlineResultProcessor.process(context)).called();
        });
    });
});