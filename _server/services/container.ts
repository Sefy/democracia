import {UserService} from "./user.service";
import {LogService} from "./log.service";
import {ChatService} from "./chat.service";
import {EntityManager} from "./db/entity-manager";
import {RoomService} from "./room.service";
import { MessageService } from "./message-service";
import { ToxicityService } from "./toxicity-service";
import { TagService } from "./tag.service";

type ContainerMap = {
  'user.service'?: UserService,
  'log.service'?: LogService,
  'chat.service'?: ChatService,
  'room.service'?: RoomService,
  'entity.manager'?: EntityManager,

  [key: string]: any
};

export class Container {

  stuff: ContainerMap = {};

  get(name: keyof ContainerMap) {
    return this.stuff[name];
  }

  put(name: keyof ContainerMap, value: any) {
    this.stuff[name] = value;

    return this;
  }

  init() {
    this.put('user.service', new UserService(this));
    this.put('log.service', new LogService(this));
    this.put('room.service', new RoomService(this));
    this.put('chat.service', new ChatService(this));
    this.put('message.service', new MessageService(this));
    this.put('toxicity.service', new ToxicityService(this));
    this.put('tag.service', new TagService(this));

    this.put('entity.manager', new EntityManager(this));

    return this;
  }

  get em() {
    return this.get('entity.manager') as EntityManager;
  }
}
