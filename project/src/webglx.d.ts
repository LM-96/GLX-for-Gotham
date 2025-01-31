import { Angle, Point3D, Vector3D } from "./geometry";
import { Logger } from "./logjsx";
import { FireRequest, SignalConsumer, SignalDescriptor } from "./signals";

export type CameraManWorkMode = "DISMISSED" | "OVER" | "FIRST_PERSON" | "THIRD_PERSON" | "CUSTOM";

export type CameraManSignalDescriptors = {
    isLookingAtSpriteChanges: SignalDescriptor<Change<boolean>>;
    isChasingSpriteChanges: SignalDescriptor<Change<boolean>>;
    targetSpriteChanges: SignalDescriptor<Change<Sprite|null>>;
    workModeChanges: SignalDescriptor<Change<CameraManWorkMode>>;
}

export type CameraManSignalWorkspace = {
    readonly isLookingAtSpriteChanges: string;
    readonly isChasingSpriteChanges: string;
    readonly targetSpriteChanges: string;
    readonly workModeChanges: string;
}

export type CameraSettings = {
    position: Point3D;
    up: Trio<number>;
    targetPosition: Point3D;
    fov: Angle;
}

export type CameraSignalDescriptors = {
    positionChanges: SignalDescriptor<PositionChange>;
    upChanges: SignalDescriptor<Change<Trio<number>>>;
    targetChanges: SignalDescriptor<PositionChange>;
    fovChanges: SignalDescriptor<Change<Angle>>;
}

export type CameraSignalWorkspace = {
    readonly positionChanges: string;
    readonly upChanges: string;
    readonly targetChanges: string;
    readonly fovChanges: string;
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

export type GLXSprite = {
    readonly sprite: Sprite;
    readonly glData: any;
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

export type SpriteActionType = 1 | 2 | 3;

export type Trio<T> = {
    readonly first: T;
    readonly second: T;
    readonly third: T;
};

export type WebGLXAppDescriptor = {
    applicationName: string;
}

export type PositionChange = Change<Point3D>;

export type ProgramInfo = {
    program: WebGLProgram,
    attribLocations: any,
    uniformLocations: any
}

export type RotationChange = Change<Trio<Angle>>;

export type ScaleChange = Change<Trio<number>>;

export type ShadowLightSettings = {
    far: number;
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

export type SharedUniforms = {
    u_ambientLight: Array<number>,
    u_colorLight: Array<number>,
    u_view: number[],
    u_projection: number[],
    u_lightDirection: Array<number>,
    u_bias: number ,
    texture_matrix: number[],
    u_projectedTexture: WebGLTexture | null,
    u_colorMult: number[],
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

export type WebGLXApplicationClass = { new (...args: any[]): WebGLXApplication };

export type WebGLXApplicationInfo = 'CONSTRUCTED' | 'ADDED_SPRITE';

export type WebGLXApplicationStart = {
    applicationClass: WebGLXApplicationClass;
    canvasElementName: string;
    webGLShaders: WebGLShaderReference;
    cameraSettings?: Partial<CameraSettings>;
    logEnabled?: boolean;
    shadowLightSetting?: Partial<ShadowLightSettings>;
}

export type WebGLShaderReference = {
    readonly main: string[];
    readonly color: string[];
}

export declare class Camera {
    readonly isChasingSprite: boolean
    readonly isLookingAtSprite: boolean

    distanceFromTarget: Vector3D
    fov: Angle
    position: Point3D
    targetPosition: Point3D
    up: Trio<number>
}

export declare class CameraMan {
    readonly currenWorkMode: CameraManWorkMode;
    readonly isHired: boolean;

    distance: number;
    hight: number;
    phase: Angle;
    targetPosition: Point3D;
    targetSprite: Sprite | null;

    chaseTargetSprite(): CameraMan
    dismiss();
    hire(mode: CameraManWorkMode);
    lookAtTargetSprite(): CameraMan
    unChaseSprite(): CameraMan
    unLookAtSprite(): CameraMan
}

export class CameraManWorkModes {
    static DISMISSED: CameraManWorkMode;
    static OVER: CameraManWorkMode;
    static FIRST_PERSON: CameraManWorkMode;
    static THIRD_PERSON: CameraManWorkMode;
    static CUSTOM: CameraManWorkMode;
}

export declare class FireRequests {
    static ofRotation(change: Change<Trio<Angle>>): FireRequest<RotationChange>;
    static ofScale(change: Change<Trio<number>>): FireRequest<ScaleChange>;
    static ofTransition(change: Change<Point3D>): FireRequest<PositionChange>;
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

export declare class Sprite {
    readonly name: string;
    readonly applicationName: string;

    position: Point3D;
    rotation: Trio<Angle>;
    scale: Trio<number>;
    hidden: boolean;
}

export declare class WebGLXApplication {
    readonly cameraMan: CameraMan;
    readonly logger: Logger;
    readonly signals: WebGLXApplicationSignalWorkspace;

    abstract main();

    glxSprite(load: MeshSpriteLoad): Sprite;
    onSignal(signalName: string, consume: SignalConsumer);
}

export declare class WebGLXApplicationInfos {
    static ADDED_SPRITE: WebGLXApplicationInfo;
    static CONSTRUCTED: WebGLXApplicationInfo;
}

export declare class WebGLXApplicationSignalWorkspace {
    readonly camera: CameraSignalWorkspace;
    readonly cameraMan: CameraManSignalWorkspace;
    readonly main: string;

    sprite(sprite: Sprite): string;
}

export declare function change<T>(from: T, to: T): Change<T>;

export declare function duo<T>(first, second): Duo<T>;

export declare function pair<F, S>(first, second): Pair<F, S>;

export declare function position(x: number, y: number, z: number): Point3D

export declare function rotation(psi: Angle, theta: Angle, phi: Angle);

export declare function scale(mx: number, my: number, mz: number): Trio<number>;

export declare function start<WebGLXApplicationClass>(appStart: WebGLXApplicationStart);

export declare function trio<T>(first: T, second: T, third: T): Trio<T>;
