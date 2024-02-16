
/*
export function formatData(data:string):string[][]{
    return data.split(',').map(current => {return current.split('-')})       
}

console.log(formatData('GLPmq9_001-GLPmq9Level|8.48,CHAmq9_001-CH4mq9Level|13.20,COmq9_001-COmq9Level|4.48'))
*/
/*
export function formatData(data: string): string[][] {
    const gases: Record<string, number> = {};
    const formattedData = data.split(',').map((current) => {
        const [gas, value] = current.split('|');
        const [name, sensor] = gas.split('_');
        if (!gases[name]) {
            gases[name] = 1;
        } else {
            gases[name]++;
        }
        const formattedName = `${name}_mq${gases[name].toString().padStart(3, '0')}`;
        return [formattedName, `${name.toUpperCase()}_${sensor}_Level|${value}`];
    });
    return formattedData;
}

const input = 'CO_MQ7|11.23,LPG_MQ9|10.08,CH4_MQ9|16.28,CO_MQ9|5.35,CO_MQ135|0.18,Alcool_MQ135|0.11,CO2_MQ135|0.31,Toluen_MQ135|0.04,MH4_MQ135|0.63,Aceton_MQ135|0.03,Temperatura|2,Humidade|3';
console.log(formatData(input));
*/
export function format (data:string,sensor_room:string):string[][] | Error{
    if (!sensor_room.includes('_') || !sensor_room.includes('-')) {
        return new Error('Formato incorreto do nome do sensor (ChirpStack). O formato correto é Ex:sensor_001-room:001');
    }
    let [sensor,id_entity] = sensor_room.split('-')
    let [name_sensor,numberId] = sensor.split('_') 
  return data.split(',').map((current) => {
        let [object_id,value] = current.split('|') 
        return (`${object_id}_${numberId} ${object_id}_Level|${value}`).split(' ')
    })
}

console.log(format('CO_MQ7|11.23,LPG_MQ9|10.08,CH4_MQ9|16.28,CO_MQ9|5.35,CO_MQ135|0.18,Alcool_MQ135|0.11,CO2_MQ135|0.31,Toluen_MQ135|0.04,MH4_MQ135|0.63,Aceton_MQ135|0.03,Temperatura|2,Humidade|3','sensor_001-room:001'))