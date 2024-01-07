
function gerarValorAleatorio(min:number, max:number):number {
    return Math.random() * (max - min) + min;
  }
  const randomData = () => {
  const limites = {
    CO2: { min: 300, max: 1000 },  
    NO2: { min: 0, max: 50 },      
    PM25: { min: 0, max: 20 },     
    PM10: { min: 0, max: 100 }     
  };
  
  const valoresAleatorios = {
    CO2: gerarValorAleatorio(limites.CO2.min, limites.CO2.max),
    NO2: gerarValorAleatorio(limites.NO2.min, limites.NO2.max),
    PM25: gerarValorAleatorio(limites.PM25.min, limites.PM25.max),
    PM10: gerarValorAleatorio(limites.PM10.min, limites.PM10.max)
  };
  
  return [valoresAleatorios.CO2,valoresAleatorios.NO2,valoresAleatorios.PM25,valoresAleatorios.PM10]
  }
  module.exports = randomData
  