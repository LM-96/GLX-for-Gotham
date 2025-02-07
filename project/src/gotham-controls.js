import { 
    ifNotNullOrUndefined, 
    isNotNullOrUndefined 
} from "./glx-model.js";
import { SIGNALS } from "./signals.js";

/**
 * @template T
 * @typedef {import("./glx-model.js").GLXControl<T>} GLXControl
 */

/**
 * @typedef {import("./glx-model.js").GLXControlInfo} GLXControlInfo
 */

/**
 * @template D
 * @typedef {import("./signals.js").SignalDescriptor<D>} SignalDescriptor
 */

/**
 * @typedef {import("./signals.js").SubscriptionToken} SubscriptionToken
 */

/**
 * @typedef {import("./glx-core.js").GLXControlHandlerParams} GLXControlsParams
 */

/**
 * @template D
 * @typedef {import("./signals.js").Signal<D>} Signal
 */


export class GLXDatGuiCotrolsHandler {

    /** @type {GLXControl<any>[]} */ #controls = [];
    /** @type {any} */ #settings = {};
    /** @type {SignalDescriptor<GLXControlInfo>|undefined} */ #signalDescriptor;
    /** @type {SubscriptionToken[]} */ #targetSubscriptionTokens = [];

    
    /**
     * 
     * @param {GLXControlsParams} params
     */
    setup(params) {
        this.#controls = params.controls;
        this.#signalDescriptor = params.controlsSignalDescriptor;
        this.#targetSubscriptionTokens = [];
        this.#settings = this.#controlsToSettings(params.controls);
        this.#setupControls(this.#signalDescriptor);
    }

    /**
     * 
     * @param {GLXControl<any>[]} controls 
     * @returns {any}
     */
    #controlsToSettings(controls) {
        /** @type {any} */ let settings = {};
        for (let control of controls) {
            settings[control.type] = control.value
        }

        return settings;
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

            let subscribeListenSignal = (/** @type {string} */ signalName) => {
                SIGNALS.subscribe(signalName, onListenSignal)
            }

            ifNotNullOrUndefined(control.listenSignal, subscribeListenSignal);
            ifNotNullOrUndefined(control.listenSignalPool, listenSignalNames => {
                for (let signalName of listenSignalNames) {
                    if (isNotNullOrUndefined(control.listenSignalGuard)) {
                        SIGNALS.subscribe(signalName, (/** @type {Signal<any>} */ signal) => {
                            // @ts-ignore
                            if (control.listenSignalGuard(signal)) {
                                onListenSignal(signal);
                            }
                        })
                    } else {
                        subscribeListenSignal(signalName);
                    }
                }
            })
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