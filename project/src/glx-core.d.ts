import { 
    GLXApplicationInfoType, 
    GLXApplicationSignalWorkspace, 
    GLXCamera,
    GLXCameraManWorkMode,
    GLXCameraSettings,
    GLXControl,
    GLXShadowLightSettings, 
    GLXSprite,
    GLXSpriteSettings,
    GLXSpriteSignalWorkspace,
    LimitChecker, 
    Trio } from "./glx-model";
import { Angle, Point3D } from "./geometry";
import { Logger } from "./logjsx";
import { SignalDescriptor } from "./signals";

export declare class GLXApplication {
    readonly applicationName: string;
    readonly cameraMan: GLXCameraMan;
    readonly logger: Logger;
    readonly signalWorkspace: GLXApplicationSignalWorkspace;

    glxSprite(load: MeshSpriteLoad);
}

export type WebGLXApplicationClass = { new(...args: any[]): GLXApplication };

export type GLXApplicationParams = {
    readonly applicationName: string;
    readonly appStart: GLXApplicationStart;
    readonly mainSignalDescriptor: SignalDescriptor<GLXApplicationInfoType>;
    readonly webGLXEnvironment: GLXEnvironment;
    readonly signalWorkspace: GLXApplicationSignalWorkspace;
}

export type GLXApplicationStart = {
    applicationClass: GLXApplicationClass;
    canvasElementName: string;
    webGLShaders: WebGLShaderReference;
    cameraSettings?: Partial<GLXCameraSettings>;
    logEnabled?: boolean;
    shadowLightSetting?: Partial<GLXShadowLightSettings>;
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

export type GLXControlsParams = {
    applicatioName: string;
    applicationSignalWorkspace: GLXApplicationSignalWorkspace;
    controls: GLXControl[];
    logEnabled?: boolean;
}

export type GLXDrawerConstructorParams = {
    applicationName: string;
    glxEnvironment: GLXEnvironment;
    camera: GLXCamera;
    shadowLightManager: GLXShadowLight;
    sharedUniforms: SharedUniforms;
    spriteManager: GLXSpriteManager;
    applicationSignalWorkspace: WebGLXApplicationSignalWorkspace;
    logEnabled: boolean;
}

export type GLXEnvironment = {
    readonly aspectRatio: number;
    readonly canvas: HTMLCanvasElement;
    readonly glContext: WebGLRenderingContext;

    getProgramInfo(programName: string);
}

export type GLXSpriteCreation = {
    readonly name: string;
    readonly glData: any;
    readonly signalWorkspace: GLXSpriteSignalWorkspace;
    readonly settings?: Partial<GLXSpriteSettings>;
}

export type GLXSpriteData = {
    readonly sprite: Sprite;
    readonly glData: any;
}

declare class GLXSpriteManager {
    createSprite(spriteCreation: GLXSpriteCreation);
    getAllGLXSpritesData(): GLXSpriteData[];
    getAllSprites(): GLXSprite[];
    getGLXSpriteData(name: string): GLXSpriteData|undefined;
    getSprite(name: string): Sprite|undefined
}

declare type GLXSpriteManagerConstructorParams = {
    applicationName: string;
    logEnabled: boolean;
}

export type LightMatrices = {
    readonly projection: number[];
    readonly world: number[];
}

export type MeshSpriteLoad = {
    name: string,
    path: string,
    position?: Point3D,
    rotation?: Trio<Angle>,
    scale?: Trio<number>,
    limitChecker?: LimitChecker,
    hidden?: boolean
}

export type ProgramInfo = {
    program: WebGLProgram,
    attribLocations: any,
    uniformLocations: any
}

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

export type WebGLShaderReference = {
    readonly main: string[];
    readonly color: string[];
}


export declare function start(appStart: GLXApplicationStart);