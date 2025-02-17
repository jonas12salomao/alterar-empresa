import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardAlterarSubcontaComponent } from './card-alterar-subconta.component';

describe('CardAlterarSubcontaComponent', () => {
  let component: CardAlterarSubcontaComponent;
  let fixture: ComponentFixture<CardAlterarSubcontaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardAlterarSubcontaComponent]
    });
    fixture = TestBed.createComponent(CardAlterarSubcontaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
