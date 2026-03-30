import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalEdit } from './animal-edit';

describe('AnimalEdit', () => {
  let component: AnimalEdit;
  let fixture: ComponentFixture<AnimalEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
