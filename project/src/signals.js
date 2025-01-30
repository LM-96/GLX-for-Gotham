// @ts-check
/**
 * @author Luca Marchegiani
 */

import { Logger } from "./logjsx.js";

/* TYPES (JSDoc) **************************************************************************************************** */

/**
 * @template D
 * @typedef {import("./signals.js").FireRequest<D>} FireRequest
 */

/**
 * @template D
 * @typedef {import("./signals").Signal<D>} Signal
 */

/**
 * @template D
 * @typedef {import("./signals").SignalConsumer<D>} SignalConsumer
 */

/**
 * @template D
 * @typedef {import("./signals").SignalDescriptor<D>} SignalDescriptor
 */

/**
 * @template D
 * @typedef {import("./signals").SignalSubscriber<D>} SignalSubscriber
 */

/**
 * @template D
 * @typedef {import("./signals").SignalTrigger<D>} SignalTrigger
 */

/**
 * @typedef {import("./signals").SubscriptionToken} SubscriptionToken
 */


/**
 *
 */

/* CLASSES ********************************************************************************************************** */

class SignalBroker {

    /** @type {number} */ #currentId = -1;

    /** @type {Logger} */ #log = Logger.forName('SignalBroker');

    /** @type {Map<string, SignalSubscription<any>[]>} */
    #subscriptions = new Map();

    /**
     *
     * @template D
     * @param {string} signalName
     * @returns {SignalDescriptor<D>}
     */
    register(signalName) {
        this.#subscriptions.set(signalName, []);

        /** @type {SignalTrigger<any>} */ let signalTrigger = fireRequest => this.#fire(signalName, fireRequest);
        /** @type {SignalSubscriber<any>} */ let signalSubscriber = signalConsumer => this.subscribe(signalName, signalConsumer);

        this.#log.info(`registered signal [signalName: "${signalName}"]`);
        return signalDescriptor(signalName, signalSubscriber, signalTrigger,);
    }

    /**
     *
     * @template D
     * @param {string} signalName
     * @param {SignalConsumer<D>} action
     * @returns {SubscriptionToken}
     */
    subscribe(signalName, action) {
        let signalSubscription = new SignalSubscription(this.#currentId, signalName, action);
        this.#currentId++;
        this.#addSubscription(signalName, signalSubscription);

        this.#log.info(`signal has been subscribed [signalName: "${signalName}", subscriptionId:${signalSubscription.id}]`);
        return subscriptionToken(signalSubscription.id, signalName);
    }

    /**
     *
     * @param {SubscriptionToken} token
     */
    unsubscribe(token) {
        this.#log.info(`signal has been unsubscribed [signalName: "${token.signalName}", subscriptionId:${token.id}]`);
        this.#removeSubscription(token.signalName, token.id);
    }

    /**
     *
     * @template T
     * @param {string} signalName
     * @param {SignalSubscription<T>} subscription
     */
    #addSubscription(signalName, subscription) {
        let subscribers = this.#getSubscriptionsOf(signalName);

        subscribers.push(subscription);
        this.#log.info('added subscription [' + JSON.stringify(subscription) + ']');
    }

    /**
     *
     * @template T
     * @param {string} signalName
     * @param {FireRequest<T>} fireRequest
     */
    #fire(signalName, fireRequest) {
        let firingSignal = signal(this.#nextId(), signalName, fireRequest.data, new Date());
        this.#log.info('firing signal [' + JSON.stringify(firingSignal) + ']');
        let subscriptions = this.#getSubscriptionsOf(firingSignal.name);

        for (let subscription of subscriptions) {
            subscription.action(firingSignal);
        }
    }

    /**
     *
     * @param {string} signalName
     * @returns {SignalSubscription<any>[]}
     */
    #getSubscriptionsOf(signalName) {
        let subscribers = this.#subscriptions.get(signalName);
        if (subscribers === undefined) {
            throw new Error('unable to find subscriber for signal "' + signalName + '"');
        }

        return subscribers;
    }


    #nextId() {
        return ++this.#currentId;
    }

    /**
     *
     * @param {string} signalName
     * @param {number} subscriptionId
     */
    #removeSubscription(signalName, subscriptionId) {
        let subscriptions = this.#getSubscriptionsOf(signalName);
        let removingSubscription = subscriptions.find(
            (subscription) => subscription.id === subscriptionId);
        subscriptions = subscriptions.filter(subscription => !subscription.equals(removingSubscription));

        this.#subscriptions.set(signalName, subscriptions);
        console.log('removed subscription <' + JSON.stringify(removingSubscription));
    }

}

/**
 * @template D
 */
class SignalSubscription {

    /**
     *
     * @param {number} id
     * @param {string} signalName
     * @param {SignalConsumer<D>} action
     */
    constructor(id, signalName, action) {
        this.id = id;
        this.signalName = signalName;
        this.action = action;
        Object.freeze(this);
    }

    /**
     *
     * @param {any} other
     * @returns {boolean}
     */
    equals(other) {
        return other.id === this.id && other.signalName === this.signalName;
    }
}

/**
 *
 * @template T
 * @param {number} id
 * @param {string} name
 * @param {T} data
 * @param {Date} time
 * @returns {Signal<T>}
 */
function signal(id, name, data, time) {
    return Object.freeze({
        id: id,
        name: name,
        data: data,
        time: time,
    });
}

/**
 *
 * @template T
 * @param {string} signalName
 * @param {SignalSubscriber<T>} signalSubscriber
 * @param {SignalTrigger<T>} signalTrigger
 * @returns {SignalDescriptor<T>}
 */
function signalDescriptor(signalName, signalSubscriber, signalTrigger) {
    if (signalName === undefined || signalName === null) {
        throw new Error('signalName is required');
    }
    return Object.freeze({
        name: signalName,
        subscriber: signalSubscriber,
        trigger: signalTrigger,
    });
}

/* CONSTANTS ******************************************************************************************************** */

export const SIGNALS = new SignalBroker();

/* UTILITIES ******************************************************************************************************** */

/**
 *
 * @param {number} id
 * @param {string} name
 * @returns {SubscriptionToken}
 */
function subscriptionToken(id, name) {
    return Object.freeze({
        id: id,
        signalName: name,
    });
}