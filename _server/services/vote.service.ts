import { Container } from "./container";
import { VoteRepository } from "./db/vote-repository";
import { VoteData, VotePub } from "@common/vote";
import { ObjectUtil } from "../util/object-util";
import { BaseFilters } from "../util/query-builder";
import { UserData } from "@common/user";

export interface VoteFilters extends BaseFilters {
  id?: number;
  search?: string;
  author?: number;
  expiresBefore?: Date;

  loadCounts?: boolean;
}

const defaultFilters = {
  loadCounts: true,
  count: 100
} as VoteFilters;

export class VoteService {

  private repository: VoteRepository;

  constructor(
    private container: Container
  ) {
    this.repository = container.em.vote;
  }

  getAll(filters?: VoteFilters) {
    filters = {...defaultFilters, ...(filters ?? {})};

    return this.repository.findAll(filters);
  }

  getPublicData(vote: VoteData) {
    return ObjectUtil.omit(vote, ['data', 'updatedAt', 'room']) as VotePub;
  }

  createVote(data: Partial<VoteData>, user: UserData) {
    return this.repository.create({
      ...data,
      createdBy: user
    });
  }
}
