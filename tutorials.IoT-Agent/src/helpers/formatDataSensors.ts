// Função que formata dados de sensores e retorna uma matriz de strings ou um erro se o formato do sensor estiver incorreto.
export function format(data: string, sensor_room: string): string[][] | Error {
    // Verifica se o nome do sensor segue o formato esperado com '_' e '-'.
    if (!sensor_room.includes('_') || !sensor_room.includes('-')) {
        return new Error('Formato incorreto do nome do sensor (ChirpStack). O formato correto é Ex: sensor_001-room:001');
    }

    // Separa o sensor e a entidade do nome do sensor.
    let [sensor, id_entity] = sensor_room.split('-');
    // Separa o nome do sensor e o número de identificação.
    let [name_sensor, numberId] = sensor.split('_');

    // Divide os dados usando a vírgula como separador e mapeia cada valor para o formato desejado.
    return data.split(',').map((current) => {
        // Separa o id do objeto e o valor usando o caractere '|' como delimitador.
        let [object_id, value] = current.split('|');
        // Formata o resultado concatenando o id do objeto com o número de identificação e o nível.
        return (`${object_id}_${numberId} ${object_id}_Level|${value}`).split(' ');
    });
}

// Exemplo de uso da função com um console.log para testar.
console.log(format(
  'CO_MQ7|11.23,LPG_MQ9|10.08,CH4_MQ9|16.28,CO_MQ9|5.35,CO_MQ135|0.18,Alcool_MQ135|0.11,CO2_MQ135|0.31,Toluen_MQ135|0.04,MH4_MQ135|0.63,Aceton_MQ135|0.03,Temperatura|2,Humidade|3',
  'sensor_001-room:001'
));
