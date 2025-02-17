// src/app/shared/models/interfaces/tipos-e-mocks.ts

// Interface que define os dados de uma certificadora.
export interface ICertificadora {
    // Nome da certificadora (ex.: "VERRA")
    nomeCertificadora: string;
    // Situação atual, por exemplo "Ativo" ou "Inativo"
    situacao: string;
  }
  
  // Interface que define os dados de uma conta.
  export interface IConta {
    // Nome da certificadora à qual a conta pertence
    certificadora: string;
    // Código ou identificador da conta (geralmente exibido na tabela)
    conta: string;
    // Nome do titular da conta
    titular: string;
    // Nome de usuário associado à conta
    usuario: string;
    // Número identificador único da conta (usado para diferenciar contas)
    numero: string;
  }
  
  // Interface que define os dados de uma sub-conta.
  export interface ISubConta {
    // Identificador da conta vinculada (normalmente o valor do campo 'conta' da conta principal)
    contaVinculada: string;
    // Código ou identificador da sub-conta
    subConta: string;
    // Nome do titular da sub-conta
    titular: string;
    // Nome de usuário associado à sub-conta
    usuario: string;
  }
  
  // Interface opcional para acumular atualizações (como edição) de conta e sub-conta.
  export interface IAtualizacoesAcumuladas {
    // A conta que está sendo editada (opcional)
    contaEditada?: IConta;
    // A sub-conta que está sendo editada (opcional)
    subContaEditada?: ISubConta;
  }
  