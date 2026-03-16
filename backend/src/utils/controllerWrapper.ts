import { NextFunction, Request, Response } from "express";

type ExpressRouteHandler<T> = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<T> | T;

export function controllerWrapper<T>(routeHandler: ExpressRouteHandler<T>) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await routeHandler(req, res, next);
            if (res.headersSent) return;

            const status = (result as any).status || 200;

            res.status(status).json(result);
        } catch (error) {
            next(error);
        }
    };
}