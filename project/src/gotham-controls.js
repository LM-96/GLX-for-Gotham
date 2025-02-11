import { Angle, AngleMath, degrees, radians } from "./geometry.js";
import {
    GLXControlTypes,
    ifNotNullOrUndefined,
    isNotNullOrUndefined
} from "./glx-model.js";
import { SIGNALS } from "./signals.js";

/**
 * @template T
 * @typedef {import("./glx-model").GLXControl<T>} GLXControl
 */

/**
 * @typedef {import("./glx-model").GLXControlInfo} GLXControlInfo
 */

/**
 * @typedef {import("./glx-model").GLXControlType} GLXControlType
 */

/**
 * @typedef {import("./gotham-controls").KeyMove} KeyMove
 */

/**
 * @template D
 * @typedef {import("./signals").SignalDescriptor<D>} SignalDescriptor
 */

/**
 * @typedef {import("./signals").SubscriptionToken} SubscriptionToken
 */

/**
 * @template T
 * @typedef {import("./glx-model").Trio<T>} Trio<T>
 */

/**
 * @typedef {import("./glx-core").GLXControlsHandlerParams} GLXControlsHandlerParams
 */

/**
 * @template D
 * @typedef {import("./signals").Signal<D>} Signal
 */


export class GothamDatGuiCotrolsHandler {

    /** @type {GLXControl<any>[]} */ #controls = [];
    /** @type {any} */ #settings = {};
    /** @type {SignalDescriptor<GLXControlInfo>|undefined} */ #signalDescriptor;
    /** @type {SubscriptionToken[]} */ #targetSubscriptionTokens = [];


    /**
     * 
     * @param {GLXControlsHandlerParams} params
     */
    setup(params) {
        this.#controls = params.controls;
        this.#signalDescriptor = params.controlsSignalDescriptor;
        this.#targetSubscriptionTokens = [];
        this.#settings = controlsToSettings(this.#controls);
        this.#setupControls(this.#signalDescriptor);
    }

    /**
     * 
     * @param {SignalDescriptor<GLXControlInfo>} signalDescriptor 
     */
    #setupControls(signalDescriptor) {
        /** @type {any} */ let gui = new dat.GUI();
        for (let control of this.#controls) {
            let controller = gui.add(this.#settings, control.type, control.options);
            ifNotNullOrUndefined(control.min, min => controller = controller.min(min));
            ifNotNullOrUndefined(control.max, max => controller = controller.max(max));
            ifNotNullOrUndefined(control.step, step => controller = controller.step(step));
            let onChange = this.#buildOnChange(signalDescriptor, control);
            controller.onChange(onChange);

            let onListenSignal = (/** @type {Signal<any>} */ signal) => {
                let newValue = isNotNullOrUndefined(control.listenReducer) ? control.listenReducer(signal) : signal.data;
                if (newValue !== this.#settings[control.type]) {
                    this.#settings[control.type] = newValue;
                    controller.onChange(undefined);
                    controller.setValue(newValue);
                    controller.onChange(onChange)
                }
            };

            listenControlSignal(control, onListenSignal);
        }
    }

    /**
     * 
     * @param {SignalDescriptor<GLXControlInfo>} signalDescriptor 
     * @param {GLXControl<*>} control 
     * @returns {(value: any) => void}
     */
    #buildOnChange(signalDescriptor, control) {
        return (/** @type {any} */ value) => {
            signalDescriptor.trigger({
                data: {
                    type: control.type,
                    value: value
                }
            });
        };
    }
}


export class GothamKeyboardControlsHandler {

    // @ts-ignore
    /** @type {HTMLCanvasElement}  */ #canvas;

    /** @type {number} */ #canvasHeight = 0;
    /** @type {number} */ #canvasWidth = 0;
    /** @type {boolean} */ #drag = false;
    /** @type {number} */ #previousX = 0;
    /** @type {number} */ #previousY = 0;
    /** @type {any} */ #settings = {};
    /** @type {Angle} */ #stepAngleSize = degrees(5);
    /** @type {number} */ #stepForwardSize = 6;
    /** @type {SignalDescriptor<GLXControlInfo>|undefined} */ #signalDescriptor;

