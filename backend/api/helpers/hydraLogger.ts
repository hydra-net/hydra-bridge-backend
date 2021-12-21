import winston, { format } from "winston";

export const hydraLogger = winston.createLogger({
  level: "error",
  format: format.combine(format.timestamp(), winston.format.simple()),
  transports: [new winston.transports.File({ filename: "app-error.log" })],
});
