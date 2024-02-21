import { CloudantV1 } from "@ibm-cloud/cloudant";
import { IamAuthenticator } from "@ibm-cloud/cloudant";
import { getDateNow } from "../helpers/getDateNow";
import { getHoursAndMinutesNow } from "../helpers/getHoursAndMinutesNow";
import { createConnection } from "net";
import dotenv from "dotenv";
import { response } from "express";
import { v4 as uuidv4 } from "uuid";
import { transformObject } from "../helpers/transformObject";

dotenv.config();

export interface OrderDocument extends CloudantV1.Document {
  name?: string;
  joined?: string;
  _id: string;
  _rev?: string;
  mark?: string;
  object?:{
    CO_MQ7_Level?: number;
    LGP_MQ9_Level?: number;
    CH4_MQ9_Level?: number;
    CO_MQ9_Level?: number;
    CO_MQ135_Level?:number;
    Alcool_MQ135_Level?:number;
    CO2_MQ135_Level?:number;
    Toluen_MQ135_Level?:number;
    MH4_MQ135_Level?:number;
    Aceton_MQ135_Level?:number;
    Temperatura_Level?:number;
    Humidade_Level?:number;
  };
  objectIQAR?:{
    CO_MQ9_IQAR:number,
    CO_MQ135_IQAR:number,
    O3_MQ131_IQAR:number,
  }
  qualityAirConcept?:string
  roomRef?: string;
  description?: string;
  block?: string;
  level?: string;
  campus?: string;
}

const authenticator = new IamAuthenticator({
  apikey: process.env.API_KEY as string,
});
const service = new CloudantV1({ authenticator });

export async function createDatabase(name: string) {
  service.setServiceUrl(process.env.URL_IBM as string);
  console.log("Cloudant conectado");
  service
    .putDatabase({ db: name })
    .then((putDatabaseResult) => {
      if (putDatabaseResult.result.ok) {
        console.log(` base de dados "${name}" criada`);
      }
    })
    .catch((err) => {
      if (err.code === 412) {
        console.log(`Base de dados ${name} já existe`);
      }
    });
}

export async function getInformationDatabase(database: string) {
  service
    .getDatabaseInformation({ db: `${database}` })
    .then((response) => {
      console.log(
        `Informções da ${database} : ${JSON.stringify(response.result)}`
      );
    })
    .catch((error) => {
      console.log("Error na função getInformationDatabase", error);
    });
}
export async function DocAlreadyExist(db: string, id: string):Promise<any> {
  service
    .postAllDocs({
      db: db,
      includeDocs: true,
      limit: 1,
      key: id,
    })
    .then((response) => {
      if (response.result.rows.length > 0) {
        return true;
      }
      else{
        return false
      }
    })
    .catch((error) => {
      if (error) {
        return error;
      }
    });
}
export async function createDocumentRoom(
    db: string,
    id: string,
    name: string,
    description: string,
    block: string,
    level: string,
    campus: string
  ) {
    const document: OrderDocument = {
      _id: id,
      name,
      block,
      level,
      campus,
      description,
      joined: `${getDateNow()},${(getHoursAndMinutesNow())}`,
    };
  
    try {
      const existingDocId = await DocAlreadyExist(db, document._id);
  
      if (!existingDocId) {
        const createDocumentResponse = await service.postDocument({
          db,
          document,
        });
  
        document._rev = createDocumentResponse.result.rev;
        return 'Documento Criado';
      } 
    } catch (error:any) {
       if(error.code === 409){return 'Documento já existe'} ;
    }
  }
export async function createDocumentSensor(
  roomRef: string,
  db: string,
  object:OrderDocument,
  qualityAirConcept:string|undefined,
  sensorsIQAR:OrderDocument
) {
  const document: OrderDocument = {
    _id: uuidv4(),
    roomRef,
    joined: `${getDateNow()},${getHoursAndMinutesNow()}`,
    dataSensors:transformObject(object) as OrderDocument['object'],
    qualityAirConcept:qualityAirConcept,
    sensorIQAR:transformObject(sensorsIQAR) as OrderDocument['objectIQAR']
  };

    service
      .postDocument({
        db,
        document,
      })
      .then((createDocumentResponse) => {
        document._rev = createDocumentResponse.result.rev;
        return `Documento criado:\n${JSON.stringify(document._id, null, 2)}`;
      });
  }
  
  

