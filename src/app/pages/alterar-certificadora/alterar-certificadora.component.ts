import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlterarCertificadoraService } from 'src/app/services/alterar-certificadora.service';
import { ICertificadora, IConta, ISubConta } from 'src/app/shared/tipos-e-mocks';

@Component({
  selector: 'app-alterar-certificadora',
  templateUrl: './alterar-certificadora.component.html',
  styleUrls: ['./alterar-certificadora.component.css']
})
export class AlterarCertificadoraComponent implements OnInit {
  // Formulários reativos para a certificadora, conta e sub-conta
  formCertificadora!: FormGroup;
  editaContaForm!: FormGroup;
  criaContaForm!: FormGroup;
  editaSubContaForm!: FormGroup;
  criaSubContaForm!: FormGroup;

  // Dados fixos da certificadora
  certificadora: ICertificadora = { 
    nomeCertificadora: 'VERRA', 
    situacao: 'Ativo'
  };

  // Arrays que armazenam contas e sub-contas, atualizados via service
  contas: IConta[] = [];
  subContas: ISubConta[] = [];

  // Flags de controle
  editandoConta: boolean = false;
  editandoSubConta: boolean = false;
  adicionandoConta = false;
  adicionandoSubConta = false;

  // Objeto para acumular atualizações durante a edição
  atualizacoesAcumuladas: { contaEditada?: IConta; subContaEditada?: ISubConta } = {};

