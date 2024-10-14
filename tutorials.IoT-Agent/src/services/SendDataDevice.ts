// Cria um objeto de cabeçalhos (Headers) para configurar a requisição HTTP.
let myHeaders = new Headers();
myHeaders.append("Content-Type", "text/plain");  // Define o tipo de conteúdo como texto simples.
myHeaders.append("Cookie", "connect.sid=s%3AmdgXLUl4tCxdyU2QqB8QJGALuxjcTSPO.R9t9QCl%2FYz1glJCiPh07gncRPHHCpgLPVLQYLZFXLo4");  // Adiciona um cookie de sessão.

// Função assíncrona para enviar dados para um agente IoT.
export const sendDataAgent = async (targetDevice: string, object: string) => {
  // `object` é o corpo da requisição que será enviado diretamente.
  let raw = object;

  // Configura as opções da requisição HTTP, definindo o método POST, os cabeçalhos e o corpo.
  let requestOptions: any = {
    method: 'POST',
    headers: myHeaders,
    body: raw,                        // O objeto que contém os dados a serem enviados.
    redirect: 'follow' as RequestRedirect // Permite redirecionamentos.
  };

  try {
    // Envia uma requisição POST para o agente IoT, incluindo a chave de API e o ID do dispositivo na URL.
    const response = await fetch(
      `http://localhost:7896/iot/d?k=4jggokgpepnvsb2uv4s40d59ov&i=${targetDevice}`, 
      requestOptions
    );
    const result = await response.text(); // Lê a resposta como texto.
    console.log(result);                  // Exibe a resposta no console.
    return { success: true };             // Retorna sucesso se a operação for bem-sucedida.
  } catch (error) {
    console.log(error);                   // Exibe o erro no console, caso ocorra.
    return { success: false };            // Retorna falha em caso de erro.
  }
};
