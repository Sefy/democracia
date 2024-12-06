import winston from "winston";
import http from "http";
import { Container } from "./container";
import { MessageData } from "@common/message";
import { env } from "../env";
import * as path from "node:path";

export class LogService {

  logger: winston.Logger;

  constructor(
    private container: Container
  ) {
    this.logger = this.setupLogger();
  }

  setupLogger() {
    const logger = winston.createLogger({
      // Log only if level is less than (meaning more severe) or equal to this
      level: "info",
      // Use timestamp and printf to create a standard log format
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
      // Log to the console and a file
      transports: [
        new winston.transports.File({filename: path.join(env.LOGS_DIR, "democracia-server.log")}),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      logger.add(new winston.transports.Console({
        format: winston.format.simple(),
      }));
    }

    return logger;
  }

  logRequest(request: http.IncomingMessage) {
    // reuse the getRemoteAddress in main .. x)
    const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    this.logger.info(`Request received on ${request.url} from ${ip}`);
  }

  logMessage(message: MessageData) {
    this.logger.info(`Message : ${message.content}, from ${message.author} in room ${message.room}`);
  }

  error(err: any, ...args: any[]) {
    this.logger.error(err, args);
  }

  info(msg: string, ...args: any[]) {
    this.logger.info(msg, args);
  }

  // getLogFilepath() {
  //   return path.join(__dirname, LOG_FILE);
  // }
}
