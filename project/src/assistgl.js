import { Angle, Point3D, point3D, radians } from "./geometry";


/**
 * @template T
 * @typedef {Readonly<{first: T, second: T}>} Pair
 */

/**
 * @template T
 * @typedef {Readonly<{first: T, second: T}>} Trio
 */

/**
 * @callback LimitChecker
 * @param {Point3D} point
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

export class MeshObject {

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
        this.name = name;
        this.glDomainName = glDomainName;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.limitChecker = limitChecker;
        this.hidden = hidden;
    }

}