import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IConta } from 'src/app/shared/tipos-e-mocks';

@Component({
  selector: 'app-tabela-contas',
  templateUrl: './tabela-contas.component.html',
  styleUrls: ['./tabela-contas.component.css']
})
export class TabelaContasComponent {
  @Input() contas: IConta[] = [];
  @Input() criaContaForm!: FormGroup;
  @Input() adicionandoConta = false;
  @Output() editarConta = new EventEmitter<IConta>();
  @Output() excluirConta = new EventEmitter<IConta>();
  @Output() adicionarConta = new EventEmitter<void>();
  @Output() adicionarSubConta = new EventEmitter<IConta>();
  @Output() cancelarNovaConta = new EventEmitter<void>();
  @Output() salvarNovaConta = new EventEmitter<IConta>();

A seguir, segue uma versão final dos principais arquivos (service, componente pai e seus templates e filhos) com as alterações solicitadas. Nesta versão:

• Não usamos mais a variável de atualizações acumuladas (nem o projetoExistente).
• Cada operação (adição, edição e exclusão) é feita individualmente, imediatamente chamando o backend (ou json‑server) via service.
• Quando uma conta é editada ou excluída, as operações para atualizar ou excluir também são chamadas para as subcontas cujo campo “contaVinculada” corresponda à conta em questão.
• Comentários foram incluídos para indicar as mudanças e explicar a lógica.

1. Service – AlterarCertificadoraService

O service volta à forma “original”, com métodos CRUD individuais para contas e subcontas.

// src/app/services/alterar-certificadora.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICertificadora, IConta, ISubConta } from 'src/app/shared/models/interfaces/tipos-e-mocks';

@Injectable({
  providedIn: 'root'
})
export class AlterarCertificadoraService {
  // URL base do json‑server
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Operações para a certificadora
  getCertificadora(): Observable<ICertificadora> {
    return this.http.get<ICertificadora>(`${this.baseUrl}/certificadora`);
  }

  // Operações para contas
  getContas(): Observable<IConta[]> {
    return this.http.get<IConta[]>(`${this.baseUrl}/contas`);
  }

  adicionarConta(novaConta: IConta): Observable<IConta> {
    return this.http.post<IConta>(`${this.baseUrl}/contas`, novaConta);
  }

  atualizarConta(contaAtualizada: IConta): Observable<IConta> {
    // Usamos "numero" como identificador único
    return this.http.put<IConta>(`${this.baseUrl}/contas/${contaAtualizada.numero}`, contaAtualizada);
  }

  excluirConta(contaParaExcluir: IConta): Observable<any> {
    return this.http.delete(`${this.baseUrl}/contas/${contaParaExcluir.numero}`);
  }

  // Operações para subcontas
  getSubContas(): Observable<ISubConta[]> {
    return this.http.get<ISubConta[]>(`${this.baseUrl}/subContas`);
  }

  adicionarSubConta(novaSubConta: ISubConta): Observable<ISubConta> {
    return this.http.post<ISubConta>(`${this.baseUrl}/subContas`, novaSubConta);
  }

  atualizarSubConta(subAtualizada: ISubConta): Observable<ISubConta> {
    // Usamos "subConta" como identificador único
    return this.http.put<ISubConta>(`${this.baseUrl}/subContas/${subAtualizada.subConta}`, subAtualizada);
  }

  excluirSubConta(subParaExcluir: ISubConta): Observable<any> {
    return this.http.delete(`${this.baseUrl}/subContas/${subParaExcluir.subConta}`);
  }
}

2. Componente Pai – AlterarCertificadoraComponent

Agora removemos toda a lógica de acumulação (variável de atualizações acumuladas e as funções de “limparAtualizacoes”). As operações são feitas individualmente.
Observe os comentários marcados com “// ALTERAÇÃO:” que indicam as partes removidas ou modificadas.

alterar-certificadora.component.ts

// src/app/pages/alterar-certificadora/alterar-certificadora.component.ts
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlterarCertificadoraService } from 'src/app/services/alterar-certificadora.service';
import { ICertificadora, IConta, ISubConta } from 'src/app/shared/models/interfaces/tipos-e-mocks';

