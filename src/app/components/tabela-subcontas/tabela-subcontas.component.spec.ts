import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaSubcontasComponent } from './tabela-subcontas.component';

describe('TabelaSubcontasComponent', () => {
  let component: TabelaSubcontasComponent;
  let fixture: ComponentFixture<TabelaSubcontasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TabelaSubcontasComponent]
    });
    fixture = TestBed.createComponent(TabelaSubcontasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
