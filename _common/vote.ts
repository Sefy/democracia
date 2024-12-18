import { UserData } from "@common/user";
import { RoomData } from "@common/room";

export interface VoteData {
    id: number;
    title: string;
    description: string;

    // date de fin du vote, pour inciter les gens :)
    expiresAt?: Date;

    // options variées, ou juste "oui / non", par défaut ?
    options?: VoteOption[];

    createdBy: UserData | number;
    createdAt: Date;

    // === server only, not public === //

    updatedAt: Date;

    // can be assigned to a specific room (vote kick / mute / ban / moderator .. ?)
    // @TODO: peut être plutôt étendre en "RoomVote" ? on y est pas t'façons ...
    room?: RoomData | number;

    // stuff related to vote (+ type ?), if it should trigger something, etc
    data?: object;
}

export interface VoteOption {
    id: number;
    text: string;
    count: number;

    // on server : can assign votechoices
}

export interface VotePub extends Omit<VoteData, 'updatedAt' | 'data' | 'room'> {
    options?: VoteOptionPub[];
    totalCount?: number;
}

export interface VoteOptionPub extends VoteOption {
    myVote?: boolean;
}
