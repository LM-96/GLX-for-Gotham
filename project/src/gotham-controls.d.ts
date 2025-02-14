import { GLXControlHandler, GLXControlsHandlerParams } from "./glx-core";

export type KeyMove = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

export declare class GothamDatGuiCotrolsHandler implements GLXControlHandler {
    setup(params: GLXControlsHandlerParams);
}

export declare class GothamKeyboardMouseTouchControlsHandler implements GLXControlHandler {
    setup(params: GLXControlsHandlerParams);
}

export declare class KeyMoves {
    static ARROW_UP: KeyMove;
    static ARROW_DOWN: KeyMove;
    static ARROW_LEFT: KeyMove;
    static ARROW_RIGHT: KeyMove;
}