// @ts-check
/**
 * @author Luca Marchegiani
 */

import { Angle, AngleMath, degrees, Math3D, Point3D, point3D, radians } from "./geometry.js";
import { Logger } from "./logjsx.js";
import { SIGNALS } from "./signals.js";

/* global loadObjx */
/* global webglUtils */

/* TYPES (JSDoc) **************************************************************************************************** */
/**
 * @typedef {import("./webglx.js").CameraManSignalDescriptors} CameraManSignalDescriptors
 */

/**
 * @typedef {import("./webglx.js").CameraManSignalWorkspace} CameraManSignalWorkspace
 */

/**
 * @typedef {import("./webglx.js").CameraManWorkMode} CameraManWorkMode
 */

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
 * @typedef {import("./webglx.js").ProgramInfo} ProgramInfo
 */

/**
 * @typedef {import("./webglx.js").RotationChange} RotationChange
 */

/**
 * @typedef {import("./webglx.js").ScaleChange} ScaleChange
 */

/**
 * @typedef {import("./webglx.js").SharedUniforms} SharedUniforms
 */

/**
 * @template T
 * @typedef {import("./signals.js").Signal<T>} Signal
 */

/**
 * @typedef {import("./webglx.js").SpriteActionType} SpriteActionType
 */

/**
 * @typedef {import("./webglx.js").SpriteSettings} SpriteSetting
 */

/**
 * @typedef {import("./webglx.js").SpriteSignalDescriptors} SpriteSignalDescriptors
 */

/**
 * @typedef {import("./webglx.js").SpriteSignalWorkspace} SpriteSignalWorkspace
 */

/**
 * @typedef {import("./signals.js").SubscriptionToken} SubscriptionToken
 */

/**
 * @template T
 * @typedef {import("./webglx.js").Trio<T>} Trio
 */

/**
 * @typedef {import("./geometry.js").Vector3D} Vector3D
 */

/* STATIC CLASSES *************************************************************************************************** */

export class CameraManWorkModes {
    /** @type {CameraManWorkMode} */ static DISMISSED = 'DISMISSED';
    /** @type {CameraManWorkMode} */ static OVER = 'OVER';
    /** @type {CameraManWorkMode} */ static FIRST_PERSON = 'FIRST_PERSON';
    /** @type {CameraManWorkMode} */ static THIRD_PERSON = 'THIRD_PERSON'
    /** @type {CameraManWorkMode} */ static CUSTOM = 'CUSTOM';
}

export class SpriteActions {
    /** @type {SpriteActionType} */ static TRANSITION = 1;
    /** @type {SpriteActionType} */ static ROTATION = 2;
    /** @type {SpriteActionType} */ static SCALE = 3;
}

class FireRequests {

    /**
     * @param {Change<Trio<Angle>>} change
     * @returns {FireRequest<RotationChange>}
     */
    static ofRotationChange(change) {
        return Object.freeze({
            data: change
        });
    }

    /**
     *
     * @param {Change<Trio<number>>} change
     * @returns {FireRequest<ScaleChange>}
     */
    static ofScaleChange(change) {
        return Object.freeze({
            data: change
        });
    }

