// Importa a biblioteca Cloudant para interagir com o serviço de banco de dados IBM Cloudant
import { CloudantV1 } from "@ibm-cloud/cloudant";
// Importa a biblioteca de autenticação IAM para o Cloudant
import { IamAuthenticator } from "@ibm-cloud/cloudant";
// Importa funções auxiliares para obter a data e hora atual
import { getDateNow } from "../helpers/getDateNow";
import { getHoursAndMinutesNow } from "../helpers/getHoursAndMinutesNow";
// Importa biblioteca para manipulação de arquivos
import fs from "fs";
// Importa bibliotecas para converter dados JSON para CSV
import converter from "json-2-csv";
import json2csv from "json2csv";
// Importa biblioteca para gerenciar variáveis de ambiente
import dotenv from "dotenv";
// Importa função auxiliar para encontrar a data e hora mais próxima
import { closestDateTime } from "../helpers/closestDateTime";
// Importa a biblioteca para gerar IDs únicos (UUID)
import { v4 as uuidv4 } from "uuid";
// Importa função para transformar objetos conforme necessidade
import { transformObject } from "../helpers/transformObject";

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

// Define a interface OrderDocument para documentos de pedidos no Cloudant
export interface OrderDocument extends CloudantV1.Document {
  name?: string;
  joined?: string;
  _id: string; // ID único do documento
  _rev?: string; // Revisão do documento para controle de versões
  mark?: string; // Marcador adicional
  object?: { // Dados sobre níveis de vários poluentes e condições do ambiente
    CO_MQ7_Level?: number;
    LGP_MQ9_Level?: number;
    CH4_MQ9_Level?: number;
    CO_MQ9_Level?: number;
    CO_MQ135_Level?: number;
    Alcool_MQ135_Level?: number;
    CO2_MQ135_Level?: number;
    Toluen_MQ135_Level?: number;
    MH4_MQ135_Level?: number;
    Aceton_MQ135_Level?: number;
    Temperatura_Level?: number;
    Humidade_Level?: number;
  };
  objectIQAR?: { // Indicadores de qualidade do ar
    CO_MQ9_IQAR: number;
    CO_MQ135_IQAR: number;
    O3_MQ131_IQAR: number;
  };
  calcHeatIndex?: any; // Valor calculado para o índice de calor
  targetConcept?: any;
  latitude?: number; // Coordenadas de localização
  longitude?: number;
  qualityAirConcept?: string;
  roomRef?: string; // Referência do ambiente (sala)
  description?: string;
  block?: string;
  level?: string;
  campus?: string;
}

// Define a interface RoomType para documentos de tipo de ambiente no Cloudant
export interface RoomType {
  _id: string;
  _rev: string;
  roomRef: string;
  joined: string;
  LPG_MQ9_Level: number; // Níveis de vários poluentes e condições do ambiente
  CH4_MQ9_Level: number;
  CO_MQ9_Level: number;
  CO_MQ135_Level: number;
  Alcool_MQ135_Level: number;
  CO2_MQ135_Level: number;
  Toluen_MQ135_Level: number;
  MH4_MQ135_Level: number;
  Aceton_MQ135_Level: number;
  O3_MQ131_Level: number;
  Temperatura_Level: number;
  Humidade_Level: number;
  QualityAirConcept: string; // Conceito de qualidade do ar
  CO_MQ9_Level_IQAR: number;
  CO_MQ135_Level_IQAR: number;
  O3_MQ131_Level_IQAR: number;
  CalcHeatIndex: number; // Índice de calor calculado
  TargetConcept: string;
}

// Define uma interface para o armazenamento de documentos de RoomType
export interface StorageTargetRoom {
  docs: RoomType[];
}

// Configura a autenticação IAM usando a API Key definida no arquivo .env
const authenticator = new IamAuthenticator({
  apikey: process.env.API_KEY as string,
});

// Cria uma instância do serviço Cloudant
const service = new CloudantV1({ authenticator });

