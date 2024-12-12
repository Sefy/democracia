import { Container } from "../services/container";
import { VoteService } from "../services/vote.service";
import express from "express";

export class VoteRouter {

  private voteService: VoteService;

  constructor(
    private container: Container
  ) {
    this.voteService = container.get('vote.service') as VoteService;
  }

  build() {
    const router = express.Router();

    router.get('/', async (req, res, next) => {
      try {
        const votes = await this.voteService.getAll();

        res.json(votes.map(v => this.voteService.getPublicData(v)));
      } catch (e) {
        next(e);
      }
    });

    return router;
  }
}