    /**
     *
     * @param {Change<Point3D>} change
     * @returns {FireRequest<PositionChange>}
     */
    static ofPositionChange(change) {
        return Object.freeze({
            data: change,
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

    /** @type {Logger} */ #logger;
    /** @type {CameraSettings} */ #settings;
    /** @type {CameraSignalDescriptors} */ #signalDescriptors;

    /**
     * 
     * @param {string} applicationName 
     * @param {CameraSignalWorkspace} signalWorkspace
     * @param {Partial<CameraSettings>} settings 
     */
    constructor(applicationName, signalWorkspace, settings = {}) {
        this.#settings = {
            position: point3D(1, 1, 1),
            up: trio(0, 0, 1),
            targetPosition: point3D(0, 0, 0),
            fov: degrees(60),
            ...settings
        };

        this.#signalDescriptors = {
            positionChanges: SIGNALS.register(signalWorkspace.positionChanges),
            upChanges: SIGNALS.register(signalWorkspace.upChanges),
            targetChanges: SIGNALS.register(signalWorkspace.targetChanges),
            fovChanges: SIGNALS.register(signalWorkspace.fovChanges)
        }

        this.#logger = Logger.forName(`Camera[${applicationName}]`);
    }

    /**
     * @returns {Angle}
     */
    get fov() {
        return this.#settings.fov;
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
    get targetPosition() {
        return this.#settings.targetPosition;
    }

    /**
     * @param {Vector3D} vector3D 
     */
    set distanceFromTarget(vector3D) {
        this.position = this.targetPosition.transform(
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
     * @param {Point3D} nextTargetPosition
     */
    set targetPosition(nextTargetPosition) {
        this.#settings.targetPosition = nextTargetPosition
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
}

/**
 * @class CameraMan
 */
export class CameraMan {

    /** @type {SubscriptionToken|null} */ #chaseSpriteSubscriptionToken = null;
    /** @type {SubscriptionToken|null} */ #chaseSpriteRotationSubscriptionToken = null;
    /** @type {SubscriptionToken|null} */ #lookAtSpriteSubscriptionToken = null;
    /** @type {Sprite|null} */ #targetSprite = null;
    /** @type {import("./webglx.js").CameraManWorkMode} */ #workMode = CameraManWorkModes.DISMISSED;

    /** @type {Camera} */ #camera;
    /** @type {number} */ #distance = 50;
    /** @type {number} */ #high = 5;
    /** @type {Logger} */ #logger;
    /** @type {number} */ #phase = 0;
    /** @type {CameraManSignalDescriptors} */ #signalDescriptors;

    /**
     * 
     * @param {string} applicationName 
     * @param {Camera} camera 
     * @param {CameraManSignalWorkspace} signalWorkspace 
     */
    constructor(applicationName, camera, signalWorkspace) {
        this.#camera = camera;
        this.#signalDescriptors = {
            isLookingAtSpriteChanges: SIGNALS.register(signalWorkspace.isLookingAtSpriteChanges),
            isChasingSpriteChanges: SIGNALS.register(signalWorkspace.isChasingSpriteChanges),
            targetSpriteChanges: SIGNALS.register(signalWorkspace.targetSpriteChanges),
            workModeChanges: SIGNALS.register(signalWorkspace.workModeChanges)
        }

        this.#logger = Logger.forName(`CameraMan[${applicationName}]`);
    }

    get distance() {
        return this.#distance;
    }

    /**
     * @returns {boolean}
     */
    get isChasingSprite() {
        return isNotNullOrUndefined(this.chaseSpriteSubscriptionToken);
    }

    /**
     * @returns {boolean}
     */
    get isHired() {
        return this.#workMode !== CameraManWorkModes.DISMISSED;
    }

    /**
     * @returns {boolean}
     */
    get isLookingAtSprite() {
        return isNotNullOrUndefined(this.isLookingAtSprite);
    }

    get targetSprite() {
        return this.#targetSprite
    }

    /**
     * @param {number} value 
     */
    set distance(value) {
        this.#distance = value;
        if (this.isHired) {
            this.#autoSet();
        }
    }

    /**
     * @param {Sprite | null} nextLookedSprite
     */
    set targetSprite(nextLookedSprite) {
        let previousLookedSprite = this.#targetSprite;
        if (nextLookedSprite !== previousLookedSprite) {
            this.#targetSprite = nextLookedSprite

            this.#signalDescriptors.targetSpriteChanges.trigger({
                data: change(nextLookedSprite, previousLookedSprite)
            });

            if (this.isHired) {
                this.#autoSet();
            }
        }
    }

    /**
     * 
     * @returns {CameraMan}
     */
    chaseTargetSprite() {
        this.#customWorkMode();
        if (isNotNullOrUndefined(this.#targetSprite)) {
            if (this.isChasingSprite) {
                this.unChaseSprite();
            }

            if (!this.isLookingAtSprite) {
                this.lookAtTargetSprite();
            }

            this.chaseSpriteSubscriptionToken = SIGNALS.subscribe(this.#targetSprite.signalWorkspace.positionChange,
                this.#chaseSpriteSignalConsumer);
            this.#signalDescriptors.isChasingSpriteChanges.trigger({
                data: change(true, false)
            });
        } else {
            this.#logger.warn(`wanted to chase sprite, but no target was set`)
        }

        return this;
    }

    dismiss() {
        if (this.#workMode !== CameraManWorkModes.DISMISSED) {
            this.#unsubscribeFromChaseSpriteSignal();
            this.#unsubscribeFromChaseSpriteRotationSignal();
            this.#unsubscribeFromLookAtSpriteSignal();
        }

        this.#setWorkMode(CameraManWorkModes.DISMISSED);
        return this;
    }

    /**
     * 
     * @param {CameraManWorkMode} workMode 
     */
    hire(workMode) {
        if (isNullOrUndefined(this.#targetSprite)) {
            throw new Error('target sprite was not set, cannot hire')
        }

        this.dismiss();
        if (this.#workMode !== workMode && isNotNullOrUndefined(this.#targetSprite)) {
            this.#logger.info(`hiring [workMode: ${workMode}]`);
            switch (workMode) {
                case CameraManWorkModes.FIRST_PERSON:
                    this.#chaseSpriteSubscriptionToken = SIGNALS.subscribe(this.#targetSprite.signalWorkspace.positionChange,
                        this.#workFirstPerson);
                    this.#chaseSpriteRotationSubscriptionToken = SIGNALS.subscribe(this.#targetSprite.signalWorkspace.rotationChange,
                        this.#workFirstPerson);
                    this.#workFirstPerson();
                    break;
                case CameraManWorkModes.OVER:
                    this.#chaseSpriteSubscriptionToken = SIGNALS.subscribe(this.#targetSprite.signalWorkspace.positionChange,
                        this.#workOver);
                    this.#workOver();
                    break;
                case CameraManWorkModes.THIRD_PERSON:
                    this.#chaseSpriteSubscriptionToken = SIGNALS.subscribe(this.#targetSprite.signalWorkspace.positionChange,
                        this.#workThirdPerson);
                    this.#chaseSpriteRotationSubscriptionToken = SIGNALS.subscribe(this.#targetSprite.signalWorkspace.rotationChange,
                        this.#workThirdPerson);
                    this.#workThirdPerson();
                    break;
                default:
                    throw new Error(`unable to hire with work mode ${workMode}`);
            }

            this.#setWorkMode(workMode);
        }
    }

    /**
     * 
     * @returns {CameraMan}
     */
    lookAtTargetSprite() {
        this.#customWorkMode;
        if (isNotNullOrUndefined(this.#targetSprite)) {
            if (this.isLookingAtSprite) {
                this.unLookAtSprite();
            }

            this.lookAtSpriteSubscriptionToken = SIGNALS.subscribe(this.#targetSprite.signalWorkspace.positionChange,
                this.#lookAtSpriteSignalConsumer);
            this.#signalDescriptors.isLookingAtSpriteChanges.trigger({
                data: change(true, false)
            })
        } else {
            this.#logger.warn(`wanted to look at sprite, but the given one is null and no target was set`);
        }

        return this;
    }


    /**
     * @returns {CameraMan}
     */
    unChaseSprite() {
        if (this.isChasingSprite) {
            this.#unsubscribeFromChaseSpriteSignal();
            this.#signalDescriptors.isLookingAtSpriteChanges.trigger({
                data: change(false, true)
            })
        }

        return this;
    }

    /**
     * @returns {CameraMan}
     */
    unLookAtSprite() {
        if (this.isLookingAtSprite) {
            if (this.isChasingSprite) {
                this.unChaseSprite();
            }

            this.#unsubscribeFromLookAtSpriteSignal();
            this.#signalDescriptors.isLookingAtSpriteChanges.trigger({
                data: change(false, true)
            })
        }

