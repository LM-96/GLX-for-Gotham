import { Angle, degrees, Point3D, point3D, radians } from "./geometry.js";
import { SIGNALS } from "./signals.js";

/**
 * @template T
 * @typedef {import("./glx-model").Change<T>} Change
 */

/**
 * @template T
 * @typedef {import("./glx-model").Duo<T>} Duo
 */

/**
 * @template T
 * @typedef {import("./signals").FireRequest<T>} FireRequest
 */

/**
 * @typedef {import("glx-model").GLXApplicationInfoTypes} GLXApplicationInfoType
 */

/**
 * @typedef {import("glx-model").GLXCameraConstructorParams} GLXCameraConstructorParams
 */

/**
 * @typedef {import("./glx-model").GLXCameraManSignalWorkspace} GLXCameraManSignalWorkspace
 */

/**
 * @typedef {import("./glx-model").GLXCameraManWorkMode} GLXCameraManWorkMode
 */

/**
 * @typedef {import("./glx-model").GLXCameraSettings} GLXCameraSettings
 */

/**
 * @typedef {import("./glx-model").GLXCameraSignalDescriptors} GLXCameraSignalDescriptors
 */

/**
 * @typedef {import("./glx-model").GLXCameraSignalWorkspace} GLXCameraSignalWorkspace
 */

/**
 * @typedef {import("./glx-model").GLXControlType} GLXControlType
 */

/**
 * @typedef {import("./glx-model").GLXDrawerSignalWorkspace} GLXDrawerSignalWorkspace
 */

/**
 * @typedef {import("./glx-model").GLXShadowLightConstructorParams} GLXShadowLightConstructorParams
 */

/**
 * @typedef {import("./glx-model").GLXShadowLightSettings} GLXShadowLightSettings
 */

/**
 * @typedef {import("./glx-model").GLXShadowLightSignalWorkspace} GLXShadowLightSignalWorkspace
 */

/**
 * @typedef {import("./glx-model").GLXShadowLightSignalDescriptors} GLXShadowLightSignalDescriptors
 */

/**
 * @typedef {import("./glx-model").GLXSpriteConstructorParams} GLXSpriteConstructorParams
 */

/**
 * @typedef {import("./glx-model").GLXSpriteSettings} GLXSpriteSetting
 */

/**
 * @typedef {import("./glx-model").GLXSpriteSignalDescriptors} GLXSpriteSignalDescriptors
 */

/**
 * @typedef {import("./glx-model").GLXSpriteSignalWorkspace} GLXSpriteSignalWorkspace
 */

/**
 * @typedef {import("./glx-model").LimitChecker} LimitChecker
 */

/**
 * @template F
 * @template S
 * @typedef {import("./glx-model").Pair<F, S>} Pair
 */


/**
 * @typedef {import("./glx-model").PositionChange} PositionChange
 */

/**
 * @typedef {import("./glx-model").RenderingMode} RenderingMode
 */

/**
 * @typedef {import("./glx-model").RotationChange} RotationChange
 */


/**
 * @typedef {import("./glx-model").ScaleChange} ScaleChange
 */

/**
 * @template T
 * @typedef {import("./glx-model").SignaledProperty<T>} SignaledProperty
 */

/**
 * @template T
 * @typedef {import("./glx-model").Trio<T>} Trio
 */

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

export class GLXApplicationInfoTypes {
    /** @type {GLXApplicationInfoType} */ static ADDED_SPRITE = 'ADDED_SPRITE';
    /** @type {GLXApplicationInfoType} */ static BOOTED = 'BOOTED';
    /** @type {GLXApplicationInfoType} */ static CONSTRUCTED = 'CONSTRUCTED';
    /** @type {GLXApplicationInfoType} */ static TEXTURE_READY = 'TEXTURE_READY';
}

export class GLXApplicationSignalWorkspace {

