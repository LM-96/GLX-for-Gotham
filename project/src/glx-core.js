import {
    degrees,
    radians,
    Angle,
    Axes,
    Math3D,
    AngleMath
} from "./geometry.js";
import {
    GLXApplicationInfoTypes,
    GLXApplicationSignalWorkspace,
    GLXCamera,
    GLXCameraManWorkModes,
    GLXControlTypes,
    GLXShadowLight,
    GLXSprite,
    RenderingModes,
    change,
    isNotNullOrUndefined,
    isNullOrUndefined,
    pair,
    setSignaledProperty,
    trio
} from "./glx-model.js";
import {
    Logger,
    enableLoggingOn,
    loggingEnabled
} from "./logjsx.js";
import { SIGNALS } from "./signals.js";
import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

/**
 * @template T
 * @typedef {import("./glx-model").Change<T>} Change
 */

/**
 * @typedef {import("./glx-core").ControlsRuntime} ControlsRuntime
 */

/**
 * @typedef {import("./glx-core").DrawMatrices} DrawMatrices
 */

/**
 * @typedef {import("./glx-model").DrawSceneContext} DrawSceneContext
 */

/**
 * @typedef {import("./glx-model").DrawSpriteContext} DrawSpriteContext
 */

/**
 * @typedef {import("./glx-model").GLXApplicationInfoType} GLXApplicationInfoType
 */

/**
 * @typedef {import("./glx-core").GLXApplicationParams} GLXApplicationParams
 */

/**
 * @typedef {import("./glx-core").GLXApplicationStart} GLXApplicationStart
 */

/**
 * @typedef {import("./glx-model").GLXCameraManConstructorParams} GLXCameraManConstructorParams
 */

/**
 * @typedef {import("./glx-model").GLXCameraManSettings} GLXCameraManSettings
 */

/**
 * @typedef {import("./glx-model").GLXCameraManSignalDescriptors} GLXCameraManSignalDescriptors
 */

/**
 * @typedef {import("./glx-model").GLXCameraManSignalWorkspace} GLXCameraManSignalWorkspace
 */

/**
 * @typedef {import("./glx-model").GLXCameraManWorkMode} GLXCameraManWorkMode
 */

/**
 * @template T
 * @typedef {import("./glx-model").GLXControl<T>} GLXControl
 */

/**
 * @typedef {import("./glx-core").GLXControlHandler} GLXControlHandler
 */

/**
 * @typedef {import("./glx-core").GLXControlHandlerClass} GLXControlHandlerClass
 */

/**
 * @typedef {import("./glx-core").GLXControlsHandlerParams} GLXControlHandlerParams
 */

/**
 * @typedef {import("./glx-model").GLXControlInfo} GLXControlInfo
 */

/**
 * @typedef {import("./glx-core").GLXControlsHandlerParams} GLXControlsParams
 */

/**
 * @typedef {import("./glx-core").GLXDrawerConstructorParams} GLXDrawerConstructorParams
 */

/**
 * @typedef {import("./glx-model").GLXDrawerSignalDescriptor} GLXDrawerSignalDescriptor

/**
 * @typedef {import("./glx-core").GLXSpriteCreation} GLXSpriteCreation
 */

/**
 * @typedef {import("./glx-core").GLXSpriteManagerConstructorParams} GLXSpriteManagerConstructorParams
 */

/**
 * @typedef {import("./glx-core").GLXSpriteData} GLXSpriteData
 */

/**
 * @typedef {import("./glx-model").GLXSpriteSignalWorkspace} GLXSpriteSignalWorkspace
 */

/**
 * @typedef {import("./glx-core").LightMatrices} LightMatrices
 */

/**
 * @typedef {import("./glx-core").MeshSpriteLoad} MeshSpriteLoad
 */

/**
 * @template F
 * @template S
 * @typedef {import("./glx-model").Pair<F, S>} Pair
 */

/**
 * @typedef {import("./geometry").Point3D} Point3D
 */

/**
 * @typedef {import("./glx-core").ProgramInfo} ProgramInfo
 */

/**
 * @typedef {import("./glx-model").RenderingMode} RenderingMode
 */

/**
 * @template D
 * @typedef {import("./signals").Signal<D>} Signal
 */

/**
 * @template D
 * @typedef {import("./signals").SignalDescriptor<D>} SignalDescriptor
 */

/**
 * @template D
 * @typedef {import("./signals").SignalSubscription<D>} SignalSubscription
 */

/**
 * @typedef {import("./glx-core").SharedUniforms} SharedUniforms
 */

/**
 * @typedef {import("./signals").SubscriptionToken} SubscriptionToken
 */

/**
 * @template T
 * @typedef {import("./glx-model").Trio<T>} Trio
 */

/**
 * @typedef {import("./geometry.js").Vector3D} Vector3D
 */

/**
 * @typedef {import("./glx-core").WebGLShaderReference} WebGLShaderReference
 */

export class GLXApplication {

    /** @type {string} */ #applicationName;
    /** @type {import("./glx-model").GLXCamera} */ #camera;
    /** @type {GLXCameraMan} */ #cameraMan;
    /** @type {Logger} */ #logger;
    /** @type {import("./glx-core").GLXEnvironment} */ #glxEnvironment;
    /** @type {SignalDescriptor<GLXApplicationInfoType>} */ #mainSignalDescriptor;
    /** @type {GLXShadowLight} */ #shadowLightManager;
    /** @type {GLXDrawer} */ drawer;
    /** @type {GLXSpriteManager} */ #spriteManager;
    /** @type {GLXApplicationSignalWorkspace}*/ #signalWorkspace;
    /** @type {MTLLoader} */ #mtlLoader = new MTLLoader();
    /** @type {Function[]} */ #spriteLoaders = [];

    /**
     * 
     * @param {GLXApplicationParams} params
     */
    constructor(params) {
        let logEnabled = params.appStart.logEnabled ?? true;
        this.#logger = Logger.forName('WebGLXApp[' + params.applicationName + ']').enabledOn(logEnabled);
        this.#applicationName = params.applicationName;
        this.#signalWorkspace = params.signalWorkspace;
        this.#mainSignalDescriptor = params.mainSignalDescriptor;
        this.#camera = this.#buildCamera(params);
        this.#cameraMan = this.#buildCameraMan(params);
        this.#spriteManager = this.#buildSpriteManager(params);
        this.#shadowLightManager = this.#buildShadowLightManager(params);
        this.#glxEnvironment = params.webGLXEnvironment;
        this.drawer = this.#buildDrawer(params);
        this.#setupControls(params.controlHandlerClasses);
    }

    get applicationName() {
        return this.#applicationName;
    }

    get cameraMan() {
        return this.#cameraMan;
    }

    get logger() {
        return this.#logger;
    }

    get signalWorkspace() {
        return this.#signalWorkspace;
    }

    get spriteLoaders() {
        return Object.freeze(this.#spriteLoaders);
    }

    get spriteManager() {
        return this.#spriteManager;
    }

    /**
     * 
     * @param {MeshSpriteLoad} load 
     */
    glxSprite(load) {
        /** @type {GLXSprite} */ let sprite;
        /** @type {THREE.Group | undefined} */ let threeData = undefined;

        sprite = this.#spriteManager.createSprite({
            name: load.name,
            glData: () => threeData,
            signalWorkspace: this.#signalWorkspace.spriteName(load.name),
            settings: { ...load }
        });

