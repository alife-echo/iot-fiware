// Configuração dos cabeçalhos da requisição, incluindo informações do serviço FIWARE e um cookie de sessão.
let myHeaders = new Headers();
myHeaders.append("fiware-service", "openiot"); // Define o serviço FIWARE a ser utilizado.
myHeaders.append("fiware-servicepath", "/");    // Define o caminho do serviço FIWARE.
myHeaders.append("Cookie", "connect.sid=s%3AmdgXLUl4tCxdyU2QqB8QJGALuxjcTSPO.R9t9QCl%2FYz1glJCiPh07gncRPHHCpgLPVLQYLZFXLo4"); // Adiciona um cookie de sessão.

export const getAllSensors = async (entity_name: string) => {
    // Configura as opções da requisição HTTP, definindo o método GET, incluindo os cabeçalhos e permitindo redirecionamentos.
    let requestOptions = {
        method: 'GET',                       // Método da requisição é GET.
        headers: myHeaders,                  // Inclui os cabeçalhos configurados anteriormente.
        redirect: 'follow' as RequestRedirect // Permite redirecionamentos automáticos.
    };

    try {
        // Realiza uma requisição GET para obter as entidades do tipo especificado.
        const response = await fetch(
            `http://localhost:1026/v2/entities?options=keyValues&type=${entity_name}`, 
            requestOptions
        );

        const result = await response.text(); // Lê a resposta como texto.
        console.log(result); // Imprime o resultado no console para depuração.
        
        // Retorna um objeto de sucesso com a mensagem (resultado) analisada como JSON.
        return { success: true, message: JSON.parse(result) };
    } catch (error) {
        // Em caso de erro, retorna um objeto de falha com a mensagem de erro.
        return { success: false, message: error };
    }
}
