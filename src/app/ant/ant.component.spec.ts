import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntComponent } from './ant.component';

describe('AntComponent', () => {
  let component: AntComponent;
  let fixture: ComponentFixture<AntComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
