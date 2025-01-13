import { SIGNALS } from "./signals.js";
import { disableLogging, Logger } from "./logjsx.js";


class Signals {
    static MY_SIGNAL = "my signal";
}

const descriptor = SIGNALS.register(Signals.MY_SIGNAL);
SIGNALS.subscribe(Signals.MY_SIGNAL, signal => console.log(signal));

descriptor.trigger({
    data: undefined,
    source: undefined,
});

disableLogging();
const logger = Logger.forName("test");
logger.info("INFO", descriptor);
logger.error("ERROR");
logger.warn("WARNING");
logger.debug("DEBUG");