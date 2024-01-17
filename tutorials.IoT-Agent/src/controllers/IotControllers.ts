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

  res.status(200).json({ sensor });
};

export const SUBMIT_DATA_AGENT = async (req: Request, res: Response) => {
  let { roomRef,dataSensors } = req.body;
  if(roomRef && dataSensors){
    res.status(200).json({ok:'---Dados Recebidos ---',data:dataSensors})
  }
  else{
    res.status(400).json({error:'Informe os dados corretamente'})
  }
  /*if (roomRef) {
    const datasSensors = randomData();
    const nitrogen = await sendDataAgent(
      "nitrogen_sensor_001",
      `nitrogenLevel|${datasSensors[1]}`
    )
      .then((result) => result)
      .catch((error) => error);
    const pm25_sensor = await sendDataAgent(
      "pm25_sensor_001",
      `pm25Level|${datasSensors[2]}`
    )
      .then((result) => result)
      .catch((error) => error);
    const pm10_sensor = await sendDataAgent(
      "pm10_sensor_001",
      `pm10Level|${datasSensors[3]}`
    )
      .then((result) => result)
      .catch((error) => error);
    const co2 = await sendDataAgent(
      "co2_sensor_001",
      `co2Level|${datasSensors[0]}`
    )
      .then((result) => result)
      .catch((error) => error);
    const sensorIBM = await createDocumentSensor(
      roomRef,
      "sensors",
      datasSensors[1],
      datasSensors[0],
      datasSensors[2],
      datasSensors[3]
    );
    res
      .json({
        NO2: nitrogen,
        PM25_SENSOR_001: pm25_sensor,
        PM10_SENSOR_001: pm10_sensor,
        CO2: co2,
        sensorIBM,
      })
      .status(200);
  } else {
    res.json({ error: "Informe os dados corretamente" });
  }*/
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
