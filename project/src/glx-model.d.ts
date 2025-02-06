import { Angle, Point3D, Vector3D } from "./geometry.js";
import { Logger } from "./logjsx.js";
import { FireRequest, Signal, SignalConsumer, SignalDescriptor } from "./signals.js";

export type Change<T> = {
    readonly from: T;
    readonly to: T;
}

export type Duo<T> = {
    readonly first: T;
    readonly second: T;
}

export type GLXApplicationInfoType = 'BOOTED' | 'CONSTRUCTED' | 'ADDED_SPRITE';

export declare class GLXApplicationInfoTypes {
    static ADDED_SPRITE: GLXApplicationInfoType;
    static BOOTED: GLXApplicationInfoType;
    static CONSTRUCTED: GLXApplicationInfoType;
}

export declare class GLXApplicationSignalWorkspace {
    readonly camera: GLXCameraSignalWorkspace;
    readonly cameraMan: GLXCameraManSignalWorkspace;
    readonly controls: string;
    readonly main: string;
    readonly shadowLight: GLXShadowLightSignalWorkspace;

    constructor(applicationName: string);
    sprite(sprite: Sprite): SpriteSignalWorkspace;
    spriteName(name: string): SpriteSignalWorkspace;
}

export declare class GLXCamera {
    fov: Angle
    position: Point3D
    targetPosition: Point3D
    up: Trio<number>
    zFar: number
    zNear: number

    constructor(params: GLXCameraConstructorParams);
}

export type GLXCameraConstructorParams = {
    applicationName: string;
    signalWorkspace: GLXCameraSignalWorkspace;
    logEnabled: boolean;
    settings?: Partial<GLXCameraSettings>;
}

export declare class GLXCameraManConstructorParams {
    applicationName: string;
    camera: GLXCamera;
    signalWorkspace: GLXCameraManSignalWorkspace;
    logEnabled: boolean;
    settings?: Partial<GLXCameraManSettings>
}

export type GLXCameraManSettings = {
    distance: number;
    high: number;
    isChasingSprite: boolean,
    isLookingAtSprite: boolean
    phase: Angle;
    targetSprite: Sprite | null;
    workMode: GLXCameraManWorkMode;
}

export type GLXCameraManSignalDescriptors = {
    distanceChanges: SignalDescriptor<Change<number>>;
    highChanges: SignalDescriptor<Change<number>>;
    isLookingAtSpriteChanges: SignalDescriptor<Change<boolean>>;
    isChasingSpriteChanges: SignalDescriptor<Change<boolean>>;
    phaseChanges: SignalDescriptor<Change<Angle>>;
    targetSpriteChanges: SignalDescriptor<Change<Sprite | null>>;
    workModeChanges: SignalDescriptor<Change<GLXCameraManWorkMode>>;
}


export type GLXCameraManSignalWorkspace = {
    readonly distanceChanges: string,
    readonly highChanges: string,
    readonly isLookingAtSpriteChanges: string;
    readonly isChasingSpriteChanges: string;
    readonly phaseChanges: string;
    readonly targetSpriteChanges: string;
    readonly workModeChanges: string;
}

export type GLXCameraManWorkMode = "DISMISSED" | "OVER" | "FIRST_PERSON" | "THIRD_PERSON" | "CUSTOM";

export class GLXCameraManWorkModes {
    static DISMISSED: GLXCameraManWorkMode;
    static OVER: GLXCameraManWorkMode;
    static FIRST_PERSON: GLXCameraManWorkMode;
    static THIRD_PERSON: GLXCameraManWorkMode;
    static CUSTOM: GLXCameraManWorkMode;
}

export type GLXCameraSettings = {
    position: Point3D;
    up: Trio<number>;
    targetPosition: Point3D;
    fov: Angle;
    zNear: number;
    zFar: number;
}

export type GLXCameraSignalDescriptors = {
    positionChanges: SignalDescriptor<PositionChange>;
    upChanges: SignalDescriptor<Change<Trio<number>>>;
    targetChanges: SignalDescriptor<PositionChange>;
    fovChanges: SignalDescriptor<Change<Angle>>;
    zNearChanges: SignalDescriptor<Change<number>>;
    zFarChanges: SignalDescriptor<Change<number>>;
}

export type GLXCameraSignalWorkspace = {
    readonly positionChanges: string;
    readonly upChanges: string;
    readonly targetChanges: string;
    readonly fovChanges: string;
    readonly zNearChanges: string;
    readonly zFarChanges: string;
}

export type GLXControl<T> = {
    type: GLXControlType,
    value: T,
    options?: T[],
    min?: T,
    max?: T,
    step?: T,
    listenSignal?: string,
    listenSignalPool?: string[],
    listenSignalGuard?: (signal: Signal<any>) => boolean,
    listenReducer?: (signal: Signal<any>) => T
}

export type GLXControlInfo = {
    readonly type: GLXControlType,
    readonly value: any
}

