// @ts-check
/**
 * @author Luca Marchegiani
 */

/* TYPES (JSDoc) **************************************************************************************************** */

/**
 * @typedef {import("./logjsx").LoggerImpl} LoggerImpl
 */

/* STATIC CLASSES *************************************************************************************************** */
class LogJSX {

    /** @type {Map<string, Logger>} */
    static #loggers = new Map();

    /** @type {boolean} */
    static #loggingEnabled = false;

    /**
     *
     * @returns {Map<string, Logger>}
     */
    static get loggers() {
        return this.#loggers;
    }

    static get loggingEnabled() {
        return this.#loggingEnabled;
    }

    static set loggingEnabled(enabled) {
        this.#loggingEnabled = enabled;
    }
}

/* OBJECTS ********************************************************************************************************** */

/**
 *
 * @param {string} name
 * @returns {LoggerImpl}
 */
function ConsoleLoggerImpl(name) {
    let prefix = `${name} | `;
    return Object.freeze({
        debug: (...data) => console.debug(prefix, ...data),
        error: (...data) => console.error(prefix, ...data),
        info: (...data) => console.info(prefix, ...data),
        warn: (...data) => console.warn(prefix, ...data),
    });
}

const NO_OPERATION = () => {};

/** @type {LoggerImpl} */
const NoOpLoggerImpl = Object.freeze({
    debug: NO_OPERATION,
    error: NO_OPERATION,
    info: NO_OPERATION,
    warn: NO_OPERATION
});

/* CLASSES ********************************************************************************************************** */

export class Logger {

    /**
     *
     * @param {string} name
     * @returns {Logger}
     */
    static forName(name) {
        return new Logger(name);
    }

    /** @type {boolean} */ #enabled;
    /** @type {LoggerImpl} */ #impl;

    /**
     *
     * @param {string} name
     */
    constructor(name) {
        this.#impl = ConsoleLoggerImpl(name);
        this.#setImpl(this.#impl);
        LogJSX.loggers.set(name, this);

        this.#enabled = LogJSX.loggingEnabled;
        if (!this.#enabled) {
            this.disable();
        }
    }

    get enabled() {
        return this.#enabled;
    }

    enable() {
        this.#setImpl(this.#impl);

        this.#enabled = true;
        return this;
    }

    disable() {
        this.#setImpl(NoOpLoggerImpl);
        
        this.#enabled = false;
        return this;
    }

    /**
     *
     * @param {LoggerImpl} loggerImpl
     */
    #setImpl(loggerImpl) {
        this.debug = loggerImpl.debug;
        this.error = loggerImpl.error;
        this.info = loggerImpl.info;
        this.warn = loggerImpl.warn;
    }
}

/* FUNCTIONS ******************************************************************************************************** */

/**
 *
 */
export function disableLogging() {
    LogJSX.loggingEnabled = false;
    for (let logger of LogJSX.loggers.values()) {
        logger.disable();
    }
}

/**
 * 
 * @returns {boolean}
 */
export function loggingEnabled() {
    return LogJSX.loggingEnabled;
}

/**
 *
 */
export function enableLogging() {
    LogJSX.loggingEnabled = true;
    for (let logger of LogJSX.loggers.values()) {
        logger.enable();
    }
}
