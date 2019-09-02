import { anyString, anything, instance, mock, when } from "ts-mockito";
import { WretcherFactory } from "../src/wretcher-factory";
import { Wretcher } from "wretch";
import Telegraf, { ContextMessageUpdate, Middleware, Telegram } from "telegraf";
import * as tt from "telegraf/typings/telegram-types";

interface TelegrafMiddlewareTrigger<T extends ContextMessageUpdate> {
    start?: Middleware<T>;
    help?: Middleware<T>;
    on: { [eventType: string]: Middleware<T> };
}

const mockTelegraf = <T extends ContextMessageUpdate>(): [Telegraf<T>, TelegrafMiddlewareTrigger<T>] => {
    const telegraf = mock(Telegraf);
    const trigger: TelegrafMiddlewareTrigger<T> = {on: {}};
    when(telegraf.start(anything())).thenCall((middleware: Middleware<T>) => trigger.start = middleware);
    when(telegraf.help(anything())).thenCall((middleware: Middleware<T>) => trigger.help = middleware);
    when(telegraf.on(anyString(), anything())).thenCall((eventType: string, middlware: Middleware<T>) => trigger.on[eventType] = middlware);
    return [telegraf, trigger];
};

const mockWretcherFactory = (urls: string[]): [WretcherFactory, Wretcher[]] => {
    const factory = mock(WretcherFactory);
    const mappings = urls.map(url => {
        return {url: url, wretcher: mock(Wretcher)};
    });
    for (const {url, wretcher} of mappings) {
        const wretcherInstance = instance(wretcher);
        when(factory.create(url)).thenReturn(wretcherInstance);
        when(wretcher.query(anything())).thenReturn(wretcherInstance);
    }
    const wretchers = mappings.map(mapping => mapping.wretcher);
    return [factory, wretchers];
};

const mockCtx = (query: Partial<tt.InlineQuery>, telegram?: Telegram): ContextMessageUpdate => {
    const emptyQuery: tt.InlineQuery = {from: undefined, id: "", offset: "", query: ""};
    const ctx = mock<ContextMessageUpdate>();
    ctx.inlineQuery = {...emptyQuery, ...query};
    ctx.telegram = telegram;
    return ctx;
};

interface MockResponseChain extends Promise<any> {
    json: () => Promise<any>;
}

const success = (data: any): Wretcher => {
    const response = Promise.resolve(data);
    const responseChain: MockResponseChain = {
        [Symbol.toStringTag]: "",
        json: () => response,
        catch: response.catch,
        then: response.then,
        finally: response.finally
    };

    const wretcher = mock(Wretcher);
    when(wretcher.get()).thenReturn(responseChain);
    return instance(wretcher);
};
export { mockWretcherFactory, success, mockTelegraf, mockCtx };