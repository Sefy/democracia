import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { map, Observable, Subject } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { LoginComponent } from "../login/login.component";
import { ChatService, ClientChatRoom, ClientRoomMessage } from "@app/services/chat.service";
import { AuthService, CurrentUser } from "@app/services/auth.service";
import { TopMessagesComponent } from "@app/components/chatbox/top-messages/top-messages.component";
import { SnackbarService } from "@app/services/snackbar.service";
import { MatTabsModule } from "@angular/material/tabs";
import { MessagesListComponent } from "@app/components/chatbox/messages-list/messages-list.component";
import { LoaderComponent } from "@app/components/_global/loader/loader.component";
import { PublicRoom } from "@common/room";
import { SocketLikeData, SocketMessage, SocketMessageData, SocketMessageType } from "@common/socket";
import { RoomService } from "@app/services/room.service";
import { env } from "../../../environments/env";
import { PublicUser } from "@common/user";
import { MessageId } from "@common/message";
import { PublicMessage } from "@common/public";
import { UserAvatarComponent } from "@app/components/user/avatar/user-avatar.component";

const ROOM_SOCKET_PREFIX = 'room-';

// @TODO: paramétrage utilisateur : taille de l'écriture, vitesse de défilement, scroll auto (on / off), etc ...
@Component({
  selector: 'app-chatbox',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatLabel,
    FormsModule,
    TopMessagesComponent,
    MatTabsModule,
    MessagesListComponent,
    LoaderComponent,
    UserAvatarComponent
  ],
  templateUrl: './chatbox.component.html',
  styleUrl: './chatbox.component.scss'
})
export class ChatboxComponent implements OnInit, OnDestroy {
  @Input() roomInfo!: PublicRoom;
  @Input() noTitle = false;

  // saoulant le "!", mais sinon faut le rajouter partout .. -_- l'enlever quand besoin de check si erreur dans template
  room!: ClientChatRoom;

  socket!: WebSocket;
  socketMessage$ = new Subject<MessageEvent>();

  currentUser?: CurrentUser | null;

  message = '';
  messageTyping$ = new Subject();

  // @TODO: improve this, get a real state from SocketService (store socket here directly .. ?)
  socketConnected = false;

  // @TODO ! :D in a fancy "settings" button somewhere on the Room header :) => open popup with settings
  minimumLikeCount = 0;

  onDestroy$ = new Subject();

  anonCount = 0;

  constructor(
    private roomService: RoomService,
    private chatService: ChatService,
    private userService: AuthService,
    private matDialog: MatDialog,
    private snackbarService: SnackbarService,
  ) {
  }

  ngOnInit() {
    this.userService.currentUser$.subscribe(u => {
      this.currentUser = u;

      this.restartSocket();
    });

    // pipe catcherror, if no room returned ?
    this.roomService.joinRoom(this.roomInfo.id).subscribe(room => {
      this.room = room;

      this.refreshTopMessages();
      this.setUsers(this.room.users ?? []);

      this.connectSocket();
    });
  }

  restartSocket() {
    this.socket?.close();
    this.connectSocket();
  }

  connectSocket() {
    if (!this.room) {
      return;
    }

    this.connectToRoom().subscribe(ws => {
      this.socket = ws;

      this.socket.onmessage = message => this.socketMessage$.next(message);
      this.socket.onclose = e => this.onCloseSocket(e);

      this.room.messages.push(this.chatService.newSystemMessage('Connecté au serveur'));
      this.socketConnected = true; // lol

      this.startListening();
    });
  }

  onMessageTyping(value: string) {
    this.messageTyping$.next(value);
  }

  getSocketUrl() {
    // @TODO: OH BORDEL
    return (env.production ? 'wss' : 'ws') + '://' + window.location.hostname + ':9797';
  }

  connectToRoom() {
    return new Observable<WebSocket>(subber => {
      const socketHeaders = ['wss'];

      if (this.userService.currentToken) {
        socketHeaders.push(this.userService.currentToken);
      }

      const socket = new WebSocket(this.getSocketUrl() + '/' + ROOM_SOCKET_PREFIX + this.room.id, socketHeaders);

      socket.onopen = () => {
        subber.next(socket);
        subber.complete();
      };
    });
  }

