import { VoteData, VoteOption } from "@common/vote";
import { UserData } from "@common/user";

export interface VoteChoice {
    option: VoteOption | number;
    user: UserData | number;
}
