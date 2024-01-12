import express,{Request,Response, response} from 'express'
import { serviceIot } from '../services/CreateServiceIot'
import { sendDataAgent } from '../services/SendDataDevice'
import { randomData } from '../helpers/randomDataSensor'
import { devices } from '../services/ShowSensors'
import { createAir } from '../models/Air'
import { createSensor } from '../models/Sensor'
import { getAllDevicesAir } from '../services/ShowDevices'
import { createDocumentAir } from '../db/Cloudant'
import { createDocumentSensor } from '../db/Cloudant'


export const CREATE_DEVICE =  async (req:Request,res:Response) => {
    let{id,name,mark} = req.body
    if(id && name && mark){
        const create = await createAir(id,name,mark).then(response=> {return response}).catch(error => {return error})
        const createDeviceIBM = await createDocumentAir('devices',id,name,mark)
        res.status(200).json({ok:create,ibm:createDeviceIBM})
    }
    else{
      res.json({error:'Informe os dados corretamente'})
    }
  
}

export const SHOW_DEVICES = async(req:Request,res:Response) => {
    let {entity_name} = req.params
    console.log(entity_name)
    const ShowDevices = await getAllDevicesAir(entity_name).then(response => {return response}).catch(error => {return error})
    res.status(200).json({devices:ShowDevices})
}
export const CREATE_SERVICE_IOT= async (req:Request,res:Response) => {
    let {entity_type} = req.body
    const service = await serviceIot(entity_type).then(response => {return response}).catch(error => {return error});
    res.json({ok:service}).status(200) 
}

export const CREATE_SENSORS = async(req:Request,res:Response) => {
    let 
    {
        device_id,
        entity_name,
        entity_type,
        object_id,
        nameAtribute,
        typeAtribute,
        foreignkeyNameRef,
        foreignkeyValueRef  
    } = req.body
    const sensor = await createSensor
      ( device_id,
        entity_name,
        entity_type,
        object_id,
        nameAtribute,
        typeAtribute,
        foreignkeyNameRef,
        foreignkeyValueRef ).then(response => {return response}).catch(error => {return error})
    
    res.status(200).json({sensor})
    
}

export const SUBMIT_DATA_AGENT = async(req:Request,res:Response) => {
  let{deviceRef} = req.body
  if(deviceRef){
    const datasSensors = randomData()
    const nitrogen =  await sendDataAgent('nitrogen_sensor_001',`nitrogenLevel|${datasSensors[1]}`).then(result => result).catch(error => error)
    const pm25_sensor = await sendDataAgent('pm25_sensor_001',`pm25Level|${datasSensors[2]}`).then(result => result).catch(error => error)
    const pm10_sensor = await sendDataAgent('pm10_sensor_001',`pm10Level|${datasSensors[3]}`).then(result => result).catch(error => error)
    const co2 = await sendDataAgent('co2_sensor_001',`co2Level|${datasSensors[0]}`).then(result => result).catch(error => error)
    const sensorIBM = await createDocumentSensor(deviceRef,'sensors',datasSensors[1],datasSensors[0],datasSensors[2],datasSensors[3])
    res.json({
      NO2:nitrogen,
      PM25_SENSOR_001:pm25_sensor,
      PM10_SENSOR_001:pm10_sensor,
      CO2:co2,
      sensorIBM
    }).status(200)  
  }
  else{
    res.json({error:'Informe os dados corretamente'})
  }
}

export const  SHOW_SENSORS = async(req:Request,res:Response) => {
    let {entity_name} = req.params
    console.log(entity_name)
    const showSensors = await devices(entity_name).then(response => {return response}).catch(error => {return error})
    res.status(200).json({devices:showSensors})
}
