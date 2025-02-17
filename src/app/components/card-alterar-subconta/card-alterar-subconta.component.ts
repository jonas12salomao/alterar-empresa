import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-card-alterar-subcontas',
  templateUrl: './card-alterar-subconta.component.html',
  styleUrls: ['./card-alterar-subconta.component.css']
})
export class CardAlterarSubcontasComponent {
  @Input() editaSubContaForm!: FormGroup;
  @Output() alterar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();
}
