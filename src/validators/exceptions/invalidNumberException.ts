export class InvalidNumberException extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, InvalidNumberException.prototype);
    }
}