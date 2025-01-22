import { WebGLXApplication } from "./webglx.js";

class MyApp extends WebGLXApplication {
    constructor() {
        super({
            name: 'MyApp',
        });
    }
}

console.log("test");
const app = new MyApp();
console.log(app.applicationName);