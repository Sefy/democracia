import {env} from "../../environments/env";

export class Debug {
  static log(msg: string): void {
    if (env.debug) {
      console.log(msg);
    }
  }
}
