import express, { Express, NextFunction, Request, Response } from 'express';
import session from 'express-session';
import http from 'http';
import { LogService } from "./services/log.service";
import { Container } from "./services/container";
import { UserService } from "./services/user.service";
import { ChatService } from "./services/chat.service";
import * as https from "node:https";
import fs from "node:fs";
import { env } from "./env";
import { TagFilters, TagService } from "./services/tag.service";
import { RoomRouter } from "./routes/room.router";
import { AuthRouter } from "./routes/auth.router";
import { VoteRouter } from "./routes/vote.router";
import { z } from "zod";

class Server {

  app!: Express;
  httpServer!: http.Server;

  container: Container;

  constructor() {
    this.container = new Container();
  }

  start() {
    // bon, surement une bonne pratique, mais trop relou, surtout sur notre serveur fourre tout où les env vars vont être bien trop nombreuses / mélangées ...
    // dotenv.config({path: path.join("C:\\_projects\\democracia\\_server\\", '.env')});

    this.app = express();
    this.app.use(express.json());
    this.app.use(session({secret: env.SECRET!}));

    this.app.set('trust proxy', true);
    this.app.enable('trust proxy');

    this.httpServer = this.createHttpServer();

    // in case we need it later .. :)
    // this.app.use(express.static(path.join(__dirname, '../../../dist/democratia/browser')));

    this.setupExpress();
    this.setupSocket();

    (this.container.get('chat.service') as ChatService).startRoutines();

    this.httpServer.listen(env.PORT, function () {
      console.log(`Listening on http${env.SSL_KEY ? 's' : ''}://localhost:${env.PORT}`);
    });
  }

  createHttpServer() {
    if (env.SSL_KEY && env.SSL_CERT) {
      const options = {
        key: fs.readFileSync(env.SSL_KEY),
        cert: fs.readFileSync(env.SSL_CERT)
      };

      return https.createServer(options, this.app);
    }

    return http.createServer(this.app);
  }

  // @TODO: use sub routers
  setupExpress() {
    this.app.use((req: Request, res: Response, next) => {
      // Log an info message for each incoming request
      this.logService.logRequest(req);
      next();
    });

    this.app.use((err: any, req: Request, resp: Response, next: NextFunction) => {
      this.logService.error(err);

      if (resp.headersSent) {
        return next(err);
      }

      if (err instanceof z.ZodError) {
        return resp.status(400).json({message: err.errors[0].message});
      }

      resp.status(500).send({ok: false, error: 'Internal server error'});
    });

    // Routes

    this.app.use('/api/auth', new AuthRouter(this.container).build());
    this.app.use('/api/rooms', new RoomRouter(this.container).build());
    this.app.use('/api/votes', new VoteRouter(this.container).build());

    this.app.get('/api/tags', async (req, resp, next) => {
      try {
        const filters = Object.assign({}, req.query) as TagFilters;

        resp.send(await this.tagService.getAll(filters));
      } catch (e) {
        next(e);
      }
    });
  }

  setupSocket() {
    this.httpServer.on('upgrade', async (req, socket, head) => {
      const authHeader = req.headers['sec-websocket-protocol'];
      const token = authHeader?.split(',').pop()?.trim();
      const userData = token ? (await this.userService.authentifyToken(token!)) : null;

      const idRoom = req.url?.split('/').pop()?.split('-').pop();
      const activeRoom = idRoom ? this.chatService.getRoom(+idRoom) : null;

      if (activeRoom) {
        if (activeRoom?.socket) {
          activeRoom.socket.handleUpgrade(req, socket, head, (ws: any) => {
            ws.userId = userData?.id;
            activeRoom.socket!.emit('connection', ws, req);
          });

          return true;
        } else {
          this.logService.error('Room does not exist or not started', idRoom);
        }
      } else {
        this.logService.error('Room ID not found');
      }

      socket.destroy();
    });
  }

  getRemoteAddress(req: Request) {
    return (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
  }

  get userService() {
    return this.container.get('user.service');
  }

  get chatService() {
    return this.container.get('chat.service');
  }

  get logService() {
    return this.container.get('log.service');
  }

  get tagService() {
    return this.container.get('tag.service');
  }
}

new Server().start();