@Component({
  selector: 'app-alterar-certificadora',
  templateUrl: './alterar-certificadora.component.html',
  styleUrls: ['./alterar-certificadora.component.css']
})
export class AlterarCertificadoraComponent implements OnInit {
  // Formulários para certificadora, edição de conta, edição de subconta e para a linha inline de nova subconta
  formCertificadora: FormGroup;
  formConta: FormGroup;
  formSubConta: FormGroup;
  novaSubContaForm: FormGroup;

  // Dados da certificadora
  certificadora: ICertificadora = { 
    nomeCertificadora: 'VERRA', 
    situacao: 'Ativo'
  };

  // Arrays para exibição
  contas: IConta[] = [];
  subContas: ISubConta[] = [];

  // Flags de controle
  editandoConta: boolean = false;
  editandoSubConta: boolean = false;
  adicionandoSubConta: boolean = false;
  // ALTERAÇÃO: Removemos a variável projetoExistente

  // Variável para armazenar o número antigo da conta, para atualizar as subcontas vinculadas
  private oldContaNumber: string = '';

  constructor(private alterarCertificadoraService: AlterarCertificadoraService) {
    // Formulário da certificadora – usa um switch button (valor booleano: true = Ativo)
    this.formCertificadora = new FormGroup({
      situacao: new FormControl(this.certificadora.situacao === 'Ativo', Validators.required)
    });
    // Formulário para edição de conta
    this.formConta = new FormGroup({
      conta: new FormControl('', Validators.required),
      titular: new FormControl('', Validators.required),
      usuario: new FormControl('', Validators.required)
    });
    // Formulário para edição de subconta
    this.formSubConta = new FormGroup({
      contaVinculada: new FormControl('', Validators.required),
      subConta: new FormControl('', Validators.required),
      titular: new FormControl('', Validators.required),
      usuario: new FormControl('', Validators.required)
    });
    // Formulário para a linha inline de nova subconta
    this.novaSubContaForm = new FormGroup({
      contaVinculada: new FormControl('', Validators.required),
      subConta: new FormControl('', Validators.required),
      titular: new FormControl('', Validators.required),
      usuario: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    // Carrega dados do backend (JSON-server)
    this.alterarCertificadoraService.getContas().subscribe((data: IConta[]) => {
      this.contas = data;
    });
    this.alterarCertificadoraService.getSubContas().subscribe((data: ISubConta[]) => {
      this.subContas = data;
    });
  }

  // MÉTODOS PARA CONTAS

  adicionarConta(): void {
    const novaConta: IConta = {
      certificadora: this.certificadora.nomeCertificadora,
      conta: '', // usuário preencherá via formulário de edição
      titular: '',
      usuario: '',
      numero: (this.contas.length + 1).toString()
    };
    // Chama o serviço para adicionar a conta e atualiza o array local
    this.alterarCertificadoraService.adicionarConta(novaConta).subscribe(added => {
      this.contas.push(added);
    });
  }

  editarConta(conta: IConta): void {
    this.editandoConta = true;
    this.formConta.patchValue({
      conta: conta.conta,
      titular: conta.titular,
      usuario: conta.usuario
    });
    this.oldContaNumber = conta.conta; // Guarda o número original para referência
  }

  alterarConta(): void {
    if (this.formConta.valid) {
      const newContaNumber = this.formConta.value.conta;
      const contaAtualizada: IConta = {
        ...this.formConta.value,
        certificadora: this.certificadora.nomeCertificadora,
        // Aqui usamos o mesmo "numero" que identifica a conta no backend
        numero: this.oldContaNumber
      };
      this.alterarCertificadoraService.atualizarConta(contaAtualizada).subscribe(updated => {
        // Atualiza a lista local de contas
        const idx = this.contas.findIndex(c => c.numero === updated.numero);
        if (idx !== -1) {
          this.contas[idx] = updated;
        }
        // Se o número da conta mudou, atualiza as subcontas vinculadas:
        if (this.oldContaNumber !== newContaNumber) {
          this.subContas.forEach(sub => {
            if (sub.contaVinculada === this.oldContaNumber) {
              const subAtualizada: ISubConta = { ...sub, contaVinculada: newContaNumber };
              // Chama o serviço para atualizar cada subconta afetada
              this.alterarCertificadoraService.atualizarSubConta(subAtualizada).subscribe(() => {
                const idxSub = this.subContas.findIndex(s => s.subConta === sub.subConta);
                if (idxSub !== -1) {
                  this.subContas[idxSub] = subAtualizada;
                }
              });
            }
          });
        }
        this.editandoConta = false;
      });
    } else {
      alert('Preencha todos os campos obrigatórios para a conta.');
    }
  }

  confirmarExclusaoConta(conta: IConta): void {
    if (confirm('Deseja excluir esta conta?')) {
      this.alterarCertificadoraService.excluirConta(conta).subscribe(() => {
        // Remove a conta localmente
        this.contas = this.contas.filter(c => c.numero !== conta.numero);
        // Para as subcontas vinculadas à conta, exclua-as individualmente
        const subParaExcluir = this.subContas.filter(sub => sub.contaVinculada === conta.conta);
        subParaExcluir.forEach(sub => {
          this.alterarCertificadoraService.excluirSubConta(sub).subscribe();
        });
        this.subContas = this.subContas.filter(sub => sub.contaVinculada !== conta.conta);
      });
    }
  }

  // MÉTODOS PARA SUB-CONTAS

  adicionarSubConta(conta?: IConta): void {
    // Ativa o modo de adição inline para nova subconta e, se uma conta for passada,
    // preenche o campo 'contaVinculada' com o valor da conta
    this.adicionandoSubConta = true;
    if (conta) {
      this.novaSubContaForm.patchValue({ contaVinculada: conta.conta });
    } else {
      this.novaSubContaForm.patchValue({ contaVinculada: '' });
    }
  }

  salvarNovaSubConta(): void {
    if (this.novaSubContaForm.valid) {
      const novaSub: ISubConta = this.novaSubContaForm.value;
      this.alterarCertificadoraService.adicionarSubConta(novaSub).subscribe(added => {
        this.subContas.push(added);
        this.adicionandoSubConta = false;
        this.novaSubContaForm.reset();
      });
    } else {
      alert('Preencha todos os campos obrigatórios para a sub-conta.');
    }
  }

  editarSubConta(sub: ISubConta): void {
    this.editandoSubConta = true;
    this.formSubConta.patchValue({
      contaVinculada: sub.contaVinculada,
      subConta: sub.subConta,
      titular: sub.titular,
      usuario: sub.usuario
    });
  }

  confirmarEdicaoSubConta(): void {
    if (this.formSubConta.valid) {
      const subAtualizada: ISubConta = { ...this.formSubConta.value };
      this.alterarCertificadoraService.atualizarSubConta(subAtualizada).subscribe(updated => {
        const idx = this.subContas.findIndex(s => s.subConta === updated.subConta);
        if (idx !== -1) {
          this.subContas[idx] = updated;
        }
        this.editandoSubConta = false;
      });
    } else {
      alert('Preencha todos os campos obrigatórios para a sub-conta.');
    }
  }

  confirmarExclusaoSubConta(sub: ISubConta): void {
    if (confirm('Deseja excluir esta sub-conta?')) {
      this.alterarCertificadoraService.excluirSubConta(sub).subscribe(() => {
        this.subContas = this.subContas.filter(s => s.subConta !== sub.subConta);
      });
    }
  }

  cancelarEdicaoSubConta(): void {
    this.editandoSubConta = false;
  }

  cancelarEdicaoConta(): void {
    this.editandoConta = false;
  }

  cancelarNovaSubConta(): void {
    this.adicionandoSubConta = false;
    this.novaSubContaForm.reset();
  }

  cancelar(): void {
    alert('Operação cancelada.');
  }
}

alterar-certificadora.component.html

<!-- src/app/pages/alterar-certificadora/alterar-certificadora.component.html -->
<div class="container mt-4">
  <!-- Card de Informações da Certificadora -->
  <bb-card class="mb-4">
    <bb-card-header>Informações da Certificadora</bb-card-header>
    <bb-card-body>
      <div class="row px-2 pb-3">
        <div class="d-flex align-items-center col-3">
          <bb-text-pair label="Certificadora" caption="{{ certificadora.nomeCertificadora }}" size="regular"></bb-text-pair>
        </div>
        <div class="d-flex align-items-center col-4">
          <bb-text-pair label="Situação" caption="Selecione para ativar ou inativar" size="regular"></bb-text-pair>
        </div>
        <div class="d-flex align-items-center col-4">
          <!-- Switch button para situação, usando formControlName vinculado a formCertificadora -->
          <bb-switch-button formControlName="situacao" label="Ativar/Inativar" description="" [alignedLeft]="false" class="white-space-pre-line"></bb-switch-button>
        </div>
      </div>
    </bb-card-body>
  </bb-card>

  <!-- Componente Tabela de Contas -->
  <app-tabela-contas 
    [contas]="contas"
    (editarConta)="editarConta($event)"
    (excluirConta)="confirmarExclusaoConta($event)"
    (adicionarConta)="adicionarConta()"
    (adicionarSubConta)="adicionarSubConta($event)"
  ></app-tabela-contas>

  <!-- Componente Tabela de Sub-contas com linha inline para nova sub-conta -->
  <app-tabela-subcontas 
    [subContas]="subContas"
    [addingNew]="adicionandoSubConta"
    [newSubContaForm]="novaSubContaForm"
    (editarSubConta)="editarSubConta($event)"
    (excluirSubConta)="confirmarExclusaoSubConta($event)"
    (saveNewSubConta)="salvarNovaSubConta()"
    (cancelNewSubConta)="cancelarNovaSubConta()"
  ></app-tabela-subcontas>

  <!-- Card de Edição de Conta -->
  <app-card-alterar-contas 
    *ngIf="editandoConta"
    [form]="formConta"
    (alterar)="alterarConta()"
    (cancelar)="cancelarEdicaoConta()"
  ></app-card-alterar-contas>

  <!-- Card de Edição de Sub-conta -->
  <app-card-alterar-subcontas 
    *ngIf="editandoSubConta"
    [form]="formSubConta"
    (alterar)="confirmarEdicaoSubConta()"
    (cancelar)="cancelarEdicaoSubConta()"
  ></app-card-alterar-subcontas>

  <!-- Botões Gerais de Cancelar/Confirmar -->
  <div class="text-end mt-3" *ngIf="!editandoConta && !editandoSubConta">
    <button bbButton type="button" kind="secondary" (click)="cancelar()">CANCELAR</button>
    <button bbButton type="button" (click)="confirmarAtualizacao()">
      CONFIRMAR
    </button>
  </div>
</div>

3. Componentes Filhos

Os componentes filhos (tabela de contas, tabela de sub-contas, card de alteração) permanecem praticamente iguais à versão anterior. Apenas removemos referências à variável de atualizações acumuladas e ao projetoExistente.

Tabela de Contas

tabela-contas.component.ts

// src/app/pages/alterar-certificadora/tabela-contas/tabela-contas.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IConta } from 'src/app/shared/models/interfaces/tipos-e-mocks';

@Component({
  selector: 'app-tabela-contas',
  templateUrl: './tabela-contas.component.html',
  styleUrls: ['./tabela-contas.component.css']
})
export class TabelaContasComponent {
  @Input() contas: IConta[] = [];
  @Output() editarConta = new EventEmitter<IConta>();
  @Output() excluirConta = new EventEmitter<IConta>();
  @Output() adicionarConta = new EventEmitter<void>();
  @Output() adicionarSubConta = new EventEmitter<IConta>();
}

tabela-contas.component.html

<!-- src/app/pages/alterar-certificadora/tabela-contas/tabela-contas.component.html -->
<bb-card class="mb-4">
  <bb-card-header>Conta</bb-card-header>
  <bb-card-body>
    <table bb-table mode="spaced" class="mb-0" [dataSource]="contas" *ngIf="contas.length">
      <ng-container bbColumnDef="certificadora">
        <th bbHeaderCell *bbHeaderCellDef>Certificadora</th>
        <td bbCell *bbCellDef="let conta">{{ conta.certificadora }}</td>
      </ng-container>
      <ng-container bbColumnDef="conta">
        <th bbHeaderCell *bbHeaderCellDef>Conta</th>
        <td bbCell *bbCellDef="let conta">{{ conta.conta }}</td>
      </ng-container>
      <ng-container bbColumnDef="titular">
        <th bbHeaderCell *bbHeaderCellDef>Titular</th>
        <td bbCell *bbCellDef="let conta">{{ conta.titular }}</td>
      </ng-container>
      <ng-container bbColumnDef="usuario">
        <th bbHeaderCell *bbHeaderCellDef>Usuário</th>
        <td bbCell *bbCellDef="let conta">{{ conta.usuario }}</td>
      </ng-container>
      <ng-container bbColumnDef="acoes">
        <th bbHeaderCell *bbHeaderCellDef></th>
        <td bbCell *bbCellDef="let conta" class="d-flex align-items-end justify-content-end">
          <button bbIconButton type="button" (click)="adicionarSubConta.emit(conta)">
            <bb-icon icon="append" pack="bbds-ui"></bb-icon>
          </button>
          <button bbIconButton type="button" (click)="editarConta.emit(conta)">
            <bb-icon icon="edit" pack="bbds-ui"></bb-icon>
          </button>
          <button bbIconButton type="button" (click)="excluirConta.emit(conta)">
            <bb-icon icon="delete" pack="bbds-ui"></bb-icon>
          </button>
        </td>
      </ng-container>
      <thead>
        <tr bb-header-row *bbHeaderRowDef="['certificadora','conta','titular','usuario','acoes']"></tr>
      </thead>
      <tbody>
        <tr bb-row *bbRowDef="let row; columns: ['certificadora','conta','titular','usuario','acoes']"></tr>
      </tbody>
    </table>
    <div class="d-flex gap-1 justify-content-end align-items-center mt-3">
      <bb-link-nav [iconConfig]="{ pack: 'bbds-ui', icon: 'append' }">
        <a href="javascript:void(0);" (click)="adicionarConta.emit()">Adicionar conta</a>
      </bb-link-nav>
    </div>
  </bb-card-body>
</bb-card>

Tabela de Sub-contas (com linha inline)

tabela-subcontas.component.ts

// src/app/pages/alterar-certificadora/tabela-subcontas/tabela-subcontas.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ISubConta } from 'src/app/shared/models/interfaces/tipos-e-mocks';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tabela-subcontas',
  templateUrl: './tabela-subcontas.component.html',
  styleUrls: ['./tabela-subcontas.component.css']
})
export class TabelaSubcontasComponent {
  @Input() subContas: ISubConta[] = [];
  @Input() addingNew: boolean = false;
  @Input() newSubContaForm!: FormGroup;
  
