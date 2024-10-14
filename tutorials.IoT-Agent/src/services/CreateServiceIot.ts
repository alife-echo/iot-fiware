// Cria um objeto de cabeçalhos (Headers) para configurar as informações da requisição HTTP.
let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");  // Define o conteúdo como JSON.
myHeaders.append("fiware-service", "openiot");         // Define o serviço FIWARE (openiot).
myHeaders.append("fiware-servicepath", "/");           // Define o caminho do serviço FIWARE.

// Função assíncrona que configura um serviço IoT no FIWARE.
export const serviceIot = async (entity_type: string) => {
  // Cria um objeto JSON que contém as informações do serviço IoT a ser criado.
  let raw = JSON.stringify({
    "services": [
      {
        "apikey": "4jggokgpepnvsb2uv4s40d59ov",  // Chave de API para autenticação.
        "cbroker": "http://orion:1026",          // URL do Orion Context Broker.
        "entity_type": `${entity_type}`,         // Tipo da entidade (dispositivo ou sensor).
        "resource": "/iot/d"                     // Recurso que será utilizado pelo serviço.
      }
    ]
  });

  // Configura as opções da requisição HTTP, incluindo o método POST, cabeçalhos e o corpo da requisição.
  let requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,                        // Corpo da requisição com os dados do serviço IoT.
    redirect: 'follow' as RequestRedirect // Redirecionamento automático.
  };

  try {
    // Envia a requisição para o endpoint de serviços IoT do FIWARE.
    const response = await fetch("http://localhost:4041/iot/services", requestOptions);
    const result = await response.text(); // Lê a resposta como texto.
    return { message: result };           // Retorna a resposta como uma mensagem.
  } catch (error) {
    // Em caso de erro, retorna a mensagem de erro.
    return { message: error };
  }
};
