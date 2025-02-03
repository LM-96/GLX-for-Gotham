import { Angle, Point3D, Vector3D } from "./geometry";
import { Logger } from "./logjsx";
import { FireRequest, Signal, SignalConsumer, SignalDescriptor } from "./signals";

export type GLXCameraManSignalWorkspace = {
    readonly distanceChanges: string,
    readonly highChanges: string,
    readonly isLookingAtSpriteChanges: string;
    readonly isChasingSpriteChanges: string;
    readonly phaseChanges: string;
    readonly targetSpriteChanges: string;
    readonly workModeChanges: string;
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

export type Change<T> = {
    readonly from: T;
    readonly to: T;
};

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

export type Duo<T> = {
    readonly first: T;
    readonly second: T;
};

export type FireRequest<D> = {
    readonly  D;
};

export type GLXApplicationComponentParams<S> = {
    applicationName: string,
    applicationSignalWorkspace: GLXApplicationSignalWorkspace,
    logEnabled: boolean,
    settings: Partial<S>,
}

export type GLXApplicationInfo = 'BOOTED' | 'CONSTRUCTED' | 'ADDED_SPRITE';

export type GLXApplicationParams = {
    readonly applicationName: string;
    readonly appStart: GLXApplicationStart;
    readonly mainSignalDescriptor: SignalDescriptor<GLXApplicationInfo>;
    readonly webGLXEnvironment: GLXEnvironment;
    readonly signalWorkspace: GLXApplicationSignalWorkspace;
}

export type GLXApplicationStart = {
    applicationClass: WebGLXApplicationClass;
    canvasElementName: string;
    webGLShaders: WebGLShaderRef;
    cameraSettings?: Partial<GLXCameraSettings>;
    logEnabled?: boolean;
    shadowLightSetting?: Partial<GLXShadowLightSettings>;
}

export type GLXCameraManWorkMode = "DISMISSED" | "OVER" | "FIRST_PERSON" | "THIRD_PERSON" | "CUSTOM";

export type GLXCameraManSettings = {
    distance: number;
    high: number;
    isChasingSprite: boolean,
    isLookingAtSprite: boolean
    phase: number;
    targetSprite: Sprite | null;
    workMode: GLXCameraManWorkMode;
}

export type GLXCameraManSignalDescriptors = {
    distanceChanges: SignalDescriptor<Change<number>>;
    highChanges: SignalDescriptor<Change<number>>;
    isLookingAtSpriteChanges: SignalDescriptor<Change<boolean>>;
    isChasingSpriteChanges: SignalDescriptor<Change<boolean>>;
    phaseChanges: SignalDescriptor<Change<number>>;
    targetSpriteChanges: SignalDescriptor<Change<Sprite | null>>;
    workModeChanges: SignalDescriptor<Change<GLXCameraManWorkMode>>;
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
    | 'light_fov'
    | 'light_near'
    | 'light_far'
    | 'spotlight'
    | 'light_width'
    | 'light_height'
    | 'curr_sprite'
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

export type GLXControl<T> = {
    type: GLXControlType,
    value: T,
    options?: T[],
    min?: T,
    max?: T,
    step?: T,
    listenSignal?: string,
    listenReducer?: (signal: Signal<any>) => T,
    onValueChange?: (newValue: T) => void;
}

export type GLXControlsParams = {
    applicatioName: string;
    applicationSignalWorkspace: GLXApplicationSignalWorkspace;
    controls: GLXControl[];
    logEnabled?: boolean;
}

export type GLXEnvironment = {
    readonly aspectRatio: number;
    readonly canvas: HTMLCanvasElement;
    readonly glContext: WebGLRenderingContext;

    getProgramInfo(programName: string);
}

export class GLXShadowLightManager {
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
}

export type GLXShadowLightManagerConstructorParams = {
    applicationName: string;
    logEnabled: boolean;
    signalWorkspace: GLXShadowLightSignalWorkspace;
    settings?: Partial<GLXShadowLightSettings>;
}

export type GLXShadowLightSettings = {
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

export type GLXSprite = {
    readonly sprite: Sprite;
    readonly glData: any;
}

export type GLXDrawerParams = {
    applicationName: string;
    glxEnvironment: GLXEnvironment;
    camera: GLXCamera;
    shadowLightManager: GLXShadowLightManager;
    sharedUniforms: SharedUniforms;
    spriteManager: GLXSpriteManager;
    applicationSignalWorkspace: WebGLXApplicationSignalWorkspace;
    logEnabled: boolean;
}

export type GLXSpriteCreation = {
    readonly name: string;
    readonly glData: any;
    readonly signalWorkspace: SpriteSignalWorkspace;
    readonly settings?: Partial<SpriteSettings>;
}

export type LightMatrices = {
    readonly projection: number[];
    readonly world: number[];
}

export type LimitChecker = (sprite: Sprite, targetPosition: Point3D) => boolean;

export type MeshSpriteLoad = {
    name: string,
    path: string,
    position?: Point3D,
    rotation?: Trio<Angle>,
    scale?: Trio<number>,
    limitChecker?: LimitChecker,
    hidden?: boolean
}

export type Pair<F, S> = {
    readonly first: F,
    readonly second: S
};

export type PositionChange = Change<Point3D>;

export type ProgramInfo = {
    program: WebGLProgram,
    attribLocations: any,
    uniformLocations: any
}

export type RotationChange = Change<Trio<Angle>>;

export type ScaleChange = Change<Trio<number>>;

export type SharedUniforms = {
    u_ambientLight: Array<number>,
    u_colorLight: Array<number>,
    u_view: number[],
    u_projection: number[],
    u_lightDirection: Array<number>,
    u_bias: number,
    texture_matrix: number[],
    u_projectedTexture: WebGLTexture | null,
    u_colorMult: number[],
}

export type Signal<D> = {
    readonly id: number;
    readonly name: string;
    readonly  D;
    readonly time: Date
};

export type SignalConsumer<D> = (signal: Signal<D>) => void;

export type SpriteActionType = 1 | 2 | 3;

export type SpriteConstructorParams = {
    applicationName: string;
    name: string;
    signalWorkspace: SpriteSignalWorkspace;
    settings?: Partial<SpriteSettings>;
}

export type SpriteSettings = {
    position: Point3D,
    rotation: Trio<Angle>,
    scale: Trio<number>,
    limitChecker: LimitChecker,
    hidden: boolean
}

export type SpriteSignalDescriptors = {
    readonly positionChange: SignalDescriptor<PositionChange>,
    readonly rotationChange: SignalDescriptor<RotationChange>,
    readonly scaleChange: SignalDescriptor<ScaleChange>
}

export type SpriteSignalWorkspace = {
    readonly positionChange: string,
    readonly rotationChange: string,
    readonly scaleChange: string
};

export type Trio<T> = {
    readonly first: T;
    readonly second: T;
    readonly third: T;
};

export type WebGLShaderRef = {
    readonly main: string[];
    readonly color: string[];
}

export type WebGLXAppDescriptor = {
    applicationName: string;
}

export type WebGLXApplicationClass = { new(...args: any[]): GLXApplication };


export declare class FireRequests {
    static ofRotation(change: Change<Trio<Angle>>): FireRequest<RotationChange>;
    static ofScale(change: Change<Trio<number>>): FireRequest<ScaleChange>;
    static ofTransition(change: Change<Point3D>): FireRequest<PositionChange>;
}

export declare class GLXApplication {
    readonly cameraMan: GLXCameraMan;
    readonly logger: Logger;
    readonly signals: GLXApplicationSignalWorkspace;

    abstract main();

    glxSprite(load: MeshSpriteLoad): Sprite;
    onSignal(signalName: string, consume: SignalConsumer);
}

export declare class GLXApplicationInfos {
    static ADDED_SPRITE: GLXApplicationInfo;
    static BOOTED: GLXApplicationInfo;
    static CONSTRUCTED: GLXApplicationInfo;
}

export declare class GLXApplicationSignalWorkspace {
    readonly camera: GLXCameraSignalWorkspace;
    readonly cameraMan: GLXCameraManSignalWorkspace;
    readonly controls: string;
    readonly main: string;
    readonly shadowLight: GLXShadowLightSignalWorkspace;

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
}

export type GLXCameraConstructorParams = {
    applicationName: string;
    signalWorkspace: GLXCameraSignalWorkspace;
    logEnabled: boolean;
    settings?: Partial<GLXCameraSettings>;
}

export declare class GLXCameraMan {
    readonly currenWorkMode: GLXCameraManWorkMode;
    readonly isHired: boolean;

    distance: number;
    hight: number;
    phase: Angle;
    targetPosition: Point3D;
    targetSprite: Sprite | null;

    chaseTargetSprite(): GLXCameraMan
    dismiss();
    hire(mode: GLXCameraManWorkMode);
    lookAtTargetSprite(): GLXCameraMan
    unChaseSprite(): GLXCameraMan
    unLookAtSprite(): GLXCameraMan
}

export declare class GLXCameraManConstructorParams {
    applicationName: string;
    camera: GLXCamera;
    signalWorkspace: GLXCameraManSignalWorkspace;
    logEnabled: boolean;
    settings?: Partial<GLXCameraManSettings>
}

export class GLXCameraManWorkModes {
    static DISMISSED: GLXCameraManWorkMode;
    static OVER: GLXCameraManWorkMode;
    static FIRST_PERSON: GLXCameraManWorkMode;
    static THIRD_PERSON: GLXCameraManWorkMode;
    static CUSTOM: GLXCameraManWorkMode;
}

export type GLXCameraSignalWorkspace = {
    readonly positionChanges: string;
    readonly upChanges: string;
    readonly targetChanges: string;
    readonly fovChanges: string;
    readonly zNearChanges: string;
    readonly zFarChanges: string;
}

export declare class GLXControlTypes {
    static LOG: GLXControlType;
    static TARGET: GLXControlType;
    static CHASE: GLXControlType;
    static LOOK_AT: GLXControlType;
    static CAM_MAN_HIGH: GLXControlType;
    static CAM_MAN_DISTANCE: GLXControlType;
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
    static LIGHT_FOV: GLXControlType;
    static LIGHT_NEAR: GLXControlType;
    static LIGHT_FAR: GLXControlType;
    static SPOTLIGHT: GLXControlType;
    static LIGHT_WIDTH: GLXControlType;
    static LIGHT_HEIGHT: GLXControlType;
    static CURR_SPRITE: GLXControlType;
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

export declare class GLXEnvironment {
    readonly aspectRation: number;
    readonly canvas: HTMLCanvasElement;
    readonly glContext: WebGLRenderingContext;

    getProgramInfo(programName: string | null): ProgramInfo
}

declare class GLXSpriteManager {
    createSprite(spriteCreation: GLXSpriteCreation);
    getAllGLXSprites(): GLXSprite[];
    getAllSprites(): Sprite[];
    getGLXSprite(name: string): GLXSprite|undefined;
    getSprite(name: string): Sprite|undefined
}

declare type GLXSpriteManagerConstructorParams = {
    applicationName: string;
    logEnabled: boolean;
}

export declare class LimitCheckers {
    static LINEAR(xBounds: Duo<number>, yBounds: Duo<number>, zBounds: Duo<number>): LimitChecker;
    static readonly UNLIMITED: LimitChecker;
}

export declare class Positions {
    static readonly ORIGIN: Point3D;
}

export declare class Rotations {
    static readonly NOT_ROTATED: Trio<Angle>;
}

export declare class Scales {
    static readonly NOT_SCALED: Trio<number>;
}

export type SignaledProperty<T> = {
    readonly propertyGetter: () => T;
    readonly propertySetter: (value: T) => void; 
    readonly nextValue: T;
    readonly signalDescriptor: SignalDescriptor<Change<T>>;
}

export declare class Sprite {
    readonly name: string;
    readonly applicationName: string;
    readonly signalWorkspace: SpriteSignalWorkspace;

    position: Point3D;
    rotation: Trio<Angle>;
    scale: Trio<number>;
    hidden: boolean;
}

export declare function change<T>(from: T, to: T): Change<T>;
export declare function duo<T>(first, second): Duo<T>;
export declare function pair<F, S>(first, second): Pair<F, S>;
export declare function position(x: number, y: number, z: number): Point3D
export declare function rotation(psi: Angle, theta: Angle, phi: Angle);
export declare function scale(mx: number, my: number, mz: number): Trio<number>;
export declare function start<WebGLXApplicationClass>(appStart: GLXApplicationStart);
export declare function trio<T>(first: T, second: T, third: T): Trio<T>;