  @Output() editarSubConta = new EventEmitter<ISubConta>();
  @Output() excluirSubConta = new EventEmitter<ISubConta>();
  @Output() saveNewSubConta = new EventEmitter<void>();
  @Output() cancelNewSubConta = new EventEmitter<void>();
}

tabela-subcontas.component.html

<!-- src/app/pages/alterar-certificadora/tabela-subcontas/tabela-subcontas.component.html -->
<bb-card class="mb-4">
  <bb-card-header>Sub-contas</bb-card-header>
  <bb-card-body>
    <table bb-table mode="spaced" class="mb-0" [dataSource]="subContas" *ngIf="subContas.length">
      <ng-container bbColumnDef="contaVinculada">
        <th bbHeaderCell *bbHeaderCellDef>Conta vinculada</th>
        <td bbCell *bbCellDef="let sub">{{ sub.contaVinculada }}</td>
      </ng-container>
      <ng-container bbColumnDef="subConta">
        <th bbHeaderCell *bbHeaderCellDef>Sub-conta</th>
        <td bbCell *bbCellDef="let sub">{{ sub.subConta }}</td>
      </ng-container>
      <ng-container bbColumnDef="titular">
        <th bbHeaderCell *bbHeaderCellDef>Titular</th>
        <td bbCell *bbCellDef="let sub">{{ sub.titular }}</td>
      </ng-container>
      <ng-container bbColumnDef="usuario">
        <th bbHeaderCell *bbHeaderCellDef>Usuário</th>
        <td bbCell *bbCellDef="let sub">{{ sub.usuario }}</td>
      </ng-container>
      <ng-container bbColumnDef="acoes">
        <th bbHeaderCell *bbHeaderCellDef></th>
        <td bbCell *bbCellDef="let sub" class="d-flex align-items-end justify-content-end">
          <button bbIconButton type="button" (click)="editarSubConta.emit(sub)">
            <bb-icon icon="edit" pack="bbds-ui"></bb-icon>
          </button>
          <button bbIconButton type="button" (click)="excluirSubConta.emit(sub)">
            <bb-icon icon="delete" pack="bbds-ui"></bb-icon>
          </button>
        </td>
      </ng-container>
      <thead>
        <tr bb-header-row *bbHeaderRowDef="['contaVinculada','subConta','titular','usuario','acoes']"></tr>
      </thead>
      <tbody>
        <tr bb-row *bbRowDef="let row; columns: ['contaVinculada','subConta','titular','usuario','acoes']"></tr>
        <!-- Linha inline para nova sub-conta -->
        <tr *ngIf="addingNew" [formGroup]="newSubContaForm">
          <td>
            <input type="text" formControlName="contaVinculada" class="form-control" placeholder="Conta vinculada">
          </td>
          <td>
            <input type="text" formControlName="subConta" class="form-control" placeholder="Sub-conta">
          </td>
          <td>
            <input type="text" formControlName="titular" class="form-control" placeholder="Titular">
          </td>
          <td>
            <input type="text" formControlName="usuario" class="form-control" placeholder="Usuário">
          </td>
          <td class="d-flex align-items-end justify-content-end">
            <button bbIconButton type="button" (click)="saveNewSubConta.emit()">
              <bb-icon icon="check" pack="bbds-ui"></bb-icon>
            </button>
            <button bbIconButton type="button" (click)="cancelNewSubConta.emit()">
              <bb-icon icon="cancel" pack="bbds-ui"></bb-icon>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </bb-card-body>
