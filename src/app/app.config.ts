import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core'; // 1. ตัดคำว่า Experimental ออก
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), 
    provideRouter(routes),
    provideHttpClient() 
  ]
};