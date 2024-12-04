import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from "@angular/router";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIcon } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { CommonModule } from "@angular/common";
import { filter } from "rxjs";

interface MenuItem {
  name: string;
  link: string;
  icon?: string;
  description?: string;
  isActive?: boolean;

  dividerAfter?: boolean;
}

@Component({
  selector: 'app-nav-menu',
  imports: [
    CommonModule,
    RouterLink,
    MatListModule,
    MatTooltip,
    MatIcon
  ],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.scss'
})
export class NavMenuComponent {

  items: MenuItem[] = [
    {link: '/rooms', name: 'Salles de discussions', icon: 'forum'},
    {link: '/votes', name: 'Votes', icon: 'how_to_vote'}
  ];

  constructor(
    private router: Router
  ) {
    // if (environment.electron) {
    //   this.items.unshift({link: '/imports', name: 'Imports', icon: 'drive_folder_upload'});
    // }

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(e => {
      const url = (e as NavigationEnd).url;

      // basic
      this.items.forEach(item => item.isActive = url.startsWith(item.link));
    });
  }
}