</bb-card>

Card de Alterar Contas

card-alterar-contas.component.ts

// src/app/pages/alterar-certificadora/card-alterar-contas/card-alterar-contas.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-card-alterar-contas',
  templateUrl: './card-alterar-contas.component.html',
  styleUrls: ['./card-alterar-contas.component.css']
})
export class CardAlterarContasComponent {
  @Input() form!: FormGroup;
  @Output() alterar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}

card-alterar-contas.component.html

<!-- src/app/pages/alterar-certificadora/card-alterar-contas/card-alterar-contas.component.html -->
<bb-card class="mb-4">
  <bb-card-header>Alterar Conta</bb-card-header>
  <bb-card-body>
    <form [formGroup]="form">
      <div class="mb-3">
        <bb-text-field label="Conta">
          <input formControlName="conta" placeholder="Informe a conta" class="form-control"/>
        </bb-text-field>
      </div>
      <div class="mb-3">
        <bb-text-field label="Titular">
          <input formControlName="titular" placeholder="Informe o titular" class="form-control"/>
        </bb-text-field>
      </div>
      <div class="mb-3">
        <bb-text-field label="Usuário">
          <input formControlName="usuario" placeholder="Informe o usuário" class="form-control"/>
        </bb-text-field>
      </div>
    </form>
  </bb-card-body>
  <bb-card-footer class="text-end">
    <button bbButton type="button" kind="secondary" (click)="cancelar.emit()">Cancelar</button>
    <button bbButton type="button" (click)="alterar.emit()">Alterar</button>
  </bb-card-footer>
