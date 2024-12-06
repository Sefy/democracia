import { PublicMessage, Publishable } from "@common/public";
import { MessageData, MessageId, VoteData, VoteType } from "@common/message";
import { Room } from "./room";
import { User } from "./user";

export class Vote implements VoteData {
  message!: Message;
  type!: VoteType;
  user!: User;

  constructor(data: VoteData) {
    this.type = data.type;

    if (data.user instanceof User) {
      this.user = data.user;
    }

    if (data.message instanceof Message) {
      this.message = data.message;
    }
  }

  setUser(user: User) {
    this.user = user;
    return this;
  }

  setMessage(message: Message) {
    this.message = message;
    return this;
  }
}

export class Message implements MessageData, Publishable<PublicMessage> {
  id!: MessageId;
  message!: string;
  date?: Date;

  toxicity?: number;

  // Join data
  room?: Room;
  author?: User;
  votes: Vote[] = [];

  saved?: boolean;

  constructor(data: MessageData) {
    this.id = data.id;
    this.message = data.message;
    this.date = data.date ?? new Date();
  }

  setRoom(room: Room) {
    this.room = room;
    return this;
  }

  setAuthor(author: User) {
    this.author = author;
    return this;
  }

  addVote(vote: Vote) {
    // pour l'instant on check ici, mais vaudrait mieux le faire plus en amont ...
    if (!this.votes.some(v => v.user.id === vote.user.id)) {
      this.votes.push(vote);
    }

    return this;
  }

  setToxicity(toxicity: number) {
    this.toxicity = toxicity;
    return this;
  }

  // @TODO: maybe store and update on each addVote / removeVote ?
  get likesCount() {
    return this.votes.filter(v => v.type === VoteType.LIKE).length -
      this.votes.filter(v => v.type === VoteType.DISLIKE).length;
  }

  toPublic(): PublicMessage {
    return {
      id: this.id,
      message: this.message,
      date: this.date,
      author: this.author?.toPublic(),
      likesCount: this.likesCount,
      room: this.room?.id
    };
  }
}
