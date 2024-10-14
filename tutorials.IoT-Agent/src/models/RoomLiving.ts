// Cria um objeto de cabeçalho (Headers) com o tipo de conteúdo definido como JSON.
let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

// Função assíncrona para criar uma sala (Room) com as informações fornecidas.
export const createRoom = async (
    id: string, 
    name: string, 
    description: string, 
    block: string, 
    level: string, 
    campus: string, 
    latitude: number, 
    longitude: number
) => {
    // Constrói o corpo da requisição (raw), convertendo os dados em uma string JSON.
    let raw = JSON.stringify({
        "id": `urn:ngsi-ld:${id}`, // Define o ID da sala no formato NGSI-LD.
        "type": "LivingRoom", // Define o tipo de entidade como 'LivingRoom'.
        "name": {
            "type": "Text", // Define o tipo do campo 'name' como 'Text'.
            "value": `${name}` // Atribui o valor do nome da sala.
        },
        "description": {
            "type": "Text", // Define o tipo do campo 'description' como 'Text'.
            "value": `${description}` // Atribui o valor da descrição da sala.
        },
        "block": {
            "type": "Text", // Define o tipo do campo 'block' como 'Text'.
            "value": `${block}` // Atribui o valor do bloco.
        },
        "level": {
            "type": "Text", // Define o tipo do campo 'level' como 'Text'.
            "value": `${level}` // Atribui o valor do nível.
        },
        "campus": {
            "type": "Text", // Define o tipo do campo 'campus' como 'Text'.
            "value": `${campus}` // Atribui o valor do campus.
        },
        "latitude": {
            "type": "Number", // Define o tipo do campo 'latitude' como 'Number'.
            "value": `${latitude}` // Atribui o valor da latitude.
        },
        "longitude": {
            "type": "Number", // Define o tipo do campo 'longitude' como 'Number'.
            "value": `${longitude}` // Atribui o valor da longitude.
        }
    });

    // Configura as opções da requisição, incluindo o método POST, cabeçalhos e o corpo (raw).
    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw, // Inclui os dados da sala no corpo da requisição.
        redirect: 'follow' as RequestRedirect // Define o comportamento de redirecionamento como 'follow'.
    };

    try {
        // Envia a requisição para a URL fornecida, utilizando as opções configuradas.
        const response = await fetch("http://localhost:1026/v2/entities", requestOptions);
        const result = await response.text(); // Obtém a resposta da requisição como texto.
        return { message: result }; // Retorna a resposta dentro de um objeto.
    }
    catch (error) {
        // Em caso de erro, retorna uma mensagem de erro.
        return { message: error };
    }
};