    /**
     * 
     * @param {GLXControlsHandlerParams} params 
     */
    setup(params) {
        this.#signalDescriptor = params.controlsSignalDescriptor;
        this.#canvas = params.canvas;
        this.#canvasHeight = params.canvas.height;
        this.#canvasWidth = params.canvas.width;

        let controls = filterControlsByType(params.controls,
            GLXControlTypes.SPRITE_X, GLXControlTypes.SPRITE_Y,
            GLXControlTypes.SPRITE_PHI);
        this.#settings = controlsToSettings(controls);
        this.#updateSettingsOnSignal(controls);
        this.#attachJsEventListener();
    }

    #attachJsEventListener() {
        this.#canvas.addEventListener('mousedown', this.#onMouseTouchDown.bind(this));
        this.#canvas.addEventListener('mouseup', this.#onMouseTouchUp.bind(this));
        this.#canvas.addEventListener('mousemove', this.#onMouseMove.bind(this));
        this.#canvas.addEventListener('touchend', this.#onMouseTouchUp.bind(this));
        this.#canvas.addEventListener('touchstart', this.#onMouseTouchDown.bind(this));
        this.#canvas.addEventListener('touchmove', this.#onMouseMove.bind(this));
        document.addEventListener('keydown', this.#onKeyDown.bind(this));
    }

    /**
     * 
     * @param {number} dForward 
     * @param {Angle} angle 
     */
    #forwardSprite(dForward, angle) {
        let radians = angle.radiansValue;
        let dx = dForward * Math.sin(radians);
        let dy = dForward * Math.cos(radians);

        if (dx !== 0) {
            this.#signalDescriptor?.trigger({
                data: {
                    type: GLXControlTypes.SPRITE_X,
                    value: this.#settings[GLXControlTypes.SPRITE_X] + dx
                }
            });
        }

        if (dy !== 0) {
            this.#signalDescriptor?.trigger({
                data: {
                    type: GLXControlTypes.SPRITE_Y,
                    value: this.#settings[GLXControlTypes.SPRITE_Y] - dy
                }
            })
        }
    }

    /**
     * 
     * @param {KeyboardEvent} event
     */
    #onKeyDown(event) {
        let keyMove = event.key;
        switch (keyMove) {
            case KeyMoves.ARROW_UP:
                this.#forwardSprite(this.#stepForwardSize, degrees(this.#settings[GLXControlTypes.SPRITE_PHI]));
                break;

            case KeyMoves.ARROW_DOWN:
                this.#forwardSprite(-this.#stepForwardSize, degrees(this.#settings[GLXControlTypes.SPRITE_PHI]));
                break;

            case KeyMoves.ARROW_LEFT:
                this.#turnSprite(this.#stepAngleSize);
                break;

            case KeyMoves.ARROW_RIGHT:
                this.#turnSprite(this.#stepAngleSize.transform(AngleMath.multiplyBy(-1)));
                break;
        }
    }

    /**
     * 
     * @param {MouseEvent|TouchEvent} event 
     */
    #onMouseTouchDown(event) {
        this.#drag = true;
        if (event instanceof MouseEvent) {
            this.#previousX = event.pageX;
            this.#previousY = event.pageY;
        } else {
            this.#previousX = event.touches[0].clientX;
            this.#previousY = event.touches[0].clientY;
        }
        event.preventDefault();
        return false;
    }

    /**
     * 
     * @param {MouseEvent|TouchEvent} event 
     */
    #onMouseTouchUp(event) {
        this.#drag = false;
    }

    /**
     * 
     * @param {MouseEvent|TouchEvent} event
     */
    #onMouseMove(event) {
        if (!this.#drag) return false;
        /** @type {number} */ let dX = 0;
        /** @type {number} */ let dY = 0;
        if (event instanceof MouseEvent) {
            dX = (event.pageX - this.#previousX) * 2 * Math.PI / this.#canvasWidth;
            dY = (event.pageY - this.#previousY) * 2 * Math.PI / this.#canvasHeight;
            this.#previousX = event.pageX;
            this.#previousY = event.pageY;
        } else if (event instanceof TouchEvent) {
            dX = (event.touches[0].clientX - this.#previousX) * 2 * Math.PI / this.#canvasWidth;
            dY = (event.touches[0].clientY - this.#previousY) * 2 * Math.PI / this.#canvasHeight;
            this.#previousX = event.touches[0].clientX;
            this.#previousY = event.touches[0].clientY;
        }

        let currentPhi = degrees(this.#settings[GLXControlTypes.SPRITE_PHI]);
        let nextPhi = currentPhi.transform(AngleMath.sum(radians(dX)));

        this.#turnSprite(nextPhi);
        this.#forwardSprite(dY, nextPhi);
        event.preventDefault();
    }

    /**
     * 
     * @param {Angle} angle
     */
    #turnSprite(angle) {
        this.#signalDescriptor?.trigger({
            data: {
                type: GLXControlTypes.SPRITE_PHI,
                value: this.#settings[GLXControlTypes.SPRITE_PHI] + angle.degreesValue
            }
        });
    }

    /**
     * 
     * @param {GLXControl<any>[]} controls 
     */
    #updateSettingsOnSignal(controls) {
        for (let control of controls) {
            let onListenedSignal = isNotNullOrUndefined(control.listenReducer) ?
                // @ts-ignore
                (/** @type {Signal<*>} */ signal) => this.#settings[control.type] = control.listenReducer(signal) :
                (/** @type {Signal<*>} */ signal) => this.#settings = signal.data;

            listenControlSignal(control, onListenedSignal);
        }
    }

}

