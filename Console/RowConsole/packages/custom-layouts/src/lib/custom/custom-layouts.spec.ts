import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomLayouts } from './custom-layouts';

describe('CustomLayouts', () => {
  let component: CustomLayouts;
  let fixture: ComponentFixture<CustomLayouts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomLayouts],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomLayouts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