export type GLXControlType =
    | 'log'
    | 'cam_man_work_mode'
    | 'target'
    | 'chase'
    | 'look_at'
    | 'cam_man_high'
    | 'cam_man_distance'
    | 'cam_man_phase'
    | 'cam_x'
    | 'cam_y'
    | 'cam_z'
    | 'cam_up_x'
    | 'cam_up_y'
    | 'cam_up_z'
    | 'z_near'
    | 'z_far'
    | 'fov'
    | 'target_x'
    | 'target_y'
    | 'target_z'
    | 'shadows'
    | 'frustum'
    | 'light_x'
    | 'light_y'
    | 'light_z'
    | 'light_target_x'
    | 'light_target_y'
    | 'light_target_z'
    | 'light_up_x'
    | 'light_up_y'
    | 'light_up_z'
    | 'light_fov'
    | 'light_near'
    | 'light_far'
    | 'spotlight'
    | 'bias'
    | 'light_width'
    | 'light_height'
    | 'curr_sprite'
    | 'hidden'
    | 'sprite_x'
    | 'sprite_y'
    | 'sprite_z'
    | 'sprite_scale_x'
    | 'sprite_scale_y'
    | 'sprite_scale_z'
    | 'sprite_psi'
    | 'sprite_theta'
    | 'sprite_phi'
    | 'draw';

export declare class GLXControlTypes {
    static LOG: GLXControlType;
    static TARGET: GLXControlType;
    static CHASE: GLXControlType;
    static LOOK_AT: GLXControlType;
    static CAM_MAN_HIGH: GLXControlType;
    static CAM_MAN_DISTANCE: GLXControlType;
    static CAM_MAN_PHASE: GLXControlType;
    static CAM_MAN_WORK_MODE: GLXControlType;
    static CAM_X: GLXControlType;
    static CAM_Y: GLXControlType;
    static CAM_Z: GLXControlType;
    static CAM_UP_X: GLXControlType;
    static CAM_UP_Y: GLXControlType;
    static CAM_UP_Z: GLXControlType;
    static Z_NEAR: GLXControlType;
    static Z_FAR: GLXControlType;
    static FOV: GLXControlType;
    static TARGET_X: GLXControlType;
    static TARGET_Y: GLXControlType;
    static TARGET_Z: GLXControlType;
    static SHADOWS: GLXControlType;
    static FRUSTUM: GLXControlType;
    static LIGHT_X: GLXControlType;
    static LIGHT_Y: GLXControlType;
    static LIGHT_Z: GLXControlType;
    static LIGHT_TARGET_X: GLXControlType;
    static LIGHT_TARGET_Y: GLXControlType;
    static LIGHT_TARGET_Z: GLXControlType;
    static LIGHT_UP_X: GLXControlType;
    static LIGHT_UP_Y: GLXControlType;
    static LIGHT_UP_Z: GLXControlType;
    static LIGHT_FOV: GLXControlType;
    static LIGHT_NEAR: GLXControlType;
    static LIGHT_FAR: GLXControlType;
    static BIAS: GLXControlType;
    static SPOTLIGHT: GLXControlType;
    static LIGHT_WIDTH: GLXControlType;
    static LIGHT_HEIGHT: GLXControlType;
    static CURR_SPRITE: GLXControlType;
    static HIDDEN: GLXControlType;
    static SPRITE_X: GLXControlType;
    static SPRITE_Y: GLXControlType;
    static SPRITE_Z: GLXControlType;
    static SPRITE_SCALE_X: GLXControlType;
    static SPRITE_SCALE_Y: GLXControlType;
    static SPRITE_SCALE_Z: GLXControlType;
    static SPRITE_PSI: GLXControlType;
    static SPRITE_THETA: GLXControlType;
    static SPRITE_PHI: GLXControlType;
    static DRAW: GLXControl;
}

export type DrawSceneContext = {
    projectionMatrix: number[],
    cameraMatrix: number[],
    textureMatrix: number[],
    programInfo: ProgramInfo
}

export type DrawSpriteContext = {
    clear?: boolean,
    sprite: Sprite,
    glData: any,
    programInfo: ProgramInfo
}

export class GLXShadowLight {
    bias: number;
    lightFar: number;
    lightFov: Angle;
    lightFrustum: boolean;
    isShadowEnabled: boolean;
    isSpotlight: boolean;
    lightDirection: Trio<number>;
    lightPosition: Point3D;
    lightTarget: Point3D;
    lightUp: Trio<number>;
    lightNear: number;
    projectionHeight: number;
    projectionWidth: number;

    constructor(params: GLXShadowLightConstructorParams);
}

export type GLXShadowLightConstructorParams = {
    applicationName: string;
    logEnabled: boolean;
    signalWorkspace: GLXShadowLightSignalWorkspace;
    settings?: Partial<GLXShadowLightSettings>;
}