        this.#spriteLoaders.push(() => {
            this.#mtlLoader.load(`${load.path}.mtl`, (/** @type {any} */ materials) => {
                materials.preload();
                let objLoader = new OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.load(`${load.path}.obj`, (/** @type {THREE.Group} */ loadedObj) => {
                    threeData = loadedObj;
                    this.#logger.info('loaded obj: ', loadedObj);
                    this.#mainSignalDescriptor.trigger({ data: GLXApplicationInfoTypes.ADDED_SPRITE });
                })
            });
        });

        return sprite;
    }

    /**
     * 
     * @param {GLXApplicationParams} params 
     * @returns {GLXCamera}
     */
    #buildCamera(params) {
        return new GLXCamera({
            applicationName: params.applicationName,
            signalWorkspace: this.#signalWorkspace.camera,
            logEnabled: params.appStart.logEnabled ?? true,
            settings: params.appStart.cameraSettings
        })
    }

    /**
     * 
     * @param {GLXApplicationParams} params 
     * @returns {GLXCameraMan} 
     */
    #buildCameraMan(params) {
        return new GLXCameraMan({
            applicationName: params.applicationName,
            camera: this.#camera,
            signalWorkspace: this.#signalWorkspace.cameraMan,
            logEnabled: params.appStart.logEnabled ?? true
        })
    }

    /**
     * 
     * @param {GLXApplicationParams} params 
     * @returns {GLXDrawer}
     */
    #buildDrawer(params) {
        let sharedUniforms = this.#defaultSharedUniforms();
        return new GLXDrawer({
            applicationName: params.applicationName,
            renderingMode: params.appStart.renderingMode ?? RenderingModes.HYBRID,
            glxEnvironment: this.#glxEnvironment,
            camera: this.#camera,
            shadowLightManager: this.#shadowLightManager,
            sharedUniforms: sharedUniforms,
            spriteManager: this.#spriteManager,
            applicationSignalWorkspace: this.#signalWorkspace,
            logEnabled: params.appStart.logEnabled ?? true
        })
    }

    /**
     * 
     * @param {ControlsRuntime} controlsRuntime 
     * @param {GLXSprite[]} sprites 
     * @returns {GLXControl<any>[]}
     */
    #buildGuiControls(controlsRuntime, sprites) {
        const spriteNames = sprites.map(sprite => sprite.name);

        return [
            {
                type: GLXControlTypes.DRAW,
                value: () => { },
            },
            {
                type: GLXControlTypes.LOG,
                value: loggingEnabled(),
            },
            {
                type: GLXControlTypes.RENDERING_MODE,
                value: this.drawer.currentRenderingMode,
                listenSignal: this.#signalWorkspace.drawer.renderingModeChange,
                listenReducer: signal => signal.data.to,
                options: [RenderingModes.SIGNAL, RenderingModes.HYBRID]

            },
            {
                type: GLXControlTypes.CAM_MAN_WORK_MODE,
                value: this.#cameraMan.workMode,
                options: CAMERA_MAN_WORK_MODES,
                listenSignal: this.#signalWorkspace.cameraMan.workModeChanges,
                listenReducer: signal => signal.data.to,
            },
            {
                type: GLXControlTypes.TARGET,
                value: this.#cameraMan.targetSprite?.name,
                options: spriteNames,
                listenSignal: this.#signalWorkspace.cameraMan.targetSpriteChanges,
                listenReducer: signal => signal.data.to,
            },
            {
                type: GLXControlTypes.CHASE,
                value: this.#cameraMan.isChasingSprite,
                listenSignal: this.#signalWorkspace.cameraMan.isChasingSpriteChanges,
                listenReducer: signal => signal.data.to,
            },
            {
                type: GLXControlTypes.LOOK_AT,
                value: this.#cameraMan.isLookingAtSprite,
                listenSignal: this.#signalWorkspace.cameraMan.isLookingAtSpriteChanges,
                listenReducer: signal => signal.data.to,
            },
            {
                type: GLXControlTypes.CAM_MAN_HIGH,
                value: this.#cameraMan.high,
                min: 0,
                max: 100,
                step: 1,
                listenSignal: this.#signalWorkspace.cameraMan.highChanges,
                listenReducer: signal => signal.data.to,
            },
            {
                type: GLXControlTypes.CAM_MAN_DISTANCE,
                value: this.#cameraMan.distance,
                min: 0,
                max: 100,
                step: 1,
                listenSignal: this.#signalWorkspace.cameraMan.distanceChanges,
                listenReducer: signal => signal.data.to,
            },
            {
                type: GLXControlTypes.CAM_MAN_PHASE,
                value: this.#cameraMan.phase.degreesValue,
                min: -180,
                max: 180,
                step: 1,
                listenSignal: this.#signalWorkspace.cameraMan.phaseChanges,
                listenReducer: signal => signal.data.to.degreesValue,
            },
            {
                type: GLXControlTypes.CAM_X,
                value: this.#camera.position.x,
                min: -500,
                max: 500,
                step: 5,
                listenSignal: this.#signalWorkspace.camera.positionChanges,
                listenReducer: signal => signal.data.to.x,
            },
            {
                type: GLXControlTypes.CAM_Y,
                value: this.#camera.position.y,
                min: -500,
                max: 500,
                step: 5,
                listenSignal: this.#signalWorkspace.camera.positionChanges,
                listenReducer: signal => signal.data.to.y,
            },
            {
                type: GLXControlTypes.CAM_Z,
                value: this.#camera.position.z,
                min: -500,
                max: 500,
                step: 5,
                listenSignal: this.#signalWorkspace.camera.positionChanges,
                listenReducer: signal => signal.data.to.z,
            },
            {
                type: GLXControlTypes.CAM_UP_X,
                value: this.#camera.up.first,
                min: -1,
                max: 1,
                step: 0.001,
                listenSignal: this.#signalWorkspace.camera.upChanges,
                listenReducer: signal => signal.data.to.first,
            },
            {
                type: GLXControlTypes.CAM_UP_Y,
                value: this.#camera.up.second,
                min: -1,
                max: 1,
                step: 0.001,
                listenSignal: this.#signalWorkspace.camera.upChanges,
                listenReducer: signal => signal.data.to.second,
            },
            {
                type: GLXControlTypes.CAM_UP_Z,
                value: this.#camera.up.third,
                min: -1,
                max: 1,
                step: 0.001,
                listenSignal: this.#signalWorkspace.camera.upChanges,
                listenReducer: signal => signal.data.to.third,
            },
            {
                type: GLXControlTypes.Z_NEAR,
                value: this.#camera.zNear,
                min: 0,
                max: 10,
                step: 0.1,
                listenSignal: this.#signalWorkspace.camera.zNearChanges,
                listenReducer: signal => signal.data.to,
            },
            {
                type: GLXControlTypes.Z_FAR,
                value: this.#camera.zFar,
                min: 0,
                max: 1000,
                step: 1,
                listenSignal: this.#signalWorkspace.camera.zFarChanges,
                listenReducer: signal => signal.data.to,
            },
            {
                type: GLXControlTypes.FOV,
                value: this.#camera.fov.degreesValue,
                min: 0,
                max: 180,
                listenSignal: this.#signalWorkspace.camera.fovChanges,
                listenReducer: signal => signal.data.to.degreesValue,
            },
            {
                type: GLXControlTypes.TARGET_X,
                value: this.#camera.targetPosition.x,
                min: -500,
                max: 500,
                step: 1,
                listenSignal: this.#signalWorkspace.camera.targetChanges,
                listenReducer: signal => signal.data.to.x,
            },
            {
                type: GLXControlTypes.TARGET_Y,
                value: this.#camera.targetPosition.y,
                min: -500,
                max: 500,
                step: 1,
                listenSignal: this.#signalWorkspace.camera.targetChanges,
                listenReducer: signal => signal.data.to.y,
            },
            {
                type: GLXControlTypes.TARGET_Z,
                value: this.#camera.targetPosition.z,
                min: -500,
                max: 500,
                step: 1,
                listenSignal: this.#signalWorkspace.camera.targetChanges,
                listenReducer: signal => signal.data.to.z,
            },
            {
                type: GLXControlTypes.SHADOWS,
                value: this.#shadowLightManager.isShadowEnabled,
                listenSignal: this.#signalWorkspace.shadowLight.isShadowEnabled,
                listenReducer: signal => signal.data.to
            },
            {
                type: GLXControlTypes.FRUSTUM,
                value: this.#shadowLightManager.lightFrustum,
                listenSignal: this.#signalWorkspace.shadowLight.lightFrustum,
                listenReducer: signal => signal.data.to
            },
            {
                type: GLXControlTypes.LIGHT_X,
                value: this.#shadowLightManager.lightPosition.x,
                min: -500,
                max: 500,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightPosition,
                listenReducer: signal => signal.data.to.x
            },
            {
                type: GLXControlTypes.LIGHT_Y,
                value: this.#shadowLightManager.lightPosition.y,
                min: -500,
                max: 500,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightPosition,
                listenReducer: signal => signal.data.to.y
            },
            {
                type: GLXControlTypes.LIGHT_Z,
                value: this.#shadowLightManager.lightPosition.z,
                min: -500,
                max: 500,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightPosition,
                listenReducer: signal => signal.data.to.z
            },
            {
                type: GLXControlTypes.LIGHT_TARGET_X,
                value: this.#shadowLightManager.lightTarget.x,
                min: -500,
                max: 500,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightTarget,
                listenReducer: signal => signal.data.to.x
            },
            {
                type: GLXControlTypes.LIGHT_TARGET_Y,
                value: this.#shadowLightManager.lightTarget.y,
                min: -500,
                max: 500,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightTarget,
                listenReducer: signal => signal.data.to.y
            },
            {
                type: GLXControlTypes.LIGHT_TARGET_Z,
                value: this.#shadowLightManager.lightTarget.z,
                min: -500,
                max: 500,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightTarget,
                listenReducer: signal => signal.data.to.z
            },
            {
                type: GLXControlTypes.LIGHT_UP_X,
                value: this.#shadowLightManager.lightUp.first,
                min: -500,
                max: 500,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightUp,
                listenReducer: signal => signal.data.to.first
            },
            {
                type: GLXControlTypes.LIGHT_UP_Y,
                value: this.#shadowLightManager.lightUp.second,
                min: -500,
                max: 500,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightUp,
                listenReducer: signal => signal.data.to.second
            },
            {
                type: GLXControlTypes.LIGHT_UP_Z,
                value: this.#shadowLightManager.lightUp.third,
                min: -500,
                max: 500,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightUp,
                listenReducer: signal => signal.data.to.third
            },
            {
                type: GLXControlTypes.LIGHT_FOV,
                value: this.#shadowLightManager.lightFov.degreesValue,
                min: 0,
                max: 360,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightFov,
                listenReducer: signal => signal.data.to.degreesValue
            },
            {
                type: GLXControlTypes.LIGHT_NEAR,
                value: this.#shadowLightManager.lightNear,
                min: 0,
                max: 100,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightNear,
                listenReducer: signal => signal.data.to
            },
            {
                type: GLXControlTypes.LIGHT_FAR,
                value: this.#shadowLightManager.lightFar,
                min: 0,
                max: 1000,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightFar,
                listenReducer: signal => signal.data.to
            },
            {
                type: GLXControlTypes.BIAS,
                value: this.#shadowLightManager.bias,
                min: -0.20,
                max: 0.00,
                step: 0.025,
                listenSignal: this.#signalWorkspace.shadowLight.bias,
                listenReducer: signal => signal.data.to
            },
            {
                type: GLXControlTypes.SPOTLIGHT,
                value: this.#shadowLightManager.isSpotlight,
                listenSignal: this.#signalWorkspace.shadowLight.isSpotlight,
                listenReducer: signal => signal.data.to
            },
            {
                type: GLXControlTypes.LIGHT_WIDTH,
                value: this.#shadowLightManager.projectionWidth,
                min: 0,
                max: 100,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.projectionWidth,
                listenReducer: signal => signal.data.to
            },
            {
                type: GLXControlTypes.LIGHT_HEIGHT,
                value: this.#shadowLightManager.projectionHeight,
                min: 0,
                max: 100,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.projectionHeight,
                listenReducer: signal => signal.data.to
            },
            {
                type: GLXControlTypes.CURR_SPRITE,
                value: controlsRuntime.currentSprite?.name,
                options: spriteNames,
            },
            {
                type: GLXControlTypes.HIDDEN,
                value: controlsRuntime.currentSprite?.hidden ?? false,
            },
            {
                type: GLXControlTypes.SPRITE_X,
                value: controlsRuntime.currentSprite?.position.x,
                min: -500,
                max: 500,
                step: 1,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.positionChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(controlsRuntime, spriteWorkspace => spriteWorkspace.positionChange),
                listenReducer: signal => signal.data.to.x
            },
            {
                type: GLXControlTypes.SPRITE_Y,
                value: controlsRuntime.currentSprite?.position.y,
                min: -500,
                max: 500,
                step: 1,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.positionChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(controlsRuntime, spriteWorkspace => spriteWorkspace.positionChange),
                listenReducer: signal => signal.data.to.y
            },
            {
                type: GLXControlTypes.SPRITE_Z,
                value: controlsRuntime.currentSprite?.position.z,
                min: -500,
                max: 500,
                step: 1,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.positionChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(controlsRuntime, spriteWorkspace => spriteWorkspace.positionChange),
                listenReducer: signal => signal.data.to.z
            },
            {
                type: GLXControlTypes.SPRITE_SCALE_X,
                value: controlsRuntime.currentSprite?.scale.first,
                min: 0,
                max: 10,
                step: 0.01,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.scaleChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(controlsRuntime, spriteWorkspace => spriteWorkspace.scaleChange),
                listenReducer: signal => signal.data.to.first
            },
            {
                type: GLXControlTypes.SPRITE_SCALE_Y,
                value: controlsRuntime.currentSprite?.scale.second,
                min: 0,
                max: 10,
                step: 0.01,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.scaleChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(controlsRuntime, spriteWorkspace => spriteWorkspace.scaleChange),
                listenReducer: signal => signal.data.to.second
            },
            {
                type: GLXControlTypes.SPRITE_SCALE_Z,
                value: controlsRuntime.currentSprite?.scale.third,
                min: 0,
                max: 10,
                step: 0.01,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.scaleChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(controlsRuntime, spriteWorkspace => spriteWorkspace.scaleChange),
                listenReducer: signal => signal.data.to.third
            },
            {
                type: GLXControlTypes.SPRITE_PSI,
                value: controlsRuntime.currentSprite?.rotation.first.degreesValue,
                min: -180,
                max: 180,
                step: 0.1,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.rotationChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(controlsRuntime, spriteWorkspace => spriteWorkspace.rotationChange),
                listenReducer: signal => signal.data.to.first.degreesValue
            },
            {
                type: GLXControlTypes.SPRITE_THETA,
                value: controlsRuntime.currentSprite?.rotation.second.degreesValue,
                min: -180,
                max: 180,
                step: 0.1,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.rotationChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(controlsRuntime, spriteWorkspace => spriteWorkspace.rotationChange),
                listenReducer: signal => signal.data.to.second.degreesValue
            },
            {
                type: GLXControlTypes.SPRITE_PHI,
                value: controlsRuntime.currentSprite?.rotation.third.degreesValue,
                min: -180,
                max: 180,
                step: 0.1,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.rotationChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(controlsRuntime, spriteWorkspace => spriteWorkspace.rotationChange),
                listenReducer: signal => signal.data.to.third.degreesValue
            },
        ];
    }

    /**
     * 
     * @param {ControlsRuntime} controlsRuntime
     * @param {(spriteSignalWorkspace: GLXSpriteSignalWorkspace) => string} signalSelector 
     * @returns {(signal: Signal<*>) => boolean}
     */
    #buildCurrentSpriteSignalGuard(controlsRuntime, signalSelector) {
        return signal =>
            isNotNullOrUndefined(controlsRuntime.currentSprite)
            && signal.name === signalSelector(this.#signalWorkspace.sprite(controlsRuntime.currentSprite));
    }

    /**
     * 
     * @param {GLXApplicationParams} params 
     * @returns {GLXShadowLight}
     */
    #buildShadowLightManager(params) {
        return new GLXShadowLight({
            applicationName: params.applicationName,
            logEnabled: params.appStart.logEnabled ?? true,
            signalWorkspace: this.#signalWorkspace.shadowLight,
            settings: params.appStart.shadowLightSetting
        });
    }

    /**
     * 
     * @param {GLXApplicationParams} params 
     * @returns 
     */
    #buildSpriteManager(params) {
        return new GLXSpriteManager({
            applicationName: params.applicationName,
            logEnabled: params.appStart.logEnabled ?? true
        })
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

    /**
     * 
     * @param {(spriteSignalWorkspace: GLXSpriteSignalWorkspace) => string} signalSelector 
     * @returns {string[]}
     */
    #getSpriteSignalPool(signalSelector) {
        return this.#spriteManager.getAllSprites()
            .map(sprite => signalSelector(this.#signalWorkspace.sprite(sprite)));
    }

    /**
     * 
     * @param {ControlsRuntime} controlsRuntime 
     */
    #linkControls(controlsRuntime) {

        const updateCurrentSprite = (/** @type {(sprite: GLXSprite) => void} */ updateFn) => {
            if (controlsRuntime.currentSprite) {
                updateFn(controlsRuntime.currentSprite);
            } else {
                console.warn("Sprite update skipped: current sprite is not defined.");
            }
        };

        const handlers = {
            [GLXControlTypes.DRAW]: () => this.drawer.renderScene(),
            [GLXControlTypes.LOG]: (/** @type {boolean} */ value) => enableLoggingOn(value),
            [GLXControlTypes.RENDERING_MODE]: (/** @type {RenderingMode} */ value) => this.drawer.currentRenderingMode = value,
            [GLXControlTypes.CAM_MAN_WORK_MODE]: (/** @type {GLXCameraManWorkMode} */ value) => this.#cameraMan.hire(value),
            [GLXControlTypes.TARGET]: (/** @type {string} */ value) => {
                const sprite = this.#spriteManager.getSprite(value);
                if (isNotNullOrUndefined(sprite)) {
                    this.#cameraMan.targetSprite = sprite;
                } else {
                    alert(`selected sprite has not been found: ${value}`)
                }
            },

            [GLXControlTypes.CHASE]: (/** @type {boolean} */ value) => {
                value ? this.#cameraMan.chaseTargetSprite() : this.#cameraMan.unChaseSprite();
            },

            [GLXControlTypes.LOOK_AT]: (/** @type {boolean} */ value) => {
                value ? this.#cameraMan.lookAtTargetSprite() : this.#cameraMan.unLookAtSprite();
            },

            [GLXControlTypes.CAM_MAN_HIGH]: (/** @type {number} */ value) => this.#cameraMan.high = value,

            [GLXControlTypes.CAM_MAN_DISTANCE]: (/** @type {number} */ value) => this.#cameraMan.distance = value,
            [GLXControlTypes.CAM_MAN_PHASE]: (/** @type {number} */ value) => this.#cameraMan.phase = degrees(value),
            [GLXControlTypes.CAM_X]: (/** @type {number} */ value) => {
                this.#camera.position = this.#camera.position.transform(Math3D.setCoordinate(Axes.X, value));
            },
            [GLXControlTypes.CAM_Y]: (/** @type {number} */ value) => {
                this.#camera.position = this.#camera.position.transform(Math3D.setCoordinate(Axes.Y, value));
            },
            [GLXControlTypes.CAM_Z]: (/** @type {number} */ value) => {
                this.#camera.position = this.#camera.position.transform(Math3D.setCoordinate(Axes.Z, value));
            },
            [GLXControlTypes.CAM_UP_X]: (/** @type {number} */ value) => {
                const prevUp = this.#camera.up;
                this.#camera.up = trio(value, prevUp.second, prevUp.third);
            },
            [GLXControlTypes.CAM_UP_Y]: (/** @type {number} */ value) => {
                const prevUp = this.#camera.up;
                this.#camera.up = trio(prevUp.first, value, prevUp.third);
            },
            [GLXControlTypes.CAM_UP_Z]: (/** @type {number} */ value) => {
                const prevUp = this.#camera.up;
                this.#camera.up = trio(prevUp.first, prevUp.second, value);
            },
            [GLXControlTypes.Z_NEAR]: (/** @type {number} */ value) => this.#camera.zNear = value,
            [GLXControlTypes.Z_FAR]: (/** @type {number} */ value) => this.#camera.zFar = value,
            [GLXControlTypes.FOV]: (/** @type {number} */ value) => this.#camera.fov = degrees(value),
            [GLXControlTypes.TARGET_X]: (/** @type {number} */ value) => {
                this.#camera.targetPosition = this.#camera.targetPosition.transform(Math3D.setCoordinate(Axes.X, value));
            },
            [GLXControlTypes.TARGET_Y]: (/** @type {number} */ value) => {
                this.#camera.targetPosition = this.#camera.targetPosition.transform(Math3D.setCoordinate(Axes.Y, value));
            },
            [GLXControlTypes.TARGET_Z]: (/** @type {number} */ value) => {
                this.#camera.targetPosition = this.#camera.targetPosition.transform(Math3D.setCoordinate(Axes.Z, value));
            },
            [GLXControlTypes.SHADOWS]: (/** @type {boolean} */ value) => this.#shadowLightManager.isShadowEnabled = value,
            [GLXControlTypes.FRUSTUM]: (/** @type {boolean} */ value) => this.#shadowLightManager.lightFrustum = value,
            [GLXControlTypes.LIGHT_X]: (/** @type {number} */ value) => {
                this.#shadowLightManager.lightPosition =
                    this.#shadowLightManager.lightPosition.transform(Math3D.setCoordinate(Axes.X, value));
            },
            [GLXControlTypes.LIGHT_Y]: (/** @type {number} */ value) => {
                this.#shadowLightManager.lightPosition =
                    this.#shadowLightManager.lightPosition.transform(Math3D.setCoordinate(Axes.Y, value));
            },
            [GLXControlTypes.LIGHT_Z]: (/** @type {number} */ value) => {
                this.#shadowLightManager.lightPosition =
                    this.#shadowLightManager.lightPosition.transform(Math3D.setCoordinate(Axes.Z, value));
            },
            [GLXControlTypes.LIGHT_TARGET_X]: (/** @type {number} */ value) => {
                this.#shadowLightManager.lightTarget =
                    this.#shadowLightManager.lightTarget.transform(Math3D.setCoordinate(Axes.X, value));
            },
            [GLXControlTypes.LIGHT_TARGET_Y]: (/** @type {number} */ value) => {
                this.#shadowLightManager.lightTarget =
                    this.#shadowLightManager.lightTarget.transform(Math3D.setCoordinate(Axes.Y, value));
            },
            [GLXControlTypes.LIGHT_TARGET_Z]: (/** @type {number} */ value) => {
                this.#shadowLightManager.lightTarget =
                    this.#shadowLightManager.lightTarget.transform(Math3D.setCoordinate(Axes.Z, value));
            },
            [GLXControlTypes.LIGHT_UP_X]: (/** @type {number} */ value) => {
                let prevUp = this.#shadowLightManager.lightUp;
                this.#shadowLightManager.lightUp = trio(value, prevUp.second, prevUp.third);
            },
            [GLXControlTypes.LIGHT_UP_Y]: (/** @type {number} */ value) => {
                let prevUp = this.#shadowLightManager.lightUp;
                this.#shadowLightManager.lightUp = trio(prevUp.first, value, prevUp.third);
            },
            [GLXControlTypes.LIGHT_UP_Z]: (/** @type {number} */ value) => {
                let prevUp = this.#shadowLightManager.lightUp;
                this.#shadowLightManager.lightUp = trio(prevUp.first, prevUp.second, value);
            },
            [GLXControlTypes.LIGHT_FOV]: (/** @type {number} */ value) => this.#shadowLightManager.lightFov = degrees(value),
            [GLXControlTypes.LIGHT_NEAR]: (/** @type {number} */ value) => this.#shadowLightManager.lightNear = value,
            [GLXControlTypes.LIGHT_FAR]: (/** @type {number} */ value) => this.#shadowLightManager.lightFar = value,
            [GLXControlTypes.BIAS]: (/** @type {number} */ value) => this.#shadowLightManager.bias = value,
            [GLXControlTypes.SPOTLIGHT]: (/** @type {boolean} */ value) => this.#shadowLightManager.isSpotlight = value,
            [GLXControlTypes.LIGHT_WIDTH]: (/** @type {number} */ value) => this.#shadowLightManager.projectionWidth = value,
            [GLXControlTypes.LIGHT_HEIGHT]: (/** @type {number} */ value) => this.#shadowLightManager.projectionHeight = value,
            [GLXControlTypes.CURR_SPRITE]: (/** @type {string} */ value) => {
                const sprite = this.#spriteManager.getSprite(value);
                if (isNotNullOrUndefined(sprite)) {
                    controlsRuntime.currentSprite = sprite;
                    sprite.emitInformationSignal();
                } else {
                    alert(`unable to set current sprite: missing sprite named ${value}`);
                }
            },
            [GLXControlTypes.HIDDEN]: (/** @type {boolean} */ value) => updateCurrentSprite(sprite => sprite.hidden = value),
            [GLXControlTypes.SPRITE_X]: (/** @type {number} */ value) => updateCurrentSprite(sprite => {
                sprite.position = sprite.position.transform(Math3D.setCoordinate(Axes.X, value));
            }),
            [GLXControlTypes.SPRITE_Y]: (/** @type {number} */ value) => updateCurrentSprite(sprite => {
                sprite.position = sprite.position.transform(Math3D.setCoordinate(Axes.Y, value));
            }),
            [GLXControlTypes.SPRITE_Z]: (/** @type {number} */ value) => updateCurrentSprite(sprite => {
                sprite.position = sprite.position.transform(Math3D.setCoordinate(Axes.Z, value));
            }),
            [GLXControlTypes.SPRITE_SCALE_X]: (/** @type {number} */ value) => updateCurrentSprite(sprite => {
                sprite.scale = trio(value, sprite.scale.second, sprite.scale.third);
            }),
            [GLXControlTypes.SPRITE_SCALE_Y]: (/** @type {number} */ value) => updateCurrentSprite(sprite => {
                sprite.scale = trio(sprite.scale.first, value, sprite.scale.third);
            }),
            [GLXControlTypes.SPRITE_SCALE_Z]: (/** @type {number} */ value) => updateCurrentSprite(sprite => {
                sprite.scale = trio(sprite.scale.first, sprite.scale.second, value);
            }),
            [GLXControlTypes.SPRITE_PSI]: (/** @type {number} */ value) => updateCurrentSprite(sprite => {
                sprite.rotation = trio(degrees(value), sprite.rotation.second, sprite.rotation.third);
            }),
            [GLXControlTypes.SPRITE_THETA]: (/** @type {number} */ value) => updateCurrentSprite(sprite => {
                sprite.rotation = trio(sprite.rotation.first, degrees(value), sprite.rotation.third);
            }),
            [GLXControlTypes.SPRITE_PHI]: (/** @type {number} */ value) => updateCurrentSprite(sprite => {
                sprite.rotation = trio(sprite.rotation.first, sprite.rotation.second, degrees(value));
            })
        };

        SIGNALS.subscribe(this.#signalWorkspace.controls, signal => {
            /** @type {GLXControlInfo} */ let controlInfo = signal.data;
            const handler = handlers[controlInfo.type];
            if (handler) {
                // @ts-ignore
                handler(controlInfo.value);
            } else {
                console.warn(`Unhandled control type: ${controlInfo.type}`);
            }
        });
    }

    /**
     * 
     * @param {GLXControlHandlerClass[]} controlHandlerClasses
     */
    #setupControls(controlHandlerClasses) {
        SIGNALS.subscribe(this.#signalWorkspace.main, (/** @type {Signal<GLXApplicationInfoType>} */ signal) => {
            if (signal.data == GLXApplicationInfoTypes.BOOTED) {
                /** @type {ControlsRuntime} */
                let controlsRuntime = {
                    currentSprite: this.#spriteManager.getFirstSprite()
                }

                let controlsSignalDescriptor = SIGNALS.register(this.#signalWorkspace.controls);
                this.#linkControls(controlsRuntime);

                /** @type {GLXControlHandlerParams} */
                let controlHandlerParams = Object.freeze({
                    applicatioName: this.#applicationName,
                    canvas: this.#glxEnvironment.canvas,
                    controls: this.#buildGuiControls(controlsRuntime, this.#spriteManager.getAllSprites()),
                    controlsSignalDescriptor: controlsSignalDescriptor
                });

                for (let controlHandlerClass of controlHandlerClasses) {
                    /** @type {GLXControlHandler} */ let controlHandler = new controlHandlerClass();
                    controlHandler.setup(controlHandlerParams);
                    this.#logger.info(`controls handler '${controlHandlerClass.name}' has been setup`)
                }
            }
        })
    }
}

