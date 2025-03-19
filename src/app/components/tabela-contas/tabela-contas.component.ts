Com base no que você enviou, o arquivo testes1.txt contém exemplos claros de como você já conseguiu criar testes funcionais com Jasmine e também exemplifica problemas enfrentados em outros testes. Vou detalhar como você pode resolver e melhorar esses testes no Jasmine para o seu projeto Angular, considerando especialmente a utilização de mocks e spies com Jasmine.

Como corrigir os testes falhando:

No arquivo de testes para o componente que falha, a configuração inicial está quase correta, mas há detalhes importantes faltando:

⸻

Principais Pontos de Melhoria:

1. Inicialização correta do FormGroup no teste

No seu teste falhando, você chama diretamente métodos do Form sem inicializar adequadamente o formulário (ex: criaContaForm.setValue). Antes disso, você precisa garantir que os formulários sejam inicializados ou mockados corretamente, exatamente como no componente original.

Sugestão de inicialização:

beforeEach(() => {
  fixture = TestBed.createComponent(AlterarCertificadoraComponent);
  component = fixture.componentInstance;

  component.criaContaForm = new FormGroup({
    codigoConta: new FormControl('', [Validators.required]),
    nomeTitularConta: new FormControl('', [Validators.required]),
    nomeConta: new FormControl('', [Validators.required])
  });

  fixture.detectChanges();
});

2. Mocks com spy devem retornar observables

Cada método chamado pelo componente no service mockado (OperacoesCertificadoraService) deve retornar um Observable mockado com of(...).

Exemplo correto:

operacoesCertificadoraServiceSpy.incluirConta.and.returnValue(of({ success: true, data: {} }));

3. Adicionar imports essenciais para testes com formulários reativos:

imports: [ReactiveFormsModule, FormsModule]



⸻

Exemplo corrigido e detalhado para os testes falhando:

Aqui vai uma versão melhorada do seu teste, já considerando as correções acima:

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AlterarCertificadoraComponent } from './alterar-certificadora.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BbDialogService } from 'dls-angular';
import { OperacoesCertificadoraService } from 'src/app/services/operacoes-certificadora.service';
import { Router } from '@angular/router';
import { AuxiliarService } from 'src/app/services/auxiliar.service';
import { of } from 'rxjs';

describe('AlterarCertificadoraComponent', () => {
  let component: AlterarCertificadoraComponent;
  let fixture: ComponentFixture<AlterarCertificadoraComponent>;
  let operacoesCertificadoraServiceSpy: jasmine.SpyObj<OperacoesCertificadoraService>;
  let auxiliarServiceSpy: jasmine.SpyObj<AuxiliarService>;
  let bbDialogServiceSpy: jasmine.SpyObj<BbDialogService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    operacoesCertificadoraServiceSpy = jasmine.createSpyObj('OperacoesCertificadoraService', [
      'incluirConta',
      'alterarConta',
      'excluirConta'
    ]);

    auxiliarServiceSpy = jasmine.createSpyObj('AuxiliarService', [
      'checarAcessos',
      'limparMensagens',
      'mostrarMensagens'
    ]);

    bbDialogServiceSpy = jasmine.createSpyObj('BbDialogService', ['open']);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, FormsModule],
      declarations: [AlterarCertificadoraComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        { provide: OperacoesCertificadoraService, useValue: operacoesCertificadoraServiceSpy },
        { provide: AuxiliarService, useValue: auxiliarServiceSpy },
        { provide: BbDialogService, useValue: bbDialogServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlterarCertificadoraComponent);
    component = fixture.componentInstance;

    component.criaContaForm = new FormGroup({
      codigoConta: new FormControl('', [Validators.required]),
      nomeTitularConta: new FormControl('', [Validators.required]),
      nomeConta: new FormControl('', [Validators.required])
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve limpar os campos do formulário ao chamar resetForms()', () => {
    component.criaContaForm.setValue({
      codigoConta: '1234',
      nomeTitularConta: 'Jonas',
      nomeConta: 'Jonas123'
    });

    component.resetForms();

    expect(component.criaContaForm.value).toEqual({
      codigoConta: null,
      nomeTitularConta: null,
      nomeConta: null
    });
  });

  it('deve chamar incluirConta do service ao salvar uma nova conta', () => {
    component.criaContaForm.setValue({
      codigoConta: '1234',
      nomeTitularConta: 'Jonas',
      nomeConta: 'Jonas123'
    });

    operacoesCertificadoraServiceSpy.incluirConta.and.returnValue(
      of({ success: true, data: {} })
    );

    component.salvarNovaConta();

    expect(operacoesCertificadoraServiceSpy.incluirConta).toHaveBeenCalled();
    expect(auxiliarServiceSpy.mostrarMensagens).toHaveBeenCalledWith(
      'Conta 1234 adicionada com sucesso.',
      'SUCCESS'
    );
  });
});



⸻

Resumo do que você precisa fazer para corrigir e aprimorar seus testes:
	•	Adicionar os imports necessários (ReactiveFormsModule, FormsModule).
	•	Inicializar seus formulários antes de cada teste com valores válidos.
	•	Mockar corretamente os retornos do seu service utilizando of() do RxJS.
	•	Verificar as chamadas dos métodos com spies usando expect(...).toHaveBeenCalled().

⸻

Dicas adicionais:
	•	Separe os testes em pequenos blocos lógicos para melhor manutenção e compreensão.
	•	Utilize fixture.detectChanges() após qualquer alteração significativa nos testes.
	•	Garanta que spies sejam configurados adequadamente antes da execução dos testes.

Essas recomendações vão garantir que seus testes Jasmine funcionem adequadamente, facilitando o desenvolvimento de testes robustos e sustentáveis em seu projeto Angular.