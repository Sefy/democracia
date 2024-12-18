import { Container } from "../services/container";
import { VoteFilters, VoteService } from "../services/vote.service";
import express from "express";
import { z } from "zod";
import { UserService } from "../services/user.service";
import { UserData } from "@common/user";

export class VoteRouter {

  private voteService = this.container.get('vote.service') as VoteService;
  private userService = this.container.get('user.service') as UserService;

  filtersSchema = z.object({
    search: z.string().optional(),
  });

  createSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().max(500).optional(),
    options: z.array(z.object({text: z.string().min(3).max(100)})),
  });

  constructor(
    private container: Container
  ) {
  }

  build() {
    const router = express.Router();

    router.get('/', async (req, res, next) => {
      try {
        const filters = this.filtersSchema.parse(req.query) as VoteFilters;

        const votes = await this.voteService.getAll(filters);

        res.json(votes.map(v => this.voteService.getPublicData(v)));
      } catch (e) {
        next(e);
      }
    });

    router.post('/', this.userService.getUserMw(), async (req, res, next) => {
      try {
        const data = this.createSchema.parse(req.body) as any;
        const vote = await this.voteService.createVote(data, req.user as UserData);
        res.status(201).json(vote);
      } catch (e) {
        next(e);
      }
    });

    return router;
  }
}