export class GLXCameraMan {

    /** @type {import("./signals").SubscriptionToken|null} */ #chaseSpriteSubscriptionToken = null;
    /** @type {import("./signals").SubscriptionToken|null} */ #chaseSpriteRotationSubscriptionToken = null;
    /** @type {import("./signals").SubscriptionToken|null} */ #lookAtSpriteSubscriptionToken = null;

    /** @type {GLXCamera} */ #camera;
    /** @type {Logger} */ #logger;
    /** @type {GLXCameraManSignalDescriptors} */ #signalDescriptors;

    /** @type {GLXCameraManSettings} */ #settings;

    /**
     * 
     * @param {GLXCameraManConstructorParams} params
     */
    constructor(params) {
        // @ts-ignore
        this.#camera = params.camera;
        this.#signalDescriptors = this.#buildSignalDescriptor(params.signalWorkspace);

        this.#settings = {
            distance: 50,
            high: 5,
            isChasingSprite: false,
            isLookingAtSprite: false,
            phase: radians(0),
            targetSprite: null,
            workMode: GLXCameraManWorkModes.DISMISSED,
            ...params.settings
        }

        this.#logger = Logger.forName(`CameraMan[${params.applicationName}]`)
            .enabledOn(params.logEnabled);
        this.#logger.info('camera man started');
    }

    get distance() {
        return this.#settings.distance;
    }

    get high() {
        return this.#settings.high;
    }

    get isChasingSprite() {
        return isNotNullOrUndefined(this.#chaseSpriteSubscriptionToken);
    }

    get isHired() {
        return this.#settings.workMode !== GLXCameraManWorkModes.DISMISSED;
    }

    get isLookingAtSprite() {
        return isNotNullOrUndefined(this.#lookAtSpriteSubscriptionToken);
    }

    get phase() {
        return this.#settings.phase;
    }

    get targetSprite() {
        // @ts-ignore
        return this.#settings.targetSprite
    }

    get workMode() {
        return this.#settings.workMode;
    }

    /**
     * @param {number} nextDistance 
     */
    set distance(nextDistance) {
        let previous = this.#settings.distance;
        if (nextDistance !== previous) {
            this.#settings.distance = nextDistance;
            this.#signalDescriptors.distanceChanges.trigger({
                data: change(nextDistance, previous)
            });

            if (this.isHired) {
                this.#autoSet();
            }
        }
    }

    /**
     * @param {number} nextHigh 
     */
    set high(nextHigh) {
        let previous = this.#settings.high;
        if (nextHigh !== previous) {
            this.#settings.high = nextHigh;
            this.#signalDescriptors.highChanges.trigger({
                data: change(nextHigh, previous)
            })
            if (this.isHired) {
                this.#autoSet();
            }
        }
    }

    /**
     * @param {Angle} nextPhase 
     */
    set phase(nextPhase) {
        let previous = this.#settings.phase;
        if (nextPhase !== previous) {
            this.#settings.phase = nextPhase;
            this.#signalDescriptors.phaseChanges.trigger({
                data: change(nextPhase, previous)
            })
            if (this.isHired) {
                this.#autoSet();
            }
        }
    }

    /**
     * @param {GLXSprite | null} nextLookedSprite
     */
    set targetSprite(nextLookedSprite) {
        let previousLookedSprite = this.#settings.targetSprite;
        if (nextLookedSprite !== previousLookedSprite) {
            this.#settings.targetSprite = nextLookedSprite

            this.#signalDescriptors.targetSpriteChanges.trigger({
                data: change(nextLookedSprite, previousLookedSprite)
            });

            if (this.isHired) {
                this.#autoSet();
            }

            this.#logger.info(`set target sprite ${nextLookedSprite?.name}`);
        }
    }

    /**
     * 
     * @returns {GLXCameraMan}
     */
    chaseTargetSprite() {
        this.#customWorkMode();
        if (isNotNullOrUndefined(this.#settings.targetSprite)) {
            if (this.isChasingSprite) {
                this.unChaseSprite();
            }

            if (!this.isLookingAtSprite) {
                this.lookAtTargetSprite();
            }

            this.chaseSpriteSubscriptionToken = SIGNALS.subscribe(this.#settings.targetSprite.signalWorkspace.positionChange,
                this.#chaseSpriteSignalConsumer.bind(this));
            this.#signalDescriptors.isChasingSpriteChanges.trigger({
                data: change(true, false)
            });
        } else {
            this.#logger.warn(`wanted to chase sprite, but no target was set`)
        }

        return this;
    }

    dismiss() {
        if (this.#settings.workMode !== GLXCameraManWorkModes.DISMISSED) {
            this.unChaseSprite();
            this.unLookAtSprite();
            this.#unsubscribeFromChaseSpriteRotationSignal();
        }

        this.#setWorkMode(GLXCameraManWorkModes.DISMISSED);
        return this;
    }

    /**
     * 
     * @param {GLXCameraManWorkMode} workMode 
     */
    hire(workMode) {
        if (isNullOrUndefined(this.#settings.targetSprite)) {
            throw new Error('target sprite was not set, cannot hire')
        }

        this.dismiss();
        if (this.#settings.workMode !== workMode && isNotNullOrUndefined(this.#settings.targetSprite)) {
            this.#logger.info(`hiring [workMode: ${workMode}]`);
            switch (workMode) {
                case GLXCameraManWorkModes.FIRST_PERSON:
                    this.#chaseSpriteSubscriptionToken = SIGNALS.subscribe(this.#settings.targetSprite.signalWorkspace.positionChange,
                        this.#workFirstPerson.bind(this));
                    this.#chaseSpriteRotationSubscriptionToken = SIGNALS.subscribe(this.#settings.targetSprite.signalWorkspace.rotationChange,
                        this.#workFirstPerson.bind(this));
                    this.#workFirstPerson();
                    break;
                case GLXCameraManWorkModes.OVER:
                    this.#chaseSpriteSubscriptionToken = SIGNALS.subscribe(this.#settings.targetSprite.signalWorkspace.positionChange,
                        this.#workOver.bind(this));
                    this.#workOver();
                    break;
                case GLXCameraManWorkModes.THIRD_PERSON:
                    this.#chaseSpriteSubscriptionToken = SIGNALS.subscribe(this.#settings.targetSprite.signalWorkspace.positionChange,
                        this.#workThirdPerson.bind(this));
                    this.#chaseSpriteRotationSubscriptionToken = SIGNALS.subscribe(this.#settings.targetSprite.signalWorkspace.rotationChange,
                        this.#workThirdPerson.bind(this));
                    this.#workThirdPerson();
                    break;
                default:
                    this.#logger.warn(`unable to hire with mode '${workMode}': dismissing`);
                    workMode = GLXCameraManWorkModes.DISMISSED
            }

            this.#setWorkMode(workMode);
        }
    }

    /**
     * 
     * @returns {GLXCameraMan}
     */
    lookAtTargetSprite() {
        this.#customWorkMode;
        if (isNotNullOrUndefined(this.#settings.targetSprite)) {
            if (this.isLookingAtSprite) {
                this.unLookAtSprite();
            }

            this.lookAtSpriteSubscriptionToken = SIGNALS.subscribe(this.#settings.targetSprite.signalWorkspace.positionChange,
                this.#lookAtSpriteSignalConsumer.bind(this));
            this.#signalDescriptors.isLookingAtSpriteChanges.trigger({
                data: change(true, false)
            })
        } else {
            this.#logger.warn(`wanted to look at sprite, but the given one is null and no target was set`);
        }

        return this;
    }


    /**
     * @returns {GLXCameraMan}
     */
    unChaseSprite() {
        if (this.isChasingSprite) {
            this.#unsubscribeFromChaseSpriteSignal();
            this.#signalDescriptors.isChasingSpriteChanges.trigger({
                data: change(false, true)
            })
        }

        return this;
    }

    /**
     * @returns {GLXCameraMan}
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
        switch (this.#settings.workMode) {
            case GLXCameraManWorkModes.FIRST_PERSON:
                this.#workFirstPerson();
                break;
            case GLXCameraManWorkModes.OVER:
                this.#workOver();
                break;
            case GLXCameraManWorkModes.THIRD_PERSON:
                this.#workThirdPerson();
                break;
            default:
                this.#logger.warn(`unable to autoset with work mode ${this.#settings.workMode}`);
        }
    }

    /**
     * 
     * @param {GLXCameraManSignalWorkspace} signalWorkspace 
     * @returns {GLXCameraManSignalDescriptors}
     */
    #buildSignalDescriptor(signalWorkspace) {
        return {
            distanceChanges: SIGNALS.register(signalWorkspace.distanceChanges),
            highChanges: SIGNALS.register(signalWorkspace.highChanges),
            isLookingAtSpriteChanges: SIGNALS.register(signalWorkspace.isLookingAtSpriteChanges),
            isChasingSpriteChanges: SIGNALS.register(signalWorkspace.isChasingSpriteChanges),
            phaseChanges: SIGNALS.register(signalWorkspace.phaseChanges),
            targetSpriteChanges: SIGNALS.register(signalWorkspace.targetSpriteChanges),
            workModeChanges: SIGNALS.register(signalWorkspace.workModeChanges)
        }
    }

    /**
     * 
     * @param {import("./signals").Signal<import("./glx-model").PositionChange>} signal 
     */
    #chaseSpriteSignalConsumer(signal) {
        let vector3D = changeToVector3D(signal.data);
        this.#camera.position = this.#camera.position.transform(
            Math3D.translate(vector3D.dx, vector3D.dy, vector3D.dz));
    }

    #customWorkMode() {
        if (this.#settings.workMode !== GLXCameraManWorkModes.DISMISSED && this.#settings.workMode !== GLXCameraManWorkModes.CUSTOM) {
            this.dismiss();
        }

        this.#setWorkMode(GLXCameraManWorkModes.CUSTOM);
    }

    /**
     * 
     * @param {import("./signals").Signal<import("./glx-model").PositionChange>} signal 
     */
    #lookAtSpriteSignalConsumer(signal) {
        this.#camera.targetPosition = signal.data.to
    }

    /**
     * 
     * @param {GLXCameraManWorkMode} workMode 
     */
    #setWorkMode(workMode) {
        if (workMode !== this.#settings.workMode) {
            let workModeChange = change(workMode, this.#settings.workMode);
            this.#settings.workMode = workMode;
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
        if (isNotNullOrUndefined(this.#settings.targetSprite)) {
            this.#logger.info(`setting up first person [sprite: ${this.#settings.targetSprite.name}]`);
            let targetPosition = this.#settings.targetSprite.position;
            let angle = this.#settings.targetSprite.rotation.third.radiansValue
                + this.#settings.phase.radiansValue;
            this.#camera.position = targetPosition.transform(Math3D.translate(
                5 * Math.cos(angle),
                5 * Math.sin(angle),
                this.#settings.high
            ));
            this.#camera.targetPosition = targetPosition.transform(Math3D.translate(
                10 * Math.cos(angle),
                10 * Math.sin(angle),
                this.#settings.high
            ));
            this.#camera.up = trio(0, 0, 1);
        } else {
            this.#logger.error('unable to setup first person mode: no target was set')
        }
    }

    #workOver() {
        if (isNotNullOrUndefined(this.#settings.targetSprite)) {
            this.#logger.info(`setting up over [sprite: ${this.#settings.targetSprite.name}]`);
            let targetPosition = this.#settings.targetSprite.position;
            this.#camera.position = targetPosition.transform(Math3D.translate(
                0,
                0,
                this.#settings.distance
            ));
            this.#camera.targetPosition = targetPosition;
            this.#camera.up = trio(1, 0, 0);
        } else {
            this.#logger.error('unable to setup over mode: no target was set')
        }
    }

    #workThirdPerson() {
        if (isNotNullOrUndefined(this.#settings.targetSprite)) {
            let targetPosition = this.#settings.targetSprite.position;
            let angle = this.#settings.targetSprite.rotation.third.radiansValue
                + this.#settings.phase.radiansValue;
            this.#camera.position = targetPosition.transform(Math3D.translate(
                - this.#settings.distance * Math.cos(angle),
                - this.#settings.distance * Math.sin(angle),
                this.#settings.high
            ));
            this.#camera.targetPosition = targetPosition.transform(Math3D.translate(
                10 * Math.cos(angle),
                10 * Math.sin(angle),
                this.#settings.high
            ));
            this.#camera.up = trio(0, 0, 1);
        } else {
            this.#logger.error('unable to setup third person mode: no target was set')
        }
    }
}

