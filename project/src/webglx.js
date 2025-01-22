// @ts-check
/**
 * @author Luca Marchegiani
 */

import { Angle, degrees, Math3D, Point3D, point3D, radians } from "./geometry.js";
import { Logger } from "./logjsx.js";
import { SIGNALS } from "./signals.js";

/* global loadObjx */
/* global webglUtils */

/* TYPES (JSDoc) **************************************************************************************************** */
/**
 * @typedef {import("./webglx.js").CameraSettings} CameraSettings
 */

/**
 * @typedef {import("./webglx.js").CameraSignalDescriptors} CameraSignalDescriptors
 */

/**
 * @typedef {import("./webglx.js").CameraSignalWorkspace} CameraSignalWorkspace
 */

/**
 * @template T
 * @typedef {import("./webglx.js").Change<T>} Change
 */

/**
 * @template T
 * @typedef {import("./webglx.js").Duo<T>} Duo
 */

/**
 * @template T
 * @typedef {import("./signals").FireRequest<T>} FireRequest
 */

/**
 * @typedef {import("./webglx.js").WebGLXApplicationSignalWorkspace} WebGLXApplicationSignalWorkspace
 */

/**
 * @typedef {import("./webglx.js").LimitChecker} LimitChecker
 */

/**
 * @typedef {import("./logjsx.js").LogFunction} LogFunction
 */

/**
 * @template T
 * @typedef {import("./signals.js").SignalDescriptor<T>} SignalDescriptor
 */

/**
 * @typedef {import("./webglx.js").PositionChange} PositionChange
 */

/**
 * @typedef {import("../lib/webgl-utils.js").ProgramInfo} ProgramInfo
 */

/**
 * @typedef {import("./webglx.js").RotationChange} RotationChange
 */

/**
 * @typedef {import("./webglx.js").ScaleChange} ScaleChange
 */

/**
 * @typedef {import("./webglx.js").SpriteAction} SpriteAction
 */

/**
 * @typedef {import("./webglx.js").SpriteActionType} SpriteActionType
 */

/**
 * @template T
 * @typedef {import("./webglx.js").Trio<T>} Trio
 */

/**
 * @typedef {import("./geometry.js").Vector3D} Vector3D
 */

/* STATIC CLASSES *************************************************************************************************** */

export class SpriteActions {
    /** @type {SpriteActionType} */ static TRANSITION = 1;
    /** @type {SpriteActionType} */ static ROTATION = 2;
    /** @type {SpriteActionType} */ static SCALE = 3;
}

class FireRequests {

    /**
     * @param {Change<Trio<Angle>>} change
     * @returns {FireRequest<SpriteAction>}
     */
    static ofRotation(change) {
        return Object.freeze({
            data: Object.freeze({
                type: SpriteActions.ROTATION,
                description: change,
            })
        });
    }

    /**
     *
     * @param {Change<Trio<number>>} change
     * @returns {FireRequest<SpriteAction>}
     */
    static ofScale(change) {
        return Object.freeze({
            data: Object.freeze({
                type: SpriteActions.SCALE,
                description: change,
            })
        });
    }

    /**
     *
     * @param {Change<Point3D>} change
     * @returns {FireRequest<SpriteAction>}
     */
    static ofTransition(change) {
        return Object.freeze({
            data: Object.freeze({
                type: SpriteActions.TRANSITION,
                description: change
            }),
        });
    }

}

class LimitCheckers {

    /**
     *
     * @param {Duo<number>} xBounds
     * @param {Duo<number>} yBounds
     * @param {Duo<number>} zBounds
     * @returns {LimitChecker}
     */
    static LINEAR(xBounds, yBounds, zBounds) {
        return (sprite, targetPosition) => isNumberBetweenInclusiveDuo(targetPosition.x, xBounds)
            && isNumberBetweenInclusiveDuo(targetPosition.y, yBounds)
            && isNumberBetweenInclusiveDuo(targetPosition.z, zBounds);
    }

    /** @type {LimitChecker} */
    static UNLIMITED = () => true;
}

class Positions {
    /** @type {Point3D} */
    static ORIGIN = point3D(0, 0, 0);
}

