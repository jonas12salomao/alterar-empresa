import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlterarCertificadoraService } from 'src/app/services/alterar-certificadora.service';
import { IAtualizacoesAcumuladas, ICertificadora, IConta, ISubConta } from 'src/app/shared/tipos-e-mocks';

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

  salvarNovaConta() {
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
  cancelarNovaConta() {
    this.adicionandoConta = false;
    this.criaContaForm.reset();
  }

  adicionarConta() {
    // Cria uma nova conta com um número gerado a partir do tamanho atual do array
    this.adicionandoConta = true;
    this.criaContaForm.setValue({
      certificadora: this.certificadora.nomeCertificadora,
      conta: '',
      titular: '',
      usuario: ''
    });
  }

  editarConta(conta: IConta) {
    // Ativa o modo de edição e armazena a conta a ser editada
    this.editandoConta = true;
    this.atualizacoesAcumuladas.contaEditada = conta;
    // Preenche o formulário com os dados existentes da conta
    this.editaContaForm.patchValue({
      certificadora: this.certificadora.nomeCertificadora,
      conta: conta.conta,
      titular: conta.titular,
      usuario: conta.usuario
    });
  }
  

  alterarConta() {
    if (this.editaContaForm.valid && this.atualizacoesAcumuladas.contaEditada) {
      // Armazena o número antigo e o novo número da conta
      const numeroContaAntiga = this.atualizacoesAcumuladas.contaEditada.conta;
      const numeroContaNova = this.editaContaForm.value.conta;
  
      // Cria o objeto atualizado para a conta
      const contaAtualizada: IConta = {
        ...this.atualizacoesAcumuladas.contaEditada,
        ...this.editaContaForm.value
      };
  
      // Atualiza a conta via serviço
      this.alterarCertificadoraService.atualizarConta(contaAtualizada).subscribe(response => {
        if (response.success) {
          // Para cada subconta cujo campo contaVinculada seja igual ao antigo número,
          // atualiza-o para o novo número chamando o serviço para atualizar cada subconta.
          const subContasParaAtualizar = this.subContas.filter(
            sub => sub.contaVinculada === numeroContaAntiga
          );
  
          subContasParaAtualizar.forEach(sub => {
            const subAtualizada: ISubConta = {
              ...sub,
              contaVinculada: numeroContaNova
            };
            this.alterarCertificadoraService.atualizarSubConta(subAtualizada).subscribe();
          });
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
          alert('Conta excluida com sucesso.');
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
          alert('Sub-conta excluida com sucesso.');
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

  limparAtualizacoes(atualizacoes: IAtualizacoesAcumuladas): IAtualizacoesAcumuladas {
    // 1. Remover contas que foram adicionadas e depois excluídas – elas não precisam ser enviadas.
    atualizacoes.contasAdicionadas = atualizacoes.contasAdicionadas.filter(c => 
      !atualizacoes.contasExcluidas.find(ec => ec.numero === c.numero)
    );
  
    // 2. Se uma conta foi adicionada e também editada, mantenha apenas a versão final na lista de adições.
    atualizacoes.contasEditadas = atualizacoes.contasEditadas.filter(c =>
      !atualizacoes.contasAdicionadas.find(ac => ac.numero === c.numero)
    );
  
    // 3. Se uma conta foi editada e depois excluída, remova-a da lista de edições.
    atualizacoes.contasEditadas = atualizacoes.contasEditadas.filter(c =>
      !atualizacoes.contasExcluidas.find(ec => ec.numero === c.numero)
    );
  
    // 4. Para subcontas, se uma subconta foi adicionada e depois excluída, remova-a da lista de adições.
    atualizacoes.subContasAdicionadas = atualizacoes.subContasAdicionadas.filter(s => 
      !atualizacoes.subContasExcluidas.find(es => es.subConta === s.subConta)
    );
  
    // 5. Se uma subconta foi adicionada, não deve aparecer na lista de edições.
    atualizacoes.subContasEditadas = atualizacoes.subContasEditadas.filter(s =>
      !atualizacoes.subContasAdicionadas.find(ns => ns.subConta === s.subConta)
    );
  
    // 6. Se uma subconta foi editada e depois excluída, remova-a da lista de edições.
    atualizacoes.subContasEditadas = atualizacoes.subContasEditadas.filter(s =>
      !atualizacoes.subContasExcluidas.find(es => es.subConta === s.subConta)
    );
  
    // Outras regras podem ser aplicadas conforme a necessidade do seu fluxo.
    return atualizacoes;
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
