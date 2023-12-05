import { Response } from "express";

const errorResponse = ({
    response,
    error,
    message,
    status,
}: {
    response: Response;
    error: string;
    message: string;
    status: number;
}) => {
    return response.status(status).json({
        error,
        message
    })
};

export default errorResponse;
