let myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("fiware-service", "openiot");
myHeaders.append("fiware-servicepath", "/");

export  const  serviceIot = async (entity_type:string) => {
     let raw = JSON.stringify({
        "services": [
        {
        "apikey":      "4jggokgpepnvsb2uv4s40d59ov",
        "cbroker":     "http://orion:1026",
        "entity_type": `${entity_type}`,
        "resource":    "/iot/d"
     }     
    ]
})
let requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow' as RequestRedirect
  };
  try {
    const response = await fetch("http://localhost:4041/iot/services", requestOptions);
    const result = await response.text();
    return { success: true};
} catch (error) {
    return { success: false };
}
}
