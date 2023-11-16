import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

type SchemaType = ZodObject<{
  body?: ZodObject<any>
  params?: ZodObject<any>
  query?: ZodObject<any>
}>

const validation = (schema: SchemaType) => (req: Request, res: Response, next: NextFunction) => {

  const params = {
    query: { ...req.query },
    params: { ...req.params },
    body: { ...req.body },
  }

  const validated = schema.safeParse(params)

  if (!validated.success) {
    console.log(validated.error.errors)
    return res.status(400).json({
      type: 'Validation Error',
      errors: validated.error.errors
    })
  }

  return next();
};

export default validation;