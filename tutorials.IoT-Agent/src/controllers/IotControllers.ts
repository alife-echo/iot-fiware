import express, { Request, Response, response } from "express";
import { serviceIot } from "../services/CreateServiceIot";
import { sendDataAgent } from "../services/SendDataDevice";
import { randomData } from "../helpers/randomDataSensor";
import { getAllSensors } from "../services/ShowSensors";
import { createRoom } from "../models/RoomLiving";
import { createSensor } from "../models/Sensor";
import { getAllRooms } from "../services/ShowRooms";
import { createDocumentRoom } from "../db/Cloudant";
import { createDocumentSensor } from "../db/Cloudant";
import { format } from "../helpers/formatDataSensors";
import {calcIQAR} from "../helpers/calcIQAR";
import { replaceLastOcurrence } from "../helpers/replaceLastOcurrance";
export const CREATE_ROOMS = async (req: Request, res: Response) => {
  let { id, name, description, block, level, campus } = req.body;
  if (id && name && description && block && level && campus) {
    const create = await createRoom(id, name, description, block, level, campus)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
    const createRoomIBM = await createDocumentRoom(
      "rooms",
      id,
      name,
      description,
      block,
      level,
      campus
    )
      .then((response) => {
        return response;
      })
      .catch((error) => {
        return error;
      });
    res.status(200).json({ ok: create, ibm: createRoomIBM });
  } else {
    res.json({ error: "Informe os dados corretamente" });
  }
};

export const SHOW_ROOMS = async (req: Request, res: Response) => {
  let { entity_name } = req.params;
  console.log(entity_name);
  const ShowRooms = await getAllRooms(entity_name)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error;
    });
  res.status(200).json({ rooms: ShowRooms });
};
export const CREATE_SERVICE_IOT = async (req: Request, res: Response) => {
  let { entity_type } = req.body;
  const service = await serviceIot(entity_type)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error;
    });
  res.json({ ok: service }).status(200);
};

export const CREATE_SENSORS = async (req: Request, res: Response) => {
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
      return response;
    })
    .catch((error) => {
      return error;
    });


  res.status(200).json({ ok:sensor});
};

export const SUBMIT_DATA_AGENT = async (req: Request, res: Response) => {
  let { room,data} = req.body;
  let sensorDataObject: { [key: string]: number } = {}
  let arr : any= []
  
  if(room && data){
    const formattedData = format(data, room);
    if (formattedData instanceof Error) {
        return res.status(400).json({ error: formattedData.message });
    }

    await Promise.all(
        formattedData.map(async (current:any) => {
            const sensorName = current[1].split('|')[0];
            const sensorValue = parseFloat(current[1].split('|')[1]);
            sensorDataObject[sensorName] = sensorValue;
            await sendDataAgent(current[0], current[1]);
            console.log(sensorName + ',' + sensorValue)  
            arr.push({sensorName,sensorValue})
        })
    );
    console.log('Qualidade do Ar:',calcIQAR(arr)[0])
    console.log('Dados IQAR:',calcIQAR(arr)[1])
    console.log(arr.length)
    const ibm = await createDocumentSensor(room,'sensors',sensorDataObject as any,calcIQAR(arr)[0],calcIQAR(arr)[1] as any)
    if(arr.length >= 13){arr = []}
    console.log(sensorDataObject)
    res.status(200).json({ok:'---Dados Recebidos ---',data,ibm:ibm})
  }
  else{
    res.status(400).json({error:'Informe os dados corretamente'})
  }

};

export const SHOW_SENSORS = async (req: Request, res: Response) => {
  let { entity_name } = req.params;
  console.log(entity_name);
  const showSensors = await getAllSensors(entity_name)
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error;
    });
  res.status(200).json({ devices: showSensors });
};
