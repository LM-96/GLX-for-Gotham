class Signals {
    static MY_SIGNAL = "my signal";
}

const trigger = SIGNALS.register(Signals.MY_SIGNAL);
SIGNALS.subscribe(Signals.MY_SIGNAL, signal => console.log(signal));

trigger.fire()