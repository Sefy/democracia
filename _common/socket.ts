import { MessageId, VoteType } from "@common/message";

export const enum SocketMessageType {
  MESSAGE,
  LIKE,
  HANDSHAKE,
  USER_JOIN,
  ANON_REFRESH, // @TODO: maybe replace with "refresh counts" .. ? x) TOUT CA POUR CA
  USER_LEAVE, // @TODO: merge with JOIN to "USER_MOVE" => {id, type: ('leave', 'join' ...)
  TOXIC_WARN,
  TOXIC_DECLINE
}

export interface SocketHandshakeData {
  room: number;
}

export interface SocketLikeData {
  target: MessageId;
  type: VoteType;
  count?: number; // response from server only
}

export interface SocketMessageData {
  id?: MessageId;
  message: string;
  author?: number;
}

export interface SocketMessage {
  date?: Date;
  type?: SocketMessageType;
  data: SocketMessageData | SocketLikeData | SocketHandshakeData | any; // probably replace with "data: object", which form depends on type ...
}