    /** @type {GLXCameraSignalWorkspace} */
    static #CAMERA = {
        positionChanges: 'camera.position',
        upChanges: 'camera.up',
        targetChanges: 'camera.target',
        fovChanges: 'camera.fov',
        zFarChanges: 'camera.zfar',
        zNearChanges: 'camera.znear'
    }

    /** @type {GLXCameraManSignalWorkspace} */
    static #CAMERA_MAN = {
        distanceChanges: 'cameraman.distance',
        highChanges: 'cameraman.high',
        isLookingAtSpriteChanges: 'cameraman.isLookingAtSprite',
        isChasingSpriteChanges: 'cameraman.isChasingSprite',
        phaseChanges: 'cameraman.phase',
        targetSpriteChanges: 'cameraman.targetSprite',
        workModeChanges: 'cameraman.workMode'
    }

    /** @type {string} */
    static #CONTROLS = "gui_settings";

    /** @type {GLXDrawerSignalWorkspace} */
    static #DRAWER = {
        renderingModeChange: 'drawer.renderingMode'
    }

    /** @type {string} */
    static #MAIN = "main";

    /** @type {GLXShadowLightSignalWorkspace} */
    static #SHADOW_LIGHT = {
        bias: 'shadowLight.bias',
        lightFar: 'shadowLight.far',
        lightFov: 'shadowLight.fox',
        isShadowEnabled: 'shadowLight.shadowEnabled',
        isSpotlight: 'shadowLight.spotlight',
        lightDirection: 'shadowLight.direction',
        lightFrustum: 'shadowLight.frustum',
        lightPosition: 'shadowLight.position',
        lightTarget: 'shadowLight.target',
        lightUp: 'shadowLight.up',
        lightNear: 'shadowLight.near',
        projectionHeight: 'shadowLight.projectionHeight',
        projectionWidth: 'shadowLight.projectionWidth'
    }

    /** @type {string} */ #applicationName;

    /** @type {GLXCameraSignalWorkspace} */ #camera
    /** @type {GLXCameraManSignalWorkspace} */ #cameraMan
    /** @type {string} */ #controls;
    /** @type {GLXDrawerSignalWorkspace} */ #drawer;
    /** @type {string}*/ #main;
    /** @type {GLXShadowLightSignalWorkspace} */ #shadowLight;
    /** @type {Map<string, GLXSpriteSignalWorkspace>} */ #sprites;

    /**
     * 
     * @param {string} applicationName 
     */
    constructor(applicationName) {
        this.#applicationName = applicationName;

        this.#camera = Object.freeze({
            positionChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA.positionChanges),
            upChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA.upChanges),
            targetChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA.targetChanges),
            fovChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA.fovChanges),
            zNearChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA.zNearChanges),
            zFarChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA.zFarChanges),
        })

        this.#cameraMan = Object.freeze({
            distanceChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA_MAN.distanceChanges),
            highChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA_MAN.highChanges),
            isChasingSpriteChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA_MAN.isChasingSpriteChanges),
            isLookingAtSpriteChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA_MAN.isLookingAtSpriteChanges),
            phaseChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA_MAN.phaseChanges),
            targetSpriteChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA_MAN.targetSpriteChanges),
            workModeChanges: this.#absolutize(GLXApplicationSignalWorkspace.#CAMERA_MAN.workModeChanges)
        })

        this.#controls = this.#absolutize(GLXApplicationSignalWorkspace.#CONTROLS);

        this.#drawer = Object.freeze({
            renderingModeChange: this.#absolutize(GLXApplicationSignalWorkspace.#DRAWER.renderingModeChange)
        });

        this.#main = this.#absolutize(GLXApplicationSignalWorkspace.#MAIN);

        this.#shadowLight = Object.freeze({
            bias: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.bias),
            lightFar: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.lightFar),
            lightFov: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.lightFov),
            isShadowEnabled: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.isShadowEnabled),
            isSpotlight: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.isSpotlight),
            lightDirection: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.lightDirection),
            lightFrustum: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.lightFrustum),
            lightPosition: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.lightPosition),
            lightTarget: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.lightTarget),
            lightUp: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.lightUp),
            lightNear: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.lightNear),
            projectionHeight: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.projectionHeight),
            projectionWidth: this.#absolutize(GLXApplicationSignalWorkspace.#SHADOW_LIGHT.projectionWidth)
        });

        this.#sprites = new Map();
    }

    get camera() {
        return this.#camera;
    }

    get cameraMan() {
        return this.#cameraMan;
    }

    get controls() {
        return this.#controls;
    }

    get drawer() {
        return this.#drawer;
    }

    get main() {
        return this.#main;
    }

    get shadowLight() {
        return this.#shadowLight;
    }

    /**
     * 
     * @param {GLXSprite} sprite 
     */
    sprite(sprite) {
        return this.spriteName(sprite.name);
    }

    /**
     * 
     * @param {string} name 
     * @returns {GLXSpriteSignalWorkspace}
     */
    spriteName(name) {
        let signalWorkspace = this.#sprites.get(name);
        if (isNotNullOrUndefined(signalWorkspace)) {
            return signalWorkspace;
        }

        signalWorkspace = {
            positionChange: this.#absolutize(`sprite.${name}.position`),
            rotationChange: this.#absolutize(`sprite.${name}.rotation`),
            scaleChange: this.#absolutize(`sprite.${name}.scale`),
            hiddenChange: this.#absolutize(`sprite.${name}.hidden`)
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

export class GLXCamera {

    /** @type {GLXCameraSettings} */ #settings;
    /** @type {GLXCameraSignalDescriptors} */ #signalDescriptors;

    /**
     * 
     * @param {GLXCameraConstructorParams} params
     */
    constructor(params) {
        this.#settings = this.#buildSettings(params.settings ?? {});
        this.#signalDescriptors = this.#buildSignalDescriptors(params.signalWorkspace);
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
     * @returns {Trio<number>}
     */
    get up() {
        return this.#settings.up;
    }

    /**
     * @returns {number}
     */
    get zFar() {
        return this.#settings.zFar;
    }

    /**
     * @returns {number}
     */
    get zNear() {
        return this.#settings.zNear;
    }

    /**
     * @param {Angle} nextFov 
     */
    set fov(nextFov) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.fov,
            propertySetter: value => this.#settings.fov = value,
            nextValue: nextFov,
            signalDescriptor: this.#signalDescriptors.fovChanges
        })
    }

    /**
     * @param {Point3D} nextPosition
     */
    set position(nextPosition) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.position,
            propertySetter: value => this.#settings.position = value,
            nextValue: nextPosition,
            signalDescriptor: this.#signalDescriptors.positionChanges
        })
    }

    /**
     * @param {Point3D} nextTargetPosition
     */
    set targetPosition(nextTargetPosition) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.targetPosition,
            propertySetter: value => this.#settings.targetPosition = value,
            nextValue: nextTargetPosition,
            signalDescriptor: this.#signalDescriptors.targetChanges
        })
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
     * @param {number} nextZFar 
     */
    set zFar(nextZFar) {
        let previous = this.zFar;
        if (nextZFar !== previous) {
            this.#settings.zFar = nextZFar;
            this.#signalDescriptors.zFarChanges.trigger({
                data: change(nextZFar, previous)
            });
        }
    }

    /**
     * @param {number} nextZNear 
     */
    set zNear(nextZNear) {
        let previous = this.zNear;
        if (nextZNear !== previous) {
            this.#settings.zNear = nextZNear;
            this.#signalDescriptors.zNearChanges.trigger({
                data: change(nextZNear, previous)
            });
        }
    }

    /**
     * 
     * @param {GLXCameraSignalWorkspace} signalWorkspace 
     * @returns {GLXCameraSignalDescriptors}
     */
    #buildSignalDescriptors(signalWorkspace) {
        return {
            positionChanges: SIGNALS.register(signalWorkspace.positionChanges),
            upChanges: SIGNALS.register(signalWorkspace.upChanges),
            targetChanges: SIGNALS.register(signalWorkspace.targetChanges),
            fovChanges: SIGNALS.register(signalWorkspace.fovChanges),
            zNearChanges: SIGNALS.register(signalWorkspace.zNearChanges),
            zFarChanges: SIGNALS.register(signalWorkspace.zFarChanges)
        }
    }

    /**
     * 
     * @param {Partial<GLXCameraSettings>} settings 
     * @returns {GLXCameraSettings}
     */
    #buildSettings(settings) {
        return {
            position: point3D(1, 1, 1),
            up: trio(0, 0, 1),
            targetPosition: point3D(0, 0, 0),
            fov: degrees(60),
            zNear: 0.1,
            zFar: 700,
            ...settings
        }
    }
}

