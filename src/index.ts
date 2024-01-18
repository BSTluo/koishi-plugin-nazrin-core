export * from './core';
export * from './service';
export * from './config';
import * as Nazrin from './Events';

declare module 'koishi' {
    interface Events extends Nazrin.Events { }
  }