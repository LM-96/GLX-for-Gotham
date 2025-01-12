import { Angle, Point3D, point3D, radians } from "./geometry";
import { SIGNALS } from "./signals.js";

/**
 * @template T
 * @typedef {object} MutableChange
 * @property {T} from
 * @property {T} to
 * @readonly
 */
/**
 * @template T
 * @typedef {object} MutablePair
 * @property {T} first
 * @property {T} second
 */
/**
 * @typedef {object} MutableSpriteAction
 * @property {number} type
 * @property {PositionChange | RotationChange | ScaleChange} description
 */
/**
 * @template T
 * @typedef {object} MutableTrio
 * @property {T} first
 * @property {T} second
 * @property {T} third
 * @readonly
 */
/**
 * @template T
 * @typedef {Readonly<MutableChange<T>>} Change
 */
/**
 * @template T
 * @typedef {import("./signals.js").FireRequest<T>} FireRequest
 */
/**
 * @callback LimitChecker
 * @param {Sprite} sprite
 * @returns {boolean}
 */
/**
 * @template T
 * @typedef {Readonly<MutablePair<T>>} Pair
 */
/**
 * @template T
 * @typedef {import("./signals.js").SignalDescriptor<T>} SignalDescriptor
 */
/**
 * @template T
 * @typedef {Readonly<MutableTrio<T>>} Trio
 */

/** @typedef {Change<Point3D>} PositionChange */
/** @typedef {Change<Trio<Angle>>} RotationChange */
/** @typedef {Change<Trio<number>>} ScaleChange */
/** @typedef {Readonly<MutableSpriteAction>} SpriteAction */

/**
 * @template T
 * @param {T} from
 * @param {T} to
 * @returns {Change<T>}
 */
export function change(from, to) {
    return Object.freeze({
        from: from,
        to: to,
    });
}

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

class SpriteChanges {
    static TRANSITION = 1;
    static ROTATION = 2;
    static SCALE = 3;
}

class FireRequests {

    /**
     * @param {Trio<Angle>} from
     * @param {Trio<Angle>} to
     * @returns {FireRequest<SpriteAction>}
     */
    static ofRotation(from, to) {
        return Object.freeze({
            data: Object.freeze({
                type: SpriteChanges.SCALE,
                description: change(from, to),
            })
        });
    }

    /**
     *
     * @param {Trio<number>} from
     * @param {Trio<number>} to
     * @returns {FireRequest<SpriteAction>}
     */
    static ofScale(from, to) {
        return Object.freeze({
            data: Object.freeze({
                type: SpriteChanges.SCALE,
                description: change(from, to),
            })
        });
    }

    /**
     *
     * @param {Point3D} from
     * @param {Point3D} to
     * @returns {FireRequest<SpriteAction>}
     */
    static ofTransition(from, to) {
        return Object.freeze({
            data: Object.freeze({
                type: SpriteChanges.TRANSITION,
                description: change(from, to)
            }),
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
    /**  @type {string | undefined} */ #glDomainName;
    /**  @type {Point3D} */ #position;
    /**  @type {Trio<Angle>} */ #rotation;
    /**  @type {Trio<number>} */ #scale;
    /**  @type {LimitChecker} */ #limitChecker;
    /**  @type {boolean} */ #hidden;
    /**  @type {SignalDescriptor<SpriteAction>} */ #informationSignalDescriptor;

    /**
     *
     * @param {string} name
     * @param {string | undefined} glDomainName
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

        this.#informationSignalDescriptor = SIGNALS.register("");
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
        let previousPosition = position;
        this.#position = position;
        this.#informationSignalDescriptor.trigger(FireRequests.ofTransition(previousPosition, position));
    }

    /**
     *
     * @param {Trio<Angle>} rotation
     */
    set rotation(rotation) {
        let previousRotation = rotation;
        this.#rotation = rotation;
        this.#informationSignalDescriptor.trigger(FireRequests.ofRotation(previousRotation, rotation));
    }


}