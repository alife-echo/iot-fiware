import express,{Request,Response, response} from 'express'
import path from 'path'
import cors from 'cors'
import dotenv from 'dotenv'
import {createDatabase,getInformationDatabase,createDocumentRoom,findAllDocs} from './db/Cloudant'
import IotRouters from './routers/IotRouters'
dotenv.config()

const server = express()
const cor_options = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true,
    optionsSuccessStatus: 200
  };

server.use(express.urlencoded({extended:true}))
server.use(express.static(path.join(__dirname,'../public')))
server.use(cors(cor_options))
server.use(IotRouters)
createDatabase('sensors');
createDatabase('rooms')
console.log(findAllDocs("sensors"))
server.use((req:Request,res:Response) => {
    res.json({error:'endpoint não encontrado'}).status(400)
})
server.listen(process.env.PORT)