        return this;
    }

    #autoSet() {
        switch (this.#workMode) {
            case CameraManWorkModes.FIRST_PERSON:
                this.#workFirstPerson();
                break;
            case CameraManWorkModes.OVER:
                this.#workOver();
                break;
            case CameraManWorkModes.THIRD_PERSON:
                this.#workThirdPerson();
                break;
            default:
                this.#logger.warn(`unable to autoset with work mode ${this.#workMode}`);
        }
    }

    /**
     * 
     * @param {Signal<PositionChange>} signal 
     */
    #chaseSpriteSignalConsumer(signal) {
        let vector3D = toVector3D(signal.data);
        this.#camera.position = this.#camera.position.transform(
            Math3D.translate(vector3D.dx, vector3D.dy, vector3D.dz));
    }

    #customWorkMode() {
        if (this.#workMode !== CameraManWorkModes.DISMISSED && this.#workMode !== CameraManWorkModes.CUSTOM) {
            this.dismiss();
        }

        this.#setWorkMode(CameraManWorkModes.CUSTOM);
    }

    /**
     * 
     * @param {Signal<PositionChange>} signal 
     */
    #lookAtSpriteSignalConsumer(signal) {
        this.#camera.targetPosition = signal.data.to
    }

    /**
     * 
     * @param {CameraManWorkMode} workMode 
     */
    #setWorkMode(workMode) {
        if (workMode !== this.#workMode) {
            let workModeChange = change(workMode, this.#workMode);
            this.#workMode = workMode;
            this.#signalDescriptors.workModeChanges.trigger({
                data: workModeChange
            })
        }
    }

    #unsubscribeFromChaseSpriteSignal() {
        if (isNotNullOrUndefined(this.#chaseSpriteSubscriptionToken)) {
            SIGNALS.unsubscribe(this.#chaseSpriteSubscriptionToken);
            this.#chaseSpriteSubscriptionToken = null;
        } else {
            this.#logger.warn('tried to unsubscribe from chase sprite signal, but no subscription was active');
        }
    }

    #unsubscribeFromChaseSpriteRotationSignal() {
        if (isNotNullOrUndefined(this.#chaseSpriteRotationSubscriptionToken)) {
            SIGNALS.unsubscribe(this.#chaseSpriteRotationSubscriptionToken);
            this.#chaseSpriteRotationSubscriptionToken = null;
        } else {
            this.#logger.warn('tried to unsubscribe from chase sprite signal, but no subscription was active');
        }
    }

    #unsubscribeFromLookAtSpriteSignal() {
        if (isNotNullOrUndefined(this.#lookAtSpriteSubscriptionToken)) {
            SIGNALS.unsubscribe(this.#lookAtSpriteSubscriptionToken);
            this.#lookAtSpriteSubscriptionToken = null;
        } else {
            this.#logger.warn('tried to unsubscribe from look at sprite signal, but no subscription was active');
        }
    }

    #workFirstPerson() {
        if (isNotNullOrUndefined(this.#targetSprite)) {
            this.#logger.info(`setting up first person [sprite: ${this.#targetSprite.name}]`);
            let targetPosition = this.#targetSprite.position;
            let phi = this.#targetSprite.rotation.third.transform(AngleMath.toRadians()).value;
            this.#camera.position = targetPosition.transform(Math3D.translate(
                5 * Math.cos(phi + this.#phase),
                5 * Math.sin(phi + this.#phase),
                this.#high
            ));
            this.#camera.targetPosition = targetPosition.transform(Math3D.translate(
                10 * Math.cos(phi + this.#phase),
                10 * Math.sin(phi + this.#phase),
                this.#high
            ));
            this.#camera.up = trio(0, 0, 1);
        } else {
            this.#logger.error('unable to setup first person mode: no target was set')
        }
    }

    #workOver() {
        if (isNotNullOrUndefined(this.#targetSprite)) {
            this.#logger.info(`setting up over [sprite: ${this.#targetSprite.name}]`);
            let targetPosition = this.#targetSprite.position;
            this.#camera.position = targetPosition.transform(Math3D.translate(
                0,
                0,
                this.#distance
            ));
            this.#camera.targetPosition = targetPosition;
            this.#camera.up = trio(1, 0, 0);
        } else {
            this.#logger.error('unable to setup over mode: no target was set')
        }
    }

    #workThirdPerson() {
        if (isNotNullOrUndefined(this.#targetSprite)) {
            let targetPosition = this.#targetSprite.position;
            let phi = this.#targetSprite.rotation.third.transform(AngleMath.toRadians()).value;
            this.#camera.position = targetPosition.transform(Math3D.translate(
                - this.#distance * Math.cos(phi + this.#phase),
                - this.#distance * Math.sin(phi + this.#phase),
                this.#high
            ));
            this.#camera.targetPosition = targetPosition.transform(Math3D.translate(
                10 * Math.cos(phi + this.#phase),
                10 * Math.sin(phi + this.#phase),
                this.#high
            ));
            this.#camera.up = trio(0, 0, 1);
        } else {
            this.#logger.error('unable to setup third person mode: no target was set')
        }
    }
}

