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
}
