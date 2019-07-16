# Description
A simple setup for writing a console Node app in TypeScript. The setup includes unit testing done with Jest & Chai, TS linting, VSCode Settings and some commands to run/debug/watch code

# Prerequisites
NodeJS

# Scripts
All the different build steps are done via [npm scripts](https://docs.npmjs.com/misc/scripts). To call a script, run `npm run <script-name>` from the command line. Below is all available scripts:

| Npm Script                | Description                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `start`                   | Build, lint and run the `app.ts`                                                                  |
| `build`                   | Full build                                                                                        |
| `serve`                   | Runs node on `dist/app.js` which is the apps entry point                                          |
| `watch-node`              | Runs node with nodemon so the process restarts if it crashes. Used in the main watch task         |
| `watch`                   | Runs all watch tasks (TypeScript, Node). Use this if you're not touching static assets.           |
| `test`                    | Runs tests using Jest test runner                                                                 |
| `watch-test`              | Runs tests in watch mode                                                                          |
| `build-ts`                | Compiles all source `.ts` files to `.js` files in the `dist` folder                               |
| `watch-ts`                | Same as `build-ts` but continuously watches `.ts` files and re-compiles when needed               |
| `tslint`                  | Runs TSLint on project files                                                                      |
| `debug`                   | Performs a full build and then serves the app in watch mode                                       |
| `serve-debug`             | Runs the app with the --inspect flag                                                              |
| `watch-debug`             | The same as `watch` but includes the --inspect flag so you can attach a debugger                  |