import { Injectable } from '@angular/core';
import { AuthService } from "@app/services/auth.service";
import moment from "moment";
import { PublicRoom } from "@common/room";
import { PublicUser } from "@common/user";
import { PublicMessage } from "@common/public";

export type ClientChatType = 'system' | 'date' | 'message';

export interface ClientRoomMessage extends PublicMessage {
  mine?: boolean; // helper to know if author = connected user
  formattedDate?: string; // helper again :)

  type?: ClientChatType;
  author?: PublicUser;
}

export interface ClientChatRoom extends Omit<Omit<PublicRoom, 'messages'>, 'mostVoted'> {
  messages: ClientRoomMessage[];
  mostVoted?: ClientRoomMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private userService: AuthService
  ) {
  }

  adaptMessage(m: PublicMessage, room: PublicRoom | ClientChatRoom) {
    const adapted = (m ?? {}) as ClientRoomMessage;

    adapted.author = typeof m.author === 'object' ? m.author : room.users.find(u => u.id === m.author);
    adapted.mine = adapted.author?.id === this.userService.currentUser?.id;
    adapted.formattedDate = this.getFormattedDate(m.date!);

    return adapted;
  }

  newSystemMessage(message: string, type: ClientChatType = 'system') {
    return {
      message,
      type,
    } as ClientRoomMessage;
  }

  // @TODO: loin d'être parfait, à voir plus tard pour alléger l'affichage, style WhatsApp : uniquement l'heure et juste mettre la date comme "séparateur" (pourrait reprendre le mécanisme de "systemMessage")
  getFormattedDate(date: Date | string) {
    const chatMoment = moment(date);
    const now = moment();

    // même jour : juste l'heure
    if (now.isSame(chatMoment, 'date')) {
      return chatMoment.format('HH:mm');
    }

    // hier : hier + l'heure
    if (now.clone().subtract(1, 'd').isSame(chatMoment, 'date')) {
      return 'Hier, ' + chatMoment.format('HH:mm');
    }

    const format = (now.isSame(chatMoment, 'year') ? '' : 'YYYY') + 'DD/MM, HH:mm';

    return chatMoment.format(format);
  }
}
