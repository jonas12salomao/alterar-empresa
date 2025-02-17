import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlterarCertificadoraComponent } from './pages/alterar-certificadora/alterar-certificadora.component';

const routes: Routes = [
  // Rota padrão: quando não houver caminho especificado, carrega o AlterarCertificadoraComponent
  { path: '', component: AlterarCertificadoraComponent },
  // Rota coringa para redirecionar caminhos inválidos para a rota padrão
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
