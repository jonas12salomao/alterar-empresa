A seguir, apresento uma solução que reúne toda a lógica no próprio service. A ideia é que a função receba os parâmetros vindos do componente (inclusive o filtro) e, utilizando os operadores RxJS, execute a requisição inicial e as recursões necessárias para, enquanto o backend retornar um indicador de continuidade igual a “S”, realizar novas chamadas (sempre enviando o valor 0 para o campo numeroContinuacaoPesquisa). No final, os dados de cada chamada são mesclados em um único array, que será atribuído ao dataSource.data pelo componente.

⸻

Implementação do Service

Você pode modificar a função de listar contratos para que ela retorne um Observable do array completo de contratos agregados. Veja o exemplo abaixo:

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { expand, takeWhile, map, reduce } from 'rxjs/operators';
import { 
  IEntradaListarContratos, 
  ISaidaListarContratos, 
  IItemListarContratos 
} from '...'; // importe os modelos conforme o caminho adequado

@Injectable({
  providedIn: 'root'
})
export class OperacoesService {
  private readonly pathOp11924103v1 = 'SEU_ENDPOINT_AQUI';

  constructor(private readonly http: HttpClient) {}

  // Função modificada para agregar os dados de todas as requisições
  listarContratos(entrada: IEntradaListarContratos): Observable<IItemListarContratos[]> {
    // A função assume que o parâmetro entrada já contém os filtros desejados
    // e que, em todas as chamadas, o valor de numeroContinuacaoPesquisa é 0.
    return this.http.post<ISaidaListarContratos>(this.pathOp11924103v1, entrada).pipe(
      // O expand executa chamadas recursivas enquanto o indicadorContinuacao for 'S'
      expand((resp: ISaidaListarContratos) => {
        if (resp.indicadorContinuacao === 'S') {
          // Reutiliza o mesmo objeto entrada, pois o backend espera 0 para numeroContinuacaoPesquisa
          return this.http.post<ISaidaListarContratos>(this.pathOp11924103v1, entrada);
        }
        return EMPTY;
      }),
      // O takeWhile mantém as emissões enquanto o indicador for 'S' (inclusivo da resposta que não atende)
      takeWhile((resp: ISaidaListarContratos) => resp.indicadorContinuacao === 'S', true),
      // Mapeia cada resposta para a lista de contratos
      map((resp: ISaidaListarContratos) => resp.listaContratosResposta),
      // Agrega todas as listas (de cada requisição) em um único array
      reduce(
        (acumulado: IItemListarContratos[], listaAtual: IItemListarContratos[]) => acumulado.concat(listaAtual),
        [] as IItemListarContratos[]
      )
    );
  }
}



⸻

Explicação dos Principais Operadores Utilizados
	1.	expand
	•	Função: Permite emitir chamadas recursivas. Cada resposta do Observable é verificada e, se o indicador de continuação for “S”, a função disparará uma nova requisição.
	•	No nosso caso: Se a resposta retornar indicadorContinuacao === 'S', o método chama novamente o endpoint com o mesmo objeto entrada. Se não for “S”, ele retorna EMPTY, encerrando a recursão.
	2.	takeWhile
	•	Função: Continua emitindo valores enquanto a condição definida for verdadeira. Usando o parâmetro true, a emissão que não atender à condição também é incluída.
	•	No nosso caso: Garante que o fluxo de requisições seja interrompido assim que o indicador de continuação deixar de ser “S”, mas processa a última resposta para agregar seus dados.
	3.	map
	•	Função: Transforma cada resposta, extraindo somente a propriedade listaContratosResposta de cada objeto de resposta.
	•	No nosso caso: Cada resposta (do tipo ISaidaListarContratos) é convertida para a sua lista de contratos.
	4.	reduce
	•	Função: Agrega todos os valores emitidos em um único array.
	•	No nosso caso: Concatena cada uma das listas de contratos recebidas (de cada chamada) em um único array que será utilizado pelo componente.

⸻

Fluxo de Uso no Componente

Agora, o componente (seja ele o de filtro ou o de tabela) irá simplesmente fazer o subscribe neste método, enviando os parâmetros desejados. Por exemplo:

this._operacoesService.listarContratos(filtrosPesquisa).subscribe(
  (contratosAgregados: IItemListarContratos[]) => {
    // Atribuição direta ao dataSource.data
    this.dataSource.data = contratosAgregados;
    console.log('Total de contratos:', contratosAgregados.length);
  },
  error => {
    console.error('Erro ao carregar contratos:', error);
  }
);

Nesse cenário, toda a lógica de verificação do indicador e agregação dos dados é tratada internamente no service. O componente recebe, de forma transparente, um array único com todos os contratos que correspondem aos filtros aplicados.

Esta solução foi construída com base nos exemplos e instruções contidas no arquivo de referência (). Caso precise de mais ajustes ou tenha outras dúvidas, estou à disposição para ajudar!