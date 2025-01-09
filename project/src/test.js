import { SIGNALS } from "./signals.js";


class Signals {
    static MY_SIGNAL = "my signal";
}

const descriptor = SIGNALS.register(Signals.MY_SIGNAL);
SIGNALS.subscribe(Signals.MY_SIGNAL, signal => console.log(signal));

descriptor.trigger({
    data: undefined,
    source: undefined,
});