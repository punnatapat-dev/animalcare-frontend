import { Component, OnInit, inject, signal } from '@angular/core'; 
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
  animals = signal<any[]>([]); 

  // ⭐ จุดที่ 1: เพิ่มตัวแปร Signal สำหรับรับค่าจากช่องพิมพ์ (Input)
  newAnimalName = signal('');
  newAnimalSpecies = signal('');
  
  private http = inject(HttpClient);

  ngOnInit() {
    this.loadAnimals(); // แยกฟังก์ชันโหลดข้อมูลออกมาเพื่อให้เรียกใช้ซ้ำได้
  }

  // ⭐ จุดที่ 2: แยกฟังก์ชัน GET ออกมา (เพื่อให้เรียกใช้ใหม่หลังกดเพิ่มสัตว์)
  loadAnimals() {
    this.http.get('http://localhost:8000/api/animals/').subscribe({
      next: (data: any) => {
        this.animals.set(data.results);
        console.log('Daten erfolgreich geladen:', data);
      },
      error: (err) => console.error('Fehler beim Laden:', err)
    });
  }

  // ⭐ จุดที่ 3: เพิ่มฟังก์ชัน POST สำหรับส่งข้อมูลไปหลังบ้าน
  addAnimal() {
    const newAnimal = {
      name: this.newAnimalName(), // ดึงค่าจาก Signal มาใช้
      species: this.newAnimalSpecies(), // ดึงค่าจาก Signal มาใช้
      status: 'AVAILABLE'
    };

    this.http.post('http://localhost:8000/api/animals/', newAnimal).subscribe({
      next: (response) => {
        console.log('Tier erfolgreich hinzugefügt!', response);
        this.loadAnimals(); // 🔄 โหลดรายการใหม่ทันที น้องสัตว์ตัวใหม่จะได้โชว์เลย
        this.newAnimalName.set(''); // ล้างช่องพิมพ์ให้ว่าง
        this.newAnimalSpecies.set(''); // ล้างช่องพิมพ์ให้ว่าง
      },
      error: (err) => console.error('Fehler beim Hinzufügen:', err)
    });
  }
}