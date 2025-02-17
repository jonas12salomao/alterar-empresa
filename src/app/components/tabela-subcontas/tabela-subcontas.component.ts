import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ISubConta } from 'src/app/shared/tipos-e-mocks';

@Component({
  selector: 'app-tabela-subcontas',
  templateUrl: './tabela-subcontas.component.html',
  styleUrls: ['./tabela-subcontas.component.css']
})
export class TabelaSubcontasComponent {
  @Input() subContas: ISubConta[] = [];
  @Input() criaSubContaForm!: FormGroup;
  @Input() adicionandoSubConta = false;
  @Output() editarSubConta = new EventEmitter<ISubConta>();
  @Output() excluirSubConta = new EventEmitter<ISubConta>();
  @Output() salvarNovaSubConta = new EventEmitter<void>();
  @Output() cancelarNovaSubConta = new EventEmitter<void>();
}