class GLXDrawer {
    /** @type {GLXApplicationSignalWorkspace} */ #applicationSignalWorkspace;
    /** @type {Logger} */ #logger
    /** @type {RenderingMode} */ #renderingMode;
    /** @type {GLXDrawerSignalDescriptor} */ #signalDescriptor;
    /** @type {import("./glx-core").GLXSpriteManager} */ #spriteManager;
    /** @type {Map<string, SubscriptionToken[]>} */ #spriteSubscriptions;

    /** @type {THREE.Scene} */ #threeScene;
    /** @type {THREE.AmbientLight} */ #threeAmbientLight;
    /** @type {THREE.SpotLight} */ #threeSpotLight;
    /** @type {boolean} */ #isSpotlightAdded;
    /** @type {THREE.PerspectiveCamera} */ #threeCamera;
    /** @type {THREE.WebGLRenderer} */ #threeRenderer;

    /**
     * 
     * @param {GLXDrawerConstructorParams} params 
     */
    constructor(params) {
        this.#logger = Logger.forName(`GLXDrawer[${params.applicationName}]`)
            .enabledOn(params.logEnabled);

        this.#applicationSignalWorkspace = params.applicationSignalWorkspace;
        this.#signalDescriptor = this.#buildSignalDescriptor(this.#applicationSignalWorkspace);
        this.#renderingMode = params.renderingMode ?? RenderingModes.HYBRID;
        this.#spriteManager = params.spriteManager;
        this.#spriteSubscriptions = new Map();
        this.#renderingMode = params.renderingMode;

        this.#threeScene = new THREE.Scene();
        this.#threeCamera = this.#buildThreeCamera(params);
        this.#threeRenderer = this.#buildThreeRenderer(params);

        this.#threeAmbientLight = this.#buildThreeAmbientLight(params);
        this.#threeScene.add(this.#threeAmbientLight);

        this.#isSpotlightAdded = params.shadowLightManager.isSpotlight;
        this.#threeSpotLight = this.#buildThreeSpotLight(params);
        if (this.#isSpotlightAdded) {
            this.#threeScene.add(this.#threeSpotLight);
        }

        this.#setupAutoRender();


        SIGNALS.subscribe(params.applicationSignalWorkspace.main, (signal) => {
            if (signal.data == GLXApplicationInfoTypes.BOOTED) {
                this.renderScene();
            }
        });

        if (this.#renderingMode === RenderingModes.HYBRID) {
            this.renderLoop();
        }
    }