export class GLXCameraManWorkModes {
    /** @type {GLXCameraManWorkMode} */ static DISMISSED = 'DISMISSED';
    /** @type {GLXCameraManWorkMode} */ static OVER = 'OVER';
    /** @type {GLXCameraManWorkMode} */ static FIRST_PERSON = 'FIRST_PERSON';
    /** @type {GLXCameraManWorkMode} */ static THIRD_PERSON = 'THIRD_PERSON'
    /** @type {GLXCameraManWorkMode} */ static CUSTOM = 'CUSTOM';
}

export class GLXControlTypes {
    /** @type {GLXControlType} */ static LOG = 'log';
    /** @type {GLXControlType} */ static RENDERING_MODE = 'rendering_mode';
    /** @type {GLXControlType} */ static CAM_MAN_WORK_MODE = 'cam_man_work_mode';
    /** @type {GLXControlType} */ static TARGET = 'target';
    /** @type {GLXControlType} */ static CHASE = 'chase';
    /** @type {GLXControlType} */ static LOOK_AT = 'look_at';
    /** @type {GLXControlType} */ static CAM_MAN_HIGH = 'cam_man_high';
    /** @type {GLXControlType} */ static CAM_MAN_DISTANCE = 'cam_man_distance';
    /** @type {GLXControlType} */ static CAM_MAN_PHASE = 'cam_man_phase';
    /** @type {GLXControlType} */ static CAM_X = 'cam_x';
    /** @type {GLXControlType} */ static CAM_Y = 'cam_y';
    /** @type {GLXControlType} */ static CAM_Z = 'cam_z';
    /** @type {GLXControlType} */ static CAM_UP_X = 'cam_up_x';
    /** @type {GLXControlType} */ static CAM_UP_Y = 'cam_up_y';
    /** @type {GLXControlType} */ static CAM_UP_Z = 'cam_up_z';
    /** @type {GLXControlType} */ static Z_NEAR = 'z_near';
    /** @type {GLXControlType} */ static Z_FAR = 'z_far';
    /** @type {GLXControlType} */ static FOV = 'fov';
    /** @type {GLXControlType} */ static TARGET_X = 'target_x';
    /** @type {GLXControlType} */ static TARGET_Y = 'target_y';
    /** @type {GLXControlType} */ static TARGET_Z = 'target_z';
    /** @type {GLXControlType} */ static SHADOWS = 'shadows';
    /** @type {GLXControlType} */ static FRUSTUM = 'frustum';
    /** @type {GLXControlType} */ static LIGHT_X = 'light_x';
    /** @type {GLXControlType} */ static LIGHT_Y = 'light_y';
    /** @type {GLXControlType} */ static LIGHT_Z = 'light_z';
    /** @type {GLXControlType} */ static LIGHT_TARGET_X = 'light_target_x';
    /** @type {GLXControlType} */ static LIGHT_TARGET_Y = 'light_target_y';
    /** @type {GLXControlType} */ static LIGHT_TARGET_Z = 'light_target_z';
    /** @type {GLXControlType} */ static LIGHT_UP_X = 'light_up_x';
    /** @type {GLXControlType} */ static LIGHT_UP_Y = 'light_up_y';
    /** @type {GLXControlType} */ static LIGHT_UP_Z = 'light_up_z';
    /** @type {GLXControlType} */ static LIGHT_FOV = 'light_fov';
    /** @type {GLXControlType} */ static LIGHT_NEAR = 'light_near';
    /** @type {GLXControlType} */ static LIGHT_FAR = 'light_far';
    /** @type {GLXControlType} */ static BIAS = 'bias';
    /** @type {GLXControlType} */ static SPOTLIGHT = 'spotlight';
    /** @type {GLXControlType} */ static LIGHT_WIDTH = 'light_width';
    /** @type {GLXControlType} */ static LIGHT_HEIGHT = 'light_height';
    /** @type {GLXControlType} */ static CURR_SPRITE = 'curr_sprite';
    /** @type {GLXControlType} */ static HIDDEN = 'hidden';
    /** @type {GLXControlType} */ static SPRITE_X = 'sprite_x';
    /** @type {GLXControlType} */ static SPRITE_Y = 'sprite_y';
    /** @type {GLXControlType} */ static SPRITE_Z = 'sprite_z';
    /** @type {GLXControlType} */ static SPRITE_SCALE_X = 'sprite_scale_x';
    /** @type {GLXControlType} */ static SPRITE_SCALE_Y = 'sprite_scale_y';
    /** @type {GLXControlType} */ static SPRITE_SCALE_Z = 'sprite_scale_z';
    /** @type {GLXControlType} */ static SPRITE_PSI = 'sprite_psi';
    /** @type {GLXControlType} */ static SPRITE_THETA = 'sprite_theta';
    /** @type {GLXControlType} */ static SPRITE_PHI = 'sprite_phi';
    /** @type {GLXControlType} */ static DRAW = 'draw';
}

