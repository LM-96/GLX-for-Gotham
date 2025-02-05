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
    change,
    ifNotNullOrUndefined,
    isNotNullOrUndefined,
    isNullOrUndefined,
    pair,
    trio
} from "./glx-model.js";
import { 
    Logger, 
    enableLoggingOn,
    loggingEnabled 
} from "./logjsx.js";
import { SIGNALS } from "./signals.js";

/**
 * @template T
 * @typedef {import("./glx-model").Change<T>} Change
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
 * @typedef {import("./glx-model").GLXControlInfo} GLXControlInfo
 */

/**
 * @typedef {import("./glx-core").GLXControlsParams} GLXControlsParams
 */

/**
 * @typedef {import("./glx-core").GLXDrawerConstructorParams} GLXDrawerConstructorParams
 */

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
 * @typedef {import("./glx-model").GLXSpriteSignalWorkspace} GLXSpriteSignalWorkspace
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
    /** @type {GLXDrawer} */ #spriteDrawer;
    /** @type {GLXSpriteManager} */ #spriteManager;
    /** @type {GLXApplicationSignalWorkspace}*/ #signalWorkspace;

    /**
     * 
     * @param {GLXApplicationParams} params
     */
    constructor(params) {
        let logEnabled = params.appStart.logEnabled ?? true;
        this.#logger = Logger.forName('WebGLXApp[' + params.applicationName + ']').enabledOn(logEnabled);
        this.#applicationName = params.applicationName;
        this.#signalWorkspace = params.signalWorkspace;
        this.#mainSignalDescriptor = SIGNALS.register(this.#signalWorkspace.main);
        this.#camera = this.#buildCamera(params);
        this.#cameraMan = this.#buildCameraMan(params);
        this.#spriteManager = this.#buildSpriteManager(params);
        this.#shadowLightManager = this.#buildShadowLightManager(params);
        this.#glxEnvironment = params.webGLXEnvironment;
        this.#spriteDrawer = this.#buildDrawer(params);
        this.#setupControls(logEnabled);
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

    /**
     * 
     * @param {MeshSpriteLoad} load 
     */
    glxSprite(load) {
        let data = loadObjX(this.#glxEnvironment.glContext, load.name, load.path);
        this.#spriteDrawer.initSpriteData(data);
        let sprite = this.#spriteManager.createSprite({
            name: load.name,
            glData: data,
            signalWorkspace: this.#signalWorkspace.spriteName(load.name),
            settings: { ...load }
        })

        this.#logger.info('loaded mesh: ', load);
        this.#mainSignalDescriptor.trigger({ data: GLXApplicationInfoTypes.ADDED_SPRITE });
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
     * @param {GLXSprite[]} sprites 
     * @returns {GLXControl<any>[]}
     */
    #buildGuiControls(sprites) {
        const spriteNames = sprites.map(sprite => sprite.name);
        let currentSprite = isNotNullOrUndefined(spriteNames[0]) ? this.#spriteManager.getSprite(spriteNames[0]) : undefined;

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
                value: this.#cameraMan.phase.map(AngleMath.degreeValue()),
                min: -180,
                max: 180,
                step: 1,
                listenSignal: this.#signalWorkspace.cameraMan.phaseChanges,
                listenReducer: signal => signal.data.to.map(AngleMath.degreeValue()),
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
                value: this.#camera.fov.map(AngleMath.degreeValue()),
                min: 0,
                max: 180,
                listenSignal: this.#signalWorkspace.camera.zFarChanges,
                listenReducer: signal => signal.data.to.map(AngleMath.degreeValue),
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
                type: GLXControlTypes.LIGHT_FOV,
                value: this.#shadowLightManager.lightFov.map(AngleMath.degreeValue()),
                min: 0,
                max: 360,
                step: 1,
                listenSignal: this.#signalWorkspace.shadowLight.lightFov,
                listenReducer: signal => signal.data.to.map(AngleMath.degreeValue())
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
                value: currentSprite?.name,
                options: spriteNames,
            },
            {
                type: GLXControlTypes.HIDDEN,
                value: currentSprite?.hidden ?? false,
            },
            {
                type: GLXControlTypes.SPRITE_X,
                value: currentSprite?.position.x,
                min: -500,
                max: 500,
                step: 1,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.positionChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(currentSprite, spriteWorkspace => spriteWorkspace.positionChange),
                listenReducer: signal => signal.data.to.x
            },
            {
                type: GLXControlTypes.SPRITE_Y,
                value: currentSprite?.position.y,
                min: -500,
                max: 500,
                step: 1,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.positionChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(currentSprite, spriteWorkspace => spriteWorkspace.positionChange),
                listenReducer: signal => signal.data.to.y
            },
            {
                type: GLXControlTypes.SPRITE_Z,
                value: currentSprite?.position.z,
                min: -500,
                max: 500,
                step: 1,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.positionChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(currentSprite, spriteWorkspace => spriteWorkspace.positionChange),
                listenReducer: signal => signal.data.to.z
            },
            {
                type: GLXControlTypes.SPRITE_SCALE_X,
                value: currentSprite?.scale.first,
                min: 0,
                max: 10,
                step: 0.01,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.scaleChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(currentSprite, spriteWorkspace => spriteWorkspace.scaleChange),
                listenReducer: signal => signal.data.to.first
            },
            {
                type: GLXControlTypes.SPRITE_SCALE_Y,
                value: currentSprite?.scale.second,
                min: 0,
                max: 10,
                step: 0.01,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.scaleChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(currentSprite, spriteWorkspace => spriteWorkspace.scaleChange),
                listenReducer: signal => signal.data.to.second
            },
            {
                type: GLXControlTypes.SPRITE_SCALE_Z,
                value: currentSprite?.scale.third,
                min: 0,
                max: 10,
                step: 0.01,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.scaleChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(currentSprite, spriteWorkspace => spriteWorkspace.scaleChange),
                listenReducer: signal => signal.data.to.third
            },
            {
                type: GLXControlTypes.SPRITE_PSI,
                value: currentSprite?.rotation.first.map(AngleMath.degreeValue()),
                min: -180,
                max: 180,
                step: 0.1,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.rotationChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(currentSprite, spriteWorkspace => spriteWorkspace.rotationChange),
                listenReducer: signal => signal.data.to.first.map(AngleMath.degreeValue())
            },
            {
                type: GLXControlTypes.SPRITE_THETA,
                value: currentSprite?.rotation.second.map(AngleMath.degreeValue()),
                min: -180,
                max: 180,
                step: 0.1,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.rotationChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(currentSprite, spriteWorkspace => spriteWorkspace.rotationChange),
                listenReducer: signal => signal.data.to.second.map(AngleMath.degreeValue())
            },
            {
                type: GLXControlTypes.SPRITE_PHI,
                value: currentSprite?.rotation.third.map(AngleMath.degreeValue()),
                min: -180,
                max: 180,
                step: 0.1,
                listenSignalPool: this.#getSpriteSignalPool(spriteWorkspace => spriteWorkspace.rotationChange),
                listenSignalGuard: this.#buildCurrentSpriteSignalGuard(currentSprite, spriteWorkspace => spriteWorkspace.rotationChange),
                listenReducer: signal => signal.data.to.third.map(AngleMath.degreeValue())
            },
        ];
    }

    /**
     * 
     * @param {GLXSprite|undefined} currentSprite 
     * @param {(spriteSignalWorkspace: GLXSpriteSignalWorkspace) => string} signalSelector 
     * @returns {(signal: Signal<*>) => boolean}
     */
    #buildCurrentSpriteSignalGuard(currentSprite, signalSelector) {
        return signal =>
            isNotNullOrUndefined(currentSprite)
            && signal.name === signalSelector(this.#signalWorkspace.sprite(currentSprite));
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

    #linkControls() {
        let currentSprite = this.#spriteManager.getFirstSprite();

        const updateCurrentSprite = (/** @type {(sprite: GLXSprite) => void} */ updateFn) => {
            if (currentSprite) {
                updateFn(currentSprite);
            } else {
                console.warn("Sprite update skipped: current sprite is not defined.");
            }
        };

        const handlers = {
            [GLXControlTypes.DRAW]: () => this.#spriteDrawer.renderScene(),
            [GLXControlTypes.LOG]: (/** @type {boolean} */ value) => enableLoggingOn(value),
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
            [GLXControlTypes.LIGHT_FOV]: (/** @type {number} */ value) => this.#shadowLightManager.lightFov = degrees(value),
            [GLXControlTypes.LIGHT_NEAR]: (/** @type {number} */ value) => this.#shadowLightManager.lightNear = value,
            [GLXControlTypes.LIGHT_FAR]: (/** @type {number} */ value) => this.#shadowLightManager.lightFar = value,
            [GLXControlTypes.SPOTLIGHT]: (/** @type {boolean} */ value) => this.#shadowLightManager.isSpotlight = value,
            [GLXControlTypes.LIGHT_WIDTH]: (/** @type {number} */ value) => this.#shadowLightManager.projectionWidth = value,
            [GLXControlTypes.LIGHT_HEIGHT]: (/** @type {number} */ value) => this.#shadowLightManager.projectionHeight = value,
            [GLXControlTypes.CURR_SPRITE]: (/** @type {string} */ value) => {
                const sprite = this.#spriteManager.getSprite(value);
                if (isNotNullOrUndefined(sprite)) {
                    currentSprite = sprite;
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
     * @param {boolean} logEnabled 
     */
    #setupControls(logEnabled) {


        SIGNALS.subscribe(this.#signalWorkspace.main, (/** @type {Signal<GLXApplicationInfoType>} */ signal) => {
            if (signal.data == GLXApplicationInfoTypes.BOOTED) {
                new GLXApplicationControls({
                    applicatioName: this.#applicationName,
                    // @ts-ignore
                    applicationSignalWorkspace: this.#signalWorkspace,
                    controls: this.#buildGuiControls(this.#spriteManager.getAllSprites()),
                    logEnabled: logEnabled
                });
                this.#linkControls();
            }
        })
    }
}

class GLXApplicationControls {

    /** @type {GLXApplicationSignalWorkspace} */ #applicationSignalWorkspace;
    /** @type {GLXControl<any>[]} */ #controls = [];
    /** @type {Logger} */ #logger;
    /** @type {any} */ #settings = {};
    /** @type {SignalDescriptor<GLXControlInfo>} */ #signalDescriptor;
    /** @type {SubscriptionToken[]} */ #targetSubscriptionTokens;

    /**
     * 
     * @param {GLXControlsParams} params
     */
    constructor(params) {
        // @ts-ignore
        this.#applicationSignalWorkspace = params.applicationSignalWorkspace;
        this.#controls = params.controls;
        this.#logger = Logger.forName(`WebGLXAppControls[${params.applicatioName}]`).enabledOn(params.logEnabled ?? true);

        this.#signalDescriptor = SIGNALS.register(params.applicationSignalWorkspace.controls);
        this.#targetSubscriptionTokens = [];

        SIGNALS.subscribe(this.#applicationSignalWorkspace.main, (signal) => {
            // @ts-ignore
            this.#controls = this.#controls;
            this.#settings = this.#controlsToSettings(this.#controls);
            if (signal.data === GLXApplicationInfoTypes.BOOTED) {
                this.#setup();
            }
        });
    }

    /**
     * 
     * @param {GLXControl<any>[]} controls 
     * @returns {any}
     */
    #controlsToSettings(controls) {
        /** @type {any} */ let settings = {};
        for (let control of controls) {
            settings[control.type] = control.value
        }

        return settings;
    }

    #setup() {
        /** @type {any} */ let gui = new dat.GUI();
        for (let control of this.#controls) {
            let controller = gui.add(this.#settings, control.type, control.options);
            ifNotNullOrUndefined(control.min, min => controller = controller.min(min));
            ifNotNullOrUndefined(control.max, max => controller = controller.max(max));
            ifNotNullOrUndefined(control.step, step => controller = controller.step(step));
            let onChange = this.#buildOnChange(control);
            controller.onChange(onChange);

            let onListenSignal = (/** @type {Signal<any>} */ signal) => {
                let newValue = isNotNullOrUndefined(control.listenReducer) ? control.listenReducer(signal) : signal.data;
                if (newValue !== this.#settings[control.type]) {
                    this.#settings[control.type] = newValue;
                    controller.onChange(undefined);
                    controller.setValue(newValue);
                    controller.onChange(onChange)
                }
            };

            let subscribeListenSignal = (/** @type {string} */ signalName) => {
                SIGNALS.subscribe(signalName, onListenSignal)
            }

            ifNotNullOrUndefined(control.listenSignal, subscribeListenSignal);
            ifNotNullOrUndefined(control.listenSignalPool, listenSignalNames => {
                for (let signalName of listenSignalNames) {
                    if (isNotNullOrUndefined(control.listenSignalGuard)) {
                        SIGNALS.subscribe(signalName, (/** @type {Signal<any>} */ signal) => {
                            // @ts-ignore
                            if (control.listenSignalGuard(signal)) {
                                onListenSignal(signal);
                            }
                        })
                    } else {
                        subscribeListenSignal(signalName);
                    }
                }
            })
        }
    }

    /**
     * 
     * @param {GLXControl<*>} control 
     * @returns {(value: any) => void}
     */
    #buildOnChange(control) {
        return (/** @type {any} */ value) => {
            this.#signalDescriptor.trigger({
                data: {
                    type: control.type,
                    value: value
                }
            });
        };
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
            let angle = this.#settings.targetSprite.rotation.third.map(AngleMath.radiansValue())
                + this.#settings.phase.map(AngleMath.radiansValue());
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
            let angle = this.#settings.targetSprite.rotation.third.map(AngleMath.radiansValue())
                + this.#settings.phase.map(AngleMath.radiansValue());
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

    /** @type {number} */ static #DEPTH_TEXTURE_SIZE = 512;
    /** @type {Map<WebGLRenderingContext, Pair<WebGLTexture, WebGLFramebuffer>>} */ static #depthTB = new Map();

    /**
     * @returns {number}
     */
    static get DEPTH_TEXTURE_SIZE() {
        return GLXDrawer.#DEPTH_TEXTURE_SIZE;
    }

    /**
     * @param {WebGLRenderingContext} gl
     * @returns {Pair<WebGLTexture, WebGLFramebuffer>}
     */
    static getTextureWithBufferForLights(gl) {
        let res = GLXDrawer.#depthTB.get(gl);
        if (isNotNullOrUndefined(res)) {
            return res;
        } else {
            let texture = GLXDrawer.#createTexture(gl);
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
        return GLXDrawer.getTextureWithBufferForLights(gl).first;
    }

    /**
     * 
     * @param {WebGLRenderingContext} gl 
     * @returns {WebGLFramebuffer}
     */
    static getTextureFrameBufferForLights(gl) {
        return GLXDrawer.getTextureWithBufferForLights(gl).second;
    }

    /**
     * @param {WebGLRenderingContext} gl
     * @returns {Pair<WebGLTexture, WebGLFramebuffer>}
     */
    static #createTexture(gl) {
        let depthTexture = gl.createTexture();
        let depthTextureSize = GLXDrawer.#DEPTH_TEXTURE_SIZE;
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

    /** @type {GLXApplicationSignalWorkspace} */ #applicationSignalWorkspace;
    /** @type {number} */ #bias;
    /** @type {GLXCamera} */ #camera;
    /** @type {any} */ #cubeLinesBufferInfo;
    /** @type {import("./glx-core").GLXEnvironment} */ #glXEnvironment;
    /** @type {Logger} */ #logger
    /** @type {GLXShadowLight} */ #shadowLightManager;
    /** @type {SharedUniforms} */ #sharedUniforms;
    /** @type {import("./glx-core").GLXSpriteManager} */ #spriteManager;
    /** @type {Map<string, number[]>} */ #spriteMatrices = new Map();
    /** @type {Map<string, SubscriptionToken[]>} */ #spriteSubscriptions;

    /** @type {boolean} */ #autoRender = false;
    /**
     * 
     * @param {GLXDrawerConstructorParams} params 
     */
    constructor(params) {
        this.#applicationSignalWorkspace = params.applicationSignalWorkspace;
        this.#bias = -0.006;
        this.#camera = params.camera
        this.#glXEnvironment = params.glxEnvironment;
        this.#shadowLightManager = params.shadowLightManager;
        this.#spriteManager = params.spriteManager;
        this.#sharedUniforms = params.sharedUniforms;
        this.#cubeLinesBufferInfo = this.#buildCubeLinesBufferInfo();
        this.#spriteSubscriptions = new Map();

        SIGNALS.subscribe(params.applicationSignalWorkspace.main, (signal) => {
            if (signal.data == GLXApplicationInfoTypes.BOOTED) {
                this.#setupAutoRender();
                this.renderScene();
            }
        })

        this.#logger = Logger.forName(`SpriteDrawer[${params.applicationName}]`)
            .enabledOn(params.logEnabled);
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
            u_projectedTexture: GLXDrawer.getTextureForLights(this.#glXEnvironment.glContext),
            u_lightDirection: this.#computeLightWorldMatrix().slice(8, 11),
        });
        gl.uniform1f(gl.getUniformLocation(drawSceneContext.programInfo.program, "mesh"), 1.);

        for (let glxSprite of this.#spriteManager.getAllGLXSpritesData()) {
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
            let u_world = this.#spriteMatrices.get(drawSpriteContext.sprite.name) ??
                this.#computeSpriteMatrix(drawSpriteContext.sprite);

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
        this.#logger.info('rendering scene...');
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
            cameraMatrix: this.#computeCameraMatrix(),
            textureMatrix: textureMatrix,
            programInfo: this.#glXEnvironment.getProgramInfo('main')
        })

        if (this.#shadowLightManager.lightFrustum) {
            this.#renderLightFrustum(lightMatrices);
        }

        this.#logger.info('render complete');
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

    #computeCameraMatrix() {
        return M4.lookAt(
            this.#camera.position.map(Math3D.toImmutableArray()),
            this.#camera.targetPosition.map(Math3D.toImmutableArray()),
            trioToJsVector(this.#camera.up)
        );
    }

    /**
     * @returns {LightMatrices}
     */
    #computeLightMatrices() {
        let lightWorldMatrix = this.#computeLightWorldMatrix();
        let lightProjectionMatrix = this.#computeLightProjectionMatrix();

        return {
            projection: lightProjectionMatrix,
            world: lightWorldMatrix
        };
    }

    /**
     * 
     * @returns {number[]}
     */
    #computeLightWorldMatrix() {
        let lightPosition = this.#shadowLightManager.lightPosition;
        let lightTarget = this.#shadowLightManager.lightTarget;
        let lightUp = this.#shadowLightManager.lightUp;
        return M4.lookAt(
            [lightPosition.x, lightPosition.y, lightPosition.z],
            [lightTarget.x, lightTarget.y, lightTarget.z],
            [lightUp.first, lightUp.second, lightUp.third],
        );
    }

    /**
     * 
     * @returns {number[]}
     */
    #computeLightProjectionMatrix() {
        if (this.#shadowLightManager.isSpotlight) {
            return M4.perspective(
                this.#shadowLightManager.lightFov.transform(AngleMath.asRadians()).value,
                this.#shadowLightManager.projectionWidth / this.#shadowLightManager.projectionHeight,
                this.#shadowLightManager.lightNear,
                this.#shadowLightManager.lightFar)
        } else {
            let halfProjectionWidth = this.#shadowLightManager.projectionWidth / 2;
            let halfProjectionHeight = this.#shadowLightManager.projectionHeight / 2;
            return M4.orthographic(
                -halfProjectionWidth, halfProjectionWidth,
                -halfProjectionHeight, halfProjectionHeight,
                this.#shadowLightManager.lightNear,
                this.#shadowLightManager.lightFov)
        }
    }

    /**
     * 
     * @param {GLXSprite} sprite 
     */
    #computeSpriteMatrix(sprite) {
        let u_world = M4.identity();
        let position = sprite.position;
        let rotation = sprite.rotation;
        let scale = sprite.scale;

        u_world = M4.translate(u_world, position.x, position.y, position.z);
        u_world = M4.xRotate(u_world, rotation.first.map(AngleMath.radiansValue()));
        u_world = M4.yRotate(u_world, rotation.second.map(AngleMath.radiansValue()));
        u_world = M4.zRotate(u_world, rotation.third.map(AngleMath.radiansValue()));
        u_world = M4.scale(u_world, scale.first, scale.second, scale.third);
        return u_world;
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
     * @param {Signal<GLXApplicationInfoTypes>} signal 
     */
    #onApplicationMainSignal(signal) {
        if (signal.data === GLXApplicationInfoTypes.ADDED_SPRITE) {
            this.#setupAutoRenderForSprites();
        }
    }
    /**
     * 
     * @param {LightMatrices} lightMatrices 
     */
    #renderLightFrustum(lightMatrices) {
        let gl = this.#glXEnvironment.glContext;
        let viewMatrix = M4.inverse(this.#computeCameraMatrix())
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
        gl.bindFramebuffer(gl.FRAMEBUFFER, GLXDrawer.getTextureFrameBufferForLights(gl));
        gl.viewport(0, 0, GLXDrawer.DEPTH_TEXTURE_SIZE, GLXDrawer.DEPTH_TEXTURE_SIZE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (this.#shadowLightManager.isShadowEnabled) {
            this.drawScene({
                projectionMatrix: lightMatrices.projection,
                cameraMatrix: lightMatrices.world,
                textureMatrix: M4.identity(),
                programInfo: this.#glXEnvironment.getProgramInfo('color')
            })
            this.#logger.info("shadows rendered");
        };
    }

    #setupAutoRender() {
        this.#setupAutoRenderForSprites();
        SIGNALS.subscribe(this.#applicationSignalWorkspace.main, this.#onApplicationMainSignal.bind(this));

        this.#setupAutoRenderOnSignals(
            ...Object.values(this.#applicationSignalWorkspace.camera),
            ...Object.values(this.#applicationSignalWorkspace.cameraMan),
            ...Object.values(this.#applicationSignalWorkspace.shadowLight)
        );

        this.#logger.info('auto render setup complete');
    }

    /**
     * 
     * @param {...string} signalNames 
     */
    #setupAutoRenderOnSignals(...signalNames) {
        this.#logger.info('setup autorender on signals: ', signalNames);
        if (isNotNullOrUndefined(signalNames)) {
            for (let signalName of signalNames) {
                SIGNALS.subscribe(signalName, this.renderScene.bind(this));
            }
        }
    }

    #setupAutoRenderForSprites() {
        for (let /** @type {GLXSprite} */ sprite of this.#spriteManager.getAllSprites()) {
            let spriteName = sprite.name;
            this.#spriteMatrices.set(spriteName, this.#computeSpriteMatrix(sprite));

            let onSpriteChange = () => {
                this.#spriteMatrices.set(spriteName, this.#computeSpriteMatrix(sprite));
                this.renderScene();
            }

            if (!this.#spriteSubscriptions.has(spriteName)) {
                /** @type {SubscriptionToken[]} */ let subscriptions = [];
                let spriteSignalWorkspace = this.#applicationSignalWorkspace.spriteName(spriteName);
                subscriptions.push(SIGNALS.subscribe(
                    spriteSignalWorkspace.positionChange, onSpriteChange.bind(this)));
                subscriptions.push(SIGNALS.subscribe(
                    spriteSignalWorkspace.rotationChange, onSpriteChange.bind(this)));
                subscriptions.push(SIGNALS.subscribe(
                    spriteSignalWorkspace.scaleChange, onSpriteChange.bind(this)));
                subscriptions.push(SIGNALS.subscribe(
                    spriteSignalWorkspace.hiddenChange, onSpriteChange.bind(this)));

                this.#spriteSubscriptions.set(spriteName, subscriptions);
                this.#logger.info(`auto rendering on any change of sprite '${spriteName}'`);
            }
        }
    }


    #updateViewMatrix() {
        this.#sharedUniforms.u_view = M4.inverse(this.#computeCameraMatrix());
    }

    #updateProjectionMatrix() {
        this.#sharedUniforms.u_projection = M4.perspective(
            this.#camera.fov.transform(AngleMath.asRadians()).value,
            this.#glXEnvironment.aspectRatio, this.#camera.zNear, this.#camera.zFar);
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
        // @ts-ignore
        webGLXEnvironment: glxEnv,
        appStart: appStart,
        // @ts-ignore
        signalWorkspace: signalWorkspace,
        mainSignalDescriptor: mainSignalDescriptor

    }
    let app = new appStart.applicationClass(params);
    mainSignalDescriptor.trigger({ data: GLXApplicationInfoTypes.CONSTRUCTED });
    logger.info('application instantiated');

    if (isNotNullOrUndefined(app.main)) {
        logger.info('running application main');
        app.main();
    }
    mainSignalDescriptor.trigger({ data: GLXApplicationInfoTypes.BOOTED })
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