/**
 * @class Sprite
 */
export class Sprite {

    /** @type {string} */ #name;
    /** @type {string} */ #applicationName;
    /** @type {SpriteSetting} */ #settings;
    /** @type {SpriteSignalWorkspace} */ #signalWorkspace;

    /**  @type {SpriteSignalDescriptors} */ #signalDescriptors;

    /**
     *
     * @param {string} name
     * @param {string} applicationName
     * @param {SpriteSignalWorkspace} signalWorkspace
     * @param {Partial<SpriteSetting>} settings
     */
    constructor(name, applicationName, signalWorkspace, settings = {}) {
        this.#name = name;
        this.#applicationName = applicationName;
        this.#settings = this.#buildSettings(settings);
        this.#signalDescriptors = this.#buildSignalDescriptors(signalWorkspace);
        this.#signalWorkspace = signalWorkspace;
    }

    get name() {
        return this.#name;
    }

    get applicationName() {
        return this.#applicationName;
    }

    get position() {
        return this.#settings.position;
    }

    get rotation() {
        return this.#settings.rotation;
    }

    get scale() {
        return this.#settings.scale;
    }

    get limitChecker() {
        return this.#settings.limitChecker;
    }

    get hidden() {
        return this.#settings.hidden
    }

    get signalWorkspace() {
        return this.#signalWorkspace;
    }