export type GLXShadowLightSettings = {
    bias: number;
    lightFar: number;
    ligthFrustum: boolean;
    lightDirection: Trio<number>;
    lightPosition: Point3D;
    lightTarget: Point3D;
    lightUp: Trio<number>;
    lightFov: Angle;
    isSpotlight: boolean;
    projectionHeight: number;
    projectionWidth: number;
    isShadowEnabled: boolean;
    near: number;
}

export class GLXShadowLightSignalDescriptors {
    bias: SignalDescriptor<Change<number>>;
    lightFar: SignalDescriptor<Change<number>>;
    lightFrustum: SignalDescriptor<Change<boolean>>;
    lightFov: SignalDescriptor<Change<Angle>>;
    isShadowEnabled: SignalDescriptor<Change<boolean>>;
    isSpotlight: SignalDescriptor<Change<boolean>>;
    lightDirection: SignalDescriptor<Change<Trio<number>>>;
    lightPosition: SignalDescriptor<Change<Point3D>>;
    lightTarget: SignalDescriptor<Change<Point3D>>;
    lightUp: SignalDescriptor<Change<Trio<number>>>;
    lightNear: SignalDescriptor<Change<number>>;
    projectionHeight: SignalDescriptor<Change<number>>;
    projectionWidth: SignalDescriptor<Change<number>>;
}

export class GLXShadowLightSignalWorkspace {
    bias: string;
    lightFar: string;
    lightFov: string;
    lightFrustum: string;
    isShadowEnabled: string;
    isSpotlight: string;
    lightDirection: string;
    lightPosition: string;
    lightTarget: string;
    lightUp: string;
    lightNear: string;
    projectionHeight: string;
    projectionWidth: string;
}

export declare class GLXSprite {
    readonly name: string;
    readonly applicationName: string;
    readonly signalWorkspace: GLXSpriteSignalWorkspace;

    position: Point3D;
    rotation: Trio<Angle>;
    scale: Trio<number>;
    hidden: boolean;

    constructor(params: GLXSpriteConstructorParams)
}

export type GLXSpriteConstructorParams = {
    applicationName: string;
    name: string;
    signalWorkspace: GLXSpriteSignalWorkspace;
    settings?: Partial<GLXSpriteSettings>;
}

export type GLXSpriteSettings = {
    position: Point3D,
    rotation: Trio<Angle>,
    scale: Trio<number>,
    limitChecker: LimitChecker,
    hidden: boolean
}

export type GLXSpriteSignalDescriptors = {
    readonly positionChange: SignalDescriptor<PositionChange>,
    readonly rotationChange: SignalDescriptor<RotationChange>,
    readonly scaleChange: SignalDescriptor<ScaleChange>,
    readonly hiddenChange: SignalDescriptor<Change<boolean>>
}

export type GLXSpriteSignalWorkspace = {
    readonly positionChange: string,
    readonly rotationChange: string,
    readonly scaleChange: string,
    readonly hiddenChange: string
}

export type LimitChecker = (sprite: GLXSprite, targetPosition: Point3D) => boolean;

export declare class LimitCheckers {

    /**
     *
     * @param {Duo<number>} xBounds
     * @param {Duo<number>} yBounds
     * @param {Duo<number>} zBounds
     * @returns {LimitChecker}
     */
    static LINEAR(xBounds: Duo<number>, yBounds: Duo<number>, zBounds: Duo<number>): LimitChecker;
    static UNLIMITED: LimitChecker;
}

export type Pair<F, S> = {
    readonly first: F,
    readonly second: S
};

export type PositionChange = Change<Point3D>;

export declare class Positions {
    static readonly ORIGIN: Point3D;
}

export type RotationChange = Change<Trio<Angle>>;

export declare class Rotations {
    static readonly NOT_ROTATED: Trio<Angle>;
}

export type ScaleChange = Change<Trio<number>>;

export declare class Scales {
    static readonly NOT_SCALED: Trio<number>;
}

export type SignaledProperty<T> = {
    readonly propertyGetter: () => T;
    readonly propertySetter: (value: T) => void;
    readonly nextValue: T;
    readonly signalDescriptor: SignalDescriptor<Change<T>>;
}

export type Trio<T> = {
    readonly first: T;
    readonly second: T;
    readonly third: T;
}

export declare function change<T>(from: T, to: T): Change<T>;
export declare function duo<T>(first, second): Duo<T>;
export declare function ifNotNullOrUndefined<T>(obj: T|null|undefined, action: (presentObj: T) => void);
export declare function isNotNullOrUndefined<T>(obj: T|null|undefined): obj is T;
export declare function isNullOrUndefined<T>(obj: T|null|undefined): boolean;
export declare function pair<F, S>(first, second): Pair<F, S>;
export declare function position(x: number, y: number, z: number): Point3D
export declare function rotation(psi: Angle, theta: Angle, phi: Angle);
export declare function scale(mx: number, my: number, mz: number): Trio<number>;
export declare function trio<T>(first: T, second: T, third: T): Trio<T>;