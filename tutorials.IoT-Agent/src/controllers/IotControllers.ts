import express, { Request, Response, response } from "express";

// Importação de serviços e modelos específicos para lidar com dispositivos IoT, sensores e dados
import { serviceIot } from "../services/CreateServiceIot";
import { sendDataAgent } from "../services/SendDataDevice";
import { getAllSensors } from "../services/ShowSensors";
import { createRoom } from "../models/RoomLiving";
import { createSensor } from "../models/Sensor";
import { getAllRooms } from "../services/ShowRooms";
import { createDocumentRoom, createDocumentSensor, getRooms, findLastDocByIdRoom, findAllDocsForCsv } from "../db/Cloudant";
import { format } from "../helpers/formatDataSensors";
import { calcIQAR } from "../helpers/calcIQAR";
import { calculateHeatIndex, targetConcept } from "../helpers/calcHeatIndex";

// Função simples de ping para verificar se o servidor está ativo
export const ping = async(req: Request, res: Response) => {
    res.status(200).json({ pong: "ok" });
}

// Função para criar uma sala (room) com dados enviados pelo cliente
export const CREATE_ROOMS = async (req: Request, res: Response) => {
  // Extraindo dados do corpo da requisição
  let { id, name, description, block, level, campus, latitude, longitude } = req.body;

  // Verificação básica para garantir que todos os dados necessários foram fornecidos
  if (id && name && description && block && level && campus) {
    
    // Criação de uma nova sala no banco de dados local
    const create = await createRoom(id, name, description, block, level, campus, latitude, longitude)
      .then((response) => {
        return response;  // Retorno da resposta bem-sucedida
      })
      .catch((error) => {
        return error;  // Tratamento de erros
      });

    // Criação do documento da sala no banco de dados IBM Cloudant
    const createRoomIBM = await createDocumentRoom(
      "rooms",
      id,
      name,
      description,
      block,
      level,
      campus,
      latitude,
      longitude
    )
      .then((response) => {
        return response;  // Retorno da resposta bem-sucedida
      })
      .catch((error) => {
        return error;  // Tratamento de erros
      });

    // Resposta ao cliente indicando o sucesso das operações
    res.status(200).json({ ok: create, ibm: createRoomIBM });
  } else {
    // Resposta de erro se os dados necessários não foram informados
    res.json({ error: "Informe os dados corretamente" });
  }
};


// Função para exibir as salas com base no nome da entidade fornecido
export const SHOW_ROOMS = async (req: Request, res: Response) => {
  let { entity_name } = req.params;  // Extrai o nome da entidade dos parâmetros da URL
  console.log(entity_name);  // Loga o nome da entidade para depuração

  // Obtém todas as salas associadas à entidade fornecida
  const ShowRooms = await getAllRooms(entity_name)
    .then((response) => {
      return response;  // Retorna o resultado em caso de sucesso
    })
    .catch((error) => {
      return error;  // Retorna o erro, caso ocorra
    });

  // Retorna a resposta com a lista de salas
  res.status(200).json({ rooms: ShowRooms });
};

// Função para exibir todas as salas, sem filtros
export const SHOW_ALL_ROOMS = async (req: Request, res: Response) => {
  const ShowRooms = await getRooms()
    .then((response) => {
      return response;  // Retorna a lista de todas as salas em caso de sucesso
    })
    .catch((error) => {
      return error;  // Retorna o erro, caso ocorra
    });

  // Envia a resposta com todas as salas encontradas
  res.status(200).json({ rooms: ShowRooms });
};

// Função para exibir o último documento de uma sala, identificado pelo ID
export const SHOW_LAST_DOC_BY_ID_ROOM = async (req: Request, res: Response) => {
  let { idRoom } = req.params;  // Extrai o ID da sala dos parâmetros da URL

  if (idRoom) {
    // Obtém o último documento da sala especificada pelo ID
    const allDocs = await findLastDocByIdRoom(idRoom)
      .then((response) => {
        return response;  // Retorna o documento em caso de sucesso
      })
      .catch((error) => {
        return error;  // Retorna o erro, caso ocorra
      });

    console.log(allDocs);  // Loga o documento obtido para depuração

    // Envia o documento como resposta
    res.status(200).json({ docs: allDocs });
  }
};


// Função para criar um serviço IoT baseado no tipo de entidade fornecido
export const CREATE_SERVICE_IOT = async (req: Request, res: Response) => {
  let { entity_type } = req.body;  // Extrai o tipo de entidade do corpo da requisição

  // Chama o serviço IoT passando o tipo de entidade e trata a resposta
  const service = await serviceIot(entity_type)
    .then((response) => {
      return response;  // Retorna a resposta do serviço em caso de sucesso
    })
    .catch((error) => {
      return error;  // Retorna o erro, caso ocorra
    });

  // Envia a resposta com o status do serviço criado
  res.json({ ok: service }).status(200);
};

