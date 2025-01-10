import { Angle, Point3D, point3D, radians } from "./geometry";

/**
 * @template T
 * @typedef { Readonly<{first: T, second: T}> } Pair
 */

/**
 * @template T
 * @typedef { Readonly<{first: T, second: T }>} Trio
 */

/**
 * @typedef { Readonly<{type: number, description: PositionChange | RotationChange | ScaleChange}> } SpriteAction
 */

/**
 * @typedef { Readonly<{from: Point3D, to: Point3D}> } PositionChange
 */

/**
 * @typedef { Readonly<{from: Trio<Angle>, to: Trio<Angle>}> } RotationChange
 */

/**
 * @typedef { Readonly<{from: Trio<number>, to: Trio<number>}> } ScaleChange
 */

/**
 * @callback LimitChecker
 * @param {Sprite} sprite
 * @returns {boolean}
 */

/**
 * @template T
 * @param {T} first
 * @param {T} second
 * @returns {Pair<T>}
 */
export function pair(first, second) {
    return Object.freeze({
        first: first,
        second: second
    });
}

/**
 *
 * @param {Point3D} from
 * @param {Point3D} to
 * @returns {PositionChange}
 */
export function positionChange(from, to) {
    return Object.freeze({
        from: from,
        to: to,
    });
}

/**
 *
 * @param {Trio<Angle>} from
 * @param {Trio<Angle>} to
 * @returns {RotationChange}
 */
export function rotationChange(from, to) {
    return Object.freeze({
        from: from,
        to: to,
    });
}

/**
 *
 * @param {Trio<number>} from
 * @param {Trio<number>} to
 * @returns {ScaleChange}
 */
export function scaleChange(from, to) {
    return Object.freeze({
        from: from,
        to: to,
    });
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

class SpriteActions {
    TRANSITION = 1;
    ROTATION = 2;
    SCALE = 3;

    /**
     * @param from
     * @param to
     * @returns SpriteAction
     */
    static transition(from, to) {
        return Object.freeze({

        });
    }
}

class FireRequests {

    /**
     *
     * @param {any} source
     * @param {Trio<number>} from
     * @param {Trio<number>} to
     * @returns {FireRequest<SpriteAction>}
     */
    static scale(source, from, to) {
        return Object.freeze({
            data: scaleChange(from, to),
            source: source
        });
    }

    /**
     *
     * @param {any} source
     * @param {Point3D} from
     * @param {Point3D} to
     * @returns {FireRequest<PositionChange>}
     */
    static transition(source, from, to) {
        return Object.freeze({
            data: positionChange(from, to),
            source: source,
        });
    }

}

class LimitCheckers {
    /** @type {LimitChecker} */
    static UNLIMITED = () => true;
}

class Positions {
    /** @type {Point3D} */
    static ORIGIN = point3D(0, 0, 0);
}

class Rotations {
    /** @type {Trio<Angle>} */
    static UNROTATED = trio(radians(0), radians(0), radians(0));
}

class Scales {
    /** @type {Trio<number>} */
    static UNSCALED = trio(1, 1, 1);
}

export class Sprite {

    /**  @type {string} */ #name;
    /**  @type {string} */ #glDomainName;
    /**  @type {Point3D} */ #position;
    /**  @type {Trio<Angle>} */ #rotation;
    /**  @type {Trio<number>} */ #scale;
    /**  @type {LimitChecker} */ #limitChecker;
    /**  @type {number} */ #hidden;
    /** @type {SignalDescriptor} */ #informationSignalDescriptor;

    /**
     *
     * @param {string} name
     * @param {string} glDomainName
     * @param {Point3D} position
     * @param {Trio<Angle>} rotation
     * @param {Trio<number>} scale
     * @param {LimitChecker} limitChecker
     * @param {boolean} hidden
     */
    constructor(name,
                glDomainName = undefined,
                position = Positions.ORIGIN,
                rotation = Rotations.UNROTATED,
                scale = Scales.UNSCALED,
                limitChecker = LimitCheckers.UNLIMITED,
                hidden = false
    ) {
        this.#name = name;
        this.#glDomainName = glDomainName;
        this.#position = position;
        this.#rotation = rotation;
        this.#scale = scale;
        this.#limitChecker = limitChecker;
        this.#hidden = hidden;
    }

    get name() {
        return this.#name;
    }

    get glDomainName() {
        return this.#glDomainName;
    }

    get position() {
        return this.#position;
    }

    get rotation() {
        return this.#rotation;
    }

    get scale() {
        return this.#scale;
    }

    get limitChecker() {
        return this.#limitChecker;
    }

    get hidden() {
        return this.#hidden;
    }

    /**
     *
     * @param {Point3D} position
     */
    set position(position) {
        this.#position = position;
        this.#informationSignalDescriptor.trigger();
    }
}