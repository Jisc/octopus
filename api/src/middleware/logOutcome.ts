import { MiddlewareObj } from '@middy/core';
import * as I from 'lib/interface';

interface HttpError extends Error {
    statusCode?: number;
}

const logOutcome = (actionName: string): MiddlewareObj<I.APIRequest> => {
    return {
        after: (request): void => {
            const statusCode = request.response?.statusCode ?? 200;

            if (statusCode >= 400) {
                console.error('[Bad Response]', {
                    action: actionName,
                    path: request.event?.rawPath,
                    method: request.event?.requestContext?.http?.method,
                    statusCode,
                    body: request.response?.body
                });
            }
        },

        onError: (request): void => {
            const error = request.error as HttpError;

            let statusCode = 500;

            if ('statusCode' in error && typeof error.statusCode === 'number') {
                statusCode = error.statusCode;
            } else if (error.name === 'ValidationError') {
                statusCode = 400;
            } else if (error.name === 'UnauthorizedError') {
                statusCode = 401;
            } else if (error.name === 'ForbiddenError') {
                statusCode = 403;
            }

            console.error('[Handler Error]', {
                action: actionName,
                path: request.event?.rawPath,
                method: request.event?.requestContext?.http?.method,
                statusCode,
                message: error?.message,
                stack: error?.stack
            });

            // let Middy’s default error handling continue
            throw error;
        }
    };
};

export default logOutcome;
