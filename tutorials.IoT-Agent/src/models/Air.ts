let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

export const createAir = async (id:string,name:string,mark:string) => {
    let raw = JSON.stringify({
        "id" : `urn:ngsi-ld:${id}`,
        "type":"Device",
        "name":{
            "type":"Text",
            "value":`${name}`
        },
        "mark":{
           "type":"Text",
           "value":`${mark}`
        }
    })

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow' as RequestRedirect
      };

    try {
        const response = await fetch("http://localhost:1026/v2/entities", requestOptions)
        const result = await response.text();
        return { success: true, message: result };
      }
    catch(error){
        return { success: false, message: error };
      }

}
