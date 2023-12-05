import { Request, Response, NextFunction } from "express"

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {

    if (err) console.error(err);

    res.sendStatus(500)
}

export default errorHandler