  // Injeção do serviço de backend simulado
  constructor(private alterarCertificadoraService: AlterarCertificadoraService,  private cdr: ChangeDetectorRef) {
    // Inicializa o formulário da certificadora com o valor atual da situação
    this.formCertificadora = new FormGroup({
      situacao: new FormControl(this.certificadora.situacao, Validators.required)
    });
    // Inicializa o formulário para editar conta
    this.editaContaForm = new FormGroup({
      certificadora: new FormControl('', Validators.required),
      conta: new FormControl('', Validators.required),
      titular: new FormControl('', Validators.required),
      usuario: new FormControl('', Validators.required)
    });
    this.criaContaForm = new FormGroup({
      certificadora: new FormControl('', Validators.required),
      conta: new FormControl('', Validators.required),
      titular: new FormControl('', Validators.required),
      usuario: new FormControl('', Validators.required)
    });
    // Inicializa o formulário para editar sub-conta
    this.editaSubContaForm = new FormGroup({
      contaVinculada: new FormControl('', Validators.required),
      subConta: new FormControl('', Validators.required),
      titular: new FormControl('', Validators.required),
      usuario: new FormControl('', Validators.required)
    });
    this.criaSubContaForm = new FormGroup({
      contaVinculada: new FormControl('', Validators.required),
      subConta: new FormControl('', Validators.required),
      titular: new FormControl('', Validators.required),
      usuario: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    // Ao iniciar, inscreva-se para receber as contas e sub-contas via service
    this.alterarCertificadoraService.getContas().subscribe((data: IConta[]) => {
      this.contas = data;
    });
    this.alterarCertificadoraService.getSubContas().subscribe((data: ISubConta[]) => {
      this.subContas = data;
    });
  }

  // MÉTODOS PARA CONTAS

  salvarNovaConta(): void {
    if (this.criaContaForm.valid) {
      // Cria um objeto do tipo ISubConta com os dados do formulário
      const novaConta: IConta = {
        ...this.criaContaForm.value,
        numero: (this.contas.length + 1).toString()
      };
      // Chama o método do serviço para adicionar a sub-conta
      this.alterarCertificadoraService.adicionarConta(novaConta).subscribe(response => {
        if (response.success) {
          // Quando adicionado com sucesso, desativa o modo de adição
          this.adicionandoConta = false;
          // Opcional: Reseta o formulário para limpar os campos
          this.criaContaForm.reset();
        }
      });
    } else {
      alert('Preencha todos os campos obrigatórios para a conta.');
    }
  }

  // Método para cancelar a adição da nova sub-conta
  cancelarNovaConta(): void {
    this.adicionandoConta = false;
    this.criaContaForm.reset();
  }

  adicionarConta(): void {
    // Cria uma nova conta com um número gerado a partir do tamanho atual do array
    this.adicionandoConta = true;
    this.criaContaForm.setValue({
      certificadora: this.certificadora.nomeCertificadora,
      conta: '',
      titular: '',
      usuario: '',
      numero: (this.contas.length + 1).toString()
    });
  }

  editarConta(conta: IConta): void {
    // Ativa o modo de edição e armazena a conta a ser editada
    this.editandoConta = true;
    this.atualizacoesAcumuladas.contaEditada = conta;
    // Preenche o formulário com os dados existentes da conta
    this.editaContaForm.patchValue({
      conta: conta.conta,
      titular: conta.titular,
      usuario: conta.usuario
    });
  }

  alterarConta(): void {
    // Se o formulário de conta for válido e há uma conta em edição...
    if (this.editaContaForm.valid && this.atualizacoesAcumuladas.contaEditada) {
      // Cria um objeto com os valores atualizados, mesclando os dados antigos e os novos do formulário
      const contaAtualizada: IConta = {
        ...this.atualizacoesAcumuladas.contaEditada,
        ...this.editaContaForm.value
      };
      this.alterarCertificadoraService.atualizarConta(contaAtualizada).subscribe(response => {
        if (response.success) {
          this.editandoConta = false;
        }
      });
    } else {
      alert('Preencha todos os campos obrigatórios para a conta.');
    }
  }

  confirmarExclusaoConta(conta: IConta): void {
    // Exibe uma confirmação simples usando confirm(); pode ser substituído por um diálogo customizado
    if (confirm('Deseja excluir esta conta? Ao excluir, todas as sub-contas vinculadas serão removidas.')) {
      this.alterarCertificadoraService.excluirConta(conta).subscribe(response => {
        if (response.success) {
          // A atualização é propagada via BehaviorSubject
        }
      });
    }
  }

  // MÉTODOS PARA SUB-CONTAS
  // Método para salvar a nova sub-conta (após preenchimento)
  salvarNovaSubConta(): void {
    if (this.criaSubContaForm.valid) {
      // Cria um objeto do tipo ISubConta com os dados do formulário
      const novaSub: ISubConta = this.criaSubContaForm.value;
      // Chama o método do serviço para adicionar a sub-conta
      this.alterarCertificadoraService.adicionarSubConta(novaSub).subscribe(response => {
        if (response.success) {
          // Quando adicionado com sucesso, desativa o modo de adição
          this.adicionandoSubConta = false;
          // Opcional: Reseta o formulário para limpar os campos
          this.criaSubContaForm.reset();
        }
      });
    } else {
      alert('Preencha todos os campos obrigatórios para a sub-conta.');
    }
  }

  // Método para cancelar a adição da nova sub-conta
  cancelarNovaSubConta(): void {
    this.adicionandoSubConta = false;
    this.criaSubContaForm.reset();
  }

  // Atualize o método "adicionarSubConta" que era chamado pelo botão "Append"
  // Agora, em vez de adicionar diretamente, chamamos iniciarAdicaoSubConta
  adicionarSubConta(conta?: IConta): void {
    this.adicionandoSubConta = true;
    // Se for chamada a partir de uma conta, pré-preenche o campo 'contaVinculada'
    this.criaSubContaForm.patchValue({
      contaVinculada: conta ? conta.conta : ''
    });
    console.log('Valor após patch:', this.criaSubContaForm.get('contaVinculada')?.value);
    this.cdr.detectChanges();
    console.log('2..Valor após patch:', this.criaSubContaForm.get('contaVinculada')?.value);
  }

  editarSubConta(sub: ISubConta): void {
    // Ativa o modo de edição para a sub-conta
    this.editandoSubConta = true;
    this.atualizacoesAcumuladas.subContaEditada = sub;
    // Preenche o formulário com os dados da sub-conta existente
    this.editaSubContaForm.patchValue({
      contaVinculada: sub.contaVinculada,
      subConta: sub.subConta,
      titular: sub.titular,
      usuario: sub.usuario
    });
  }

  confirmarEdicaoSubConta(): void {
    // Se o formulário de sub-conta for válido e há uma sub-conta em edição...
    if (this.editaSubContaForm.valid && this.atualizacoesAcumuladas.subContaEditada) {
      const subAtualizada: ISubConta = {
        ...this.atualizacoesAcumuladas.subContaEditada,
        ...this.editaSubContaForm.value
      };
      this.alterarCertificadoraService.atualizarSubConta(subAtualizada).subscribe(response => {
        if (response.success) {
          this.editandoSubConta = false;
          this.atualizacoesAcumuladas.subContaEditada = undefined;
        }
      });
    } else {
      console.log(this.criaSubContaForm.get('contaVinculada')?.errors);
      console.log(this.criaSubContaForm.get('subConta')?.errors);
      console.log(this.criaSubContaForm.get('titular')?.errors);
      console.log(this.criaSubContaForm.get('usuario')?.errors);
    }
  }

  confirmarExclusaoSubConta(sub: ISubConta): void {
    if (confirm('Deseja excluir esta sub-conta?')) {
      this.alterarCertificadoraService.excluirSubConta(sub).subscribe(response => {
        if (response.success) {
          // A atualização é propagada automaticamente
        }
      });
    }
  }

  cancelarEdicaoSubConta(): void {
    // Desativa o modo de edição de sub-conta e limpa os dados acumulados
    this.editandoSubConta = false;
    this.atualizacoesAcumuladas.subContaEditada = undefined;
  }

  cancelarEdicaoConta(): void {
    // Desativa o modo de edição de conta e limpa os dados acumulados
    this.editandoConta = false;
    this.atualizacoesAcumuladas.contaEditada = undefined;
  }

  cancelar(): void {
    alert('Operação cancelada.');
    // Aqui você pode, por exemplo, redirecionar para outra página usando o Router
  }

  confirmarAtualizacao(): void {
    if (this.formCertificadora.valid) {
      // Prepara os dados para envio ou persistência
      const dados = {
        situacao: this.formCertificadora.value.situacao,
        contas: this.contas,
        subContas: this.subContas
      };
      console.log('Dados para atualizar:', dados);
      alert('Atualização efetuada com sucesso.');
    } else {
      alert('Por favor, corrija os erros no formulário.');
    }
  }
}
