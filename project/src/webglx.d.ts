import { Angle, Point3D } from "./geometry";
import { FireRequest, SignalDescriptor } from "./signals";

export type CameraSettings = {
    position: Point3D;
    up: Trio<number>;
    target: Point3D;
    fov: Angle;
    isLookingAtSprite: boolean;
    isChasingSprite: boolean;
    targetSprite: Sprite | null;
}

export type CameraSignalDescriptors = {
    positionChanges: SignalDescriptor<PositionChange>;
    upChanges: SignalDescriptor<Change<Trio<number>>>;
    targetChanges: SignalDescriptor<PositionChange>;
    fovChanges: SignalDescriptor<Change<Angle>>;
    isLookingAtSpriteChanges: SignalDescriptor<Change<boolean>>;
    isChasingSpriteChanges: SignalDescriptor<Change<boolean>>;
    targetSpriteChanges: SignalDescriptor<Change<Sprite|null>>;
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

export type WebGLXApplicationSignalWorkspace = {
    camera: CameraSignalWorkspace
}

export type WebGLShaderReference = {
    readonly main: string[];
    readonly color: string[];
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

export declare class SpriteAction {
    readonly type: SpriteActionType;
    readonly description: PositionChange | RotationChange | ScaleChange;
}

export declare class SpriteActions {
    static TRANSITION: SpriteActionType;
    static ROTATION: SpriteActionType;
    static SCALE: SpriteActionType;
}

export declare class WebGLXApplication {

}

export declare function change<T>(from: T, to: T): Change<T>;

export declare function duo<T>(first, second): Duo<T>;

export declare function trio<T>(first: T, second: T, third: T): Trio<T>;
