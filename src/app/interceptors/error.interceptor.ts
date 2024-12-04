import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from "@angular/core";
import {DialogService} from "@app/services/dialog.service";
import {catchError, tap} from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const dialogService = inject(DialogService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      dialogService.alert(err.message);

      throw err;
    })
  );
};
