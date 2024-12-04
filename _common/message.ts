import { UserData } from "@common/user";
import { RoomData } from "@common/room";

export enum VoteType {
  LIKE = 1,
  DISLIKE = -1
}

export interface VoteData {
  user: number | UserData;
  message: number | MessageData;
  type: VoteType;
}

export type MessageId = string | number;

export interface MessageData {
  id: MessageId;
  message: string;

  room?: number | RoomData;
  date?: Date;

  author?: number | UserData;

  toxicity?: number;

  saved?: boolean;
}