</bb-card>

Card de Alterar Sub-contas

card-alterar-subcontas.component.ts

// src/app/pages/alterar-certificadora/card-alterar-subcontas/card-alterar-subcontas.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-card-alterar-subcontas',
  templateUrl: './card-alterar-subcontas.component.html',
  styleUrls: ['./card-alterar-subcontas.component.css']
})
export class CardAlterarSubcontasComponent {
  @Input() form!: FormGroup;
  @Output() alterar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}

card-alterar-subcontas.component.html

<!-- src/app/pages/alterar-certificadora/card-alterar-subcontas/card-alterar-subcontas.component.html -->
<bb-card class="mb-4">
  <bb-card-header>Alterar Sub-conta</bb-card-header>
  <bb-card-body>
    <form [formGroup]="form">
      <div class="mb-3">
        <bb-text-field label="Conta Vinculada">
          <input formControlName="contaVinculada" placeholder="Conta vinculada" class="form-control"/>
        </bb-text-field>
      </div>
      <div class="mb-3">
        <bb-text-field label="Sub-conta">
          <input formControlName="subConta" placeholder="Sub-conta" class="form-control"/>
        </bb-text-field>
      </div>
      <div class="mb-3">
        <bb-text-field label="Titular">
          <input formControlName="titular" placeholder="Titular" class="form-control"/>
        </bb-text-field>
      </div>
      <div class="mb-3">
        <bb-text-field label="Usuário">
          <input formControlName="usuario" placeholder="Usuário" class="form-control"/>
        </bb-text-field>
      </div>
    </form>
  </bb-card-body>
  <bb-card-footer class="text-end">
    <button bbButton type="button" kind="secondary" (click)="cancelar.emit()">Cancelar</button>
    <button bbButton type="button" kind="primary" (click)="alterar.emit()">Confirmar</button>
  </bb-card-footer>
