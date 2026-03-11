import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-animal-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './animal-detail.html',
  styleUrl: './animal-detail.css',
})
export class AnimalDetailComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  API_BASE = 'https://animalcare-backend.onrender.com';

  animal = signal<any | null>(null);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Ungültige Tier-ID');
      this.loading.set(false);
      return;
    }

    this.http.get<any>(`${this.API_BASE}/api/animals/${id}/`).subscribe({
      next: (data) => {
        this.animal.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Tier konnte nicht geladen werden');
        this.loading.set(false);
      },
    });
  }
}