import { Injectable } from '@angular/core';
import { ApiService } from "@app/services/api.service";
import { TagData } from "@common/room";

const API_URL = '/tags';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(
    private apiService: ApiService
  ) {}

  getAll() {
    return this.apiService.get<TagData[]>(API_URL);
  }

  search(value: string) {
    return this.apiService.get(API_URL + '/search/' + value);
  }
}
