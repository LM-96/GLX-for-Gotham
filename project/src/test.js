import { GLXApplication } from "./webglx.js";

class MyApp extends GLXApplication {
    constructor() {
        super({
            name: 'MyApp',
        });
    }
}

console.log("test");
const app = new MyApp();
console.log(app.applicationName);