  startListening() {
    this.onMessage().subscribe(serverMessage => {
      if (serverMessage.type === SocketMessageType.MESSAGE) {
        this.handleNewMessage(serverMessage.data as SocketMessageData);
      } else if (serverMessage.type === SocketMessageType.LIKE) {
        this.handleNewVote(serverMessage.data as SocketLikeData);
      } else if (serverMessage.type === SocketMessageType.USER_JOIN) {
        this.handleNewUser(serverMessage.data as PublicUser);
      }
    });
  }

  handleNewMessage(data: SocketMessageData) {
    const author = this.findUser(data.author!);

    // un message d'un inconnu ?
    if (!author) {
      return;
    }

    const pubChat = {
      id: data.id!,
      content: data.message!,
      author: author.id,
      date: new Date()
    };

    const message = this.chatService.adaptMessage(pubChat, this.room);

    this.room.messages.push(message);
  }

  handleNewVote(data: SocketLikeData) {
    const message = this.findMessage(data.target);

    console.log('Messages', this.room.messages, data.target);
    console.log(`On set le nombre de like sur ${message?.id} à ${data.count}`);

    if (message) {
      message.likesCount = data.count;
      this.refreshTopMessages();
    }
  }

  handleNewUser(user: PublicUser) {
    // ou remplacement possible ? si les infos d'un user ont changé et qu'il se reconnecte ?
    if (!this.findUser(user.id)) {
      // wesh trop chiant ? @TODO: transform cette histoire de "ClientChatRoom" en classe Room côté client ? :)
      this.room.users.push(user);
      this.room.messages.push(this.chatService.newSystemMessage('Nouveau membre : ' + user.username));
    }
  }

  onCloseSocket(e: CloseEvent) {
    this.socketConnected = false;
    this.room.messages.push(this.chatService.newSystemMessage('Déconnecté du serveur'));
  }

  // pas con en fait, pour éviter de surcharger le serveur, on peut simplement garder ça à jour côté client ...
  refreshTopMessages() {
    this.room.mostVoted = this.room.messages
      .filter(m => !!m.likesCount)
      .sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0))
      .slice(0, 5);
  }

  findUser(id: number) {
    return this.room.users.find(u => u.id === id);
  }

  findMessage(id: MessageId) {
    return this.room.messages.find(m => m.id === id);
  }

  sendMessage() {
    this.socketSendMessage(this.message);
    this.message = '';
  }

  onClickMessageInput(event: MouseEvent) {
    if (!this.currentUser) {
      // tried to prevent focus field (avoid useless "entering field" animation ...)
      event.preventDefault();
      this.matDialog.open(LoginComponent);
    }
  }

  sendLike(message: ClientRoomMessage) {
    console.log('Send like for : ', message);

    this.socketSendLikeFor(message);
  }

  setTitle(newTitle: string) {
    if (newTitle !== this.room.title) {
      this.room.title = newTitle;
      this.snackbarService.info(`Le titre de la room a changé pour ${this.room.title}`, {
        duration: 4000, verticalPosition: 'top'
      });
    }
  }

  setUsers(users: PublicUser[]) {
    this.room.users = users;
    // @TODO: bon c'est cool, mais ça montre qu'on a un soucis de déconnexion / switch des users (les anons restent même après que l'user soit loggé ...)
    this.anonCount = users.filter(u => u.username === 'anon').length;
  }

  // Socket part (maybe move to a Helper class, with Room attached, Service doesn't fit use case ...)

  onMessage() {
    return this.socketMessage$.pipe(
      map(event => {
        const data = JSON.parse(event.data) as SocketMessage;

        // un peu foireux ça, plutôt laisser le serveur nous donner l'heure .. ?
        data.date = new Date(performance.timeOrigin + event.timeStamp);

        return data;
      })
    );
  }

  buildSocketMessage(type: SocketMessageType, data: any) {
    return {type, data} as SocketMessage;
  }

  socketHandshake() {
    this.socket?.send(JSON.stringify(this.buildSocketMessage(SocketMessageType.HANDSHAKE, null)));
  }

  socketSendMessage(message: string) {
    this.socket?.send(JSON.stringify(this.buildSocketMessage(SocketMessageType.MESSAGE, {message})));
  }

  socketSendLikeFor(target: PublicMessage) {
    const data = {target: target.id};

    this.socket?.send(JSON.stringify(this.buildSocketMessage(SocketMessageType.LIKE, data)));
  }

  ngOnDestroy() {
    this.socket?.close();

    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }
}
