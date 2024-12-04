import { Pipe, PipeTransform } from '@angular/core';
import { UserRole } from "@common/user";
import { RoleService } from "@app/services/role.service";

export type ReturnType = 'name' | 'color' | 'colorClass';

@Pipe({
  name: 'role'
})
export class RolePipe implements PipeTransform {

  constructor(
    private roleService: RoleService
  ) {
  }

  // on pourrait vouloir retourner des trucs différents mais bon ... pour l'intant osef en fait x)
  transform(value?: UserRole, what?: ReturnType): string {
    if (!value) {
      return '';
    }

    const data = this.roleService.getRole(value);

    return data?.name ?? '';
  }
}
