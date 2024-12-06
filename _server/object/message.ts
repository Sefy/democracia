import { PublicMessage, Publishable } from "@common/public";
import { MessageData, MessageId, VoteData, VoteType } from "@common/message";
import { Room } from "./room";
import { User } from "./user";

export class Vote implements VoteData {
  message!: Message;
  type!: VoteType;
  user!: User;

  // bon ça va me saouler x) mieux gérer les états => dirty state ?
  new?: boolean;
  edited?: boolean;

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

  isNew(val = true) {
    this.new = val;
    return this;
  }

  isEdited(val = true) {
    this.edited = val;
    return this;
  }
}

export class Message implements MessageData, Publishable<PublicMessage> {
  id!: MessageId;
  content!: string;
  date?: Date;

  toxicity?: number;

  // Join data
  room?: Room;
  author?: User;
  votes: Vote[] = [];

  new?: boolean;

  constructor(data: MessageData) {
    this.id = data.id;
    this.content = data.content;
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

  findUserVote(user: User) {
    return this.votes.find(v => v.user.id === user.id);
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
  get votesCount() {
    return {
      up: this.votes.filter(v => v.type === 'UP').length,
      down: this.votes.filter(v => v.type === 'DOWN').length
    };
  }

  get likesCount() {
    const votesCount = this.votesCount;

    return votesCount.up - votesCount.down;
  }

  toPublic(): PublicMessage {
    return {
      id: this.id,
      content: this.content,
      date: this.date,
      author: this.author?.toPublic(),
      likesCount: this.likesCount,
      room: this.room?.id
    };
  }
}