    get currentRenderingMode() {
        return this.#renderingMode;
    }

    /**
     * @param {RenderingMode} newRenderingMode 
     */
    set currentRenderingMode(newRenderingMode) {
        setSignaledProperty({
            propertyGetter: () => this.#renderingMode,
            propertySetter: (value) => this.#renderingMode = value,
            signalDescriptor: this.#signalDescriptor.renderingModeChange,
            nextValue: newRenderingMode
        });

        if (newRenderingMode === RenderingModes.HYBRID) {
            this.renderLoop();
        }
    }

    renderLoop() {
        this.renderScene();

        if (this.#renderingMode === RenderingModes.HYBRID) {
            requestAnimationFrame(this.renderLoop.bind(this));
        } else {
            this.#logger.info("render loop off");
        }
    }

    renderScene() {
        console.log('AAAAAA', this.#threeScene)
        this.#threeRenderer.render(this.#threeScene, this.#threeCamera);
        this.#logger.info('render complete');
    }

    /**
     * 
     * @param {GLXApplicationSignalWorkspace} applicationSignalWorkspace 
     * @returns {GLXDrawerSignalDescriptor}
     */
    #buildSignalDescriptor(applicationSignalWorkspace) {
        return {
            renderingModeChange: SIGNALS.register(applicationSignalWorkspace.drawer.renderingModeChange)
        }
    }

