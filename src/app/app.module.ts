import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AlterarCertificadoraComponent } from './pages/alterar-certificadora/alterar-certificadora.component';
import { TabelaContasComponent } from './components/tabela-contas/tabela-contas.component';
import { TabelaSubcontasComponent } from './components/tabela-subcontas/tabela-subcontas.component';
import { CardAlterarContasComponent } from './components/card-alterar-conta/card-alterar-conta.component';
import { CardAlterarSubcontasComponent } from './components/card-alterar-subconta/card-alterar-subconta.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    AlterarCertificadoraComponent,
    TabelaContasComponent,
    TabelaSubcontasComponent,
    CardAlterarContasComponent,
    CardAlterarSubcontasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
