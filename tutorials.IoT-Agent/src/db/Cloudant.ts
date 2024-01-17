import { CloudantV1 } from "@ibm-cloud/cloudant";
import { IamAuthenticator } from "@ibm-cloud/cloudant";
import { getDateNow } from "../helpers/getDateNow";
import { getHoursAndMinutesNow } from "../helpers/getHoursAndMinutesNow";
import { createConnection } from "net";
import dotenv from "dotenv";
import { response } from "express";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

interface OrderDocument extends CloudantV1.Document {
  name?: string;
  joined?: string;
  _id: string;
  _rev?: string;
  mark?: string;
  no2?: number;
  pm25?: number;
  pm10?: number;
  co2?: number;
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
  no2: number,
  co2: number,
  pm25: number,
  pm10: number
) {
  const document: OrderDocument = {
    _id: uuidv4(),
    roomRef,
    joined: `${getDateNow()},${getHoursAndMinutesNow()}`,
    no2,
    co2,
    pm10,
    pm25,
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
  
  