// Define um array de campos para uso no processo de conversão (JSON para CSV)
const fields: any = [
  "_id",
  "_rev",
  "roomRef",
  "joined",
  "LPG_MQ9_Level",
  "CH4_MQ9_Level",
  "CO_MQ9_Level",
  "CO_MQ135_Level",
  "Alcool_MQ135_Level",
  "CO2_MQ135_Level",
  "Toluen_MQ135_Level",
  "MH4_MQ135_Level",
  "Aceton_MQ135_Level",
  "O3_MQ131_Level",
  "Temperatura_Level",
  "Humidade_Level",
  "QualityAirConcept",
  "CO_MQ9_Level_IQAR",
  "CO_MQ135_Level_IQAR",
  "O3_MQ131_Level_IQAR",
  "CalcHeatIndex",
  "TargetConcept",
];


// Função assíncrona para criar uma base de dados no Cloudant
export async function createDatabase(name: string) {
  // Define a URL do serviço Cloudant a partir do arquivo .env
  service.setServiceUrl(process.env.URL_IBM as string);
  console.log("Cloudant conectado");
  
  // Tenta criar uma nova base de dados com o nome especificado
  service
    .putDatabase({ db: name })
    .then((putDatabaseResult) => {
      // Se a criação for bem-sucedida, exibe uma mensagem de sucesso
      if (putDatabaseResult.result.ok) {
        console.log(`Base de dados "${name}" criada`);
      }
    })
    .catch((err) => {
      // Se o erro for 412, a base de dados já existe, então exibe uma mensagem informativa
      if (err.code === 412) {
        console.log(`Base de dados ${name} já existe`);
      }
    });
}

// Função assíncrona para obter informações sobre uma base de dados existente
export async function getInformationDatabase(database: string) {
  // Tenta obter informações da base de dados especificada
  service
    .getDatabaseInformation({ db: `${database}` })
    .then((response) => {
      // Se bem-sucedido, exibe as informações da base de dados
      console.log(
        `Informações da ${database}: ${JSON.stringify(response.result)}`
      );
    })
    .catch((error) => {
      // Se ocorrer um erro, exibe uma mensagem de erro
      console.log("Erro na função getInformationDatabase", error);
    });
}


// Função assíncrona que filtra informações de sensores e gera um arquivo CSV
export async function filterIdRooms(): Promise<any> {
  let storage: any = []; // Array para armazenar os dados filtrados

  // Obtém informações das salas (rooms) chamando a função getRooms()
  const rooms: any[] = await getRooms()
    .then(response => { return response })
    .catch(error => { return error });

  // Faz uma requisição para obter todos os documentos do banco de dados 'sensors'
  await service.postAllDocs({
    db: 'sensors',
    includeDocs: true, // Inclui os documentos completos na resposta
  }).then((response) => {
      // Filtra os documentos de sensores com condições específicas
      response.result.rows.filter((sensor) => {
        if(sensor.doc?.roomRef === 'sensor_005-room:005' && sensor.doc?.joined.split(',')[0] === '14/03/24') {
          // Se o sensor atende as condições, adiciona as informações relevantes ao array storage
          storage.push({
            _id: sensor.doc?._id,
            _rev: sensor.doc?._rev,
            roomRef: rooms.find((room) => {
              if(room.id === sensor.doc?.roomRef) {
                return room;
              }
            }).name, // Nome da sala baseado na referência do sensor
            joined: sensor.doc?.joined,
            LPG_MQ9_Level: sensor.doc?.dataSensors.LPG_MQ9_Level,
            CH4_MQ9_Level: sensor.doc?.dataSensors.CH4_MQ9_Level,
            CO_MQ9_Level: sensor.doc?.dataSensors.CO_MQ9_Level,
            CO_MQ135_Level: sensor.doc?.dataSensors.CO_MQ135_Level,
            Alcool_MQ135_Level: sensor.doc?.dataSensors.Alcool_MQ135_Level,
            CO2_MQ135_Level: sensor.doc?.dataSensors.CO2_MQ135_Level,
            Toluen_MQ135_Level: sensor.doc?.dataSensors.Toluen_MQ135_Level,
            MH4_MQ135_Level: sensor.doc?.dataSensors.MH4_MQ135_Level,
            Aceton_MQ135_Level: sensor.doc?.dataSensors.Aceton_MQ135_Level,
            O3_MQ131_Level: sensor.doc?.dataSensors.O3_MQ131_Level,
            Temperatura_Level: sensor.doc?.dataSensors.Temperatura_Level,
            Humidade_Level: sensor.doc?.dataSensors.Humidade_Level,
            QualityAirConcept: sensor.doc?.qualityAirConcept,
            CO_MQ9_Level_IQAR: sensor.doc?.sensorIQAR.CO_MQ9_Level_IQAR,
            CO_MQ135_Level_IQAR: sensor.doc?.sensorIQAR.CO_MQ135_Level_IQAR,
            O3_MQ131_Level_IQAR: sensor.doc?.sensorIQAR.O3_MQ131_Level_IQAR,
            CalcHeatIndex: sensor.doc?.calcHeatIndex,
            TargetConcept: sensor.doc?.targetConcept
          });
        }
      });

      // Converte o array storage em formato CSV
      const csv = json2csv.parse(storage, { fields });
      
      // Salva o arquivo CSV com um nome baseado na data, hora e um UUID
      fs.writeFile(`csv/csv-camp3/${getDateNow().replace(/\//g, '')}-${getHoursAndMinutesNow().replace(/:/g, '')}-${uuidv4()}.csv`, csv, (err) => {
        if(err) throw err;
        console.log("CSV CAMPUS 3 GERADO");
      });
      
  }).catch((error) => {
     return error; // Retorna o erro em caso de falha
  });

  // Exibe no console o conteúdo armazenado para verificação
  console.log('---------------campus 3-------------', storage);
}



