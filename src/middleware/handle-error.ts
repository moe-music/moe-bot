import { ErrorRequestHandler } from 'express';

import { Logger } from '../services/index.js';

const logger = new Logger();
export function handleError(): ErrorRequestHandler {
    return (error, req, res, _next) => {
        logger.error(
            `API error: ${error}`
        );
        res.status(500).json({ error: true, message: error.message });
    };
}