export class KeyMoves {

    /** @type {KeyMove} */
    static ARROW_UP = 'ArrowUp';

    /** @type {KeyMove} */
    static ARROW_DOWN = 'ArrowDown';

    /** @type {KeyMove} */
    static ARROW_LEFT = 'ArrowLeft';

    /** @type {KeyMove} */
    static ARROW_RIGHT = 'ArrowRight';
}

/**
  * 
  * @param {GLXControl<any>[]} controls 
  * @returns {any}
  */
function controlsToSettings(controls) {
    /** @type {any} */ let settings = {};
    for (let control of controls) {
        settings[control.type] = control.value
    }

    return settings;
}

/**
 * 
 * @param {GLXControl<any>[]} controls
 * @param {...GLXControlType} types 
 * @returns {GLXControl<any>[]}
 */
function filterControlsByType(controls, ...types) {
    if (isNotNullOrUndefined(types) && types.length > 0) {
        return controls.filter(control => types.includes(control.type));
    }

    return [];
}

/**
 * 
 * @param {GLXControl<any>} control 
 * @param {(signal: Signal<any>) => void} onListenedSignal 
 */
function listenControlSignal(control, onListenedSignal) {
    let subscribeListenSignal = (/** @type {string} */ signalName) => {
        SIGNALS.subscribe(signalName, onListenedSignal)
    }

    ifNotNullOrUndefined(control.listenSignal, subscribeListenSignal);
    ifNotNullOrUndefined(control.listenSignalPool, listenSignalNames => {
        for (let signalName of listenSignalNames) {
            if (isNotNullOrUndefined(control.listenSignalGuard)) {
                SIGNALS.subscribe(signalName, (/** @type {Signal<any>} */ signal) => {
                    // @ts-ignore
                    if (control.listenSignalGuard(signal)) {
                        onListenedSignal(signal);
                    }
                })
            } else {
                subscribeListenSignal(signalName);
            }
        }
    })
}
