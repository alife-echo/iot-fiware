import express,{Request,Response} from 'express'
import path from 'path'
import cors from 'cors'
import dotenv from 'dotenv'
import {createDatabase} from './db/Cloudant'
dotenv.config()

const server = express()
const cor_options = {
    origin: 'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true,
    optionsSuccessStatus: 200
  };

server.use(express.urlencoded({extended:true}))
server.use(express.static(path.join(__dirname,'../public')))
server.use(cors(cor_options))


createDatabase('sensors');
createDatabase('devices')

server.use((req:Request,res:Response) => {
    res.json({error:'endpoint não encontrado'}).status(400)
})
server.listen(process.env.PORT)