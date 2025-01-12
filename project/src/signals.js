/**
 * @template T
 * @typedef {object} MutableFireRequest
 * @property {T} data
 */
/**
 * @template T
 * @typedef {object} MutableSignalDescriptor
 * @property {string} name
 * @property {SignalSubscriber<T>} subscriber
 * @property {SignalTrigger<T>} trigger
 */
/**
 * @template T
 * @callback SignalConsumer
 * @param {Signal<T>} signal
 */
/**
 * @template T
 * @typedef {Readonly<MutableSignalDescriptor<T>>} SignalDescriptor
 */
/**
 * @template T
 * @callback SignalTrigger
 * @param {FireRequest<T>} fireRequest
 */
/**
 * @template T
 * @callback SignalSubscriber
 * @param {SignalConsumer<T>} signalConsumer
 */

/**
 * @template T
 * @typedef {Readonly<MutableFireRequest<T>>} FireRequest
 */

/**
 * @template T
 */
class Signal {

    /**
     *
     * @param {number} id
     * @param {string} name
     * @param {T} data
     * @param {Date} time
     */
    constructor(id, name, data, time) {
        this.id = id;
        this.name = name;
        this.data = data;
        this.time = time;
        Object.freeze(this);
    }


}

/**
 * @template T
 */
class SignalSubscription {

    /**
     *
     * @param {number} id
     * @param {string} signalName
     * @param {SignalConsumer<T>} action
     */
    constructor(id, signalName,  action) {
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

class SubscriptionToken {

    /**
     *
     * @param {number} id
     * @param {string} signalName
     */
    constructor(id, signalName) {
        this.id = id;
        this.signalName = signalName;
        Object.freeze(this);
    }
}

class SignalBroker {
    /** @type {Map<string, SignalSubscription<any>[]>} */
    #subscriptions = new Map();

    /** @type {number} */
    #currentId = -1;

    /**
     *
     * @template T
     * @param {string} signalName
     * @returns {SignalDescriptor<T>}
     */
    register(signalName) {
        this.#subscriptions.set(signalName, []);

        /** @type {SignalTrigger<T>} */ let signalTrigger =  fireRequest => this.#fire(signalName, fireRequest);
        /** @type {SignalSubscriber<T>} */ let signalSubscriber = signalConsumer => this.subscribe(signalName, signalConsumer);

        return signalDescriptor(signalName, signalSubscriber, signalTrigger,);
    }

    /**
     *
     * @template T
     * @param {string} signalName
     * @param {SignalConsumer<T>} action
     * @returns {SubscriptionToken}
     */
    subscribe(signalName, action) {
        let signalSubscription = new SignalSubscription(this.#currentId, signalName, action);
        this.#currentId ++;
        this.#addSubscription(signalName, signalSubscription);

        return new SubscriptionToken(signalSubscription.id, signalName);
    }

    /**
     *
     * @param {SubscriptionToken} token
     */
    unsubscribe(token) {
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
        console.log('added subscription <' + JSON.stringify(subscription) + '>');
    }

    /**
     *
     * @template T
     * @param {string} signalName
     * @param {FireRequest<T>} fireRequest
     */
    #fire(signalName, fireRequest) {
        let signal = new Signal(this.#nextId(), signalName, fireRequest.data, new Date());
        console.log('firing signal <' + JSON.stringify(signal) + '>');
        let subscriptions = this.#getSubscriptionsOf(signal.name);

        for (let subscription of subscriptions) {
            subscription.action(signal);
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
            throw new Error('unable to find subscriber for signal "' + signalName + '"')
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

export const SIGNALS = new SignalBroker();
export const UNSPECIFIED = {
    id: "unspecified"
};