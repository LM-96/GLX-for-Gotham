
export type FireRequest<D> = {
    readonly data: D;
};

export type Signal<D> = {
    readonly id: number;
    readonly name: string;
    readonly data?: D;
    readonly time: Date
};

export type SignalConsumer<D> = (signal: Signal<D>) => void;

export type SignalDescriptor<D> = {
    readonly name: string;
    readonly subscriber: SignalSubscriber<D>;
    readonly trigger: SignalTrigger<D>
};

export type SignalSubscriber<D> = (consumer: SignalConsumer<D>) => SubscriptionToken;

export type SignalTrigger<D> = (request: FireRequest<D>) => void;

export type SubscriptionToken = {
    readonly id: number;
    readonly signalName: string;
};

export declare class SignalBroker {
    register<D>(signalName: string): SignalDescriptor<D>;
    subscribe<D>(signalName: string, action: SignalConsumer<D>): SubscriptionToken;
    unsubscribe(token: SubscriptionToken);

}

export declare class SignalSubscription<D> {
    readonly id: number;
    readonly signalName: string;
    readonly action: SignalConsumer<D>

    equals(other: any): boolean;
}

export const SIGNALS: SignalBroker;
export const SIGSYS: SigSys;