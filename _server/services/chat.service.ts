import { WebSocket, WebSocketServer } from "ws";
import { Container } from "./container";
import { RoomData } from "@common/room";
import { SocketLikeData, SocketMessage, SocketMessageData, SocketMessageType } from "@common/socket";
import http from "http";
import { LogService } from "./log.service";
import { Room } from "../object/room";
import { User } from "../object/user";
import { Message, Vote } from "../object/message";
import { VoteType } from "@common/message";
import { AnonData, UserData } from "@common/user";
import { ToxicityService } from "./toxicity-service";
import { interval } from "rxjs";
import { RoomService } from "./room.service";

export interface CustomSocket extends WebSocket {
  isAlive: boolean;
  userId?: number | string;
}

// faire en sorte que ce timer s'adapte selon la charge du serveur ? (si trop de monde / rooms, on peut update moins souvent pour soulager .. ?)
const ROOM_DATA_REFRESH_TIMER = 15;

export class ChatService {
  activeRooms: Room[] = [];
  activeUsers: User[] = [];
  activeAnons: AnonData[] = [];

  decoder = new TextDecoder('utf-8');

  constructor(
    private container: Container
  ) {
  }

  startRoutines() {
    // every x sec, updated rooms should refresh their stored values (message count, trending score, etc)
    // @TODO: la routine s'occupe uniquement des rooms actives : il faut mettre à jour ces données quand une room se ferme (quand le dernier user se barre : à faire aussi :p)
    interval(ROOM_DATA_REFRESH_TIMER * 1000).subscribe(() => {
      this.activeRooms.forEach(r => this.roomService.saveRoom(r));
    });
  }

  // ========== ROOM ========== //

  getRoom(id: number) {
    return this.activeRooms.find(r => r.id === id);
  }

  // @TODO: initialiser toutes données enfants de la Room ici
  loadChatRoom(data: RoomData) {
    return new Room(data);
  }

  startRoom(data: RoomData) {
    const activeRoom = this.getRoom(data.id);

    if (activeRoom) {
      // @TODO: peut être option pour force restart ?
      this.logService.error('Room already started ?');
      return activeRoom;
    }

    const room = this.loadChatRoom(data);

    this.activeRooms.push(room);

    this.openRoomSocket(room);

    this.logService.info('Socket started for room {}', room.id);

    return room;
  }

  // @TODO: voir comment gérer au mieux la connexion "anonyme" ?
  joinRoom(room: Room, user: UserData) {
    let activeUser = this.findUser(user, this.activeUsers);

    if (!activeUser) {
      activeUser = this.newUser(user);
      this.activeUsers.push(activeUser);
    }

    if (!room.getUser(activeUser.id)) {
      room.addUser(activeUser);
      this.sendMessage(room, {type: SocketMessageType.USER_JOIN, date: new Date(), data: activeUser.toPublic()});
    }
  }

  joinRoomAnon(room: Room, anon: AnonData) {
    let activeAnon = this.findAnon(anon);

    if (!activeAnon) {
      this.activeAnons.push(anon);
    }

    if (!room.findAnon(anon.id)) {
      room.addAnon(anon);
      this.sendMessage(room, {type: SocketMessageType.ANON_REFRESH, date: new Date(), data: room.anonCount});
    }
  }

  openRoomSocket(room: Room) {
    room.socket = new WebSocketServer({noServer: true});

    room.socket.on('connection', (ws, req) => {
      this.handleConnection(ws as CustomSocket, room, req as any);
    });
  }

