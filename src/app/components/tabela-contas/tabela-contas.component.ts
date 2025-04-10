A ideia agora é centralizar toda a lógica de iteração e agregação dos dados no serviço, de forma que o método responsável retorne, em um único Observable, um array completo de contratos ativos. Dessa forma, o componente que consome o serviço pode simplesmente atribuir o array resultante à propriedade dataSource.data sem precisar se preocupar com paginação ou lógica de pageChange. Segue um exemplo que adapta a lógica demonstrada no exemplo de histórico de prefixos para o seu caso:

⸻

Exemplo de Implementação no Serviço

import { EMPTY, expand, mergeMap, reduce, takeWhile, Observable } from 'rxjs';
import { IEntradaListarContratos, ISaidaListarContratos, IItemListarContratos } from '...'; // importe seus modelos corretamente

@Injectable({
  providedIn: 'root'
})
export class OperacoesService {
  
  constructor(private readonly http: HttpClient) {}

  // Método existente que faz a requisição ao backend
  listarContratos(entrada: IEntradaListarContratos): Observable<ISaidaListarContratos> {
    return this.http.post<ISaidaListarContratos>('pathOp11924103v1', entrada);
  }

  // Novo método que agrega os dados de contratos ativos em uma única resposta
  listarTodosContratosAtivos(): Observable<IItemListarContratos[]> {
    const entradaInicial: IEntradaListarContratos = {
      codigoEstado: 1,
      numeroContinuacaoPesquisa: 0  // valor fixo conforme a regra: sempre enviar 0 para continuar
      // outros parâmetros podem ser adicionados conforme necessário
    };

    return this.listarContratos(entradaInicial).pipe(
      // O expand permite emitir chamadas recursivas enquanto o indicador de continuidade for 'S'
      expand((resposta: ISaidaListarContratos) => {
        if (resposta.indicadorContinuacao === 'S') {
          // Reutiliza a mesma entrada, pois o backend sempre espera 0 em numeroContinuacaoPesquisa para continuar
          return this.listarContratos(entradaInicial);
        }
        return EMPTY;
      }),
      // O takeWhile segue emitindo enquanto o indicador for 'S'; com o parâmetro true a última emissão também será incluída
      takeWhile((resposta: ISaidaListarContratos) => resposta.indicadorContinuacao === 'S', true),
      // O mergeMap extrai cada item da lista de contratos de cada resposta
      mergeMap((resposta: ISaidaListarContratos) => resposta.listaContratosResposta),
      // O reduce acumula todos os contratos emitidos em um único array
      reduce((todosContratos: IItemListarContratos[], contrato: IItemListarContratos) => {
        todosContratos.push(contrato);
        return todosContratos;
      }, [])
    );
  }
}



⸻

Explicação dos Operadores RxJS Utilizados
	•	expand
Permite que cada resposta do backend seja avaliada para decidir se é necessário disparar uma nova requisição. No exemplo, assim que a resposta contém o indicadorContinuacao como 'S', o operador dispara outra chamada utilizando a mesma entrada. Quando o backend retorna um valor diferente (por exemplo, 'N'), o fluxo retorna um Observable vazio (EMPTY), encerrando a recursão.
	•	takeWhile
Este operador mantém a emissão dos valores enquanto a condição definida for verdadeira. Utilizando o parâmetro true (inclusivo), ele garante que a resposta que não atende à condição (última resposta com indicador diferente de ‘S’) também seja processada.
	•	mergeMap
Converte cada resposta do Observable em múltiplas emissões, neste caso, mapeando cada objeto do array listaContratosResposta para uma emissão individual. Isso permite tratar cada contrato individualmente, facilitando a agregação.
	•	reduce
Ao final da cadeia, o operador reduce acumula todas as emissões (cada contrato) em um único array. Assim, o Observable final emite um array completo com todos os contratos retornados em cada chamada.

⸻

Como Utilizar no Componente

No componente, você pode consumir esse método do serviço da seguinte forma:

this._operacoesService.listarTodosContratosAtivos().subscribe(
  (contratosAgregados: IItemListarContratos[]) => {
    // Atribua o array completo ao dataSource da tabela
    this.dataSource.data = contratosAgregados;
    console.log('Contratos agregados:', contratosAgregados.length);
  },
  error => {
    console.error('Erro ao carregar contratos:', error);
  }
);

Essa abordagem isola a complexidade de gerenciar várias requisições no serviço, permitindo que o componente se concentre apenas em exibir os dados. Você poderá atribuir o array retornado diretamente ao dataSource.data e, como o componente paginator da DLS já gerencia a exibição dos 10 registros por página automaticamente, não há necessidade de lógica adicional de paginação.

Essa solução foi construída com base nos exemplos presentes no arquivo de referência (). Caso precise de ajustes ou tenha dúvidas adicionais, fique à vontade para perguntar!