    /**
     * @param {Point3D} position
     */
    set position(position) {
        let positionChange = change(position, this.#settings.position);

        // @ts-ignore
        if (!this.limitChecker(this, position)) {
            throw new Error(`invalid position change [sprite: "${this.#name}", target: ${position}]: out of bounds`);
        }

        this.#settings.position = position;
        this.#signalDescriptors.positionChange.trigger(FireRequests.ofPositionChange(positionChange));
    }

    /**
     *
     * @param {Trio<Angle>} rotation
     */
    set rotation(rotation) {
        let rotationChange = change(rotation, this.#settings.rotation);

        this.#settings.rotation = rotation;
        this.#signalDescriptors.rotationChange.trigger(FireRequests.ofRotationChange(rotationChange));
    }

    /**
     * @param {Trio<number>} scale
     */
    set scale(scale) {
        let scaleChange = change(scale, this.#settings.scale);

        this.#settings.scale = scale;
        this.#signalDescriptors.scaleChange.trigger(FireRequests.ofScaleChange(scaleChange));
    }

    /**
     * @param {Partial<SpriteSetting>} settings 
     * @returns {SpriteSetting}
     */
    #buildSettings(settings) {
        if (isNullOrUndefined(settings)) {
            settings = {}
        };

        return {
            position: Positions.ORIGIN,
            rotation: Rotations.NOT_ROTATED,
            scale: Scales.NOT_SCALED,
            limitChecker: LimitCheckers.UNLIMITED,
            hidden: false,
            ...settings
        };
    }

    /**
     * 
     * @param {SpriteSignalWorkspace} signalWorkspace 
     * @returns {SpriteSignalDescriptors}
     */
    #buildSignalDescriptors(signalWorkspace) {
        return {
            positionChange: SIGNALS.register(signalWorkspace.positionChange),
            rotationChange: SIGNALS.register(signalWorkspace.rotationChange),
            scaleChange: SIGNALS.register(signalWorkspace.scaleChange)
        }
    }

}

/**
 * @class SpriteDrawer
 */
class SpriteDrawer {
    /** @type {string} */ #applicationName;
    /** @type {number} */ #bias;
    /** @type {any} */ #cubeLinesBufferInfo;
    /** @type {WebGLXEnvironment} */ #glXEnvironment;
    /** @type {boolean} */ #lightFrustum;
    /** @type {Logger} */ #logger
    /** @type {SharedUniforms} */ #sharedUniforms;
    /** @type {SpriteManager} */ #spriteManager;
    /** @type {number} */ zNear = 0.1;
    /** @type {number} */ zFar = 700;

