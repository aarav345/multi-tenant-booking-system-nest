// src/config/logger.config.ts
import type { Params } from 'nestjs-pino';

export const pinoConfig: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

    // Pretty print in development, JSON in production
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: { colorize: true, singleLine: true },
          }
        : undefined,

    // Attach requestId to every log automatically
    genReqId: () => crypto.randomUUID(),

    // Redact sensitive fields from logs — never log passwords or tokens
    redact: {
      paths: [
        'req.headers.authorization', // JWT tokens
        'req.body.password', // login/register
        'req.body.passwordHash', // just in case
        '*.email', // any email in any log object
        '*.phone', // customer phone numbers
      ],
      censor: '[REDACTED]',
    },

    // Customize what gets logged per request
    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} ${res.statusCode}`,

    customErrorMessage: (req, res, error) =>
      `${req.method} ${req.url} ${res.statusCode} - ${error.message}`,

    // Skip health check logs — they're noise
    autoLogging: {
      ignore: (req) => req.url === '/api/v1/health',
    },
  },
};
