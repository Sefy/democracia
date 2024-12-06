import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from "@app/services/auth.service";
import { UserRole } from "@common/user";

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective {

  role?: UserRole;

  @Input() set appHasRole(role: UserRole) {
    this.role = role;
    this.refreshView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe(() => this.refreshView());
  }

  refreshView() {
    if (this.role && this.authService.hasRole(this.role)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
