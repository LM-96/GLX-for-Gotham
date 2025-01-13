import { Angle, Point3D } from "./geometry";
import { FireRequest } from "./signals";

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

export type PositionChange = Change<Point3D>;

export type RotationChange = Change<Trio<Angle>>;

export type ScaleChange = Change<Trio<number>>;

export declare class FireRequests {
    static ofRotation(change: Change<Trio<Angle>>): FireRequest<RotationChange>;
    static ofScale(change: Change<Trio<number>>): FireRequest<ScaleChange>;
    static ofTransition(change: Change<Point3D>): FireRequest<PositionChange>;
}

export declare class LimitCheckers {
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
    readonly glDomainName: string;

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

export declare function change<T>(from: T, to: T): Change<T>;

export declare function duo<T>(first, second): Duo<T>;

export function trio<T>(first: T, second: T, third: T): Trio<T>;


