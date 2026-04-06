import * as winston from 'winston';
import { format } from 'winston';

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      format: format.combine(
        format.timestamp(),
        format.ms(),
        format.printf((info) => {
          const { timestamp, level, message, context, ms, ...meta } = info;
          // In development, we use a human-readable format
          if (process.env.NODE_ENV !== 'production') {
            const colorizer = winston.format.colorize().colorize;
            return `${colorizer(level, `[${level.toUpperCase()}]`)} ${timestamp} ${context ? `\x1b[33m[${context}]\x1b[0m ` : ''}${message} \x1b[32m${ms}\x1b[0m ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
          }
          // In production, we use JSON for structured logging
          return JSON.stringify({
            timestamp,
            level,
            context,
            message,
            ...meta,
          });
        }),
      ),
    }),
  ],
};
