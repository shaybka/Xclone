import { aj } from "../config/arcjet.js";

export const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, { requested: 1 });
        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({
                    error: "Too Many Requests",
                    message: "Rate limit exceeded. please try again later."
                });
            } else if (decision.reason.isBot()) {
                return res.status(403).json({
                    error: "Bot access denied",
                    message: "automated requests are not allowed."
                });
            } else {
                return res.status(403).json({
                    error: "Forbidden",
                    message: "Access denied by security policies."
                });
            }
        }
        else if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
            return res.status(403).json({
                error: "Spoofed bot detected",
                message: "malicious bot activity detected"
            });
        }
        next();
    } catch (error) {
        console.error("arcjet middleware error:", error);
           // allow request to continue if arcjet fails
           next();
    }
}