class Rotations {
    /** @type {Trio<Angle>} */
    static NOT_ROTATED = trio(radians(0), radians(0), radians(0));
}

class Scales {
    /** @type {Trio<number>} */
    static NOT_SCALED = trio(1, 1, 1);
}

/* CLASSES ********************************************************************************************************** */

/**
 * @class Camera
 */
export class Camera {
    /** @type {CameraSignalWorkspace} */
    static SIGNAL_WORKSPACES = {
        positionChanges: 'camera.position',
        upChanges: 'camera.up',
        targetChanges: 'camera.target',
        fovChanges: 'camera.fov',
        isLookingAtSpriteChanges: 'camera.isLookingAtSprite',
        isChasingSpriteChanges: 'camera.isChasingSprite',
        targetSpriteChanges: 'camera.targetSprite'
    }

    /** @type {CameraSettings} */ #settings;
    /** @type {CameraSignalDescriptors} */ #signalDescriptors;

    /**
     * 
     * @param {Partial<CameraSettings>} settings 
     */
    constructor(settings = {}) {
        this.#settings = {
            position: point3D(1, 1, 1),
            up: trio(0, 0, 1),
            target: point3D(0, 0, 0),
            fov: degrees(60),
            isLookingAtSprite: false,
            isChasingSprite: false,
            targetSprite: null,
            ...settings
        };

        this.#signalDescriptors = {
            positionChanges: SIGNALS.register(Camera.SIGNAL_WORKSPACES.positionChanges),
            upChanges: SIGNALS.register(Camera.SIGNAL_WORKSPACES.upChanges),
            targetChanges: SIGNALS.register(Camera.SIGNAL_WORKSPACES.targetChanges),
            fovChanges: SIGNALS.register(Camera.SIGNAL_WORKSPACES.fovChanges),
            isLookingAtSpriteChanges: SIGNALS.register(Camera.SIGNAL_WORKSPACES.isLookingAtSpriteChanges),
            isChasingSpriteChanges: SIGNALS.register(Camera.SIGNAL_WORKSPACES.isChasingSpriteChanges),
            targetSpriteChanges: SIGNALS.register(Camera.SIGNAL_WORKSPACES.targetSpriteChanges)
        }
    }

    /**
     * 
     * @param {Sprite|null} sprite 
     * @returns {Camera}
     */
    chaseSprite(sprite = null) {
        let nextTargetSprite = sprite ?? this.targetSprite;
        let wasChasingSprite = this.isChasingSprite;
        if (wasChasingSprite) {
            this.unChaseSprite();
        }

        if (!this.isLookingAtSprite || nextTargetSprite !== this.targetSprite) {
            this.lookAtSprite(nextTargetSprite);
        }

        if (!wasChasingSprite) {
            this.#settings.isChasingSprite = true;
            this.#signalDescriptors.isChasingSpriteChanges.trigger({
                data: change(true, wasChasingSprite)
            });
        }
    

        return this;
    }

    /**
     * @returns {boolean}
     */
    get isChasingSprite() {
        return this.#settings.isChasingSprite;
    }

    /**
     * @returns {boolean}
     */
    get isLookingAtSprite() {
        return this.#settings.isLookingAtSprite;
    }

    /**
     * @returns {Point3D}
     */
    get position() {
        return this.#settings.position;
    }

    /**
     * @returns {Point3D}
     */
    get target() {
        return this.#settings.target;
    }

    /**
     * 
     * @param {Sprite|null} sprite 
     * @returns {Camera}
     */
    lookAtSprite(sprite = null) {
        let nextTargetSprite = sprite ?? this.targetSprite;
        let wasLookingAtSprite = this.isLookingAtSprite
        if (wasLookingAtSprite) {
            this.unLookSprite();
        }

        if (nextTargetSprite !== this.targetSprite) {
            this.targetSprite = nextTargetSprite;
        }

        if (!wasLookingAtSprite) {
            this.#settings.isLookingAtSprite = true;
            this.#signalDescriptors.isLookingAtSpriteChanges.trigger({
                data: change(true, wasLookingAtSprite)
            });
        }

        return this;
    }

    /**
     * @param {Vector3D} vector3D 
     */
    set distanceFromTarget(vector3D) {
        this.position = this.target.transform(
            Math3D.translate(vector3D.dx, vector3D.dy, vector3D.dz));
    }

    /**
     * @param {Angle} nextFov 
     */
    set fov(nextFov) {
        let previousFov = this.#settings.fov;
        if (nextFov !== previousFov) {
            this.#settings.fov = nextFov;

            this.#signalDescriptors.fovChanges.trigger({
                data: change(nextFov, previousFov)
            });
        }
    }

    /**
     * @param {Point3D} nextPosition
     */
    set position(nextPosition) {
        let previousPosition = this.position;
        if (nextPosition !== previousPosition) {
            this.#settings.position = nextPosition;

            this.#signalDescriptors.positionChanges.trigger({
                data: change(nextPosition, previousPosition)
            });
        }
    }

    /**
     * @param {Sprite | null} nextLookedSprite
     */
    set targetSprite(nextLookedSprite) {
        let previousLookedSprite = this.#settings.targetSprite;
        if (nextLookedSprite !== previousLookedSprite) {
            this.#settings.targetSprite = nextLookedSprite

            this.#signalDescriptors.targetSpriteChanges.trigger({
                data: change(nextLookedSprite, previousLookedSprite)
            });
        }
    }

    /**
     * @param {Trio<number>} nextUp
     */
    set up(nextUp) {
        let previousUp = this.up;
        if (nextUp !== previousUp) {
            this.#settings.up = nextUp;

            this.#signalDescriptors.upChanges.trigger({
                data: change(nextUp, previousUp)
            });
        }
    }

    /**
     * @returns {Camera}
     */
    unChaseSprite() {

    }

    /**
     * @returns {Camera}
     */
    unLookSprite() {

    }


}