export class GLXShadowLight {

    /** @type {GLXShadowLightSettings} */ #settings;
    /** @type {GLXShadowLightSignalDescriptors} */ #signalDescriptors;

    /**
     * 
     * @param {GLXShadowLightConstructorParams} params
     */
    constructor(params) {
        this.#settings = {
            bias: -0.006,
            lightPosition: point3D(0, 0, 100),
            lightTarget: point3D(0, 0, 0),
            lightUp: trio(0, 1, 0),
            lightFov: radians(0),
            isSpotlight: false,
            projectionWidth: 10,
            projectionHeight: 10,
            isShadowEnabled: false,
            near: 1,
            lightFar: 700,
            ligthFrustum: false,
            ...params.settings
        };
        this.#signalDescriptors = this.#buildSignalDescriptors(params.signalWorkspace);
    }

    get bias() {
        return this.#settings.bias;
    }

    get lightFar() {
        return this.#settings.lightFar;
    }

    get isShadowEnabled() {
        return this.#settings.isShadowEnabled;
    }

    get isSpotlight() {
        return this.#settings.isSpotlight;
    }

    get lightFov() {
        return this.#settings.lightFov;
    }

    get lightFrustum() {
        return this.#settings.ligthFrustum;
    }

    get lightPosition() {
        return this.#settings.lightPosition;
    }

    get lightTarget() {
        return this.#settings.lightTarget;
    }

    get lightUp() {
        return this.#settings.lightUp;
    }

    get lightNear() {
        return this.#settings.near;
    }

    get projectionHeight() {
        return this.#settings.projectionHeight;
    }

    get projectionWidth() {
        return this.#settings.projectionWidth;
    }

    /**
     * @param {number} nextBias
     */
    set bias(nextBias) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.bias,
            propertySetter: (value) => this.#settings.bias = value,
            nextValue: nextBias,
            signalDescriptor: this.#signalDescriptors.bias
        })
    }


    /**
     * @param {number} nextFar 
     */
    set lightFar(nextFar) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.lightFar,
            propertySetter: (value) => this.#settings.lightFar = value,
            nextValue: nextFar,
            signalDescriptor: this.#signalDescriptors.lightFar
        });
    }

    /**
     * @param {Angle} nextFov 
     */
    set lightFov(nextFov) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.lightFov,
            propertySetter: (value) => this.#settings.lightFov = value,
            nextValue: nextFov,
            signalDescriptor: this.#signalDescriptors.lightFov
        });
    }

    set lightFrustum(nextFrustum) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.ligthFrustum,
            propertySetter: (value) => this.#settings.ligthFrustum = value,
            nextValue: nextFrustum,
            signalDescriptor: this.#signalDescriptors.lightFrustum
        })
    }

    /**
     * @param {boolean} nextShadowEnabled
     */
    set isShadowEnabled(nextShadowEnabled) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.isShadowEnabled,
            propertySetter: (value) => { this.#settings.isShadowEnabled = value; },
            nextValue: nextShadowEnabled,
            signalDescriptor: this.#signalDescriptors.isShadowEnabled
        });
    }

    /**
     * @param {boolean} nextSpotlight 
     */
    set isSpotlight(nextSpotlight) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.isSpotlight,
            propertySetter: (value) => { this.#settings.isSpotlight = value; },
            nextValue: nextSpotlight,
            signalDescriptor: this.#signalDescriptors.isSpotlight
        });
    }

    /**
     * @param {Point3D} nextPosition 
     */
    set lightPosition(nextPosition) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.lightPosition,
            propertySetter: (value) => { this.#settings.lightPosition = value; },
            nextValue: nextPosition,
            signalDescriptor: this.#signalDescriptors.lightPosition
        });
    }

    /**
     * @param {Point3D} nextTarget 
     */
    set lightTarget(nextTarget) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.lightTarget,
            propertySetter: (value) => { this.#settings.lightTarget = value; },
            nextValue: nextTarget,
            signalDescriptor: this.#signalDescriptors.lightTarget
        });
    }

    /**
     * @param {Trio<number>} nextUp 
     */
    set lightUp(nextUp) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.lightUp,
            propertySetter: (value) => { this.#settings.lightUp = value; },
            nextValue: nextUp,
            signalDescriptor: this.#signalDescriptors.lightUp
        });
    }

    /**
     * @param {number} nextNear 
     */
    set lightNear(nextNear) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.near,
            propertySetter: (value) => { this.#settings.near = value; },
            nextValue: nextNear,
            signalDescriptor: this.#signalDescriptors.lightNear
        });
    }

    /**
     * @param {number} nextHeight 
     */
    set projectionHeight(nextHeight) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.projectionHeight,
            propertySetter: (value) => { this.#settings.projectionHeight = value; },
            nextValue: nextHeight,
            signalDescriptor: this.#signalDescriptors.projectionHeight
        });
    }

    /**
     * @param {number} nextWidth 
     */
    set projectionWidth(nextWidth) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.projectionWidth,
            propertySetter: (value) => { this.#settings.projectionWidth = value; },
            nextValue: nextWidth,
            signalDescriptor: this.#signalDescriptors.projectionWidth
        });
    }

    /**
     * 
     * @param {GLXShadowLightSignalWorkspace} signalWorkspace 
     * @returns {GLXShadowLightSignalDescriptors}
     */
    #buildSignalDescriptors(signalWorkspace) {
        return {
            bias: SIGNALS.register(signalWorkspace.bias),
            lightFar: SIGNALS.register(signalWorkspace.lightFar),
            lightFrustum: SIGNALS.register(signalWorkspace.lightFrustum),
            lightFov: SIGNALS.register(signalWorkspace.lightFov),
            isShadowEnabled: SIGNALS.register(signalWorkspace.isShadowEnabled),
            isSpotlight: SIGNALS.register(signalWorkspace.isSpotlight),
            lightDirection: SIGNALS.register(signalWorkspace.lightDirection),
            lightPosition: SIGNALS.register(signalWorkspace.lightPosition),
            lightTarget: SIGNALS.register(signalWorkspace.lightTarget),
            lightUp: SIGNALS.register(signalWorkspace.lightUp),
            lightNear: SIGNALS.register(signalWorkspace.lightNear),
            projectionHeight: SIGNALS.register(signalWorkspace.projectionHeight),
            projectionWidth: SIGNALS.register(signalWorkspace.projectionWidth)
        }
    }

}

