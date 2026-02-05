
/**
 * 🛠️ Mana Unified Logger (V1.0)
 * Designed for Premium Production Engineering
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogOptions {
    maskPII?: boolean;
    data?: any;
}

const IS_PROD = process.env.NODE_ENV === 'production';

// Helper to mask sensitive strings (09123456789 -> 0912****789)
const maskString = (str: string): string => {
    if (!str || str.length < 6) return '***';
    if (str.includes('@')) {
        const [user, domain] = str.split('@');
        return `${user[0]}***@${domain}`;
    }
    return `${str.substring(0, 4)}****${str.substring(str.length - 3)}`;
};

const processData = (data: any, mask: boolean) => {
    if (!data) return undefined;
    if (!mask) return data;

    // Deep copy and mask sensitive fields
    const cleanData = JSON.parse(JSON.stringify(data));
    const sensitiveKeys = ['phone', 'mobile', 'email', 'password', 'token', 'fullName'];

    const maskObject = (obj: any) => {
        for (const key in obj) {
            if (sensitiveKeys.includes(key) && typeof obj[key] === 'string') {
                obj[key] = maskString(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                maskObject(obj[key]);
            }
        }
    };

    maskObject(cleanData);
    return cleanData;
};

class Logger {
    private logLevel: LogLevel = IS_PROD ? 'INFO' : 'DEBUG';

    private log(level: LogLevel, message: string, options?: LogOptions) {
        // Level Filtering
        const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
        if (levels.indexOf(level) < levels.indexOf(this.logLevel)) return;

        const timestamp = new Date().toISOString();
        const maskedData = processData(options?.data, options?.maskPII ?? true);

        const logPayload = {
            timestamp,
            level,
            message,
            context: 'CLIENT',
            ...(maskedData && { data: maskedData })
        };

        // In DEV, we use colored console with emojis for readability
        if (!IS_PROD) {
            const emojis = { DEBUG: '🔍', INFO: 'ℹ️', WARN: '⚠️', ERROR: '❌' };
            const colors = { DEBUG: '\x1b[36m', INFO: '\x1b[32m', WARN: '\x1b[33m', ERROR: '\x1b[31m', reset: '\x1b[0m' };

            console.log(
                `${emojis[level]} [${level}] ${message}`,
                maskedData ? '\nData:' : '',
                maskedData || ''
            );
        } else {
            // In PROD, we use structured JSON for log aggregators
            console.log(JSON.stringify(logPayload));
        }
    }

    debug(msg: string, data?: any) { this.log('DEBUG', msg, { data, maskPII: true }); }
    info(msg: string, data?: any) { this.log('INFO', msg, { data, maskPII: true }); }
    warn(msg: string, data?: any) { this.log('WARN', msg, { data, maskPII: true }); }
    error(msg: string, data?: any, err?: Error) {
        this.log('ERROR', msg, {
            data: { ...data, errorStack: err?.stack, errorMessage: err?.message },
            maskPII: false // Errors usually need detail, but mask in specific calls if needed
        });
    }

    // Special method for PII-safe logging (forced masking)
    security(msg: string, piiData: any) {
        this.log('INFO', `[SECURITY] ${msg}`, { data: piiData, maskPII: true });
    }
}

export const logger = new Logger();