  handleConnection(socket: CustomSocket, room: Room, req: http.ClientRequest) {
    // const ip = req.socket?.remoteAddress;

    socket.isAlive = true;

    socket.on('message', data => {
      // un peu bourrin :p @TODO: improve lateeeer ... :)
      const message = JSON.parse(this.decoder.decode(data as any)) as SocketMessage;

      this.logService.info('Socket message : ', message);

      const author = typeof socket.userId === 'number' ? <User>room.getUser(socket.userId) : null;

      // pas plus loin si user introuvable
      if (!author) {
        this.logService.info('Auteur introuvable : ', socket.userId, message);
        return;
      }

      switch (message.type) {
        case SocketMessageType.MESSAGE: // first because kind of default :) / should happen the most ...
          // bon du coup c'est un appel async (à cause du toxicity service), mais bon, osef ?
          this.handleMessageAction((message.data as SocketMessageData).message, room, author, socket);
          break;
        case SocketMessageType.LIKE:
          this.handleLikeAction(message.data as SocketLikeData, room, author);
          break;
      }
    });

    socket.on('close', (code, data) => {
      this.logService.info('Socket close in room ' + room.id, code, data);
      // @TODO: probablement virer le user des actives et de la room ?

      const userId = socket.userId;

      if (typeof userId === 'string') {
        room.removeAnon(userId);
        this.sendMessage(room, {type: SocketMessageType.ANON_REFRESH, date: new Date(), data: room.anonCount});
      } else if (typeof userId === 'number') {
        room.removeUser(userId);
        this.sendMessage(room, {type: SocketMessageType.USER_LEAVE, data: {id: userId}});
      }
    });
  }

  // ========== USER ========== //

  findUser(user: UserData, users: User[]) {
    return users.find(u => (u.id && u.id === user.id) || (u.token && u.token === user.token));
  }

  findAnon(anon: AnonData) {
    return this.activeAnons.find(a => a.id === anon.id);
  }

  newUser(data: UserData) {
    return new User(data);
  }

  // ========== MESSAGE ========== //

  async handleMessageAction(message: string, room: Room, author: User, socket: WebSocket) {
    try {
      const toxicity = await this.toxicityService.evaluateToxicity(message);

      this.logService.info('Toxicité du message : ', message, toxicity);

      // @TODO: définir les seuils auxquels on refuse les messages
      if (toxicity > .9) {
        // @TODO: proposer des suggestions de correction :)
        this.sendMessageTo(socket, {type: SocketMessageType.TOXIC_DECLINE, data: {toxicity}});
        return;
      } else if (toxicity > .5) {
        // @TODO: incrémenter un compteur de toxicité sur User => mute auto s'il dépasse un seuil
        this.sendMessageTo(socket, {type: SocketMessageType.TOXIC_WARN, data: {toxicity}});
        return;
      }

      const msg = this.newChatMessage(message, room, author);

      msg.setToxicity(toxicity);

      this.addMessage(room, msg);
    } catch (e) {
      this.logService.error('Error handling socket message : ', e);
    }
  }

  handleLikeAction(data: SocketLikeData, room: Room, author: User) {
    this.addLike(data, room, author);
  }

  addMessage(room: Room, msg: Message) {
    // @TODO: incrémenter le room.messagesCount automatiquement du coup ?
    room.addMessage(msg);

    this.sendMessage(room, this.createSocketMessage(msg));
  }

  sendMessage(room: Room, message: SocketMessage) {
    room.socket?.clients.forEach(client => client.send(JSON.stringify(message)));
  }

  sendMessageTo(socket: WebSocket, message: SocketMessage) {
    socket.send(JSON.stringify(message));
  }

  createSocketMessage(msg: Message) {
    return {
      type: SocketMessageType.MESSAGE,
      data: {id: msg.id, message: msg.message, author: msg.author!.id}
    } as SocketMessage;
  }

  newChatMessage(message: string, room: Room, author: User) {
    return new Message({id: crypto.randomUUID(), message})
      .setAuthor(author)
      .setRoom(room);
  }

  addLike(data: SocketLikeData, room: Room, author: User) {
    const message = room.getMessage(data.target);

    if (message) {
      const vote = new Vote({type: VoteType.LIKE, user: author, message});

      message.addVote(vote);

      // @TODO: handle déjà voté !
      // if (message.likes.includes(author.id)) {
      //   return;
      // }

      this.sendMessage(room, {
        type: SocketMessageType.LIKE,
        data: {target: message.id, count: message.likesCount}
      });
    }
  }

  get logService() {
    return this.container.get('log.service') as LogService;
  }

  get toxicityService() {
    return this.container.get('toxicity.service') as ToxicityService;
  }

  get roomService() {
    return this.container.get('room.service') as RoomService;
  }
}
