import {Router} from 'express'
import * as IotControllersDevices from '../controllers/IotControllers'

const ROUTER = Router()

ROUTER.post('/create-device',IotControllersDevices.CREATE_DEVICE)
ROUTER.get('/show-devices/:entity_name',IotControllersDevices.SHOW_DEVICES)
ROUTER.post('/create-service-iot',IotControllersDevices.CREATE_SERVICE_IOT)
ROUTER.post('/create-sensors',IotControllersDevices.CREATE_SENSORS)
ROUTER.get('/send-data-sensors',IotControllersDevices.SUBMIT_DATA_AGENT)
ROUTER.get('/show-sensors/:entity_name',IotControllersDevices.SHOW_SENSORS)

export default ROUTER