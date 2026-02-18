import { Component, OnInit, inject, signal } from '@angular/core'; // 1. เพิ่ม signal ตรงนี้
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animal-list.html', 
  styleUrl: './animal-list.css'      
})
export class AnimalListComponent implements OnInit {
  //  ประกาศเป็น Signal ตัวเดียวที่เก็บ Array ข้างใน
  animals = signal<any[]>([]); 
  
  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get('http://localhost:8000/api/animals/').subscribe({
        next: (data: any) => {
          //  ใช้ .set() เพื่อส่งข้อมูลเข้าไปใน Signal
          this.animals.set(data.results); 
          console.log('Daten erfolgreich geladen:', data);
        },
        error: (err) => {
          console.error('Fehler beim Laden der Daten:', err);
        }
      });
  }
}