import { MessageData, MessageId } from "@common/message";
import { PublicUser, UserData } from "@common/user";
import { PublicData, PublicMessage } from "@common/public";

export interface TagData {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

// Base
export interface RoomData {
  id: number;

  title?: string;
  description?: string;

  // DB
  createdAt?: Date;
  updatedAt?: Date;

  lastActive: Date;
  startedAt?: Date;

  trendingScore?: number;
  messagesCount?: number;

  // @TODO: tout repasser en [] et virer les magouilles partout de Array.from() ! la grosse merde les Set ... -_-
  tags: Iterable<TagData>;
  users?: Iterable<UserData>;
  messages: Iterable<MessageData>;
  mostVoted?: Iterable<MessageData | MessageId>; // ids only ?
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