// Função assíncrona para obter os valores mínimos e máximos de vários parâmetros em documentos de sensores
export async function minAndMax(): Promise<any> {
  let storage: any[] = []; // Array para armazenar dados filtrados dos sensores

  // Obtém informações das salas (rooms) chamando a função getRooms()
  const rooms: any[] = await getRooms()
    .then(response => { return response })
    .catch(error => { return error });

  // Faz uma requisição para obter todos os documentos do banco de dados 'sensors'
  await service.postAllDocs({
    db: 'sensors',
    includeDocs: true, // Inclui os documentos completos na resposta
  })
  .then((response) => {
      console.log(response); // Exibe a resposta completa no console para depuração

      // Mapeia os documentos de sensores e extrai dados relevantes para o array storage
      response.result.rows.map((element) => {
          storage.push({
              _id: element.doc?._id,
              _rev: element.doc?._rev,
              roomRef: rooms.find((room) => {
                  if (room.id === element.doc?.roomRef) {
                      return room;
                  }
              }).name, // Nome da sala com base na referência do sensor
              joined: element.doc?.joined,
              LPG_MQ9_Level: element.doc?.dataSensors.LPG_MQ9_Level,
              CH4_MQ9_Level: element.doc?.dataSensors.CH4_MQ9_Level,
              CO_MQ9_Level: element.doc?.dataSensors.CO_MQ9_Level,
              CO_MQ135_Level: element.doc?.dataSensors.CO_MQ135_Level,
              Alcool_MQ135_Level: element.doc?.dataSensors.Alcool_MQ135_Level,
              CO2_MQ135_Level: element.doc?.dataSensors.CO2_MQ135_Level,
              Toluen_MQ135_Level: element.doc?.dataSensors.Toluen_MQ135_Level,
              MH4_MQ135_Level: element.doc?.dataSensors.MH4_MQ135_Level,
              Aceton_MQ135_Level: element.doc?.dataSensors.Aceton_MQ135_Level,
              O3_MQ131_Level: element.doc?.dataSensors.O3_MQ131_Level,
              Temperatura_Level: element.doc?.dataSensors.Temperatura_Level,
              Humidade_Level: element.doc?.dataSensors.Humidade_Level,
              QualityAirConcept: element.doc?.qualityAirConcept,
              CO_MQ9_Level_IQAR: element.doc?.sensorIQAR.CO_MQ9_Level_IQAR,
              CO_MQ135_Level_IQAR: element.doc?.sensorIQAR.CO_MQ135_Level_IQAR,
              O3_MQ131_Level_IQAR: element.doc?.sensorIQAR.O3_MQ131_Level_IQAR,
              CalcHeatIndex: element.doc?.calcHeatIndex,
              TargetConcept: element.doc?.targetConcept
          });
      });
  })
  .catch((error) => {
      if (error) {
          return error; // Retorna o erro em caso de falha na requisição
      }
  });

  console.log(storage); // Exibe os dados armazenados para verificação

  // Encontra os valores mínimos e máximos para cada atributo numérico no array storage
  let minMaxValues: any = {};
  Object.keys(storage[0]).forEach((key) => {
      if (typeof storage[0][key] === 'number' && !isNaN(storage[0][key])) {
          // Extrai todos os valores de um determinado campo e ignora NaN
          let values = storage.map(obj => obj[key]);
          let filteredValues = values.filter(value => !isNaN(value));
          if (filteredValues.length > 0) {
              // Calcula o valor mínimo e máximo para o campo e armazena no objeto minMaxValues
              minMaxValues[key] = {
                  min: Math.min(...filteredValues),
                  max: Math.max(...filteredValues)
              };
          }
      }
  });

  console.log('JSON Mínimo e Máximo:', minMaxValues); // Exibe os valores mínimos e máximos no console

  return minMaxValues; // Retorna o objeto contendo os valores mínimos e máximos
}








