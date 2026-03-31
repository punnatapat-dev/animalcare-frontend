import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComfirmModel } from './confirm-modal';

describe('ComfirmModel', () => {
  let component: ComfirmModel;
  let fixture: ComponentFixture<ComfirmModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComfirmModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComfirmModel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
