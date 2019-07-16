class App {
    greet(name: string): string {
        return `Hello ${name}`;
    }
}

const app = new App;
console.log(app.greet("World"));

export { App };