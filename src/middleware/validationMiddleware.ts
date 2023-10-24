import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

const createParamsObject = (req: Request) => ({
  query: { ...req.query },
  params: { ...req.params },
  body: { ...req.body },
});

const validation = (schema: ZodType<unknown>) => (req: Request, res: Response, next: NextFunction) => {

    const params = createParamsObject(req)

    const validated = schema.safeParse(params)

    if (!validated.success) {
        console.log(validated.error.errors)
        res.status(400).json({
            type: 'Validation Error',
            errors: validated.error.errors
        })
    }

  return next();
};

export default validation;