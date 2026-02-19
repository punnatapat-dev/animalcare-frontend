import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core'; // 1. ตัดคำว่า Experimental ออก
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // 2. ตัดคำว่า Experimental ออกให้เหลือแค่นี้
    provideRouter(routes),
    provideHttpClient() 
  ]
};