</bb-card>

3. Configurando o JSON‑Server

Passo a Passo
	1.	Instale o json‑server globalmente:
Abra seu terminal e execute:

npm install -g json-server


	2.	Crie um arquivo db.json:
Na raiz do projeto, crie um arquivo chamado db.json com o seguinte conteúdo:

{
  "certificadora": {
    "nomeCertificadora": "VERRA",
    "situacao": "Ativo"
  },
  "contas": [
    {
      "certificadora": "VERRA",
      "conta": "1234",
      "titular": "Banco do Brasil",
      "usuario": "Usuario1",
      "numero": "1"
    },
    {
      "certificadora": "ASG",
      "conta": "5678",
      "titular": "Banco do Brasil SA",
      "usuario": "Usuario2",
      "numero": "2"
    },
    {
      "certificadora": "MCC",
      "conta": "9876",
      "titular": "Banco do Brasil INC",
      "usuario": "Usuario3",
      "numero": "3"
    }
  ],
  "subContas": [
    {
      "contaVinculada": "1234",
      "subConta": "123456",
      "titular": "Banco do Brasil",
      "usuario": "Usuario1"
    },
    {
      "contaVinculada": "5678",
      "subConta": "5678999",
      "titular": "Banco do Brasil SA",
      "usuario": "Usuario2"
    },
    {
      "contaVinculada": "9876",
      "subConta": "9876543",
      "titular": "Banco do Brasil INC",
      "usuario": "Usuario3"
    }
  ]
}


	3.	Inicie o JSON‑server:
No terminal, na pasta onde está o db.json, execute:

json-server --watch db.json

Isso iniciará o servidor na URL http://localhost:3000 – as chamadas do service serão direcionadas para lá.

Considerações Finais

Nesta versão final:
	•	Cada operação (adição, edição e exclusão) é feita individualmente, com chamadas imediatas ao service.
	•	Ao editar ou excluir uma conta, as operações para atualizar ou excluir as subcontas vinculadas também são disparadas.
	•	A variável de atualizações acumuladas e as funções de limpeza foram removidas.
	•	A variável projetoExistente foi removida, pois não está mais em uso.
	•	O service voltou à forma original, com operações CRUD individuais.
	•	O JSON‑server é usado para persistir os dados enquanto a operação não está pronta.

Esta estrutura garante que as operações sejam realizadas de forma individual e que as alterações em contas sejam refletidas nas subcontas vinculadas conforme necessário. Se precisar de mais ajustes ou tiver dúvidas, estou à disposição!



}
