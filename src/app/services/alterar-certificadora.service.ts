// alterar-certificadora.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ICertificadora, IConta, ISubConta } from 'src/app/shared/tipos-e-mocks';

@Injectable({
  providedIn: 'root'
})
export class AlterarCertificadoraService {
  // Dados mockados
  private certificadora: ICertificadora = { 
    nomeCertificadora: 'VERRA', 
    situacao: 'Ativo'
  };

  private contasSubject = new BehaviorSubject<IConta[]>([
    { certificadora: 'VERRA', conta: '1234', titular: 'Banco do Brasil', usuario: 'Usuario1', numero: '1' },
    { certificadora: 'ASG', conta: '5678', titular: 'Banco do Brasil SA', usuario: 'Usuario2', numero: '2' },
    { certificadora: 'MCC', conta: '9876', titular: 'Banco do Brasil INC', usuario: 'Usuario3', numero: '3' }
  ]);

  private subContasSubject = new BehaviorSubject<ISubConta[]>([
    { contaVinculada: '1234', subConta: '123456', titular: 'Banco do Brasil', usuario: 'Usuario1' },
    { contaVinculada: '5678', subConta: '5678999', titular: 'Banco do Brasil SA', usuario: 'Usuario2' },
    { contaVinculada: '9876', subConta: '9876543', titular: 'Banco do Brasil INC', usuario: 'Usuario3' }
  ]);

  // Métodos para obter dados
  getCertificadora(): Observable<ICertificadora> {
    return of(this.certificadora).pipe(delay(500));
  }

  getContas(): Observable<IConta[]> {
    return this.contasSubject.asObservable();
  }

  getSubContas(): Observable<ISubConta[]> {
    return this.subContasSubject.asObservable();
  }

  // Métodos CRUD para Contas
  adicionarConta(novaConta: IConta): Observable<{ success: boolean }> {
    const contas = this.contasSubject.getValue();
    contas.push(novaConta);
    this.contasSubject.next(contas);
    return of({ success: true }).pipe(delay(500));
  }

  atualizarConta(contaAtualizada: IConta): Observable<{ success: boolean }> {
    let contas = this.contasSubject.getValue();
    contas = contas.map(conta => conta.numero === contaAtualizada.numero ? contaAtualizada : conta);
    this.contasSubject.next(contas);
    return of({ success: true }).pipe(delay(500));
  }

  excluirConta(contaParaExcluir: IConta): Observable<{ success: boolean }> {
    let contas = this.contasSubject.getValue();
    contas = contas.filter(conta => conta.numero !== contaParaExcluir.numero);
    this.contasSubject.next(contas);

    // Remove as subcontas vinculadas
    let subContas = this.subContasSubject.getValue();
    subContas = subContas.filter(sub => sub.contaVinculada !== contaParaExcluir.conta);
    this.subContasSubject.next(subContas);
    return of({ success: true }).pipe(delay(500));
  }

  // Métodos CRUD para Sub-contas
  adicionarSubConta(novaSubConta: ISubConta): Observable<{ success: boolean }> {
    const subContas = this.subContasSubject.getValue();
    subContas.push(novaSubConta);
    this.subContasSubject.next(subContas);
    return of({ success: true }).pipe(delay(500));
  }

  atualizarSubConta(subAtualizada: ISubConta): Observable<{ success: boolean }> {
    let subContas = this.subContasSubject.getValue();
    subContas = subContas.map(sub => sub.subConta === subAtualizada.subConta ? subAtualizada : sub);
    this.subContasSubject.next(subContas);
    return of({ success: true }).pipe(delay(500));
  }

  excluirSubConta(subParaExcluir: ISubConta): Observable<{ success: boolean }> {
    let subContas = this.subContasSubject.getValue();
    subContas = subContas.filter(sub => sub.subConta !== subParaExcluir.subConta);
    this.subContasSubject.next(subContas);
    return of({ success: true }).pipe(delay(500));
  }
}