/**
 * @class Sprite
 */
export class Sprite {

    /**  @type {string} */ #name;
    /**  @type {string} */ #applicationName;
    /**  @type {Point3D} */ #position;
    /**  @type {Trio<Angle>} */ #rotation;
    /**  @type {Trio<number>} */ #scale;
    /**  @type {LimitChecker} */ #limitChecker;
    /**  @type {boolean} */ #hidden;
    /**  @type {SignalDescriptor<SpriteAction>} */ #informationSignalDescriptor;

    /**
     *
     * @param {string} name
     * @param {string} applicationName
     * @param {Point3D} position
     * @param {Trio<Angle>} rotation
     * @param {Trio<number>} scale
     * @param {LimitChecker} limitChecker
     * @param {boolean} hidden
     */
    constructor(name,
        applicationName,
        position = Positions.ORIGIN,
        rotation = Rotations.NOT_ROTATED,
        scale = Scales.NOT_SCALED,
        limitChecker = LimitCheckers.UNLIMITED,
        hidden = false
    ) {
        this.#name = name;
        this.#applicationName = applicationName;
        this.#position = position;
        this.#rotation = rotation;
        this.#scale = scale;
        this.#limitChecker = limitChecker;
        this.#hidden = hidden;

        this.#informationSignalDescriptor = SIGNALS.register("");
    }

    get name() {
        return this.#name;
    }

    get applicationName() {
        return this.#applicationName;
    }

    get position() {
        return this.#position;
    }

    get rotation() {
        return this.#rotation;
    }

    get scale() {
        return this.#scale;
    }

    get limitChecker() {
        return this.#limitChecker;
    }

    get hidden() {
        return this.#hidden;
    }

