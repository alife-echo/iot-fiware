// Função assíncrona para obter todas as salas de um determinado tipo de entidade.
export const getAllRooms = async (entity_name: string) => {
  // Configura as opções da requisição HTTP, definindo o método GET e permitindo redirecionamentos.
  let requestOptions = {
      method: 'GET',                       // Método da requisição é GET.
      redirect: 'follow' as RequestRedirect // Permite redirecionamentos automáticos.
  };

  try {
      // Realiza uma requisição GET para obter as entidades do tipo especificado.
      const response = await fetch(
          `http://localhost:1026/v2/entities?options=keyValues&type=${entity_name}`, 
          requestOptions
      );

      const result = await response.text(); // Lê a resposta como texto.
      
      // Retorna um objeto de sucesso com a mensagem (resultado) analisada como JSON.
      return { success: true, message: JSON.parse(result) };
  } catch (error) {
      // Em caso de erro, retorna um objeto de falha com a mensagem de erro.
      return { success: false, message: error };
  }
}
