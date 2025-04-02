A abordagem ideal para persistir os filtros e os dados da tabela envolve centralizar o estado em um serviço compartilhado – normalmente chamado de “state service” ou, no seu caso, o próprio FiltroTabelaService – que é fornecido em nível de aplicação ou em um módulo compartilhado. Dessa forma, quando o usuário navega para fora da tela de consulta e depois retorna, o componente de consulta pode, no seu ngOnInit, ler do serviço os filtros e os dados que estavam salvos e reaplicá-los, evitando chamadas desnecessárias ao backend. Além disso, você pode utilizar técnicas de caching para manter os dados carregados, de forma que se o usuário voltar à tela de consulta, os dados já estarão disponíveis sem precisar de uma nova requisição.

Como Implementar a Persistência de Filtros e Dados
	1.	Persistência de Filtros e Dados no Serviço:
	•	Utilize um serviço (como o FiltroTabelaService) que mantenha os seguintes BehaviorSubjects:
	•	Um para os filtros selecionados (por exemplo, filtrosSelecionadosSubject).
	•	Um para a lista de dados (por exemplo, especialidadesFiltradasSubject ou similar para o seu caso).
	•	Sempre que os filtros são alterados (por meio de métodos como atualizarFiltros), o serviço atualiza esses BehaviorSubjects.
	•	Ao carregar a tela de consulta (no ngOnInit do componente), você subscreve a esses BehaviorSubjects para obter os filtros e dados previamente carregados.
	2.	Uso de Roteamento e Recuperação do Estado:
	•	Garanta que o serviço seja fornecido em um módulo compartilhado (ou via providedIn: 'root') para que seu estado persista mesmo quando o componente for destruído.
	•	Na navegação, você pode utilizar o Angular Router para navegar entre telas, e o serviço manterá os dados salvos.
	•	O componente de consulta, em seu ngOnInit, deve chamar um método como filtroTabelaService.inicializarFiltros() que, se houver filtros e dados salvos, os reaplica (em vez de disparar uma nova operação ao backend).
	3.	Evitar Operações Desnecessárias ao Backend:
	•	Se os filtros e os dados já estão salvos no serviço e não foram alterados, evite refazer a chamada ao backend. Por exemplo, você pode ter uma lógica no método aplicarFiltros() que verifica se os filtros atuais são os mesmos dos salvos e, se sim, usa os dados cacheados.
	•	Se os filtros forem alterados, você atualiza o cache e, dependendo do caso, pode optar por chamar o backend apenas se os filtros realmente mudaram.

Boas Práticas para Evitar Vazamentos de Memória
	•	Desinscrever de Subscriptions:
Sempre que você utilizar o subscribe (por exemplo, em ngOnInit), desinscreva no ngOnDestroy. Para isso, utilize padrões como a criação de um Subject (por exemplo, _destroy$) e o operador takeUntil, ou simplesmente armazene as subscriptions e chame unsubscribe.
	•	Uso de BehaviorSubjects e Async Pipe:
Ao utilizar BehaviorSubjects e o async pipe nos templates, o Angular cuida automaticamente da assinatura e o cancelamento (unsubscribe) quando o componente é destruído, diminuindo o risco de vazamentos.
	•	Manter o Estado Centralizado:
Ao centralizar o estado em um serviço compartilhado, você evita duplicação de dados e minimiza o número de assinaturas espalhadas pelo código, o que torna a gestão de memória mais fácil.
	•	Limpar Recursos:
Se você usar timers ou setTimeout/interval, sempre guarde as referências e cancele-os quando o componente for destruído.

Exemplo de Abordagem

Suponha que você tenha um serviço como este (trecho extraído e adaptado com base no exemplo do arquivo especialidades.txt filtros.txt](file-service://file-JHmWKdVTyeg1dXpnqtjUEu)):

@Injectable({
  providedIn: 'root'
})
export class FiltroTabelaService {
  private filtrosSelecionadosSubject = new BehaviorSubject<Filtros>({
    tipo: [],
    especialidade: [],
    descricao: [],
    status: []
  });
  private dadosTabelaSubject = new BehaviorSubject<any[]>([]);

  filtrosSelecionados$ = this.filtrosSelecionadosSubject.asObservable();
  dadosTabela$ = this.dadosTabelaSubject.asObservable();

  // Método para salvar filtros e dados
  persistirEstado(filtros: Filtros, dados: any[]): void {
    this.filtrosSelecionadosSubject.next(filtros);
    this.dadosTabelaSubject.next(dados);
  }

  // Método para reaplicar filtros e dados sem chamar o backend
  obterEstado(): { filtros: Filtros, dados: any[] } {
    return {
      filtros: this.filtrosSelecionadosSubject.getValue(),
      dados: this.dadosTabelaSubject.getValue()
    };
  }

  // Método para atualizar filtros e, se necessário, chamar o backend
  aplicarFiltros(): void {
    const { filtros, dados } = this.obterEstado();
    if (dados.length > 0) {
      // Se os dados já estão carregados e os filtros não foram alterados,
      // reutilize-os sem chamar o backend.
      // Caso contrário, dispare a operação para obter dados novos.
    }
  }
}

No componente de consulta, no ngOnInit, você pode verificar se já há estado salvo e reaplicá-lo:

ngOnInit(): void {
  // ...
  const estado = this.filtroTabelaService.obterEstado();
  if (estado.filtros && estado.dados.length > 0) {
    // Reaplica os filtros salvos nos controles do formulário
    this.filtrosSelecionados = estado.filtros;
    // Atualiza a tabela com os dados salvos
    this.dataSource.data = estado.dados;
  } else {
    // Caso não haja estado salvo, faz a chamada inicial ao backend
    this.aplicarFiltros();
  }
}

Conclusão

A melhor prática aqui é centralizar a persistência do estado (filtros e dados) em um serviço que sobreviva à navegação entre telas. Assim, quando o usuário retorna à tela de consulta, o componente lê o estado salvo e reaplica automaticamente os filtros e a lista de dados, evitando novas chamadas desnecessárias ao backend. Ao mesmo tempo, siga as boas práticas para evitar vazamentos de memória, desinscrevendo de observables e utilizando async pipe sempre que possível. Essa abordagem proporciona uma experiência de usuário mais fluida e eficiente, além de facilitar a manutenção do código.

Espero que essa explicação e exemplo ajudem a estruturar sua solução! Se precisar de mais detalhes ou ajustes, estou à disposição.