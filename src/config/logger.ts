import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeEnv = process.env.NODE_ENV || 'development';
const logDir = path.join(__dirname, '../../logs');

// Define log format
const logFormat = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.errors({ stack: true }),
	winston.format.splat(),
	winston.format.json(),
);

// Console format for development
const consoleFormat = winston.format.combine(
	winston.format.colorize(),
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.printf(({ timestamp, level, message, ...meta }) => {
		let msg = `${timestamp} [${level}]: ${message}`;
		if (Object.keys(meta).length > 0) {
			msg += ` ${JSON.stringify(meta)}`;
		}
		return msg;
	}),
);

// Create logger instance
const logger = winston.createLogger({
	level: nodeEnv === 'production' ? 'info' : 'debug',
	format: logFormat,
	defaultMeta: { service: 'websocket-app' },
	transports: [
		// Error log file
		new winston.transports.File({
			filename: path.join(logDir, 'error.log'),
			level: 'error',
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		}),
		// Combined log file
		new winston.transports.File({
			filename: path.join(logDir, 'combined.log'),
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		}),
	],
});

// Add console transport in development
if (nodeEnv !== 'production') {
	logger.add(
		new winston.transports.Console({
			format: consoleFormat,
		}),
	);
}

// Create log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true });
}

export default logger;
