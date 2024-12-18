import { Container } from "./container";
import { VoteRepository } from "./db/vote-repository";
import { VoteData, VoteOption, VotePub } from "@common/vote";
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
  count: 100
} as VoteFilters;

export class VoteService {

  private repository: VoteRepository;

  constructor(
    private container: Container
  ) {
    this.repository = container.em.vote;
  }

  async get(filters: VoteFilters) {
    filters.count = 1;

    return (await this.getAll(filters))[0];
  }

  getAll(filters?: VoteFilters) {
    filters = {...defaultFilters, ...(filters ?? {})};

    return this.repository.findAll(filters);
  }

  getPublicData(vote: VoteData) {
    const data = ObjectUtil.omit(vote, ['data', 'updatedAt', 'room']) as VotePub;

    data.totalCount = vote.options?.reduce((acc, opt) => acc + opt.count, 0);

    return data;
  }

  createVote(data: Partial<VoteData>, user: UserData) {
    return this.repository.create({
      ...data,
      createdBy: user
    });
  }

  // OPTIONS ;o

  getOption(id: number) {
    return this.repository.findOption(id);
  }

  // CHOICES ;o

  answerVote(vote: VoteData, opt: VoteOption, user: UserData) {
    return this.repository.vote(vote.id, opt.id, user.id);
  }
}
