import { CloudantV1 } from '@ibm-cloud/cloudant'
import { IamAuthenticator } from '@ibm-cloud/cloudant'
import { createConnection } from 'net'
import dotenv from 'dotenv'
dotenv.config()
interface OrderDocument extends CloudantV1.Document {
    name?: string;
    joined?: string;
    _id: string;
    _rev?: string;
  }

const authenticator =  new IamAuthenticator ({
    apikey:process.env.API_KEY as string 
 })
const service =  new CloudantV1({authenticator,})

export async function createDatabase (name:string) {
   
       
     service.setServiceUrl(process.env.URL_IBM as string)
     console.log('Cloudant conectado')
     service.putDatabase({db:name})
     .then((putDatabaseResult) => {
         if(putDatabaseResult.result.ok){
            console.log(` base de dados "${name}" criada`)
         }
     })
     .catch((err)=>{
         if(err.code === 412) {
            console.log(`Base de dados ${name} já existe`)
         }
     })
     service.getAllDbs().then(response => console.log(response.result)).catch(err => console.log(err))
}