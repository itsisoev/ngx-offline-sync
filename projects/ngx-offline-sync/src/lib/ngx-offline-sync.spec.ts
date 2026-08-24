import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxOfflineSync } from './ngx-offline-sync';

describe('NgxOfflineSync', () => {
  let component: NgxOfflineSync;
  let fixture: ComponentFixture<NgxOfflineSync>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxOfflineSync],
    }).compileComponents();

    fixture = TestBed.createComponent(NgxOfflineSync);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
