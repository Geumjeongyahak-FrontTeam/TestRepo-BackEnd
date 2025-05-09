"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    var _a, _b;
    return ({
        database: {
            host: process.env.DATABASE_HOST || 'localhost',
            port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
            username: process.env.DATABASE_USERNAME,
            password: (_b = (_a = process.env.DATABASE_PASSWORD) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '',
            name: process.env.DATABASE_NAME,
        },
        cache: {
            ttl: process.env.CACHE_TTL ? parseInt(process.env.CACHE_TTL, 10) : 3600,
            max: process.env.CACHE_MAX_ITEMS ? parseInt(process.env.CACHE_MAX_ITEMS, 10) : 100,
        },
        retry: {
            maxAttempts: process.env.RETRY_MAX_ATTEMPTS ? parseInt(process.env.RETRY_MAX_ATTEMPTS, 10) : 3,
            delay: process.env.RETRY_DELAY ? parseInt(process.env.RETRY_DELAY, 10) : 500,
        },
    });
};