export class GLXSprite {

    /** @type {string} */ #name;
    /** @type {string} */ #applicationName;
    /** @type {GLXSpriteSetting} */ #settings;
    /** @type {GLXSpriteSignalWorkspace} */ #signalWorkspace;
    /**  @type {GLXSpriteSignalDescriptors} */ #signalDescriptors;

    /**
     *
     * @param {GLXSpriteConstructorParams} params
     */
    constructor(params) {
        this.#name = params.name;
        this.#applicationName = params.applicationName;
        this.#settings = this.#buildSettings(params.settings ?? {});
        this.#signalDescriptors = this.#buildSignalDescriptors(params.signalWorkspace);
        this.#signalWorkspace = params.signalWorkspace;
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

    set hidden(hidden) {
        setSignaledProperty({
            propertyGetter: () => this.#settings.hidden,
            propertySetter: value => this.#settings.hidden = value,
            nextValue: hidden,
            signalDescriptor: this.#signalDescriptors.hiddenChange
        })
    }

    /**
     * @param {Point3D} position
     */
    set position(position) {
        let positionChange = change(position, this.#settings.position);

        // @ts-ignore
        if (!this.limitChecker(this, position)) {
            this.#signalDescriptors.positionChange.trigger(FireRequests.ofPositionChange(positionChange));
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

    emitInformationSignal() {
        this.#signalDescriptors.positionChange.trigger(FireRequests.ofPositionChange(
            change(this.#settings.position, this.#settings.position)));
        this.#signalDescriptors.rotationChange.trigger(FireRequests.ofRotationChange(
            change(this.#settings.rotation, this.#settings.rotation)));
        this.#signalDescriptors.scaleChange.trigger(FireRequests.ofScaleChange(
            change(this.#settings.scale, this.#settings.scale)));
        this.#signalDescriptors.hiddenChange.trigger({
            data: change(this.#settings.hidden, this.#settings.hidden)
        });
    }

    /**
     * @param {Partial<GLXSpriteSetting>} settings 
     * @returns {GLXSpriteSetting}
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
     * @param {GLXSpriteSignalWorkspace} signalWorkspace 
     * @returns {GLXSpriteSignalDescriptors}
     */
    #buildSignalDescriptors(signalWorkspace) {
        return {
            positionChange: SIGNALS.register(signalWorkspace.positionChange),
            rotationChange: SIGNALS.register(signalWorkspace.rotationChange),
            scaleChange: SIGNALS.register(signalWorkspace.scaleChange),
            hiddenChange: SIGNALS.register(signalWorkspace.hiddenChange)
        }
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

export class RenderingModes {
    /** @type {RenderingMode} */
    static SIGNAL = 'SIGNAL';

    /**
     * @type {RenderingMode}
     */
    static HYBRID = 'HYBRID';
}

class Rotations {
    /** @type {Trio<Angle>} */
    static NOT_ROTATED = trio(radians(0), radians(0), radians(0));
}

class Scales {
    /** @type {Trio<number>} */
    static NOT_SCALED = trio(1, 1, 1);
}

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
 *
 * @template T
 * @template R
 * @param {T|null|undefined} obj 
 * @param {(obj: T) => R} action 
 * @returns R
 */
export function ifNotNullOrUndefined(obj, action) {
    if (isNotNullOrUndefined(obj)) {
        action(obj);
    }
}

/**
 * 
 * @template T
 * @param {T|null|undefined} obj 
 * @returns {obj is T}
 */
export function isNotNullOrUndefined(obj) {
    return obj !== null && obj !== undefined
}

/**
 * 
 * @template T
 * @param {T|null|undefined} obj 
 * @returns {boolean}
 */
export function isNullOrUndefined(obj) {
    return obj === null || obj === undefined;
}

/**
 *
 * @param {number} num
 * @param {Duo<number>} duo
 * @returns {boolean}
 */
export function isNumberBetweenInclusiveDuo(num, duo) {
    return num >= duo.first && num <= duo.second;
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

/**
 * 
 * @template T
 * @param {SignaledProperty<T>} setter 
 */
export function setSignaledProperty(setter) {
    // @ts-ignore
    let previousValue = setter.propertyGetter();
    let nextValue = setter.nextValue;
    if (nextValue !== previousValue) {
        // @ts-ignore
        setter.propertySetter(nextValue);
        setter.signalDescriptor.trigger({
            data: change(nextValue, previousValue)
        })
    }
}
