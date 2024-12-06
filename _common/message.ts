import { UserData } from "@common/user";
import { RoomData } from "@common/room";

export type VoteType = 'UP' | 'DOWN';

// export enum VoteType {
//   LIKE = 1,
//   DISLIKE = -1
// }

export interface VoteData {
  type: VoteType;
  user: number | UserData;

  // nullable, info pas toujours indispensable (si on est déjà rangé dans un Message)
  message?: number | MessageData;
}

export type MessageId = string | number;

export interface MessageData {
  id: MessageId;
  content: string;

  room?: number | RoomData;
  date?: Date;

  author?: number | UserData;

  toxicity?: number;

  votes?: VoteData[];
}
