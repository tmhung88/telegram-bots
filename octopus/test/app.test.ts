import {App} from "../src/app";
describe("[App]", () => {
    describe("[greet()]", () => {
        it("should return greeting", () => {
            const app = new App();
            expect(app.greet("World")).toEqual("Hello World");
        });
    });
});