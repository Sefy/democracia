import { WebSocket, WebSocketServer } from "ws";
import { Container } from "./container";
import { SocketLikeData, SocketMessage, SocketMessageData, SocketMessageType } from "@common/socket";
import http from "http";
import { LogService } from "./log.service";
import { Room } from "../object/room";
import { User } from "../object/user";
import { Message, Vote } from "../object/message";
import { MessageData, VoteData } from "@common/message";
import { AnonData, PublicUser, UserData } from "@common/user";
import { ToxicityService } from "./toxicity-service";
import { interval } from "rxjs";
import { RoomService } from "./room.service";
import { PublicMessage } from "@common/public";
import { UserService } from "./user.service";

export interface CustomSocket extends WebSocket {
  isAlive: boolean;
  userId?: number | string;
}

interface CacheData {
  needsUpdate?: boolean;
}

interface CachedUser extends PublicUser, CacheData {
}

interface CachedMessage extends PublicMessage, CacheData {
}

// faire en sorte que ce timer s'adapte selon la charge du serveur ? (si trop de monde / rooms, on peut update moins souvent pour soulager .. ?)
const ROOM_DATA_REFRESH_TIMER = 15;

export class ChatService {
  rooms: Room[] = [];
  users: User[] = [];
  anons: AnonData[] = [];

  cachedUsers: { [k: number]: User } = {};

  decoder = new TextDecoder('utf-8');

  constructor(
    private container: Container
  ) {
  }

  startRoutines() {
    // every x sec, updated rooms should refresh their stored values (message count, trending score, etc)
    // @TODO: la routine s'occupe uniquement des rooms actives : il faut mettre à jour ces données quand une room se ferme (quand le dernier user se barre : à faire aussi :p)
    interval(ROOM_DATA_REFRESH_TIMER * 1000).subscribe(() => {
      this.rooms.forEach(r => this.roomService.saveRoom(r));
    });
  }

  // ========== USER ========== //

  getActiveUser(id: number) {
    return this.users.find(u => (u.id && u.id === id));
  }

  findAnon(anon: AnonData) {
    return this.anons.find(a => a.id === anon.id);
  }

  newUser(data: UserData) {
    return new User(data);
  }

  async getOrLoadUser(id: number) {
    const user = this.getActiveUser(id) ?? this.cachedUsers[id];

    if (user) {
      return user;
    }

    if (this.cachedUsers[id]) {
      return this.cachedUsers[id];
    }

    const userData = await this.userService.repository.findOne({id});

    if (userData) {
      this.cachedUsers[id] = new User(userData);

      return this.cachedUsers[id];
    }

    return null;
  }

  // ========== ROOM ========== //

  getRoom(id: number) {
    return this.rooms.find(r => r.id === id);
  }

  async loadChatRoom(id: number) {
    // OK on en fout 500 en cache, après on nettoiera le cache progressivement, tout en updatant le résumé
    const data = await this.roomService.get(id, {tags: true, messagesOptions: {count: 500, votes: true}});

    const room = new Room(data);

    // @TODO: peut être virer Promise.all : si on lance tous les load en même temps on ne bénéficie pas du cachedUsers
    room.messages = await Promise.all(data.messages.map(async (m) => this.loadChatMessage(m)));

    return room;
  }

  async loadChatMessage(m: MessageData) {
    const msg = new Message(m);

    const authorId = typeof m.author === 'object' ? m.author.id : m.author;
    const author = authorId ? await this.getOrLoadUser(authorId) : null;

    if (author) {
      msg.setAuthor(author);
    }

    // même problème que pour les messages, sympa le Promise.all() mais en fait non x)
    msg.votes = await Promise.all((m.votes ?? []).map(async (v) => this.loadChatVote(v, msg)));

    return msg;
  }

  async loadChatVote(data: VoteData, message: Message) {
    const vote = new Vote(data);

    vote.message = message;

    const user = await this.getOrLoadUser(data.user as number);

    // pas possible ? on devrait juste l'ignorer si on retrouve pas le User ...
    if (user) {
      vote.setUser(user);
    }

    return vote;
  }

  async startRoom(id: number) {
    const activeRoom = this.getRoom(id);

    if (activeRoom) {
      // @TODO: peut être option pour force restart ?
      this.logService.error('Room already started ?');
      return activeRoom;
    }

    const room = await this.loadChatRoom(id);

    this.rooms.push(room);

    this.openRoomSocket(room);

    this.logService.info('Socket started for room {}', room.id);

    return room;
  }

  // @TODO: voir comment gérer au mieux la connexion "anonyme" ?
  joinRoomUser(room: Room, user: UserData) {
    let activeUser = this.getActiveUser(user.id);

    if (!activeUser) {
      activeUser = this.newUser(user);
      this.users.push(activeUser);
    }

    if (!room.getUser(activeUser.id)) {
      room.addUser(activeUser);
      this.sendMessage(room, {type: SocketMessageType.USER_JOIN, date: new Date(), data: activeUser.toPublic()});
    }
  }

  joinRoomAnon(room: Room, anon: AnonData) {
    let activeAnon = this.findAnon(anon);

    if (!activeAnon) {
      this.anons.push(anon);
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

  // ========== MESSAGE ========== //

  addMessage(room: Room, msg: Message) {
    // @TODO: incrémenter le room.messagesCount automatiquement du coup ?
    room.addMessage(msg);

    this.sendMessage(room, this.createSocketMessage(msg));
  }

  newChatMessage(message: string, room: Room, author: User) {
    return new Message({id: crypto.randomUUID(), content: message})
      .setAuthor(author)
      .setRoom(room);
  }

  addLike(data: SocketLikeData, room: Room, author: User) {
    const message = room.getMessage(data.target);

    if (message) {
      const existingVote = message.findUserVote(author);

      if (existingVote) {
        existingVote.type = data.type;
        existingVote.isEdited();
      } else {
        message.addVote(new Vote({type: data.type, user: author, message}).isNew());
      }

      // @TODO: handle déjà voté !
      // if (message.likes.includes(author.id)) {
      //   return;
      // }

      this.sendMessage(room, {
        type: SocketMessageType.LIKE, data: {
          target: message.id,
          count: message.likesCount
        }
      });
    }
  }

  // ========== SOCKET ========== //

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
      msg.new = true;

      this.addMessage(room, msg);
    } catch (e) {
      this.logService.error('Error handling socket message : ', e);
    }
  }

  handleLikeAction(data: SocketLikeData, room: Room, author: User) {
    this.addLike(data, room, author);
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
      data: {id: msg.id, message: msg.content, author: msg.author!.id}
    } as SocketMessage;
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

  get userService() {
    return this.container.get('user.service') as UserService;
  }
}
