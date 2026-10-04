import winston from 'winston';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const level = process.env.LOG_LEVEL || 'info';
const logDir = process.env.LOG_DIR || 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

let transports: winston.transport[] = [
  new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) }),
  new winston.transports.File({ filename: `${logDir}/error.log`, level: 'error' }),
  new winston.transports.File({ filename: `${logDir}/combined.log` }),
];

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const DailyRotateFile = require('winston-daily-rotate-file');
  transports = [
    new winston.transports.Console({ format: winston.format.combine(winston.format.colorize(), winston.format.simple()) }),
    new DailyRotateFile({ filename: `${logDir}/%DATE%-combined.log`, datePattern: 'YYYY-MM-DD', maxFiles: '14d', level }),
    new DailyRotateFile({ filename: `${logDir}/%DATE%-error.log`, datePattern: 'YYYY-MM-DD', maxFiles: '30d', level: 'error' }),
  ];
} catch (e) {
  // if daily rotate not available, fallback to file transports above
}

const logger = winston.createLogger({
  level,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports,
});

export default logger;