    /**
     * 
     * @param {string} applicationName 
     * @param {WebGLXEnvironment} glEnvironment 
     * @param {SpriteManager} spriteManager 
     */
    constructor(applicationName, glEnvironment, spriteManager) {
        this.#applicationName = applicationName;
        this.#bias = -0.006;
        this.#glXEnvironment = glEnvironment;
        this.#spriteManager = spriteManager;
        this.#lightFrustum = false;
        this.#sharedUniforms = this.#defaultSharedUniforms();
        this.#cubeLinesBufferInfo = this.#buildCubeLinesBufferInfo();

        this.#logger = Logger.forName(`SpriteDrawer[${applicationName}]`);
    }

    renderScene() {
        let gl = this.#glXEnvironment.glContext;
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // TODO
    }

    #buildCubeLinesBufferInfo() {
        return WebGLUtils.createBufferInfoFromArrays(
            this.#glXEnvironment.glContext, {
            position: [
                -1, -1, -1,
                1, -1, -1,
                -1,  1, -1,
                1,  1, -1,
                -1, -1,  1,
                1, -1,  1,
                -1,  1,  1,
                1,  1,  1,
            ],
            indices: [
                0, 1,
                1, 3,
                3, 2,
                2, 0,

                4, 5,
                5, 7,
                7, 6,
                6, 4,

                0, 4,
                1, 5,
                3, 7,
                2, 6,
            ],
        });
    }

    /**
     * @returns {SharedUniforms}
     */
    #defaultSharedUniforms() {
        return {
            u_ambientLight: [0.2, 0.2, 0.2],
                u_colorLight: [1.0, 1.0, 1.0],
                u_view: M4.identity(),
                u_projection: M4.identity(),
                u_lightDirection: [2, 2, 2],
                u_bias: 0.001,
                texture_matrix: M4.identity(),
                u_projectedTexture: null,
                u_colorMult: [1, 1, 1, 1],
        };
    }

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
     * @param {SpriteSignalWorkspace} signalWorkspace
     * @param {Partial<SpriteSetting>} settings
     * @returns {Sprite}
     */
    createSprite(name, signalWorkspace, settings = {}) {
        this.#log.info('create sprite [name: ' + name + ', applicationName: ' + this.#applicationName + ']');

        /** @type {Sprite} */
        let sprite = new Sprite(name, this.#applicationName, signalWorkspace, settings);
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

    /** @type {string} */ #applicationName;
    /** @type {Camera} */ #camera;
    /** @type {CameraMan} */ #cameraMan;
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
        this.#signalWorkspace = new WebGLXApplicationSignalWorkspace(applicationName);

        this.#camera = new Camera(applicationName, this.#signalWorkspace.camera);
        this.#cameraMan = new CameraMan(applicationName, this.#camera, this.#signalWorkspace.cameraMan);
        this.#spriteManager = new SpriteManager(applicationName);
        this.#spriteDrawer = new SpriteDrawer()
    }

    get applicationName() {
        return this.#applicationName;
    }

    get signalWorkspace() {
        return this.#signalWorkspace;
    }
}

