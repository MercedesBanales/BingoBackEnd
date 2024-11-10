export class InvalidFormatException extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, InvalidFormatException.prototype);
    }
}