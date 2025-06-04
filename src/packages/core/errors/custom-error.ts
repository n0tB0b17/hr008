class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError"
    }
}


class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BadRequestError"
    }
}

class ForbiddenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ForbiddenError"
    }
}


export {
    NotFoundError,
    BadRequestError,
    ForbiddenError
}