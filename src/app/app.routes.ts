import { Routes } from '@angular/router';
import { HomeComponent } from "@app/pages/home/home.component";
import { RoomsComponent } from "@app/pages/rooms/rooms.component";
import { AboutComponent } from "@app/pages/about/about.component";
import { RoomDetailComponent } from "@app/pages/rooms/detail/room-detail.component";
import { VotesComponent } from "@app/pages/votes/votes.component";

export const routes: Routes = [
  {path: '', pathMatch: 'full', component: HomeComponent},

  {
    path: 'rooms', children: [
      {path: ':id', component: RoomDetailComponent},
      {path: '', component: RoomsComponent, pathMatch: 'full'}
    ]
  },

  {
    path: 'votes', component: VotesComponent
  },

  {path: 'about', component: AboutComponent},
];
