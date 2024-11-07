export class NotFoundException extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, NotFoundException.prototype);
    }
}