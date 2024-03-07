export * from './Core';
export * from './Service';
export * from './Config';
import * as Nazrin from './Events';

declare module 'koishi' {
  interface Events extends Nazrin.Events { }
}