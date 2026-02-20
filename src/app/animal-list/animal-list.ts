import { Component, OnInit, inject, signal } from '@angular/core'; 
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ต้องเพิ่ม FormsModule เพื่อใช้กับ input

@Component({
  selector: 'app-animal-list',
  standalone: true,
  imports: [CommonModule, FormsModule], // เพิ่ม FormsModule ตรงนี้ด้วย
  templateUrl: './animal-list.html', 
  styleUrl: './animal-list.css'      
})
export class AnimalListComponent implements OnInit {
  animals = signal<any[]>([]); 
  newAnimalName = signal('');
  newAnimalSpecies = signal('');
  
  // ⭐ จุดที่เพิ่มใหม่: เก็บ ID ของตัวที่กำลังแก้ไข (ถ้าเป็น null แปลว่าโหมดปกติ/เพิ่มใหม่)
  editingAnimalId = signal<number | null>(null);

  private http = inject(HttpClient);

  ngOnInit() {
    this.loadAnimals();
  }

  loadAnimals() {
    this.http.get('http://localhost:8000/api/animals/').subscribe({
      next: (data: any) => {
        this.animals.set(data.results);
      },
      error: (err) => console.error('Fehler beim Laden:', err)
    });
  }

  // ⭐ จุดที่เพิ่มใหม่: ฟังก์ชันดึงข้อมูลจากรายการมาใส่ในฟอร์มเพื่อแก้ไข
  prepareEdit(animal: any) {
    this.editingAnimalId.set(animal.id);
    this.newAnimalName.set(animal.name);
    this.newAnimalSpecies.set(animal.species);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ⭐ จุดที่เพิ่มใหม่: ฟังก์ชันกดยกเลิกการแก้ไข
  cancelEdit() {
    this.editingAnimalId.set(null);
    this.newAnimalName.set('');
    this.newAnimalSpecies.set('');
  }

  // ปรับปรุงฟังก์ชันเดิมให้รองรับทั้ง Add และ Update
  submitForm() {
    if (!this.newAnimalName() || !this.newAnimalSpecies()) return;

    const animalData = {
      name: this.newAnimalName(),
      species: this.newAnimalSpecies(),
      status: 'AVAILABLE'
    };

    if (this.editingAnimalId()) {
      // 🛠️ กรณีแก้ไข: ส่ง PUT
      this.http.put(`http://localhost:8000/api/animals/${this.editingAnimalId()}/`, animalData).subscribe({
        next: () => {
          this.loadAnimals();
          this.cancelEdit(); // ล้างฟอร์มและออกจากการแก้ไข
          console.log('Tier erfolgreich aktualisiert!');
        },
        error: (err) => console.error('Fehler beim Update:', err)
      });
    } else {
      // ➕ กรณีเพิ่มใหม่: ส่ง POST (โค้ดเดิมของคุณ)
      this.http.post('http://localhost:8000/api/animals/', animalData).subscribe({
        next: () => {
          this.loadAnimals();
          this.newAnimalName.set('');
          this.newAnimalSpecies.set('');
        },
        error: (err) => console.error('Fehler beim Hinzufügen:', err)
      });
    }
  }

  deleteAnimal(id: number) {
    if (confirm("Möchten Sie dieses Tier wirklich löschen?")) {
      // แก้ไข Syntax ของ URL จากเดิมของคุณที่เป็น ${id} ให้เป็นแบบ String Template `.../${id}/`
      this.http.delete(`http://localhost:8000/api/animals/${id}/`).subscribe({
        next: () => {
          this.animals.update(items => items.filter(a => a.id !== id));
          console.log('Tier erfolgreich gelöscht!');
        },
        error: (err) => console.error("Fehler:", err)
      });
    }
  }
}