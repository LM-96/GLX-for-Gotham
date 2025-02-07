import { AngleMath, degrees } from "./geometry.js";
import { GLXDatGuiCotrolsHandler } from "./gotham-controls.js";
import { GLXApplication } from "./glx-core.js";
import { start } from "./glx-core.js";
import { LimitCheckers } from "./glx-model.js";
import { duo, GLXCameraManWorkModes, position, rotation, scale } from "./glx-model.js";



const BASE = 200;
const HIGH = 365;
const TOLERANCE = 3;

class GothamApp extends GLXApplication {

    batMoto = this.glxSprite({
        name: 'batmoto',
        path: './assets/objs/batmoto.obj',
        position: position(170, -131, 1),
        rotation: rotation(degrees(0), degrees(0), degrees(90)),
        scale: scale(0.3, 0.3, 0.3),
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
        this.cameraMan.phase = this.batMoto.rotation.third.transform(AngleMath.multiplyBy(-1));
        this.cameraMan.distance = 50;
        this.cameraMan.hire(GLXCameraManWorkModes.THIRD_PERSON);
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
        lightFar: 300,
        projectionHeight: 100,
        projectionWidth: 100,
        lightFov: degrees(120),
        lightPosition: position(170, -131, 50),
        lightTarget: position(170, -131, 1),
        isShadowEnabled: true,
        isSpotlight: true
    },
    cameraSettings: {
        zFar: 700
    },
    controlHandlerClasses: [ GLXDatGuiCotrolsHandler ]
});