// Função para criar sensores com base nos dados fornecidos pelo cliente
export const CREATE_SENSORS = async (req: Request, res: Response) => {
  // Extrai os dados necessários para a criação do sensor do corpo da requisição
  let {
    device_id,
    entity_name,
    entity_type,
    object_id,
    nameAtribute,
    typeAtribute, 
    foreignkeyNameRef,
    foreignkeyValueRef,
  } = req.body;

  // Chama a função de criação de sensor passando os dados extraídos
  const sensor = await createSensor(
    device_id,
    entity_name,
    entity_type,
    object_id,
    nameAtribute,
    typeAtribute,
    foreignkeyNameRef,
    foreignkeyValueRef
  )
    .then((response) => {
      return response;  // Retorna a resposta do serviço em caso de sucesso
    })
    .catch((error) => {
      return error;  // Retorna o erro, caso ocorra
    });

  // Envia a resposta com o status do sensor criado
  res.status(200).json({ ok: sensor });
};

// Função para enviar dados de sensores de uma sala para o agente
export const SUBMIT_DATA_AGENT = async (req: Request, res: Response) => {
  let { room, data } = req.body;  // Extrai a sala e os dados do corpo da requisição
  let sensorDataObject: { [key: string]: number } = {};  // Objeto para armazenar dados dos sensores
  let arr: any = [];  // Array para armazenar sensores individuais

  if (room && data) {
    // Formata os dados e verifica se há erro
    const formattedData = format(data, room);
    if (formattedData instanceof Error) {
      return res.status(400).json({ error: formattedData.message });
    }

    // Processa cada item de dados formatados e envia ao agente
    await Promise.all(
      formattedData.map(async (current: any) => {
        const sensorName = current[1].split('|')[0];
        const sensorValue = parseFloat(current[1].split('|')[1]);
        sensorDataObject[sensorName] = sensorValue;  // Armazena o valor no objeto sensorDataObject

        await sendDataAgent(current[0], current[1]);  // Envia os dados para o agente
        console.log(sensorName + ',' + sensorValue);
        arr.push({ sensorName, sensorValue });  // Adiciona o nome e valor do sensor ao array
      })
    );

    console.log(arr);

    // Filtra e ordena os dados de temperatura e umidade para o cálculo do índice de calor
    const temp_rh: any = arr.filter((substance: any) => 
      substance.sensorName === "Temperatura_Level" || substance.sensorName === "Humidade_Level"
    );
    temp_rh.sort((a: any, b: any) => {
      if (a.sensorName === "Temperatura_Level") return -1;
      if (b.sensorName === "Temperatura_Level") return 1;
      return 0;
    });

    const temperatura = temp_rh[0].sensorValue;
    const umidade = temp_rh[1].sensorValue;
    console.log(calculateHeatIndex(temperatura, umidade));  // Calcula e exibe o índice de calor
    console.log(targetConcept(temperatura, umidade));  // Exibe o conceito alvo com base na temperatura e umidade
    console.log('Qualidade do Ar:', calcIQAR(arr)[0]);  // Exibe a qualidade do ar
    console.log('Dados IQAR:', calcIQAR(arr)[1]);  // Exibe os dados detalhados de qualidade do ar
    console.log(arr.length);

    // Cria um documento com os dados dos sensores e métricas calculadas
    const ibm = await createDocumentSensor(
      room,
      'galpaotocorredordois',
      sensorDataObject as any,
      calcIQAR(arr)[0],
      calcIQAR(arr)[1] as any,
      calculateHeatIndex(temperatura, umidade) as any,
      targetConcept(temperatura, umidade) as any
    );

    // Limpa o array se atingir um número de sensores
    if (arr.length >= 13) { arr = []; }
    console.log(sensorDataObject);

    // Envia a resposta indicando que os dados foram recebidos e processados
    res.status(200).json({ ok: '---Dados Recebidos ---', data, ibm });
  } else {
    // Responde com erro caso os dados estejam incompletos
    res.status(400).json({ error: 'Informe os dados corretamente' });
  }
};

// Função para exibir sensores associados a uma entidade específica
export const SHOW_SENSORS = async (req: Request, res: Response) => {
  let { entity_name } = req.params;  // Extrai o nome da entidade dos parâmetros da URL
  console.log(entity_name);  // Loga o nome da entidade para depuração

  // Busca todos os sensores associados à entidade e trata a resposta
  const showSensors = await getAllSensors(entity_name)
    .then((response) => {
      return response;  // Retorna a lista de sensores em caso de sucesso
    })
    .catch((error) => {
      return error;  // Retorna o erro, caso ocorra
    });

  // Envia a resposta com a lista de dispositivos (sensores)
  res.status(200).json({ devices: showSensors });
};
