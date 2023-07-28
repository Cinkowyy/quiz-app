import { Request, Response, NextFunction } from "express"

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = res.statusCode ? res.statusCode : 500

    res.status(statusCode)

    let errorResponse;

    if (process.env.NODE_ENV === 'development') {
        errorResponse = {
            message: err.message,
            stack: err.stack
        }
    } else {
        errorResponse = {
            message: err.message,
        }
    }

    res.json(errorResponse)
}

export default errorHandler