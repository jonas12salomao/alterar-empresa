import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaContasComponent } from './tabela-contas.component';

describe('TabelaContasComponent', () => {
  let component: TabelaContasComponent;
  let fixture: ComponentFixture<TabelaContasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TabelaContasComponent]
    });
    fixture = TestBed.createComponent(TabelaContasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
