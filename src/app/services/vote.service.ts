import { Injectable } from '@angular/core';
import { ApiService } from "@app/services/api.service";
import { VoteOptionPub, VotePub } from "@common/vote";

export interface VoteFilters {
  search?: string;
}

const API_URL = '/votes';

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  constructor(
    private apiService: ApiService
  ) {}

  getAll(filters: VoteFilters) {
    return this.apiService.get<VotePub[]>(API_URL, filters);
  }

  getVote(id: number) {
    return this.apiService.get<VotePub>(API_URL + '/' + id);
  }

  createVote(data: VotePub) {
    return this.apiService.post(API_URL, data);
  }

  vote(vote: VotePub, option: VoteOptionPub) {
    return this.apiService.post(API_URL + '/vote-option', {vote: vote.id, opt: option.id});
  }
}
