import { CloudantV1 } from "@ibm-cloud/cloudant";
import { IamAuthenticator } from "@ibm-cloud/cloudant";
import { getDateNow } from "../helpers/getDateNow";
import { getHoursAndMinutesNow } from "../helpers/getHoursAndMinutesNow";
import fs from "fs";
import converter from "json-2-csv";
import json2csv from "json2csv";
import dotenv from "dotenv";
import { closestDateTime } from "../helpers/closestDateTime";
import { v4 as uuidv4 } from "uuid";
import { transformObject } from "../helpers/transformObject";

dotenv.config();

export interface OrderDocument extends CloudantV1.Document {
  name?: string;
  joined?: string;
  _id: string;
  _rev?: string;
  mark?: string;
  object?: {
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
  objectIQAR?: {
    CO_MQ9_IQAR: number;
    CO_MQ135_IQAR: number;
    O3_MQ131_IQAR: number;
  };
  calcHeatIndex?: any;
  targetConcept?: any;
  latitude?: number;
  longitude?: number;
  qualityAirConcept?: string;
  roomRef?: string;
  description?: string;
  block?: string;
  level?: string;
  campus?: string;
}

export interface RoomType {
  _id: string;
  _rev: string;
  roomRef: string;
  joined: string;
  LPG_MQ9_Level: number;
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
  QualityAirConcept: string;
  CO_MQ9_Level_IQAR: number;
  CO_MQ135_Level_IQAR: number;
  O3_MQ131_Level_IQAR: number;
  CalcHeatIndex: number;
  TargetConcept: string;
}

export interface StorageTargetRoom {
  docs: RoomType[];
}

const authenticator = new IamAuthenticator({
  apikey: process.env.API_KEY as string,
});
const service = new CloudantV1({ authenticator });
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
export async function filterIdRooms():Promise<any>{
  let storage:any = [];
  await service.postAllDocs({
    db:'galpaotocorredordois',
    includeDocs:true,
  }).then((response)=>{
          response.result.rows.filter((sensor)=>{
            if(sensor.doc?.roomRef === 'sensor_011-room:011' || sensor.doc?.roomRef === 'sensor_010-room:010' ){
              storage.push({
                _id: sensor.doc?._id,
                _rev: sensor.doc?._rev,
                roomRef:sensor.doc?.roomRef,
                joined: sensor.doc?.joined,
                LPG_MQ9_Level: sensor.doc?.dataSensors.LPG_MQ9_Level,
                CH4_MQ9_Level:sensor.doc?.dataSensors.CH4_MQ9_Level,
                CO_MQ9_Level:sensor.doc?.dataSensors. CO_MQ9_Level,
                CO_MQ135_Level: sensor.doc?.dataSensors.CO_MQ135_Level,
                Alcool_MQ135_Level:sensor.doc?.dataSensors.Alcool_MQ135_Level,
                CO2_MQ135_Level:sensor.doc?.dataSensors.CO2_MQ135_Level,
                Toluen_MQ135_Level:sensor.doc?.dataSensors.Toluen_MQ135_Level,
                MH4_MQ135_Level:sensor.doc?.dataSensors.MH4_MQ135_Level,
                Aceton_MQ135_Level:sensor.doc?.dataSensors.Aceton_MQ135_Level,
                O3_MQ131_Level: sensor.doc?.dataSensors.O3_MQ131_Level,
                Temperatura_Level:sensor.doc?.dataSensors.Temperatura_Level,
                Humidade_Level:sensor.doc?.dataSensors.Humidade_Level,
                QualityAirConcept:sensor.doc?.qualityAirConcept,
                CO_MQ9_Level_IQAR:sensor.doc?.sensorIQAR.CO_MQ9_Level_IQAR,
                CO_MQ135_Level_IQAR:sensor.doc?.sensorIQAR.CO_MQ135_Level_IQAR,
                O3_MQ131_Level_IQAR:sensor.doc?.sensorIQAR.O3_MQ131_Level_IQAR,
                CalcHeatIndex:sensor.doc?.calcHeatIndex,
                TargetConcept:sensor.doc?.targetConcept
              });
            }
        })
        const csv = json2csv.parse(storage, { fields });
      fs.writeFile(`csv/csv-camp3/${getDateNow().replace(/\//g, '')}-${getHoursAndMinutesNow().replace(/:/g, '')}-${uuidv4()}.csv`,csv,(err)=>{
        if(err) throw err
        console.log("CSV CAMPUS 3 GERADO")
      })
       
  }).catch((error)=>{
     return error
  })

  console.log('---------------campus 3-------------',storage)
}

export async function findLastDocByIdRoom(idRoom:string):Promise<any>{
  let storage:any = [];
  await service.postAllDocs({
    db:'sensors',
    includeDocs:true,
  }).then((response)=>{
          response.result.rows.filter((sensor)=>{
            if(sensor.doc?.roomRef === idRoom){
              storage.push({
                _id: sensor.doc?._id,
                _rev: sensor.doc?._rev,
                roomRef:sensor.doc?.roomRef,
                joined: sensor.doc?.joined,
                LPG_MQ9_Level: sensor.doc?.dataSensors.LPG_MQ9_Level,
                CH4_MQ9_Level:sensor.doc?.dataSensors.CH4_MQ9_Level,
                CO_MQ9_Level:sensor.doc?.dataSensors. CO_MQ9_Level,
                CO_MQ135_Level: sensor.doc?.dataSensors.CO_MQ135_Level,
                Alcool_MQ135_Level:sensor.doc?.dataSensors.Alcool_MQ135_Level,
                CO2_MQ135_Level:sensor.doc?.dataSensors.CO2_MQ135_Level,
                Toluen_MQ135_Level:sensor.doc?.dataSensors.Toluen_MQ135_Level,
                MH4_MQ135_Level:sensor.doc?.dataSensors.MH4_MQ135_Level,
                Aceton_MQ135_Level:sensor.doc?.dataSensors.Aceton_MQ135_Level,
                O3_MQ131_Level: sensor.doc?.dataSensors.O3_MQ131_Level,
                Temperatura_Level:sensor.doc?.dataSensors.Temperatura_Level,
                Humidade_Level:sensor.doc?.dataSensors.Humidade_Level,
                QualityAirConcept:sensor.doc?.qualityAirConcept,
                CO_MQ9_Level_IQAR:sensor.doc?.sensorIQAR.CO_MQ9_Level_IQAR,
                CO_MQ135_Level_IQAR:sensor.doc?.sensorIQAR.CO_MQ135_Level_IQAR,
                O3_MQ131_Level_IQAR:sensor.doc?.sensorIQAR.O3_MQ131_Level_IQAR,
                CalcHeatIndex:sensor.doc?.calcHeatIndex,
                TargetConcept:sensor.doc?.targetConcept
              });
            }
        })
       
  }).catch((error)=>{
     return error
  })

  const closestDoc = closestDateTime(storage)
  return  closestDoc
}
export async function DocAlreadyExist(db: string, id: string): Promise<any> {
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
      } else {
        return false;
      }
    })
    .catch((error) => {
      if (error) {
        return error;
      }
    });
}


