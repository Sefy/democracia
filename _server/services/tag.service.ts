import { BaseFilters } from "../util/query-builder";
import { Container } from "./container";
import { TagData } from "@common/room";

export interface TagFilters extends BaseFilters {
  id?: number;
  ids?: number[];
  roomId?: number;
}

export class TagService {
  constructor(
    private container: Container
  ) { }

  get(id?: number) {
    return this.getAll({id});
  }

  getAll(filters?: TagFilters) {
    return this.repository.findAll(filters); //.map(t => this.getPublicData(t));
  }

  // @TODO: pour l'instant rien à faire .. ?
  getPublicData(tag: TagData) {
    return tag;
  }

  get repository() {
    return this.container.em.tag;
  }
}
