"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = void 0;
async function withRetry(operation, maxAttempts, delay, logger, operationName) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            if (error instanceof Error) {
                lastError = error;
                logger.warn(`Attempt ${attempt}/${maxAttempts} failed for operation ${operationName}: ${error.message}`);
                if (attempt < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
    }
    throw lastError;
}
exports.withRetry = withRetry;
