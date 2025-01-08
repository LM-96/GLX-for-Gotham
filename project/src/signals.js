/**
 * @callback FireRequestConsumer
 * @param {FireRequest} fireRequest
 */

/**
 * @callback SignalConsumer
 * @param {Signal} signal
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

class FireRequest {

    /**
     *
     * @param {any} data
     * @param {any} source
     */
    constructor(data, source) {
        this.data = data;
        this.source = source;
        Object.freeze(this);
    }
}

class SignalTrigger {
    /** @type string */
    #signalName;

    /** @type FireRequestConsumer */
    #notifyFire;

    /**
     *
     * @param {string} signalName
     * @param {(fireRequest: FireRequest) => void} notifyFire
     */
    constructor(signalName, notifyFire) {
        this.#signalName = signalName;
        this.#notifyFire = notifyFire;
    }

    /**
     *
     * @param {any} data
     * @param {any} source
     * @return {void}
     */
    fire(data = UNSPECIFIED, source = UNSPECIFIED) {
        let fireRequest = new FireRequest(data, source)
        this.#notifyFire(fireRequest)
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
     * @returns {SignalTrigger}
     */
    register(signalName) {
        this.#subscriptions.set(signalName, []);
        return new SignalTrigger(signalName, (fireRequest) => this.#fire(signalName, fireRequest));
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
        this.#removeSubscription(token.signalName, token.id)
    }

    /**
     *
     * @param {string} signalName
     * @param {SignalSubscription} subscription
     */
    #addSubscription(signalName, subscription) {
        let subscribers = this.#subscriptions.get(signalName);
        subscribers.push(subscription);
        console.log('added subscription <' + JSON.stringify(subscription) + '>')
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
            subscription.action(signal)
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

const SIGNALS = new SignalBroker();
const UNSPECIFIED = {
    id: "unspecified"
};