/**
 * @typedef {Readonly<{data: any, source: any}>} FireRequest
 * @typedef {Readonly<{name: string, subscriber: SignalSubscriber, trigger: SignalTrigger}>} SignalDescriptor
 */

/**
 * @callback SignalTrigger
 * @param {FireRequest} fireRequest
 */

/**
 * @callback SignalConsumer
 * @param {Signal} signal
 */

/**
 * @callback SignalSubscriber
 * @param {SignalConsumer} signalConsumer
 */


class Signal {

    /**
     *
     * @param {number} id
     * @param {string} name
     * @param {any} data
     * @param {string} source
     * @param {Date} time
     */
    constructor(id, name, data, source, time) {
        this.id = id;
        this.name = name;
        this.data = data;
        this.source = source;
        this.time = time;
        Object.freeze(this);
    }


}

class SignalSubscription {

    /**
     *
     * @param {number} id
     * @param {string} signalName
     * @param {SignalConsumer} action
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
    /** @type {Map<string, SignalSubscription[]>} */
    #subscriptions = new Map();

    /** @type {number} */
    #currentId = -1;

    /**
     *
     * @param {string} signalName
     * @returns {SignalDescriptor}
     */
    register(signalName) {
        this.#subscriptions.set(signalName, []);
        let signalTrigger =  fireRequest => this.#fire(signalName, fireRequest);
        let signalSubscriber = signalConsumer => this.subscribe(signalName, signalConsumer);

        return signalDescriptor(signalName, signalTrigger, signalSubscriber);
    }

    /**
     *
     * @param {string} signalName
     * @param {SignalConsumer} action
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
     * @param {string} signalName
     * @param {SignalSubscription} subscription
     */
    #addSubscription(signalName, subscription) {
        let subscribers = this.#subscriptions.get(signalName);
        subscribers.push(subscription);
        console.log('added subscription <' + JSON.stringify(subscription) + '>');
    }

    /**
     *
     * @param {string} signalName
     * @param {FireRequest} fireRequest
     */
    #fire(signalName, fireRequest) {
        let signal = new Signal(this.#nextId(), signalName, fireRequest.data, fireRequest.source, new Date());
        console.log('firing signal <' + JSON.stringify(signal) + '>');
        let subscriptions = this.#subscriptions.get(signalName);

        for (let subscription of subscriptions) {
            subscription.action(signal);
        }
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
        let subscriptions = this.#subscriptions.get(signalName);
        let removingSubscription = subscriptions.find(
            (subscription) => subscription.id === subscriptionId);
        subscriptions = subscriptions.filter(subscription => !subscription.equals(removingSubscription));

        this.#subscriptions.set(signalName, subscriptions);
        console.log('removed subscription <' + JSON.stringify(removingSubscription));
    }

}

/**
 *
 * @param {string} signalName
 * @param {SignalSubscriber} signalSubscriber
 * @param {SignalTrigger} signalTrigger
 * @returns {SignalDescriptor}
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