import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Animal {
  id: number;
  name: string;
  species: string;
  status: string;
  image_url?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AnimalService {
  private http = inject(HttpClient);
  // ลบ / ต่อท้ายออกเพื่อให้จัดการ path ใน method ต่างๆ ได้แม่นยำขึ้น
  private readonly API_BASE = 'https://animalcare-backend.onrender.com/api/animals';

  getAnimalById(id: number): Observable<Animal> {
    return this.http.get<Animal>(`${this.API_BASE}/${id}/`);
  }
}