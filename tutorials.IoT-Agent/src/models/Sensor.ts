// Cria um objeto de cabeçalhos (Headers) para configurar as informações da requisição HTTP.
let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json"); // Define que o conteúdo enviado será em formato JSON.
myHeaders.append("fiware-service", "openiot"); // Define o serviço FIWARE utilizado (neste caso, 'openiot').
myHeaders.append("fiware-servicepath", "/"); // Define o caminho do serviço FIWARE.
myHeaders.append(
  "Cookie", 
  // Adiciona um cookie de sessão para autenticação na requisição.
  "connect.sid=s%3AmdgXLUl4tCxdyU2QqB8QJGALuxjcTSPO.R9t9QCl%2FYz1glJCiPh07gncRPHHCpgLPVLQYLZFXLo4"
);

// Função assíncrona para criar um sensor e registrar no serviço FIWARE.
export const createSensor = async (
  device_id: string,         // ID do dispositivo do sensor.
  entity_name: string,       // Nome da entidade associada ao sensor.
  entity_type: string,       // Tipo da entidade (ex: 'Sensor', 'Device').
  object_id: string,         // ID do objeto monitorado pelo sensor.
  nameAtribute: string,      // Nome do atributo do sensor.
  typeAtribute: string,      // Tipo do atributo (ex: 'Text', 'Number').
  foreignkeyNameRef: string, // Nome da chave estrangeira (referência a outra entidade).
  foreignkeyValueRef: string // Valor da chave estrangeira (referência ao ID de outra entidade).
) => {
  // Cria um objeto JSON que representa os dados do sensor a serem enviados.
  let sensors = JSON.stringify({
    "devices": [
      {
        "device_id": `${device_id}`,                // ID do dispositivo.
        "entity_name": `urn:ngsi-ld:${entity_name}`, // Nome completo da entidade no formato NGSI-LD.
        "entity_type": `${entity_type}`,             // Tipo da entidade.
        "transport": "HTTP",                        // Método de transporte dos dados (neste caso, HTTP).
        "attributes": [
          {
            "object_id": `${object_id}`,            // ID do objeto monitorado.
            "name": `${nameAtribute}`,              // Nome do atributo do sensor.
            "type": `${typeAtribute}`               // Tipo do atributo (Text, Number, etc.).
          }
        ],
        // Atributos estáticos que referenciam outras entidades.
        "static_attributes": [
          {
            "name": `${foreignkeyNameRef}`,         // Nome da referência a outra entidade.
            "type": "Relationship",                 // Tipo definido como 'Relationship' (relacionamento entre entidades).
            "value": `urn:ngsi-ld:${foreignkeyValueRef}` // Valor da chave estrangeira, no formato NGSI-LD.
          }
        ]
      }
    ]
  });

  // Configura as opções da requisição HTTP, incluindo o método POST, cabeçalhos e o corpo da requisição.
  let requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: sensors, // Corpo da requisição com os dados do sensor.
    redirect: "follow" as RequestRedirect, // Comportamento de redirecionamento.
  };

  try {
    // Envia a requisição para a API de dispositivos do FIWARE, criando o sensor.
    const response = await fetch(
      "http://localhost:4041/iot/devices", // URL do endpoint de dispositivos.
      requestOptions
    );
    const result = await response.text(); // Obtém a resposta como texto.
    return { message: result };           // Retorna a resposta como uma mensagem.
  } catch (error) {
    // Em caso de erro, retorna a mensagem de erro.
    return { message: error };
  }
};