// Função assíncrona para encontrar o documento mais recente por ID de sala (room)
export async function findLastDocByIdRoom(idRoom: string): Promise<any> {
  let storage: any = []; // Array para armazenar documentos de sensores filtrados

  // Faz uma requisição para obter todos os documentos do banco de dados 'sensors'
  await service.postAllDocs({
    db: 'sensors',
    includeDocs: true, // Inclui os documentos completos na resposta
  })
  .then((response) => {
      // Filtra documentos com base no ID da sala (idRoom)
      response.result.rows.filter((sensor) => {
        if (sensor.doc?.roomRef === idRoom) { // Verifica se o documento é da sala especificada
          // Armazena os dados relevantes no array storage
          storage.push({
            _id: sensor.doc?._id,
            _rev: sensor.doc?._rev,
            roomRef: sensor.doc?.roomRef,
            joined: sensor.doc?.joined,
            LPG_MQ9_Level: sensor.doc?.dataSensors.LPG_MQ9_Level,
            CH4_MQ9_Level: sensor.doc?.dataSensors.CH4_MQ9_Level,
            CO_MQ9_Level: sensor.doc?.dataSensors.CO_MQ9_Level,
            CO_MQ135_Level: sensor.doc?.dataSensors.CO_MQ135_Level,
            Alcool_MQ135_Level: sensor.doc?.dataSensors.Alcool_MQ135_Level,
            CO2_MQ135_Level: sensor.doc?.dataSensors.CO2_MQ135_Level,
            Toluen_MQ135_Level: sensor.doc?.dataSensors.Toluen_MQ135_Level,
            MH4_MQ135_Level: sensor.doc?.dataSensors.MH4_MQ135_Level,
            Aceton_MQ135_Level: sensor.doc?.dataSensors.Aceton_MQ135_Level,
            O3_MQ131_Level: sensor.doc?.dataSensors.O3_MQ131_Level,
            Temperatura_Level: sensor.doc?.dataSensors.Temperatura_Level,
            Humidade_Level: sensor.doc?.dataSensors.Humidade_Level,
            QualityAirConcept: sensor.doc?.qualityAirConcept,
            CO_MQ9_Level_IQAR: sensor.doc?.sensorIQAR.CO_MQ9_Level_IQAR,
            CO_MQ135_Level_IQAR: sensor.doc?.sensorIQAR.CO_MQ135_Level_IQAR,
            O3_MQ131_Level_IQAR: sensor.doc?.sensorIQAR.O3_MQ131_Level_IQAR,
            CalcHeatIndex: sensor.doc?.calcHeatIndex,
            TargetConcept: sensor.doc?.targetConcept
          });
        }
      });
  })
  .catch((error) => {
    return error; // Retorna o erro caso ocorra uma falha na requisição
  });

  // Encontra o documento mais recente com base na data e hora mais próxima
  const closestDoc = closestDateTime(storage);
  return closestDoc; // Retorna o documento mais próximo
}

