import { WebSocketServer } from "ws";
import { RoomData, TagData } from "@common/room";
import { Publishable } from "@common/public";
import { Message } from "./message";
import { User } from "./user";
import { MessageId } from "@common/message";
import { ArrayUtil } from "../util/array-util";
import { AnonData } from "@common/user";

export class Tag implements TagData, Publishable<TagData> {
  id!: number;
  name!: string;
  color?: string;

  constructor(data?: TagData) {
    if (data) {
      Object.assign(this, data);
    }
  }

  toPublic() {
    return {
      id: this.id,
      name: this.name,
      color: this.color
    } as TagData;
  }
}

export class Room implements RoomData {
  id!: number;

  title?: string;
  description?: string;

  // Join data
  tags: Tag[] = [];
  users: User[] = [];
  anons: AnonData[] = [];
  messages: Message[] = [];
  mostVoted: Message[] = [];

  // Counts
  // userCount?: number;
  trendingScore?: number;
  messagesCount?: number;

  // Dates
  createdAt?: Date;
  updatedAt?: Date;

  startedAt?: Date = new Date();
  lastActive: Date = new Date();

  socket?: WebSocketServer;

  // est ce qu'on a le droit de faire ça .. ? x)
  get userCount() {
    return this.users.length;
  }

  get anonCount() {
    return this.anons.length;
  }

  constructor(data?: RoomData) {
    if (data) {
      Object.assign(this, data);

      if (data.tags) {
        this.tags = (data.tags as TagData[]).map(t => new Tag(t));
      }
    }
  }

  getUser(id: number, index = false) {
    return index ?
      this.users.findIndex(u => u.id === id) :
      this.users.find(u => u.id === id);
  }

  addUser(user: User) {
    if (!this.getUser(user.id)) {
      this.users.push(user);
    }

    return this;
  }

  removeUser(id: number) {
    const index = this.getUser(id, true) as number;

    if (index > -1) {
      this.users.splice(index, 1);
    }
  }

  findAnon(id: string, index = false) {
    return index ?
      this.anons.findIndex(a => a.id === id) :
      this.anons.find(a => a.id === id);
  }

  addAnon(anon: AnonData) {
    if (!this.findAnon(anon.id)) {
      this.anons.push(anon);
    }
  }

  removeAnon(id: string) {
    const index = this.findAnon(id, true) as number;

    if (index > 1) {
      this.anons.splice(index, 1);
    }
  }

  getMessage(needle: MessageId) {
    return ArrayUtil.find(this.messages, needle);
  }

  addMessage(message: Message) {
    if (!this.messages.some(m => m.id === message.id)) {
      this.messages.push(message);
    }

    return this;
  }
}
