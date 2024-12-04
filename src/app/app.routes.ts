import { Routes } from '@angular/router';
import { HomeComponent } from "@app/pages/home/home.component";
import { RoomsComponent } from "@app/pages/rooms/rooms.component";
import { AboutComponent } from "@app/pages/about/about.component";
import { RoomPageComponent } from "@app/pages/rooms/page/room-page.component";

export const routes: Routes = [
  {path: '', pathMatch: 'full', component: HomeComponent},

  {
    path: 'rooms', children: [
      {path: ':id', component: RoomPageComponent},
      {path: '', component: RoomsComponent, pathMatch: 'full'}
    ]
  },

  {path: 'about', component: AboutComponent},
];
