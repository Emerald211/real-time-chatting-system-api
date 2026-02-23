import logger from '../config/logger.js';
const loggingMiddleware = (req, res, next) => {
    const startTime = Date.now();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip,
        });
    });
    next();
};
export default loggingMiddleware;
//# sourceMappingURL=loggingMiddleware.js.map