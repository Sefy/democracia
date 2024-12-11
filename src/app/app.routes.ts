import { Routes } from '@angular/router';
import { HomeComponent } from "@app/pages/home/home.component";
import { RoomsComponent } from "@app/pages/rooms/rooms.component";
import { AboutComponent } from "@app/pages/about/about.component";
import { RoomDetailComponent } from "@app/pages/rooms/detail/room-detail.component";

export const routes: Routes = [
  {path: '', pathMatch: 'full', component: HomeComponent},

  {
    path: 'rooms', children: [
      {path: ':id', component: RoomDetailComponent},
      {path: '', component: RoomsComponent, pathMatch: 'full'}
    ]
  },

  {path: 'about', component: AboutComponent},
];