    /**
     * 
     * @param {GLXDrawerConstructorParams} params 
     * @returns {THREE.AmbientLight}
     */
    #buildThreeAmbientLight(params) {
        let light = new THREE.AmbientLight();
        return light;
    }

    /**
     * 
     * @param {GLXDrawerConstructorParams} params 
     * @returns {THREE.PerspectiveCamera}
     */
    #buildThreeCamera(params) {
        let camera = new THREE.PerspectiveCamera(
            params.camera.fov.radiansValue, params.glxEnvironment.aspectRatio, params.camera.zNear, params.camera.zFar);
        camera.position.x = params.camera.position.x;
        camera.position.y = params.camera.position.y;
        camera.position.z = params.camera.position.z;
        camera.lookAt(params.camera.targetPosition.x, params.camera.targetPosition.y, params.camera.targetPosition.z);
        camera.up.x = params.camera.up.first;
        camera.up.y = params.camera.up.second;
        camera.up.z = params.camera.up.third;

        return camera;
    }

    /**
     * 
     * @param {GLXDrawerConstructorParams} params 
     * @returns {THREE.WebGLRenderer}
     */
    #buildThreeRenderer(params) {
        let renderer = new THREE.WebGLRenderer({
            canvas: params.glxEnvironment.canvas,
            context: params.glxEnvironment.glContext
        });

        renderer.setClearColor(new THREE.Color(0x000000));
        return renderer;
    }

    /**
     * 
     * @param {GLXDrawerConstructorParams} params 
     * @returns {THREE.SpotLight}
     */
    #buildThreeSpotLight(params) {
        let light = new THREE.SpotLight();

        light.position.x = params.shadowLightManager.lightPosition.x;
        light.position.y = params.shadowLightManager.lightPosition.y;
        light.position.z = params.shadowLightManager.lightPosition.z;
        light.target.position.x = params.shadowLightManager.lightTarget.x;
        light.target.position.y = params.shadowLightManager.lightTarget.y;
        light.target.position.z = params.shadowLightManager.lightTarget.z;
        light.up.set(params.shadowLightManager.lightUp.first,
            params.shadowLightManager.lightUp.second,
            params.shadowLightManager.lightUp.third);
        light.shadow.camera.near = params.shadowLightManager.lightNear;
        light.shadow.camera.far = params.shadowLightManager.lightFar;
        light.castShadow = params.shadowLightManager.isShadowEnabled;
        light.shadow.bias = params.shadowLightManager.bias;

        return light;
    }

    #renderOnSignal() {
        if (this.#renderingMode === RenderingModes.SIGNAL) {
            this.renderScene();
        }
    }

    #setupAutoRender() {
        this.#setupAutoRenderForCamera();
        this.#setupAutoRenderForShadownLight();
        this.#setupAutoRenderForSprites();
        this.#logger.info('auto render setup complete');
    }

    #setupAutoRenderForShadownLight() {
        let lightSignals = this.#applicationSignalWorkspace.shadowLight;

        SIGNALS.subscribe(lightSignals.bias, (/** @type {Signal<Change<number>} */ signal) => {
            this.#threeSpotLight.shadow.bias = signal.data.to;
            this.#renderOnSignal();
        });

        SIGNALS.subscribe(lightSignals.isShadowEnabled, (/** @type {Signal<Change<boolean>} */ signal) => {
            this.#threeSpotLight.castShadow = signal.data.to;
            this.#renderOnSignal();
        });

        SIGNALS.subscribe(lightSignals.isSpotlight, (/** @type {Signal<Change<boolean>} */ signal) => {
            let isSpotlight = signal.data.to;
            if (isSpotlight && !(this.#isSpotlightAdded)) {
                this.#threeScene.add(this.#threeSpotLight);
                this.#isSpotlightAdded = true;
            }

            if (!isSpotlight && this.#isSpotlightAdded) {
                this.#threeScene.remove(this.#threeSpotLight);
                this.#isSpotlightAdded = false;
            }
            this.#renderOnSignal();
        });

        SIGNALS.subscribe(lightSignals.lightPosition, (/** @type {Signal<Change<Point3D>>} */ signal) => {
            let position = signal.data.to;
            this.#threeSpotLight.position.x = position.x;
            this.#threeSpotLight.position.y = position.y;
            this.#threeSpotLight.position.z = position.z;
            this.#renderOnSignal();
        });

        SIGNALS.subscribe(lightSignals.lightTarget, (/** @type {Signal<Change<Point3D>>} */ signal) => {
            let target = signal.data.to;
            this.#threeSpotLight.target.position.x = target.x;
            this.#threeSpotLight.target.position.y = target.y;
            this.#threeSpotLight.target.position.z = target.z;
            this.#renderOnSignal();
        });

        SIGNALS.subscribe(lightSignals.lightFar, (/** @type {Signal<Change<number>>} */ signal) => {
            this.#threeSpotLight.shadow.camera.far = signal.data.to;
            this.#renderOnSignal();
        });

        SIGNALS.subscribe(lightSignals.lightNear, (/** @type {Signal<Change<number>>} */ signal) => {
            this.#threeSpotLight.shadow.camera.near = signal.data.to;
            this.#renderOnSignal();
        });

        SIGNALS.subscribe(lightSignals.lightDirection, (/** @type {Signal<Change<number>>} */ signal) => {
            this.#threeSpotLight.shadow.camera.near = signal.data.to;
            this.#renderOnSignal();
        });

        this.#logger.info('shadow light signal subscribed');
    }

    #setupAutoRenderForCamera() {
        let cameraSignals = this.#applicationSignalWorkspace.camera;
        SIGNALS.subscribe(cameraSignals.fovChanges, (/** @type {Signal<Change<Angle>>} */ signal) => {
            this.#threeCamera.fov = signal.data.to.radiansValue;
            this.#threeCamera.updateProjectionMatrix();
            this.#renderOnSignal();
        });

        SIGNALS.subscribe(cameraSignals.zNearChanges, (/** @type {Signal<Change<number>>} */ signal) => {
            this.#threeCamera.near = signal.data.to;
            this.#threeCamera.updateProjectionMatrix();
            this.#renderOnSignal();
        });

        SIGNALS.subscribe(cameraSignals.zFarChanges, (/** @type {Signal<Change<number>>} */ signal) => {
            this.#threeCamera.far = signal.data.to
            this.#threeCamera.updateProjectionMatrix();
            this.#renderOnSignal();
        });

        SIGNALS.subscribe(cameraSignals.positionChanges, (/** @type {Signal<Change<Point3D>>} */ signal) => {
            let position = signal.data.to;
            this.#threeCamera.position.x = position.x;
            this.#threeCamera.position.y = position.y;
            this.#threeCamera.position.z = position.z;
            this.#renderOnSignal();
        });

        SIGNALS.subscribe(cameraSignals.targetChanges, (/** @type {Signal<Change<Point3D>>} */ signal) => {
            let target = signal.data.to;
            this.#threeCamera.lookAt(target.x, target.y, target.z);
            this.#renderOnSignal();
        });

        SIGNALS.subscribe(cameraSignals.upChanges, (/** @type {Signal<Change<Trio<number>>>} */ signal) => {
            let up = signal.data.to
            this.#threeCamera.up.x = up.first;
            this.#threeCamera.up.y = up.second;
            this.#threeCamera.up.z = up.third;
            this.#renderOnSignal();
        });

        this.#logger.info('camera signal subscribed');
    }

    #setupAutoRenderForSprites() {
        SIGNALS.subscribe(this.#applicationSignalWorkspace.main, (signal) => {
            if (signal.data == GLXApplicationInfoTypes.ADDED_SPRITE) {
                for (let /** @type {GLXSpriteData} */ spriteData of this.#spriteManager.getAllGLXSpritesData()) {
                    /** @type {GLXSprite} */ let sprite = spriteData.sprite;
                    let spriteName = spriteData.sprite.name;
                    /** @type {THREE.Group} */ let threeNode = spriteData.glData();

                    if (isNotNullOrUndefined(threeNode) && !this.#spriteSubscriptions.has(spriteName)) {
                        threeNode.position.x = sprite.position.x;
                        threeNode.position.y = sprite.position.y;
                        threeNode.position.z = sprite.position.z;
                        threeNode.rotation.x = sprite.rotation.first.radiansValue;
                        threeNode.rotation.y = sprite.rotation.second.radiansValue;
                        threeNode.rotation.z = sprite.rotation.third.radiansValue;
                        threeNode.scale.x = sprite.scale.first;
                        threeNode.scale.y = sprite.scale.second;
                        threeNode.scale.z = sprite.scale.third;
                        threeNode.visible = !sprite.hidden;

                        this.#threeScene.add(threeNode);

                        /** @type {SubscriptionToken[]} */ let subscriptions = [];
                        let spriteSignalWorkspace = this.#applicationSignalWorkspace.spriteName(spriteName);
                        subscriptions.push(SIGNALS.subscribe(
                            spriteSignalWorkspace.positionChange, (/** @type {Signal<Change<Point3D>>} */ signal) => {
                                let position = signal.data.to;
                                threeNode.position.x = position.x;
                                threeNode.position.y = position.y;
                                threeNode.position.z = position.z;

                                this.#renderOnSignal();
                            }));

                        subscriptions.push(SIGNALS.subscribe(
                            spriteSignalWorkspace.rotationChange, (/** @type {Signal<Change<Trio<Angle>>>} */ signal) => {
                                let rotation = signal.data.to;
                                threeNode.rotation.x = rotation.first.radiansValue;
                                threeNode.rotation.y = rotation.second.radiansValue;
                                threeNode.rotation.z = rotation.third.radiansValue;

                                this.#renderOnSignal();
                            }));

                        subscriptions.push(SIGNALS.subscribe(
                            spriteSignalWorkspace.scaleChange, (/** @type {Signal<Change<Trio<Number>>>} */ signal) => {
                                let rotation = signal.data.to;
                                threeNode.scale.x = rotation.first;
                                threeNode.scale.y = rotation.second;
                                threeNode.scale.z = rotation.third;

                                this.#renderOnSignal();
                            }));

                        subscriptions.push(SIGNALS.subscribe(
                            spriteSignalWorkspace.hiddenChange, (/** @type {Signal<Change<boolean>>} */ signal) => {
                                threeNode.visible = !signal.data.to;

                                this.#renderOnSignal();
                            }));

                        this.#spriteSubscriptions.set(spriteName, subscriptions);
                        this.#logger.info(`signal of sprite '${spriteName}' subscribed`);
                    }
                }
            }
        });
    }
}

