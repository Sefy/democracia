export class ArrayUtil {
  static find<T extends { id: Y }, Y>(haystack: Iterable<T>, needle: Y): T | undefined {
    for (const item of haystack) {
      if (item.id === needle) {
        return item;
      }
    }
    return undefined;
  }

  // @TODO: essayer ça mais bon ... parait fou de pouvoir faire du item[key], sur des classes par ex ?
  // static find<T, K extends keyof T>(haystack: Iterable<T>, key: K, value: T[K]): T | undefined {
  //   for (const item of haystack) {
  //     if (item[key] === value) {
  //       return item;
  //     }
  //   }
  //   return undefined;
  // }
}
