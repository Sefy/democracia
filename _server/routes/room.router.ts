import { Container } from "../services/container";
import { RoomFilters } from "../services/db/room-repository";
import express, { Request, Response } from "express";
import { AnonData } from "@common/user";
import { RoomService } from "../services/room.service";
import { MessageService } from "../services/message-service";
import { ChatService } from "../services/chat.service";
import { TagService } from "../services/tag.service";
import { UserService } from "../services/user.service";
import { authenticateJWT } from "../middlewares/auth.middleware";

export class RoomRouter {
  constructor(
    private container: Container
  ) {
  }

  build() {
    const router = express.Router();

    router.get('/', async (req, res, next) => {
      try {
        const filters = Object.assign({}, req.query) as RoomFilters;

        // @TODO: récupérer d'abord uniquement des IDs, puis chercher dans ChatService.activeRooms si on a des match
        // @TODO: => charger les données de celles-ci en live, les autres depuis la DB
        res.json(await this.roomService.getAll(filters, {tags: true, counts: true}));
      } catch (e) {
        next(e);
      }
    });

    // @TODO: filter on User Role !
    // router.post('/', authenticateJWT, async (req: Request, resp: Response) => {
    //   const roomData = req.body.room;
    //
    //   try {
    //     roomData.tags = await this.tagService.getAll({ids: roomData.tags as number[]});
    //
    //     const newRoom = await this.roomService.createRoom(roomData);
    //
    //     resp.send({ok: true});
    //   } catch (e) {
    //     console.error(e);
    //
    //     resp.send({ok: false, error: e});
    //   }
    // });

    router.get('/search/:subject', async (req, resp, next) => {
      const subject = req.params.subject;

      try {
        resp.json(await this.roomService.search(subject));
      } catch (e) {
        next(e);
      }
    });

    router.get('/:id/messages/:page', async (req: Request, resp: Response, next) => {
      const id = +req.params.id;
      const page = +(req.query.page || 1);

      try {
        const messages = await this.messageService.getAll({room: id, page});

        resp.send({ok: true, messages});
      } catch (e) {
        next(e);
      }
    });

    router.get('/:id', async (req: Request, resp: Response, next) => {
      try {
        const room = await this.roomService.get(+req.params.room, {lastMessages: 100});

        if (room) {
          resp.send({ok: true, room});
        } else {
          resp.send({ok: false});
        }
      } catch (e) {
        next(e);
      }
    });

    router.get('/:id/join-anon', async (req: Request, resp: Response, next) => {
      try {
        const token = this.userService.getTokenFromRequest(req.headers.authorization);

        let anon = token ? (await this.userService.authentifyToken(token)) as AnonData : null;
        let newAnon = false;

        if (!anon) {
          anon = this.userService.newAnon({ip: req.ip});
          newAnon = true;
        }

        const id = +req.params.id;

        let room = this.chatService.getRoom(id);

        if (!room) {
          room = this.chatService.startRoom(await this.roomService.get(id, {tags: true}));
        }

        this.chatService.joinRoomAnon(room, anon);

        const result = {ok: true, room: this.roomService.getPublicData(room, {lastMessages: 100, users: true})} as any;

        if (newAnon) {
          result.token = this.userService.generateToken(anon);
        }

        resp.send(result);
      } catch (e) {
        next(e);
      }
    });

    // ======== PROTECTED ROUTES ======== //

    router.get('/:id/join-auth', authenticateJWT, async (req: Request, res: Response, next) => {
      const reqUser = req.user as any;

      // @TODO: if !reqUser => pas plus loin

      try {
        const user = await this.userService.getOneByEmail(reqUser.email);

        if (!user) {
          res.send({ok: false, errors: [`No user found`]});
          return;
        }

        const id = +req.params.id;

        let room = this.chatService.getRoom(id);

        if (!room) {
          room = this.chatService.startRoom(await this.roomService.get(id, {tags: true}));
        }

        if (room) {
          this.chatService.joinRoom(room, user);
          res.send({ok: true, room: this.roomService.getPublicData(room, {lastMessages: 100, users: true})});
        } else {
          res.send({ok: false});
        }
      } catch (e) {
        next(e);
      }
    });

    return router;
  }

  get roomService() {
    return this.container.get('room.service') as RoomService;
  }

  get userService() {
    return this.container.get('user.service') as UserService;
  }

  get messageService() {
    return this.container.get('message.service') as MessageService;
  }

  get chatService() {
    return this.container.get('chat.service') as ChatService;
  }

  get tagService() {
    return this.container.get('tag.service') as TagService;
  }
}
