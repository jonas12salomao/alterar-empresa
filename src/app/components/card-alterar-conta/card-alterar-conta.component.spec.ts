import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardAlterarContaComponent } from './card-alterar-conta.component';

describe('CardAlterarContaComponent', () => {
  let component: CardAlterarContaComponent;
  let fixture: ComponentFixture<CardAlterarContaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardAlterarContaComponent]
    });
    fixture = TestBed.createComponent(CardAlterarContaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
