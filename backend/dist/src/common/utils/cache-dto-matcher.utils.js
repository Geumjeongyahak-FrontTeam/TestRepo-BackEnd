"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheDtoMatcher = void 0;
/**
 * Match Cache and DTO Fields
 * @param obj - Cache
 * @param requiredFields
 * @returns True if Cache Fields match with DTO's
 */
function cacheDtoMatcher(obj, requiredFields) {
    if (typeof obj !== 'object' || obj === null)
        return false;
    for (const field of requiredFields) {
        if (!(field in obj)) {
            return false;
        }
    }
    return true;
}
exports.cacheDtoMatcher = cacheDtoMatcher;