    /**
     * @param {Point3D} position
     */
    set position(position) {
        let positionChange = change(position, this.#position);

        // @ts-ignore
        if (!this.limitChecker(this, position)) {
            throw new Error(`invalid position change [sprite: "${this.#name}", target: ${position}]: out of bounds`);
        }

        this.#position = position;
        this.#informationSignalDescriptor.trigger(FireRequests.ofTransition(positionChange));
    }

    /**
     *
     * @param {Trio<Angle>} rotation
     */
    set rotation(rotation) {
        let rotationChange = change(rotation, this.#rotation);

        this.#rotation = rotation;
        this.#informationSignalDescriptor.trigger(FireRequests.ofRotation(rotationChange));
    }

    /**
     * @param {Trio<number>} scale
     */
    set scale(scale) {
        let scaleChange = change(scale, this.#scale);

        this.#scale = scale;
        this.#informationSignalDescriptor.trigger(FireRequests.ofScale(scaleChange));
    }

}

/**
 * @class SpriteDrawer
 */
class SpriteDrawer {
    /** @type {string} */ #applicationName;
    /** @type {WebGLXEnvironment} */ #glXEnvironment;
    /** @type {SpriteManager} */ #spriteManager;
    /** @type {number} */ zNear = 0.1;
    /** @type {number} */ zFar = 700;

}

/**
 * @class SpriteManager
 */
class SpriteManager {
    /** @type {string} */ #applicationName;
    /** @type {Logger} */ #log;
    /** @type {Map<string, Sprite>} */ #sprites;

    /**
     *
     * @param {string} applicationName
     */
    constructor(applicationName) {
        this.#applicationName = applicationName;
        this.#log = Logger.forName('SpriteManager[' + applicationName + ']');
    }

    /**
     *
     * @param {string} name
     * @returns {Sprite}
     */
    createSprite(name) {
        this.#log.info('create sprite [name: ' + name + ', applicationName: ' + this.#applicationName + ']');

        /** @type {Sprite} */
        let sprite = new Sprite(name);
        this.#sprites.set(name, sprite);

        return sprite;
    }

    /**
     *
     * @returns {Sprite[]}
     */
    getAllSprites() {
        return new Array(...this.#sprites.values());
    }

    /**
     *
     * @param {string} name
     * @returns {Sprite|undefined}
     */
    getSprite(name) {
        return this.#sprites.get(name);
    }

}

/**
 * @class WebGLXApplication
 */
export class WebGLXApplication {
    static SIGNAL_NAMESPACE = 'WebGXLApp';

    /**
     * 
     * @param {string} name 
     * @returns {string}
     */
    static parentSignalNamespace(name) {
        return `${WebGLXApplication.SIGNAL_NAMESPACE}[${name}].${WebGLXApplication.SIGNAL_NAMESPACE}`;
    }

    /** @type {string} */ #applicationName;
    /** @type {Logger} */ #log;
    /** @type {WebGLXEnvironment} */ #webGLXEnvironment;
    /** @type {SpriteDrawer} */ #spriteDrawer;
    /** @type {SpriteManager} */ #spriteManager;
    /** @type {WebGLXApplicationSignalWorkspace} */ #signalWorkspace;

    /**
     * 
     * @param {string} applicationName 
     * @param {WebGLXEnvironment} webGLXEnvironment 
     */
    constructor(applicationName, webGLXEnvironment) {
        this.#log = Logger.forName('WebGLXApp[' + applicationName + ']');
        this.#applicationName = applicationName;
        this.#webGLXEnvironment = webGLXEnvironment;
        this.#signalWorkspace = this.#buildSignalWorkspace(applicationName);
    }

    get applicationName() {
        return this.#applicationName;
    }

    get signalWorkspace() {
        return this.#signalWorkspace;
    }

    /**
     * 
     * @param {string} applicationName 
     * @returns {WebGLXApplicationSignalWorkspace}
     */
    #buildSignalWorkspace(applicationName) {
        return {
            camera: {
                positionChanges: WebGLXApplication.parentSignalNamespace(Camera.SIGNAL_WORKSPACES.positionChanges),
                upChanges: WebGLXApplication.parentSignalNamespace(Camera.SIGNAL_WORKSPACES.upChanges),
                targetChanges: WebGLXApplication.parentSignalNamespace(Camera.SIGNAL_WORKSPACES.targetChanges),
                fovChanges: WebGLXApplication.parentSignalNamespace(Camera.SIGNAL_WORKSPACES.fovChanges),
                isLookingAtSpriteChanges: WebGLXApplication.parentSignalNamespace(Camera.SIGNAL_WORKSPACES.isLookingAtSpriteChanges),
                isChasingSpriteChanges: WebGLXApplication.parentSignalNamespace(Camera.SIGNAL_WORKSPACES.isChasingSpriteChanges),
                targetSpriteChanges: WebGLXApplication.parentSignalNamespace(Camera.SIGNAL_WORKSPACES.targetSpriteChanges)
            }
        }
    }

}

/**
 * @class WebGLXEnvironment
 */
class WebGLXEnvironment {
    /** @type {HTMLCanvasElement} */ #canvas;
    /** @type {WebGLRenderingContext} */ #gl;
    /** @type {Map<string, ProgramInfo>} */ #programInfo;

    /**
     *
     * @param {HTMLElement} element
     * @param {Map<string, WebGLShader[]>} webGLShaders
     */
    constructor(element, webGLShaders) {
        this.#canvas = this.#getCanvasElement(element);
        this.#gl = this.#getGl();
        this.#checkDepthTextureExtension();
        this.#programInfo = this.#buildProgramInfos(webGLShaders);
    }

    /**
     *
     * @returns {number}
     */
    get aspectRation() {
        return this.#canvas.clientWidth / this.#canvas.clientHeight;
    }

    /**
     *
     * @returns {HTMLCanvasElement}
     */
    get canvas() {
        return this.#canvas;
    }

    /**
     *
     * @returns {WebGLRenderingContext}
     */
    get glContext() {
        return this.#gl;
    }

    /**
     *
     * @param {string | null} programName
     * @returns {ProgramInfo}
     */
    getProgramInfo(programName) {
        if (programName === null) {
            return this.#programInfo.values().next().value;
        }

        return this.#programInfo.get(programName);
    }

    /**
     * 
     * @param {Map<string, WebGLShader[]>} webGLShaders
     * @returns {Map<string, ProgramInfo>}
     */
    #buildProgramInfos(webGLShaders) {
        /** @type {Map<string, ProgramInfo>}*/
        let programInfos = new Map();

        webGLShaders.forEach((value, key) => {
            // @ts-ignore
            this.#programInfo.set(key, webglUtils.createProgramInfo(this.#gl, value));
        });

        return programInfos;
    }

    #checkDepthTextureExtension() {
        let ext = this.#gl.getExtension('WEBGL_depth_texture');
        if (!ext) {
            throw alertedError('WEBGL_depth_texture is required to work');
        }
    }

    /**
     * 
     * @param {HTMLElement} element 
     * @returns {HTMLCanvasElement}
     */
    #getCanvasElement(element) {
        if (!('getContext' in element)) {
            throw alertedError('The given html element is not a canvas');
        }

        // @ts-ignore
        return element;
    }

