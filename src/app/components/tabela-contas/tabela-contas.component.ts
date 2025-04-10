A seguir, segue uma implementação no service que, partindo de um objeto de entrada (com os filtros recebidos do componente), faz a chamada inicial e, enquanto o backend retornar o indicador “S”, faz novas chamadas incrementando em 50 o valor de numeroContinuacaoPesquisa. Ao final, todas as listas de contratos são concatenadas em um único array, que será retornado para o componente.

⸻

Implementação no Service

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { expand, takeWhile, map, reduce } from 'rxjs/operators';
import { 
  IEntradaListarContratos, 
  ISaidaListarContratos, 
  IItemListarContratos 
} from '@bb-catalogo-mcc/op11924103v1';  // ajuste o caminho conforme sua estrutura

@Injectable({
  providedIn: 'root'
})
export class OperacoesService {
  // Endpoint do backend
  private readonly pathOp11924103v1 = 'SEU_ENDPOINT_AQUI';

  constructor(private readonly http: HttpClient) {}

  /**
   * Função para listar contratos com filtros e incrementar o número de continuação.
   * A lógica é:
   * - Inicia com o valor de numeroContinuacaoPesquisa presente no objeto entrada (ou 0 se não informado).
   * - Em cada resposta, se o indicadorContinuacao for "S", atualiza o número adicionando 50
   *   e dispara nova chamada, mantendo os demais filtros.
   * - Ao final, concatena as listas de contratos de todas as chamadas em um único array.
   */
  listarContratos(entrada: IEntradaListarContratos): Observable<IItemListarContratos[]> {
    // Define o valor inicial para numeroContinuacaoPesquisa se não estiver presente
    const entradaInicial: IEntradaListarContratos = {
      ...entrada,
      numeroContinuacaoPesquisa: entrada.numeroContinuacaoPesquisa ?? 0
    };

    // Função que encapsula a chamada http e retorna junto com o objeto de entrada utilizado
    const executarChamada = (entradaParam: IEntradaListarContratos) =>
      this.http.post<ISaidaListarContratos>(this.pathOp11924103v1, entradaParam)
        .pipe(
          map(resp => ({ entrada: entradaParam, resp }))
        );

    return executarChamada(entradaInicial).pipe(
      // expand: enquanto o indicador for 'S', dispara nova requisição com numeroContinuacaoPesquisa incrementado em 50
      expand(({ entrada, resp }) => {
        if (resp.indicadorContinuacao === 'S') {
          const novaEntrada: IEntradaListarContratos = {
            ...entrada,
            numeroContinuacaoPesquisa: (entrada.numeroContinuacaoPesquisa ?? 0) + 50
          };
          return executarChamada(novaEntrada);
        }
        return EMPTY;
      }),
      // takeWhile: inclui todas as respostas (inclusive a última que não atende à condição, graças ao flag true)
      takeWhile(({ resp }) => resp.indicadorContinuacao === 'S', true),
      // Extrai somente a lista de contratos de cada resposta
      map(({ resp }) => resp.listaContratosResposta),
      // Concatena todas as listas em um único array
      reduce(
        (acumulado: IItemListarContratos[], listaAtual: IItemListarContratos[]) => acumulado.concat(listaAtual),
        [] as IItemListarContratos[]
      )
    );
  }
}



⸻

Como Funciona a Lógica
	1.	Entrada Inicial:
O método recebe um objeto com os filtros, onde o campo numeroContinuacaoPesquisa é definido para 0 caso não esteja especificado, e geralmente o filtro codigoEstado será 1 para listar contratos ativos.
	2.	Função auxiliar executarChamada:
Essa função executa o HTTP POST usando o objeto de entrada e retorna um objeto contendo o mesmo objeto de entrada usado e a resposta do backend. Isso permite que, a cada expansão, se possa atualizar a propriedade numeroContinuacaoPesquisa com base na entrada da chamada anterior.
	3.	Uso do expand:
O operador expand realiza chamadas recursivas. Na verificação, se resp.indicadorContinuacao for “S”, cria-se uma nova entrada copiando os filtros já enviados e incrementando o valor de numeroContinuacaoPesquisa em 50 (por exemplo, 0 → 50, 50 → 100, etc.). Caso contrário, retorna-se EMPTY para interromper a recursão.
	4.	Consolidação das Respostas:
	•	O operador map extrai a propriedade listaContratosResposta de cada resposta.
	•	Em seguida, o reduce acumula todas as listas em um único array, que será emitido quando o fluxo for completado.
	5.	Resultado no Componente:
O componente fará o subscribe nesse método, atribuindo diretamente o array retornado à propriedade dataSource.data, sem precisar se preocupar com lógica de paginação ou chamadas adicionais.

⸻

Esta abordagem centraliza toda a lógica de iteração e agregação de dados no service, respeitando os filtros passados pelo componente (inclusive a lógica de incremento no campo numeroContinuacaoPesquisa). Assim, o componente apenas envia os parâmetros e recebe, em uma única resposta, o array completo de contratos.

Essa solução foi construída com base nos exemplos e arquivos enviados (). Se houver mais detalhes ou ajustes necessários, basta solicitar!