// Função assíncrona para verificar se um documento já existe no banco de dados pelo ID
export async function DocAlreadyExist(db: string, id: string): Promise<any> {
  service.postAllDocs({
    db: db,
    includeDocs: true, // Inclui documentos completos na resposta
    limit: 1, // Limita a resposta a um único documento
    key: id, // Define a chave (ID) do documento que está sendo verificado
  })
  .then((response) => {
    // Verifica se a resposta contém algum documento
    if (response.result.rows.length > 0) {
      return true; // Retorna true se o documento já existir
    } else {
      return false; // Retorna false se o documento não existir
    }
  })
  .catch((error) => {
    if (error) {
      return error; // Retorna o erro caso ocorra uma falha na requisição
    }
  });
}



// Função assíncrona que obtém todas as salas do banco de dados 'rooms'
export async function getRooms(): Promise<any[]> {
  const rooms: any[] = []; // Array para armazenar os dados das salas

  // Requisição para obter todos os documentos no banco de dados 'rooms'
  await service.postAllDocs({
    db: 'rooms',
    includeDocs: true, // Inclui os documentos completos na resposta
  })
  .then((response) => {
    // Mapeia cada elemento retornado e armazena os dados relevantes no array 'rooms'
    response.result.rows.map((element) => {
      rooms.push({
        id: element?.doc?._id,
        name: element?.doc?.name,
        lat: element?.doc?.latitude,
        long: element?.doc?.longitude,
        campus: element?.doc?.campus,
        block: element?.doc?.block,
      });
    });
  });
  return rooms; // Retorna o array com os dados das salas
}

// Função assíncrona que encontra todos os documentos em um banco de dados e gera um arquivo CSV
export async function findAllDocsForCsv(db: string): Promise<any> {
  let storage: any = []; // Array para armazenar os dados de sensores filtrados

  // Obtém todos os dados das salas para referenciar os nomes
  const rooms: any[] = await getRooms()
    .then((response) => { return response; })
    .catch((error) => { return error; });

  // Faz uma requisição para obter todos os documentos do banco de dados especificado
  await service
    .postAllDocs({
      db: db,
      includeDocs: true, // Inclui os documentos completos na resposta
    })
    .then((response) => {
      console.log(response);
      // Mapeia cada documento e armazena os dados relevantes no array 'storage'
      response.result.rows.map((element) => {
        storage.push({
          _id: element.doc?._id,
          _rev: element.doc?._rev,
          roomRef: rooms.find((room) => {
            if (room.id === element.doc?.roomRef) { return room; }
          }).name,
          joined: element.doc?.joined,
          LPG_MQ9_Level: element.doc?.dataSensors.LPG_MQ9_Level,
          CH4_MQ9_Level: element.doc?.dataSensors.CH4_MQ9_Level,
          CO_MQ9_Level: element.doc?.dataSensors.CO_MQ9_Level,
          CO_MQ135_Level: element.doc?.dataSensors.CO_MQ135_Level,
          Alcool_MQ135_Level: element.doc?.dataSensors.Alcool_MQ135_Level,
          CO2_MQ135_Level: element.doc?.dataSensors.CO2_MQ135_Level,
          Toluen_MQ135_Level: element.doc?.dataSensors.Toluen_MQ135_Level,
          MH4_MQ135_Level: element.doc?.dataSensors.MH4_MQ135_Level,
          Aceton_MQ135_Level: element.doc?.dataSensors.Aceton_MQ135_Level,
          O3_MQ131_Level: element.doc?.dataSensors.O3_MQ131_Level,
          Temperatura_Level: element.doc?.dataSensors.Temperatura_Level,
          Humidade_Level: element.doc?.dataSensors.Humidade_Level,
          QualityAirConcept: element.doc?.qualityAirConcept,
          CO_MQ9_Level_IQAR: element.doc?.sensorIQAR.CO_MQ9_Level_IQAR,
          CO_MQ135_Level_IQAR: element.doc?.sensorIQAR.CO_MQ135_Level_IQAR,
          O3_MQ131_Level_IQAR: element.doc?.sensorIQAR.O3_MQ131_Level_IQAR,
          CalcHeatIndex: element.doc?.calcHeatIndex,
          TargetConcept: element.doc?.targetConcept,
        });
      });

      // Converte o array 'storage' para CSV
      const csv = json2csv.parse(storage, { fields });

      // Salva o arquivo CSV no diretório especificado
      fs.writeFile(
        `csv/testgateway/${getDateNow().replace(/\//g, '')}-${getHoursAndMinutesNow().replace(/:/g, '')}-${uuidv4()}.csv`,
        csv,
        (err) => {
          if (err) throw err; // Lança erro se a gravação falhar
          console.log("CSV GERADO"); // Log de confirmação da criação do arquivo
        }
      );
    })
    .catch((error) => {
      if (error) {
        return error; // Retorna o erro caso ocorra uma falha na requisição
      }
    });

  storage = []; // Limpa o array 'storage' após a criação do CSV
}


