import { TestBed } from '@angular/core/testing';

import { AlterarCertificadoraService } from './alterar-certificadora.service';

describe('AlterarCertificadoraService', () => {
  let service: AlterarCertificadoraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlterarCertificadoraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
