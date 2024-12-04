import { Injectable } from '@angular/core';
import { UserRole } from "@common/user";

export interface RoleData {
  name: string;
  color: string;
  colorClass: string;
}

const ROLES: Map<UserRole, RoleData> = new Map();

ROLES.set('USER', {name: 'Utilisateur', color: '#939393', colorClass: ''});
ROLES.set('MODERATOR', {name: 'Modérateur', color: '#933932', colorClass: ''});
ROLES.set('ADMIN', {name: 'Admin', color: 'red', colorClass: ''});

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor() {
  }

  getRole(role: UserRole) {
    return ROLES.get(role);
  }
}
