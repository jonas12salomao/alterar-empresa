import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-card-alterar-contas',
  templateUrl: './card-alterar-conta.component.html',
  styleUrls: ['./card-alterar-conta.component.css']
})
export class CardAlterarContasComponent {
  @Input() editaContaForm!: FormGroup;
  @Output() alterar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}
