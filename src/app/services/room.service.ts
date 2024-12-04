import { Injectable } from '@angular/core';
import { PublicRoom } from "@common/room";
import { map, tap } from "rxjs";
import { ChatService, ClientChatRoom } from "@app/services/chat.service";
import { ApiService } from "@app/services/api.service";
import { AuthService } from "@app/services/auth.service";

// Actually these are "BaseFilters" ? :)
export interface RoomFilters {
  order?: string;
  count?: number;
  search?: string;
}

const API_URL = '/rooms';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(
    private apiService: ApiService,
    private userService: AuthService,
    private chatService: ChatService
  ) {
  }

  getRooms(filters?: RoomFilters) {
    return this.apiService.get<PublicRoom[]>(API_URL, filters);
  }

  getDetail(id: number) {
    return this.apiService.get<PublicRoom>(API_URL + '/' + id);
  }

  search(search: string) {
    return this.apiService.get<PublicRoom[]>(API_URL + '/search/' + search);
  }

  joinRoom(id: number) {
    const anon = !this.userService.currentUser;

    const url = `/rooms/${id}/join-${anon ? 'anon' : 'auth'}`;

    return this.apiService.get<{ ok: boolean, room: PublicRoom, token?: string }>(url).pipe(
      tap(res => {
        if (anon && res.token) {
          this.userService.currentToken = res.token;
        }
      }),
      map(res => this.adaptRoom(res.room)),
    );
  }

  adaptRoom(room: PublicRoom) {
    const res = room as ClientChatRoom;

    res.messages = room.messages?.map(m => this.chatService.adaptMessage(m, room));
    // res.mostVoted = room.mostVoted?.map(id => res.messages.find(m => m.id === id)!);

    return res;
  }

  createRoom(room: PublicRoom) {
    const data = {
      ...room,
      tags: room.tags?.map(t => t.id)
    };

    return this.apiService.post(API_URL, {room: data});
  }
}
