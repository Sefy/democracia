import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { env } from "../../environments/env";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  apiUrl = env.API_BASE_URL;

  constructor(
    protected http: HttpClient
  ) {
  }

  get<T>(url: string, data?: HttpParams | any) {
    const options = {} as { params: HttpParams };

    if (data) {
      options.params = this.createHttpParams(data);
    }

    return this.http.get<T>(this.apiUrl + url, options);
  }

  // BON. ne pas appeler avec null ... -_-
  createHttpParams(data: any) {
    if (data instanceof HttpParams) {
      return data;
    }

    return new HttpParams({fromObject: data});
  }

  post<T>(url: string, data: any) {
    return this.http.post<T>(this.apiUrl + url, data);
  }
}
