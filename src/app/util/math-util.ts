export class MathUtil {
  static round(value: number, places: number) {
    const pow = Math.pow(10, places);

    return Math.round(value * pow) / pow;
  }

  static rand(min: number, max: number) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  static isNumeric(value: any) {
    return !isNaN(+value); // typeof +value === 'number';
  }

  static sum(...values: any[]) {
    let total = 0;

    for (const val of values) {
      total += Number(val);
    }

    return total;
  }
}
