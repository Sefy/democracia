export class ObjectUtil {
  static omit<T extends object, K extends keyof T>(obj: T, keysToOmit: K[]): Omit<T, K> {
    return Object.fromEntries(
      Object.entries(obj).filter(([key]) => !keysToOmit.includes(key as K))
    ) as Omit<T, K>;
  }

  static pick<T extends object, K extends keyof T>(obj: T, keysToInclude: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keysToInclude) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  }
}