class WebGLXApplicationSignalWorkspace {

    /** @type {CameraSignalWorkspace} */
    static #CAMERA = {
        positionChanges: 'camera.position',
        upChanges: 'camera.up',
        targetChanges: 'camera.target',
        fovChanges: 'camera.fov'
    }

    /** @type {CameraManSignalWorkspace} */
    static #CAMERA_MAN = {
        isLookingAtSpriteChanges: 'cameraman.isLookingAtSprite',
        isChasingSpriteChanges: 'cameraman.isChasingSprite',
        targetSpriteChanges: 'cameraman.targetSprite',
        workModeChanges: 'cameraman.workMode'
    }

    /** @type {string} */ #applicationName;

    /** @type {CameraSignalWorkspace} */ #camera
    /** @type {CameraManSignalWorkspace} */ #cameraMan

    /**
     * 
     * @param {string} applicationName 
     */
    constructor(applicationName) {
        this.#applicationName = applicationName;

        this.#camera = {
            positionChanges: this.#absolutize(WebGLXApplicationSignalWorkspace.#CAMERA.positionChanges),
            upChanges: this.#absolutize(WebGLXApplicationSignalWorkspace.#CAMERA.upChanges),
            targetChanges: this.#absolutize(WebGLXApplicationSignalWorkspace.#CAMERA.targetChanges),
            fovChanges: this.#absolutize(WebGLXApplicationSignalWorkspace.#CAMERA.fovChanges)
        }

        this.#cameraMan = {
            isChasingSpriteChanges: this.#absolutize(WebGLXApplicationSignalWorkspace.#CAMERA_MAN.isChasingSpriteChanges),
            isLookingAtSpriteChanges: this.#absolutize(WebGLXApplicationSignalWorkspace.#CAMERA_MAN.isLookingAtSpriteChanges),
            targetSpriteChanges: this.#absolutize(WebGLXApplicationSignalWorkspace.#CAMERA_MAN.targetSpriteChanges),
            workModeChanges: this.#absolutize(WebGLXApplicationSignalWorkspace.#CAMERA_MAN.workModeChanges)
        }
    }

    /**
     * @returns {CameraSignalWorkspace}
     */
    get camera() {
        return this.#camera;
    }

    /**
     * @returns {CameraManSignalWorkspace}
     */
    get cameraMan() {
        return this.#cameraMan;
    }

    /**
     * 
     * @param {string} relativeSignalName 
     * @returns {string}
     */
    #absolutize(relativeSignalName) {
        return `GLX.${this.#applicationName}.${relativeSignalName}`;
    }

}

/**
 * @class WebGLXEnvironment
 */
class WebGLXEnvironment {
    /** @type {HTMLCanvasElement} */ #canvas;
    /** @type {WebGLRenderingContext} */ #gl;
    /** @type {Logger} */ #logger
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
 * @template T
 * @param {T|null|undefined} obj 
 * @returns {obj is T}
 */
function isNotNullOrUndefined(obj) {
    return obj !== null && obj !== undefined
}

/**
 * 
 * @template T
 * @param {T|null|undefined} obj 
 * @returns {boolean}
 */
function isNullOrUndefined(obj) {
    return obj === null || obj === undefined;
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

/**
 * 
 * @param {Change<Point3D>} change 
 * @returns {Vector3D}
 */
function toVector3D(change) {
    return {
        dx: change.to.x - change.from.x,
        dy: change.to.y - change.from.y,
        dz: change.to.z - change.from.z
    };
}