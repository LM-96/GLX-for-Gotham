
export type LogFunction = (...data: any[]) => void;

export type LoggerImpl = {
    readonly debug: LogFunction;
    readonly error: LogFunction;
    readonly info: LogFunction;
    readonly warn: LogFunction;
}

export declare function disableLogging();

export declare function loggingEnabled();

export declare function enableLogging();

export declare class Logger {
    static forName(name: string): Log;

    debug(...data: any[]): void;
    disable(): Logger;
    enable(): Logger;
    error(...data: any[]): void;
    info(...data: any[]): void;
    warn(...data: any[]): void;
}