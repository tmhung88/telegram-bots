import { anything, instance, mock, when } from "ts-mockito";
import { WretcherFactory } from "../src/wretcher-factory";
import { Wretcher } from "wretch";

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
export { mockWretcherFactory, success };