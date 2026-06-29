import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaspberryMonitor } from './raspberry-monitor';

describe('RaspberryMonitor', () => {
  let component: RaspberryMonitor;
  let fixture: ComponentFixture<RaspberryMonitor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaspberryMonitor],
    }).compileComponents();

    fixture = TestBed.createComponent(RaspberryMonitor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