export async function getRooms():Promise<any[]>{
  const rooms:any[] = []
   await  service.postAllDocs({
       db:'rooms',
       includeDocs:true,
     }).then(response => {
        response.result.rows.map((element)=> {
              rooms.push({id:element?.doc?._id,name:element?.doc?.name,lat:element?.doc?.latitude,long:element?.doc?.longitude,campus:element?.doc?.campus,block:element?.doc?.block})
        })
     })
    return rooms
}

export async function findAllDocsForCsv(db: string): Promise<any> {
  let storage:any = [];
    const rooms: any[] = await getRooms().then(response => {return response}).catch(error => {return error})
  await  service
    .postAllDocs({
      db: db,
      includeDocs: true,
    })
    .then((response) => {
      console.log(response)
      response.result.rows.map((element) => {
        storage.push({
          _id: element.doc?._id,
          _rev: element.doc?._rev,
          roomRef:rooms.find((room)=> {if(room.id === element.doc?.roomRef){return room}}).name,
          joined: element.doc?.joined,
          LPG_MQ9_Level: element.doc?.dataSensors.LPG_MQ9_Level,
          CH4_MQ9_Level:element.doc?.dataSensors.CH4_MQ9_Level,
          CO_MQ9_Level:element.doc?.dataSensors. CO_MQ9_Level,
          CO_MQ135_Level: element.doc?.dataSensors.CO_MQ135_Level,
          Alcool_MQ135_Level:element.doc?.dataSensors.Alcool_MQ135_Level,
          CO2_MQ135_Level:element.doc?.dataSensors.CO2_MQ135_Level,
          Toluen_MQ135_Level: element.doc?.dataSensors.Toluen_MQ135_Level,
          MH4_MQ135_Level:element.doc?.dataSensors.MH4_MQ135_Level,
          Aceton_MQ135_Level:element.doc?.dataSensors.Aceton_MQ135_Level,
          O3_MQ131_Level: element.doc?.dataSensors.O3_MQ131_Level,
          Temperatura_Level:element.doc?.dataSensors.Temperatura_Level,
          Humidade_Level:element.doc?.dataSensors.Humidade_Level,
          QualityAirConcept:element.doc?.qualityAirConcept,
          CO_MQ9_Level_IQAR:element.doc?.sensorIQAR.CO_MQ9_Level_IQAR,
          CO_MQ135_Level_IQAR:element.doc?.sensorIQAR.CO_MQ135_Level_IQAR,
          O3_MQ131_Level_IQAR:element.doc?.sensorIQAR.O3_MQ131_Level_IQAR,
          CalcHeatIndex:element.doc?.calcHeatIndex,
          TargetConcept:element.doc?.targetConcept
        });
      });
      //service.postAllDocs({db:'rooms',includeDocs:true}).then((response)=> {response.result.rows.map((elementRoom) => {elementRoom.doc?.name} )})
      const csv = json2csv.parse(storage, { fields });
      fs.writeFile(`csv/${getDateNow().replace(/\//g, '')}-${getHoursAndMinutesNow().replace(/:/g, '')}-${uuidv4()}.csv`,csv,(err)=>{
        if(err) throw err
        console.log("CSV GERADO")
      })
    })
    .catch((error) => {
      if (error) {
        return error;
      }
    });
  
 
    storage = []
}
export async function createDocumentRoom(
  db: string,
  id: string,
  name: string,
  description: string,
  block: string,
  level: string,
  campus: string,
  latitude: number,
  longitude: number
) {
  const document: OrderDocument = {
    _id: id,
    name,
    block,
    level,
    campus,
    description,
    joined: `${getDateNow()},${getHoursAndMinutesNow()}`,
    latitude,
    longitude,
  };

  try {
    const existingDocId = await DocAlreadyExist(db, document._id);

    if (!existingDocId) {
      const createDocumentResponse = await service.postDocument({
        db,
        document,
      });

      document._rev = createDocumentResponse.result.rev;
      return "Documento Criado";
    }
  } catch (error: any) {
    if (error.code === 409) {
      return "Documento já existe";
    }
  }
}
export async function createDocumentSensor(
  roomRef: string,
  db: string,
  object: OrderDocument,
  qualityAirConcept: string | undefined,
  sensorsIQAR: OrderDocument,
  calcHeatIndex: OrderDocument,
  targetConcept: OrderDocument
) {
  const document: OrderDocument = {
    _id: uuidv4(),
    roomRef,
    joined: `${getDateNow()},${getHoursAndMinutesNow()}`,
    dataSensors: transformObject(object) as OrderDocument["object"],
    qualityAirConcept: qualityAirConcept,
    sensorIQAR: transformObject(sensorsIQAR) as OrderDocument["objectIQAR"],
    calcHeatIndex,
    targetConcept,
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
