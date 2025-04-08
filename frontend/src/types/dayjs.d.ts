declare module 'dayjs' {
  interface Dayjs {
    format(template?: string): string;
    valueOf(): number;
    isValid(): boolean;
    year(): number;
    month(): number;
    date(): number;
    hour(): number;
    minute(): number;
    second(): number;
    millisecond(): number;
  }

  interface DayjsStatic {
    (date?: string | number | Date | Dayjs): Dayjs;
    format(date: string, template: string): string;
    parse(date: string, format: string): Dayjs;
    isDayjs(value: any): boolean;
  }

  const dayjs: DayjsStatic;
  export = dayjs;
} 