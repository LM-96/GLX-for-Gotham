import { degrees } from "./geometry.js";
import { CameraManWorkModes, duo, LimitCheckers, position, rotation, scale, start, WebGLXApplication } from "./webglx.js";

const BASE = 200;
const HIGH = 365;
const TOLERANCE = 3;

class GothamApp extends WebGLXApplication {

    batMoto = this.glxSprite({
        name: 'batmoto',
        path: './assets/objs/batmoto.obj',
        position: position(170, -131, 1),
        rotation: rotation(degrees(0), degrees(0), degrees(90)),
        scale: scale(1, 1, 1),
        limitChecker: LimitCheckers.LINEAR(
            duo(TOLERANCE, HIGH - TOLERANCE),
            duo(-BASE + TOLERANCE, 0 - TOLERANCE),
            duo(1, 1))
    });

    world = this.glxSprite({
        name: 'world',
        path: './assets/objs/city.obj',
        scale: scale(0.7, 0.7, 0.7)
    });

    main() {
        this.cameraMan.targetSprite = this.batMoto;
        this.cameraMan.hire(CameraManWorkModes.THIRD_PERSON);
        setTimeout(() => this.batMoto.position = position(180, -120, 1), 5000);
    }
}

start({
    applicationClass: GothamApp,
    canvasElementName: 'gotham-canvas',
    webGLShaders: {
        main: ["vertex-shader", "fragment-shader"],
        color: ["color-vertex-shader", "color-fragment-shader"]
    },
    shadowLightSetting: {
        far: 200,
        projectionHeight: 500,
        projectionWidth: 500,
        lightPosition: position(200, 20, 10),
        lightTarget: position(20, 20, 0),
        isShadowEnabled: true
    }
});