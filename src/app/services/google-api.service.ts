/// <reference path="../../../node_modules/@types/gapi/index.d.ts" />
import {Injectable, NgZone} from '@angular/core';
import {env} from "../../environments/env";

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {
  constructor(
    private zone: NgZone
  ) {}

  loadClient(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.zone.run(() => {
        gapi.load('client', {
          callback: resolve,
          onerror: reject,
          timeout: 1000, // 5 seconds.
          ontimeout: reject
        });
      });
    });
  }

  initClient(): Promise<any> {
    const gapiParams = { 'apiKey': env.GOOGLE_API_KEY };

    return new Promise((resolve, reject) => {
      this.zone.run(() => {
        gapi.client.init(gapiParams).then(resolve, reject);
      });
    });
  }
}