    /**
     * @returns {WebGLRenderingContext}
     */
    #getGl() {
        let gl = this.#canvas.getContext('webgl');
        if (gl !== null) {
            return gl;
        }

        throw alertedError('Unable to initialize WebGL. Your browser may not support it');
    }

}

/* FUNCTIONS ******************************************************************************************************** */

/**
 * @template T
 * @param {T} to
 * @param {T} from
 * @returns {Change<T>}
 */
export function change(to, from) {
    return Object.freeze({
        to: to,
        from: from,
    });
}

/**
 * @template T
 * @param {T} first
 * @param {T} second
 * @returns {Duo<T>}
 */
export function duo(first, second) {
    return Object.freeze({
        first: first,
        second: second
    });
}

/**
 * @template T
 * @param {T} first
 * @param {T} second
 * @param {T} third
 * @returns {Trio<T>}
 */
export function trio(first, second, third) {
    return Object.freeze({
        first: first,
        second: second,
        third: third,
    });
}

/* UTILITIES ******************************************************************************************************** */

/**
 *
 * @param {string} msg
 * @returns {Error}
 */
function alertedError(msg) {
    alert(msg);
    return new Error(msg);
}

/**
 *
 * @param {number} num
 * @param {Duo<number>} duo
 * @returns {boolean}
 */
function isNumberBetweenInclusiveDuo(num, duo) {
    return num >= duo.first && num <= duo.second;
}

