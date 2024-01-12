
export const getAllDevicesAir = async (entity_name:string) => {
    let requestOptions = {
        method: 'GET',
        redirect: 'follow' as RequestRedirect
      };
      try {
        const response = await fetch(`http://localhost:1026/v2/entities?options=keyValues&type=${entity_name}`, requestOptions)
        const result = await response.text();
        return { success: true, message:JSON.parse(result)};
    } catch (error) {
        return { success: false, message: error };
    }
  }
  