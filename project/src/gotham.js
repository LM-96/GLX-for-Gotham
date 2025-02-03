import { AngleMath, degrees } from "./geometry.js";
import { GLXCameraManWorkModes, duo, LimitCheckers, position, rotation, scale, start, GLXApplication } from "./webglx.js";

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
        //setTimeout(() => this.cameraMan.dismiss(), 5000);
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
        lightFar: 200,
        projectionHeight: 500,
        projectionWidth: 500,
        lightPosition: position(200, 20, 10),
        lightTarget: position(20, 20, 0),
        isShadowEnabled: true
    }
});