class GLXEnvironment {
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
     * @param {Map<string, WebGLShader[]>} shaders
     * @returns {Map<string, ProgramInfo>}
     */
    #buildProgramInfos(shaders) {
        /** @type {Map<string, ProgramInfo>}*/
        let programInfos = new Map();

        shaders.forEach((value, key) => {
            // @ts-ignore
            programInfos.set(key, webglUtils.createProgramInfo(this.#gl, value));
        });


        return programInfos;
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
        let gl = this.#canvas.getContext('webgl2');
        if (gl !== null) {
            return gl;
        }

        throw alertedError('Unable to initialize WebGL. Your browser may not support it');
    }

}

class GLXSpriteManager {
    /** @type {string} */ #applicationName;
    /** @type {Logger} */ #log;
    /** @type {Map<string, GLXSpriteData>} */ #spritesByName;

    /**
     *
     * @param {GLXSpriteManagerConstructorParams} params
     */
    constructor(params) {
        this.#applicationName = params.applicationName;
        this.#log = Logger.forName('SpriteManager[' + params.applicationName + ']')
            .enabledOn(params.logEnabled);
        this.#spritesByName = new Map();
    }

    /**
     *
     * @param {GLXSpriteCreation} spriteCreation 
     * @returns {GLXSprite}
     */
    createSprite(spriteCreation) {
        this.#log.info('create sprite [name: ' + spriteCreation.name + ', applicationName: ' + this.#applicationName + ']');

        /** @type {GLXSprite} */
        let sprite = new GLXSprite({
            name: spriteCreation.name,
            applicationName: this.#applicationName,
            signalWorkspace: spriteCreation.signalWorkspace,
            settings: spriteCreation.settings
        });
        this.#spritesByName.set(spriteCreation.name, Object.freeze({
            sprite: sprite,
            glData: spriteCreation.glData
        }));

        return sprite;
    }

    /**
     *
     * @returns {GLXSpriteData[]}
     */
    getAllGLXSpritesData() {
        return new Array(...this.#spritesByName.values());
    }

    /**
     * 
     * @returns {GLXSprite[]}
     */
    getAllSprites() {
        // @ts-ignore
        return this.getAllGLXSpritesData().map(glxSprite => glxSprite.sprite);
    }

    /**
     * 
     * @returns {GLXSprite|undefined}
     */
    getFirstSprite() {
        // @ts-ignore
        return this.#spritesByName.values().next().value?.sprite;
    }

    /**
     *
     * @param {string} name
     * @returns {GLXSpriteData|undefined}
     */
    getGLXSpriteData(name) {
        return this.#spritesByName.get(name);
    }

    /**
     * 
     * @param {string} name 
     * @returns {GLXSprite|undefined}
     */
    getSprite(name) {
        // @ts-ignore
        return this.getGLXSpriteData(name)?.sprite;
    }

}

