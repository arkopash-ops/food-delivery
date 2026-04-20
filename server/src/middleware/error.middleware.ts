import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
    statusCode?: number;
}

export const errorLogger = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(`ERROR ${req.method} ${req.url} - ${err.message}`);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};
