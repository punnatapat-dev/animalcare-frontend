import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000/api/animals/';

  getAnimals(params?: any) {
    return this.http.get(this.baseUrl, { params });
  }

  createAnimal(data: any, file?: File) {
    const form = new FormData();

    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined) form.append(k, String(v));
    });

    // ✅ ต้องชื่อ image
    if (file) form.append('image', file);

    return this.http.post(this.baseUrl, form);
  }

  updateAnimal(id: number, data: any, file?: File) {
    const form = new FormData();

    Object.entries(data).forEach(([k, v]) => {
      if (v !== null && v !== undefined) form.append(k, String(v));
    });

    if (file) form.append('image', file);

    return this.http.patch(`${this.baseUrl}${id}/`, form);
  }

  deleteAnimal(id: number) {
    return this.http.delete(`${this.baseUrl}${id}/`);
  }
}