const CAMERA_MAN_WORK_MODES = [
    GLXCameraManWorkModes.CUSTOM,
    GLXCameraManWorkModes.FIRST_PERSON,
    GLXCameraManWorkModes.THIRD_PERSON,
    GLXCameraManWorkModes.OVER,
    GLXCameraManWorkModes.DISMISSED
];

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
 * @param {Change<Point3D>} change 
 * @returns {Vector3D}
 */
function changeToVector3D(change) {
    return {
        dx: change.to.x - change.from.x,
        dy: change.to.y - change.from.y,
        dz: change.to.z - change.from.z
    };
}

/**
 * 
 * @param {string} canvasHtmlName 
 * @param {Map<string, string[]>} webGLShaders 
 * @returns {GLXEnvironment}
 */
function createWebglEnvironment(canvasHtmlName, webGLShaders) {
    let canvas = document.getElementById(canvasHtmlName);
    if (canvas == null) {
        alert("Unable to find the canvas with id: " + canvas);
        throw new Error("Unable to find the canvas with id: " + canvas);
    }
    return new GLXEnvironment(canvas, webGLShaders);
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
    return res;
}

/**
 * @param {GLXApplicationStart} appStart
 */
export function start(appStart) {
    let appName = appStart.applicationClass.prototype.constructor.name;
    let logger = Logger.forName(`GLXStart[${appName}]`).enabledOn(appStart.logEnabled ?? true);
    let glxEnv = createWebglEnvironment(appStart.canvasElementName, mapShaders(appStart.webGLShaders));
    let signalWorkspace = new GLXApplicationSignalWorkspace(appName);
    let mainSignalDescriptor = SIGNALS.register(signalWorkspace.main);

    /** @type {GLXApplicationParams} */ let params = {
        applicationName: appName,
        webGLXEnvironment: glxEnv,
        appStart: appStart,
        signalWorkspace: signalWorkspace,
        mainSignalDescriptor: mainSignalDescriptor,
        controlHandlerClasses: appStart.controlHandlerClasses ?? []

    }
    let app = new appStart.applicationClass(params);
    mainSignalDescriptor.trigger({ data: GLXApplicationInfoTypes.CONSTRUCTED });
    logger.info('application instantiated');

    let spriteLoaders = app.spriteLoaders;
    let loadedSprite = 0;
    let subscriptionToken = SIGNALS.subscribe(signalWorkspace.main, (/** @type {Signal<GLXApplicationInfoType>} */ signal) => {
        if (signal.data === GLXApplicationInfoTypes.ADDED_SPRITE) {
            loadedSprite++;
            if (loadedSprite === spriteLoaders.length) {
                SIGNALS.unsubscribe(subscriptionToken);
                if (isNotNullOrUndefined(app.main)) {
                    logger.info('running application main');
                    app.main();
                }

                mainSignalDescriptor.trigger({ data: GLXApplicationInfoTypes.BOOTED })
            }
        }
    });

    for (let spriteLoader of spriteLoaders) {
        spriteLoader();
    }
}

/**
 * 
 * @template T
 * @param {Trio<T>} trio 
 * @returns {T[]}
 */
function trioToJsVector(trio) {
    return [
        trio.first,
        trio.second,
        trio.third
    ];
}