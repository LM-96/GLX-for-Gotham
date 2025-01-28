import { Angle, Point3D, Vector3D } from "./geometry";
import { FireRequest, SignalDescriptor } from "./signals";

export type CameraManWorkMode = "DISMISSED" | "OVER" | "FIRST_PERSON" | "THIRD_PERSON" | "CUSTOM";

export type CameraManSignalDescriptors = {
    isLookingAtSpriteChanges: SignalDescriptor<Change<boolean>>;
    isChasingSpriteChanges: SignalDescriptor<Change<boolean>>;
    targetSpriteChanges: SignalDescriptor<Change<Sprite|null>>;
    workModeChanges: SignalDescriptor<Change<CameraManWorkMode>>;
}

export type CameraManSignalWorkspace = {
    isLookingAtSpriteChanges: string;
    isChasingSpriteChanges: string;
    targetSpriteChanges: string;
    workModeChanges: string;
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
    positionChanges: string;
    upChanges: string;
    targetChanges: string;
    fovChanges: string;
    isLookingAtSpriteChanges: string;
    isChasingSpriteChanges: string;
    targetSpriteChanges: string;
}

export type Change<T> = {
    readonly from: T;
    readonly to: T;
};

export type Duo<T> = {
    readonly first: T;
    readonly second: T;
};

export type LimitChecker = (sprite: Sprite, targetPosition: Point3D) => boolean;

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

export type RotationChange = Change<Trio<Angle>>;

export type ScaleChange = Change<Trio<number>>;

export type SpriteSettings = {
    position: Point3D,
    rotation: Trio<Angle>,
    scale: Trio<number>,
    limitChecker: LimitChecker,
    hidden: boolean
}

export type SpriteSignalDescriptors = {
    positionChange: SignalDescriptor<PositionChange>,
    rotationChange: SignalDescriptor<RotationChange>,
    scaleChange: SignalDescriptor<ScaleChange>
}

export type SpriteSignalWorkspace = {
    positionChange: string,
    rotationChange: string,
    scaleChange: string
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

}

export declare function change<T>(from: T, to: T): Change<T>;

export declare function duo<T>(first, second): Duo<T>;

export declare function trio<T>(first: T, second: T, third: T): Trio<T>;