// Função assíncrona para criar um documento de sala no banco de dados
export async function createDocumentRoom(
  db: string,             // Nome do banco de dados
  id: string,             // ID do documento
  name: string,           // Nome da sala
  description: string,    // Descrição da sala
  block: string,          // Bloco onde a sala está localizada
  level: string,          // Nível da sala
  campus: string,         // Campus onde a sala está localizada
  latitude: number,       // Latitude da sala
  longitude: number       // Longitude da sala
) {
  // Criação do objeto 'document' contendo todos os detalhes da sala
  const document: OrderDocument = {
    _id: id,
    name,
    block,
    level,
    campus,
    description,
    joined: `${getDateNow()},${getHoursAndMinutesNow()}`, // Data e hora de criação
    latitude,
    longitude,
  };

  try {
    // Verifica se um documento com o mesmo ID já existe no banco de dados
    const existingDocId = await DocAlreadyExist(db, document._id);

    // Se não existir, cria o documento no banco de dados
    if (!existingDocId) {
      const createDocumentResponse = await service.postDocument({
        db,
        document,
      });

      // Atualiza a revisão do documento criada
      document._rev = createDocumentResponse.result.rev;
      return "Documento Criado"; // Retorna uma confirmação da criação do documento
    }
  } catch (error: any) {
    // Verifica se o erro é de conflito de documento existente (código 409)
    if (error.code === 409) {
      return "Documento já existe"; // Retorna uma mensagem caso o documento já exista
    }
  }
}

// Função assíncrona para criar um documento de sensor vinculado a uma sala no banco de dados
export async function createDocumentSensor(
  roomRef: string,                // Referência para a sala
  db: string,                     // Nome do banco de dados
  object: OrderDocument,          // Objeto contendo os dados do sensor
  qualityAirConcept: string | undefined, // Conceito da qualidade do ar
  sensorsIQAR: OrderDocument,     // Objeto IQAR do sensor
  calcHeatIndex: OrderDocument,   // Índice de calor calculado
  targetConcept: OrderDocument    // Conceito alvo
) {
  // Cria o objeto 'document' contendo os dados do sensor
  const document: OrderDocument = {
    _id: uuidv4(), // Gera um ID único para o documento do sensor
    roomRef,
    joined: `${getDateNow()},${getHoursAndMinutesNow()}`, // Data e hora de criação
    dataSensors: transformObject(object) as OrderDocument["object"], // Dados do sensor transformados
    qualityAirConcept: qualityAirConcept,
    sensorIQAR: transformObject(sensorsIQAR) as OrderDocument["objectIQAR"], // Dados IQAR transformados
    calcHeatIndex,   // Índice de calor
    targetConcept,   // Conceito alvo
  };

  // Envia o documento para o banco de dados
  service
    .postDocument({
      db,
      document,
    })
    .then((createDocumentResponse) => {
      // Atualiza a revisão do documento criado
      document._rev = createDocumentResponse.result.rev;
      return `Documento criado:\n${JSON.stringify(document._id, null, 2)}`; // Retorna confirmação de criação do documento
    });
}

