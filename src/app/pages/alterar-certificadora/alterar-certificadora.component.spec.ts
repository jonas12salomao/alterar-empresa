import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlterarCertificadoraComponent } from './alterar-certificadora.component';

describe('AlterarCertificadoraComponent', () => {
  let component: AlterarCertificadoraComponent;
  let fixture: ComponentFixture<AlterarCertificadoraComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlterarCertificadoraComponent]
    });
    fixture = TestBed.createComponent(AlterarCertificadoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
