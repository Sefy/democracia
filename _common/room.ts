import { MessageData, MessageId } from "@common/message";
import { PublicUser, UserData } from "@common/user";
import { PublicData, PublicMessage } from "@common/public";

export interface TagData {
  id: number;
  name: string;
  icon?: string;
  color?: string;
}

// Base
export interface RoomData {
  id: number;

  title?: string;
  description?: string;

  // DB
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: UserData;

  lastActive: Date;
  startedAt?: Date;

  trendingScore?: number;
  messagesCount?: number;

  tags: TagData[];
  users?: UserData[];
  messages: MessageData[];
  mostVoted?: (MessageData | MessageId)[]; // ids only ?
}

// Shared with Client
export interface PublicRoom extends RoomData, PublicData {
  isActive?: boolean;

  tags: TagData[];
  users: PublicUser[];
  messages: PublicMessage[];
  mostVoted?: (PublicMessage | MessageId)[]; // ids only ?

  userCount?: number;
  anonCount?: number;
}
