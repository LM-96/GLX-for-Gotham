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
 * @typedef {import("./webglx.js").DrawSceneContext} DrawSceneContext
 */

/**
 * @typedef {import("./webglx.js").DrawSpriteContext} DrawSpriteContext
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
 * @typedef {import("./webglx.js").GLXSprite} GLXSprite
 */

/**
 * @typedef {import("./webglx.js").GLXSpriteCreation} GLXSpriteCreation
 */

/**
 * @typedef {import("./webglx.js").LightMatrices} LightMatrices
 */

/**
 * @typedef {import("./webglx.js").LimitChecker} LimitChecker
 */

/**
 * @typedef {import("./logjsx.js").LogFunction} LogFunction
 */

/**
 * @typedef {import("./webglx.js").MeshSpriteLoad} MeshSpriteLoad
 */

/**
 * @template T
 * @typedef {import("./signals.js").SignalDescriptor<T>} SignalDescriptor
 */

/**
 * @template F
 * @template S
 * @typedef {import("./webglx.js").Pair<F,S>} Pair
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

/**
 * @typedef {import("./webglx.js").WebGLXApplicationStart} WebGLXApplicationStart
 */

/**
 * @typedef {import("./webglx.js").WebGLShaderReference} WebGLShaderReference
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

export class LimitCheckers {

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
     * @param {boolean} logEnabled 
     * @param {Partial<CameraSettings>} settings 
     */
    constructor(applicationName, signalWorkspace, logEnabled, settings = {}) {
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

        this.#logger = Logger.forName(`Camera[${applicationName}]`).enabledOn(logEnabled);
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

    computeCameraMatrix() {
        return Object.freeze(M4.lookAt(
            this.#settings.position.map(Math3D.toImmutableArray()),
            this.#settings.targetPosition.map(Math3D.toImmutableArray()),
            toJsVectorTrio(this.#settings.up)
        ))
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
     * @param {boolean} logEnabled 
     */
    constructor(applicationName, camera, signalWorkspace, logEnabled) {
        this.#camera = camera;
        this.#signalDescriptors = {
            isLookingAtSpriteChanges: SIGNALS.register(signalWorkspace.isLookingAtSpriteChanges),
            isChasingSpriteChanges: SIGNALS.register(signalWorkspace.isChasingSpriteChanges),
            targetSpriteChanges: SIGNALS.register(signalWorkspace.targetSpriteChanges),
            workModeChanges: SIGNALS.register(signalWorkspace.workModeChanges)
        }

        this.#logger = Logger.forName(`CameraMan[${applicationName}]`).enabledOn(logEnabled);
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
        let vector3D = toVector3DChange(signal.data);
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
 * @class ShadowLightManager
 */
export class ShadowLightManager {
    /** @type {number} */ static #DEPTH_TEXTURE_SIZE = 512;
    /** @type {Map<WebGLRenderingContext, Pair<WebGLTexture, WebGLFramebuffer>>} */ static #depthTB = new Map();

    /**
     * @returns {number}
     */
    static get DEPTH_TEXTURE_SIZE() {
        return ShadowLightManager.#DEPTH_TEXTURE_SIZE;
    }

    /**
     * @param {WebGLRenderingContext} gl
     * @returns {Pair<WebGLTexture, WebGLFramebuffer>}
     */
    static getTextureWithBufferForLights(gl) {
        let res = ShadowLightManager.#depthTB.get(gl);
        if (isNotNullOrUndefined(res)) {
            return res;
        } else {
            let texture = ShadowLightManager.#createTexture(gl);
            this.#depthTB.set(gl, texture);

            return texture;
        }
    }

    /**
     * 
     * @param {WebGLRenderingContext} gl 
     * @returns {WebGLTexture}
     */
    static getTextureForLights(gl) {
        return ShadowLightManager.getTextureWithBufferForLights(gl).second;
    }

    /**
     * 
     * @param {WebGLRenderingContext} gl 
     * @returns {WebGLFramebuffer}
     */
    static getTextureFrameBufferForLights(gl) {
        return ShadowLightManager.getTextureFrameBufferForLights(gl);
    }

    /**
     * @param {WebGLRenderingContext} gl
     * @returns {Pair<WebGLTexture, WebGLFramebuffer>}
     */
    static #createTexture(gl) {
        let depthTexture = gl.createTexture();
        let depthTextureSize = ShadowLightManager.#DEPTH_TEXTURE_SIZE;
        gl.bindTexture(gl.TEXTURE_2D, depthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT, // internal format
            depthTextureSize,   // width
            depthTextureSize,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.UNSIGNED_INT,    // type
            null);              // data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        let depthFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point
            gl.TEXTURE_2D,        // texture target
            depthTexture,         // texture
            0);                   // mip level

        // create a color texture of the same size as the depth texture
        // see article why this is needed_
        let unusedTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, unusedTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            depthTextureSize,
            depthTextureSize,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // attach it to the framebuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point
            gl.TEXTURE_2D,         // texture target
            unusedTexture,         // texture
            0);
        return pair(depthTexture, depthFramebuffer);
    }

    /** @type {Trio<number>} */ #lightDirection = trio(0, 0, 0);
    /** @type {SharedUniforms} */ #sharedUniforms;
    /** @type {Point3D} */ #lightPosition = point3D(0, 0, 100);
    /** @type {Point3D} */ #lightTarget = point3D(0, 0, 0);
    /** @type {Trio<number>} */ #lightUp = trio(0, 1, 0);
    /** @type {Angle} */ #lightFov = radians(0);
    /** @type {boolean} */ #spotlight = false;
    /** @type {number} */ #projWidth = 10;
    /** @type {number} */ #projHeight = 10;
    /** @type {boolean} */ #shadowEnabled = false;
    /** @type {number} */ #near = 1;
    /** @type {number} */ #far = 700;

    /**
     * 
     * @param {SharedUniforms} sharedUniforms 
     */
    constructor(sharedUniforms) {
        this.#sharedUniforms = sharedUniforms;
    }

    /**
     * @returns {number}
     */
    get far() {
        return this.#far;
    }

    /**
     * @returns {boolean}
     */
    get isShadowEnabled() {
        return this.#shadowEnabled
    }

    /**
     * @returns {boolean}
     */
    get isSpotlight() {
        return this.#spotlight;
    }

    /**
     * @returns {Angle}
     */
    get lightFov() {
        return this.#lightFov
    }

    /**
     * @returns {Trio<number>}
     */
    get ligthDirection() {
        return this.#lightDirection;
    }

    /**
     * @returns {Point3D}
     */
    get lightPosition() {
        return this.#lightPosition;
    }

    /**
     * @returns {Point3D}
     */
    get lightTarget() {
        return this.#lightTarget;
    }

    /**
     * @returns {Trio<number>}
     */
    get lightUp() {
        return this.#lightUp;
    }

    /**
     * @returns {number}
     */
    get near() {
        return this.#near;
    }

    /**
     * @returns {number}
     */
    get projHeight() {
        return this.#projHeight;
    }

    /**
     * @returns {number}
     */
    get projWidth() {
        return this.#projWidth;
    }

    /**
     * @param {number} far 
     */
    set far(far) {
        this.#far = far;
    }

    /**
     * @param {Angle} fov 
     */
    set fov(fov) {
        this.fov = fov;
    }

    /**
     * @param {boolean} shadowEnabled
     */
    set isShadowEnabled(shadowEnabled) {
        this.#shadowEnabled = shadowEnabled
    }

    /**
     * @param {boolean} spotlight 
     */
    set isSpotlight(spotlight) {
        this.#spotlight = spotlight;
    }

    /**
     * @param {Trio<number>} direction 
     */
    set lightDirection(direction) {
        this.#lightDirection = direction;
    }

    /**
     * @param {Point3D} position 
     */
    set lightPosition(position) {
        this.lightPosition = position;
        this.#updateSharedUniforms();
    }

    /**
     * @param {Point3D} target 
     */
    set lightTarget(target) {
        this.#lightTarget = target;
    }

    /**
     * @param {Trio<number>} up 
     */
    set lightUp(up) {
        this.#lightUp = up;
    }

    /**
     * @param {number} near 
     */
    set near(near) {
        this.#near = near
    }

    /**
     * @param {number} height
     */
    set projHeight(height) {
        this.#projHeight = height;
    }

    /**
     * @param {number} width 
     */
    set projWidth(width) {
        this.#projWidth = width;
    }

    /**
     * 
     * @returns {number[]}
     */
    computeLightWorldMatrix() {
        return M4.lookAt(
            [this.#lightPosition.x, this.#lightPosition.y, this.#lightPosition.z],
            [this.#lightTarget.x, this.#lightTarget.y, this.#lightTarget.z],
            [this.#lightUp.first, this.#lightUp.second, this.#lightUp.third],
        );
    }

    /**
     * 
     * @returns {number[]}
     */
    computeLightProjectionMatrix() {
        if (this.#spotlight) {
            return M4.perspective(this.#lightFov.transform(AngleMath.toRadians()).value,
                this.#projWidth / this.#projHeight, this.#near, this.#far)
        } else {
            return M4.orthographic(-this.#projWidth / 2, this.#projWidth / 2,
                -this.#projHeight / 2, this.#projHeight / 2, this.#near, this.#far)
        }
    }

    #updateSharedUniforms() {
        this.#sharedUniforms.u_lightDirection = toJsVectorTrio(this.#lightDirection)
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
    /** @type {Camera} */ #camera;
    /** @type {any} */ #cubeLinesBufferInfo;
    /** @type {WebGLXEnvironment} */ #glXEnvironment;
    /** @type {boolean} */ #lightFrustum;
    /** @type {Logger} */ #logger
    /** @type {ShadowLightManager} */ #shadowLightManager;
    /** @type {SharedUniforms} */ #sharedUniforms;
    /** @type {SpriteManager} */ #spriteManager;
    /** @type {number} */ zNear = 0.1;
    /** @type {number} */ zFar = 700;

    /**
     * 
     * @param {string} applicationName 
     * @param {WebGLXEnvironment} glXEnvironment 
     * @param {Camera} camera 
     * @param {ShadowLightManager} shadowLightManager 
     * @param {SharedUniforms} sharedUniforms
     * @param {SpriteManager} spriteManager 
     * @param {boolean} logEnabled 
     */
    constructor(applicationName, glXEnvironment, camera, shadowLightManager, sharedUniforms, spriteManager, logEnabled) {
        this.#applicationName = applicationName;
        this.#bias = -0.006;
        this.#camera = camera
        this.#glXEnvironment = glXEnvironment;
        this.#shadowLightManager = shadowLightManager;
        this.#spriteManager = spriteManager;
        this.#lightFrustum = false;
        this.#sharedUniforms = sharedUniforms;
        this.#cubeLinesBufferInfo = this.#buildCubeLinesBufferInfo();

        this.#logger = Logger.forName(`SpriteDrawer[${applicationName}]`).enabledOn(logEnabled);
    }

    /**
     * 
     * @param {DrawSceneContext} drawSceneContext 
     */
    drawScene(drawSceneContext) {
        let gl = this.#glXEnvironment.glContext;
        let viewMatrix = M4.inverse(drawSceneContext.cameraMatrix)
        gl.useProgram(drawSceneContext.programInfo.program)
        WebGLUtils.setUniforms(drawSceneContext.programInfo, {
            u_view: viewMatrix,
            u_projection: drawSceneContext.projectionMatrix,
            u_bias: this.#bias,
            u_textureMatrix: drawSceneContext.textureMatrix,
            u_projectedTexture: ShadowLightManager.getTextureForLights(this.#glXEnvironment.glContext),
            u_lightDirection: this.#shadowLightManager.computeLightWorldMatrix().slice(8, 11),
        });
        gl.uniform1f(gl.getUniformLocation(drawSceneContext.programInfo.program, "mesh"), 1.);

        for (let glxSprite of this.#spriteManager.getAllGLXSprites()) {
            this.drawSprite({
                programInfo: drawSceneContext.programInfo,
                sprite: glxSprite.sprite,
                glData: glxSprite.glData
            })
        }

        this.#logger.info('scene drawn');
    }

    /**
     * 
     * @param {DrawSpriteContext} drawSpriteContext 
     */
    drawSprite(drawSpriteContext) {
        let clear = drawSpriteContext.clear ?? false;
        let gl = this.#glXEnvironment.glContext;
        if (clear) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }
        if (!drawSpriteContext.sprite.hidden) {
            let u_world = drawSpriteContext.glData;

            for (let { bufferInfo, material } of drawSpriteContext.glData.parts) {
                // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
                WebGLUtils.setBuffersAndAttributes(gl, drawSpriteContext.programInfo, bufferInfo);
                // calls gl.uniform
                WebGLUtils.setUniforms(drawSpriteContext.programInfo, {
                    u_colorMult: [1, 1, 1, 1],
                    u_color: [1, 1, 1, 1],
                    u_world: u_world,
                }, material);
                // calls gl.drawArrays or gl.drawElements
                WebGLUtils.drawBufferInfo(gl, bufferInfo);
            }

            // for (let part of this.#data.parts) {
            //   // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
            //   WebGLUtils.setBuffersAndAttributes(gl, programInfo, part.bufferInfo);
            //   // calls gl.uniform
            //   WebGLUtils.setUniforms(programInfo, { u_world }, part.material);
            //   // calls gl.drawArrays or gl.drawElements
            //   WebGLUtils.drawBufferInfo(gl, part.bufferInfo);
            // }
            this.#logger.info(`drawn sprite '${drawSpriteContext.sprite.name}'`)
        } else {
            this.#logger.info(`sprite '${drawSpriteContext.sprite.name}' is hidden, draw skipped`)
        }

    }

    /**
     * 
     * @param {any} data 
     */
    initSpriteData(data) {
        data.u_world = M4.identity();
    }

    renderScene() {
        let gl = this.#glXEnvironment.glContext;
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        let lightMatrices = this.#computeLightMatrices();
        this.#renderLights(lightMatrices);
        this.#clearGlBuffers();
        let textureMatrix = this.#computeTextureMatrix(lightMatrices);
        let viewProjectionMatrix = this.#computeViewProjectionMatrix();

        this.drawScene({
            projectionMatrix: viewProjectionMatrix,
            cameraMatrix: this.#camera.computeCameraMatrix(),
            textureMatrix: textureMatrix,
            programInfo: this.#glXEnvironment.getProgramInfo('main')
        })

        if (this.#lightFrustum) {
            this.#renderLightFrustum(lightMatrices);
        }
        this.#logger.info("render complete")
    }

    #buildCubeLinesBufferInfo() {
        return WebGLUtils.createBufferInfoFromArrays(
            this.#glXEnvironment.glContext, {
            position: [
                -1, -1, -1,
                1, -1, -1,
                -1, 1, -1,
                1, 1, -1,
                -1, -1, 1,
                1, -1, 1,
                -1, 1, 1,
                1, 1, 1,
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

    #clearGlBuffers() {
        let gl = this.#glXEnvironment.glContext;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.#logger.info("framebuffer, color buffer and depth buffer clean");
    }

    /**
     * @returns {LightMatrices}
     */
    #computeLightMatrices() {
        let gl = this.#glXEnvironment.glContext;
        let lightWorldMatrix = this.#shadowLightManager.computeLightWorldMatrix();
        let lightProjectionMatrix = this.#shadowLightManager.computeLightProjectionMatrix();

        return Object.freeze({
            projection: lightProjectionMatrix,
            world: lightWorldMatrix
        });
    }

    /**
     * 
     * @param {LightMatrices} lightMatrices 
     * @returns {number[]}
     */
    #computeTextureMatrix(lightMatrices) {
        let textureMatrix = M4.identity();
        textureMatrix = M4.translate(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = M4.scale(textureMatrix, 0.5, 0.5, 0.5);
        textureMatrix = M4.multiply(textureMatrix, lightMatrices.projection);
        textureMatrix = M4.multiply(
            textureMatrix,
            M4.inverse(lightMatrices.world));
        this.#logger.info("texture matrix calculated");

        return textureMatrix;
    }

    /**
     * 
     * @returns {number[]}
     */
    #computeViewProjectionMatrix() {
        this.#updateProjectionMatrix()
        this.#updateViewMatrix()
        let viewProjectionMatrix = M4.multiply(this.#sharedUniforms.u_projection,
            this.#sharedUniforms.u_view)
        this.#logger.info("view projection matrix calculated");

        return viewProjectionMatrix;
    }

    /**
     * 
     * @param {LightMatrices} lightMatrices 
     */
    #renderLightFrustum(lightMatrices) {
        let gl = this.#glXEnvironment.glContext;
        let viewMatrix = M4.inverse(this.#camera.computeCameraMatrix())
        gl.useProgram(this.#glXEnvironment.getProgramInfo('color').program)
        WebGLUtils.setBuffersAndAttributes(gl,
            this.#glXEnvironment.getProgramInfo('color'),
            this.#cubeLinesBufferInfo);

        const mat = M4.multiply(lightMatrices.world, M4.inverse(lightMatrices.projection));
        WebGLUtils.setUniforms(this.#glXEnvironment.getProgramInfo('color'), {
            u_color: [1, 1, 1, 1],
            u_view: viewMatrix,
            u_projection: this.#sharedUniforms.u_projection,
            u_world: mat,
        });
        WebGLUtils.drawBufferInfo(gl, this.#cubeLinesBufferInfo, gl.LINES);
        this.#logger.info("light frustum rendered")
    }

    /**
     * @param {LightMatrices} lightMatrices 
     */
    #renderLights(lightMatrices) {
        let gl = this.#glXEnvironment.glContext;
        gl.bindFramebuffer(gl.FRAMEBUFFER, ShadowLightManager.getTextureFrameBufferForLights(gl));
        gl.viewport(0, 0, ShadowLightManager.DEPTH_TEXTURE_SIZE, ShadowLightManager.DEPTH_TEXTURE_SIZE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (this.#shadowLightManager.isShadowEnabled) {
            this.drawScene({
                projectionMatrix: lightMatrices.projection,
                cameraMatrix: lightMatrices.world,
                textureMatrix: lightMatrices.world,
                programInfo: this.#glXEnvironment.getProgramInfo('color')
            })
            this.#logger.info("shadows rendered");
        };
    }


    #updateViewMatrix() {
        this.#sharedUniforms.u_view = M4.inverse(this.#camera.computeCameraMatrix());
    }

    #updateProjectionMatrix() {
        this.#sharedUniforms.u_projection = M4.perspective(
            this.#camera.fov.transform(AngleMath.toRadians()).value,
            this.#glXEnvironment.aspectRatio, this.zNear, this.zFar)
    }

}

/**
 * @class SpriteManager
 */
class SpriteManager {
    /** @type {string} */ #applicationName;
    /** @type {Logger} */ #log;
    /** @type {Map<string, GLXSprite>} */ #spritesByName;

    /**
     *
     * @param {string} applicationName
     * @param {boolean} logEnabled 
     */
    constructor(applicationName, logEnabled) {
        this.#applicationName = applicationName;
        this.#log = Logger.forName('SpriteManager[' + applicationName + ']').enabledOn(logEnabled);
        this.#spritesByName = new Map();
    }

    /**
     *
     * @param {GLXSpriteCreation} spriteCreation 
     * @returns {Sprite}
     */
    createSprite(spriteCreation) {
        this.#log.info('create sprite [name: ' + spriteCreation.name + ', applicationName: ' + this.#applicationName + ']');

        /** @type {Sprite} */
        let sprite = new Sprite(spriteCreation.name, this.#applicationName, spriteCreation.signalWorkspace, spriteCreation.settings ?? {});
        this.#spritesByName.set(spriteCreation.name, Object.freeze({
            sprite: sprite,
            glData: spriteCreation.glData
        }));

        return sprite;
    }

    /**
     *
     * @returns {GLXSprite[]}
     */
    getAllGLXSprites() {
        return new Array(...this.#spritesByName.values());
    }

    /**
     *
     * @param {string} name
     * @returns {GLXSprite|undefined}
     */
    getGLXSprite(name) {
        return this.#spritesByName.get(name);
    }

}

/**
 * @class WebGLXApplication
 */
export class WebGLXApplication {

    /** @type {string} */ #applicationName;
    /** @type {Camera} */ #camera;
    /** @type {CameraMan} */ #cameraMan;
    /** @type {Logger} */ #logger;
    /** @type {WebGLXEnvironment} */ #webGLXEnvironment;
    /** @type {ShadowLightManager} */ #shadowLightManager;
    /** @type {SpriteDrawer} */ #spriteDrawer;
    /** @type {SpriteManager} */ #spriteManager;
    /** @type {WebGLXApplicationSignalWorkspace} */ #signalWorkspace;

    /**
     * 
     * @param {string} applicationName 
     * @param {WebGLXEnvironment} webGLXEnvironment 
     * @param {boolean} logEnabled 
     */
    constructor(applicationName, webGLXEnvironment, logEnabled) {
        this.#logger = Logger.forName('WebGLXApp[' + applicationName + ']').enabledOn(logEnabled);
        this.#applicationName = applicationName;
        this.#webGLXEnvironment = webGLXEnvironment;
        this.#signalWorkspace = new WebGLXApplicationSignalWorkspace(applicationName);

        this.#camera = new Camera(applicationName, this.#signalWorkspace.camera, logEnabled);
        this.#cameraMan = new CameraMan(applicationName, this.#camera, this.#signalWorkspace.cameraMan, logEnabled);
        this.#spriteManager = new SpriteManager(applicationName, logEnabled);
        let sharedUniforms = this.#defaultSharedUniforms();
        this.#shadowLightManager = new ShadowLightManager(sharedUniforms)
        this.#spriteDrawer = new SpriteDrawer(applicationName, webGLXEnvironment, this.#camera,
            this.#shadowLightManager, sharedUniforms, this.#spriteManager, logEnabled);
    }

    get applicationName() {
        return this.#applicationName;
    }

    get signalWorkspace() {
        return this.#signalWorkspace;
    }

    /**
     * 
     * @param {MeshSpriteLoad} load 
     */
    glxSprite(load) {
        let data = loadObjX(this.#webGLXEnvironment.glContext, load.name, load.path);
        this.#spriteDrawer.initSpriteData(data);
        this.#spriteManager.createSprite({
            name: load.name,
            glData: data,
            signalWorkspace: this.#signalWorkspace.sprite(load.name),
            settings: { ...load }
        })

        this.#logger.info('loading mesh: ', load)
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
            u_colorMult: [1, 1, 1, 1]
        }
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
    /** @type {Map<string, SpriteSignalWorkspace} */ #sprites

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

        this.#sprites = new Map();
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
     * @param {string} name 
     * @returns {SpriteSignalWorkspace}
     */
    sprite(name) {
        let signalWorkspace = this.#sprites.get(name);
        if (isNotNullOrUndefined(signalWorkspace)) {
            return signalWorkspace;
        }

        signalWorkspace = {
            positionChange: this.#absolutize(`sprite.${name}.position`),
            rotationChange: this.#absolutize(`sprite.${name}.rotation`),
            scaleChange: this.#absolutize(`sprite.${name}.scale`)
        }
        this.#sprites.set(name, signalWorkspace);
        return signalWorkspace;
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
    get aspectRatio() {
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
        let programInfo = null;

        if (isNotNullOrUndefined(programName)) {
            programInfo = this.#programInfo.get(programName);
        } else {
            programInfo = this.#programInfo.values().next().value;
        }

        if (isNotNullOrUndefined(programInfo)) {
            return programInfo;
        } else {
            throw new Error(`program '${programName}' not found`);
        }
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
            programInfos.set(key, webglUtils.createProgramInfo(this.#gl, value));
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
 * @template F
 * @template S
 * @param {F} first 
 * @param {S} second 
 * @returns {Pair<F,S>}
 */
export function pair(first, second) {
    return Object.freeze({
        first: first,
        second: second
    });
}

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @param {number} z 
 * @returns {Point3D}
 */
export function position(x, y, z) {
    return point3D(x, y, z);
}

/**
 * 
 * @param {Angle} psi 
 * @param {Angle} theta 
 * @param {Angle} phi 
 * @returns {Trio<Angle>}
 */
export function rotation(psi, theta, phi) {
    return trio(psi, theta, phi);
}

/**
 * 
 * @param {number} mx 
 * @param {number} my 
 * @param {number} mz 
 * @returns {Trio<number>}
 */
export function scale(mx, my, mz) {
    return trio(mx, my, mz);
}

/**
 * @param {WebGLXApplicationStart} appStart
 */
export function start(appStart) {
    let appName = appStart.applicationClass.prototype.constructor.name;
    let logger = Logger.forName(`GLXStart[${appName}]`).enabledOn(appStart.logEnabled ?? true);
    logger.info('starting...')

    let shaders = mapShaders(appStart.webGLShaders);
    logger.info('shaders: ', shaders);

    let glxEnv = createWebglEnvironment(appStart.canvasElementName, mapShaders(appStart.webGLShaders));
    let app = new appStart.applicationClass(appName, glxEnv, appStart.logEnabled ?? true);
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
 * @param {string} canvasHtmlName 
 * @param {Map<string, string[]} webGLShaders 
 * @returns {WebGLXEnvironment}
 */
function createWebglEnvironment(canvasHtmlName, webGLShaders) {
    let canvas = document.getElementById(canvasHtmlName);
    if(canvas == null) {
        alert("Unable to find the canvas with id: " + canvas);
        throw new Error("Unable to find the canvas with id: " + canvas);
    }
    return new WebGLXEnvironment(canvas, webGLShaders);
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
 * @param {WebGLShaderReference} shaders 
 * @returns {Map<string, string[]>}
 */
function mapShaders(shaders) {
    let res = new Map();
    Object.entries(shaders).forEach(([key, value]) => {
        res.set(key, value)
    })
    return res
}

/**
 * 
 * @param {Change<Point3D>} change 
 * @returns {Vector3D}
 */
function toVector3DChange(change) {
    return {
        dx: change.to.x - change.from.x,
        dy: change.to.y - change.from.y,
        dz: change.to.z - change.from.z
    };
}

/**
 * 
 * @template T
 * @param {Trio<T>} trio 
 * @returns {T[]}
 */
function toJsVectorTrio(trio) {
    return [
        trio.first,
        trio.second,
        trio.third
    ];
}