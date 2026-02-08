import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log directory is in the project root
const logDir = path.resolve(__dirname, '../../../logs');

const transport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '1m', // 1MB limit as requested
    maxFiles: '7d', // Keep for 7 days as requested
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        transport,
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

export default logger;
