// @ts-check
/**
 * @author Luca Marchegiani
 */

import { Angle, Point3D, point3D, radians } from "./geometry.js";
import { SIGNALS } from "./signals.js";

/* TYPES (JSDoc) **************************************************************************************************** */

/**
 * @template T
 * @typedef {import("./assistgl").Duo<T>} Duo
 */

/**
 * @template T
 * @typedef {import("./assistgl").Change<T>} Change
 */

/**
 * @template T
 * @typedef {import("./signals").FireRequest<T>} FireRequest
 */

/**
 * @typedef {import("./assistgl").LimitChecker} LimitChecker
 */

/**
 * @typedef {import("./assistgl").LogFunction} LogFunction
 */

/**
 * @typedef {import('./assistgl').Log} Log
 */

/**
 * @template T
 * @typedef {import("./signals.js").SignalDescriptor<T>} SignalDescriptor
 */

/**
 * @template T
 * @typedef {import("./assistgl").Trio<T>} Trio
 */

/**
 * @typedef {import("./assistgl").PositionChange} PositionChange
 */

/**
 * @typedef {import("./assistgl").RotationChange} RotationChange
 */

/**
 * @typedef {import("./assistgl").ScaleChange} ScaleChange
 */

/**
 * @typedef {import("./assistgl").SpriteAction} SpriteAction
 */

/**
 * @typedef {import("./assistgl").SpriteActionType} SpriteActionType
 */

/* STATIC CLASSES *************************************************************************************************** */

export class SpriteActions {
    /** @type {SpriteActionType} */ static TRANSITION = 1;
    /** @type {SpriteActionType} */ static ROTATION = 2;
    /** @type {SpriteActionType} */ static SCALE = 3;
}

class FireRequests {

    /**
     * @param {Change<Trio<Angle>>} change
     * @returns {FireRequest<SpriteAction>}
     */
    static ofRotation(change) {
        return Object.freeze({
            data: Object.freeze({
                type: SpriteActions.ROTATION,
                description: change,
            })
        });
    }

    /**
     *
     * @param {Change<number>} change
     * @returns {FireRequest<SpriteAction>}
     */
    static ofScale(change) {
        return Object.freeze({
            data: Object.freeze({
                type: SpriteActions.SCALE,
                description: change,
            })
        });
    }

    /**
     *
     * @param {Change<Point3D>} change
     * @returns {FireRequest<SpriteAction>}
     */
    static ofTransition(change) {
        return Object.freeze({
            data: Object.freeze({
                type: SpriteActions.TRANSITION,
                description: change
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
    static NOT_ROTATED = trio(radians(0), radians(0), radians(0));
}

class Scales {
    /** @type {Trio<number>} */
    static NOT_SCALED = trio(1, 1, 1);
}

/* CLASSES ********************************************************************************************************** */




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
                rotation = Rotations.NOT_ROTATED,
                scale = Scales.NOT_SCALED,
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
     * @param {Point3D} position
     */
    set position(position) {
        let positionChange = change(position, this.#position);

        if (!this.limitChecker(this, position)) {
            throw new Error(`invalid position change [sprite ${this.#name}, target: ${position}]: out of bounds`);
        }

        this.#position = position;
        this.#informationSignalDescriptor.trigger(FireRequests.ofTransition(positionChange));
    }

    /**
     *
     * @param {Trio<Angle>} rotation
     */
    set rotation(rotation) {
        let rotationChange = change(rotation, this.#rotation);

        this.#rotation = rotation;
        this.#informationSignalDescriptor.trigger(FireRequests.ofRotation(rotationChange));
    }

    set scale(scale) {
        let scaleChange = change(scale, this.#scale);

        this.#scale = scale;
        this.#informationSignalDescriptor.trigger(FireRequests.ofScale(scaleChange));
    }

}

/* FUNCTIONS ******************************************************************************************************** */

/**
 * @template T
 * @param {T} to
 * @param {T} from
 * @returns {Change<T>}
 */
export function change(to, from) {
    return Object.freeze({
        to: to,
        from: from,
    });
}

/**
 * @template T
 * @param {T} first
 * @param {T} second
 * @returns {Duo<T>}
 */
export function duo(first, second) {
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

