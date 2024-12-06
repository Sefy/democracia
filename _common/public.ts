import { PublicUser } from "@common/user";
import { MessageData } from "@common/message";


export interface PublicData {

}

export interface Publishable<T> {
  toPublic(): T;
}

export interface VotesCount {
  up?: number;
  down?: number;
}

export interface PublicMessage extends Omit<MessageData, 'votes'> {
  author?: number | PublicUser; // on peut passer un simple number si on est sûr que le client a la correspondance

  likesCount?: number;
}
