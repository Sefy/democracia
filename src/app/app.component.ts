import { Component, OnInit } from '@angular/core';
import { AuthService } from "@app/services/auth.service";
import { HeaderComponent } from "@app/components/_layout/header/header.component";
import { ChildrenOutletContexts, RouterOutlet } from "@angular/router";
import { slideInAnimation } from "@app/animations";
import { Theme, ThemeService } from "@app/services/theme.service";
import { MatIconRegistry } from "@angular/material/icon";
import { MatSidenavModule } from "@angular/material/sidenav";
import { NavMenuComponent } from "@app/components/_layout/nav-menu/nav-menu.component";
import { ThemeSwitcherComponent } from "@app/components/_global/theme-switcher/theme-switcher.component";
import { FaIconLibrary, FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    RouterOutlet,
    MatSidenavModule,
    NavMenuComponent,
    ThemeSwitcherComponent,
    FontAwesomeModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [slideInAnimation] // marche pas cette merde ! x)
})
export class AppComponent implements OnInit {
  constructor(
    private userService: AuthService,
    private contexts: ChildrenOutletContexts,
    private themeService: ThemeService,
    matIconRegistry: MatIconRegistry,
    faIconLibrary: FaIconLibrary
  ) {
    matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');

    faIconLibrary.addIconPacks(fas, fab);

    this.themeService.init();
  }

  ngOnInit() {
    this.userService.loadTokenFromStorage();

    this.userService.loadUser().subscribe();

    this.themeService.currentTheme$.subscribe(theme => this.updateHtmlColorScheme(theme));
  }

  updateHtmlColorScheme(theme: Theme) {
    document.documentElement.style.colorScheme = theme;
  }

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  protected readonly slideInAnimation = slideInAnimation;
}
