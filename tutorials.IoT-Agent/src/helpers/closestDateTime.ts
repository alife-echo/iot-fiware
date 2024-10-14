import { StorageTargetRoom, RoomType } from "../db/Cloudant";

// Função que retorna o objeto com a data/hora mais próxima da data/hora atual em uma lista de salas.
export function closestDateTime(storageTargetRoom: RoomType) {
    const currentDate = new Date(); // Data e hora atuais.
    let closestDateTime = null as any; // Variável para armazenar o objeto com a data mais próxima.
    let minDifference = Infinity; // Inicializa a diferença mínima com o maior valor possível.

    // Verifica se storageTargetRoom é um array.
    if (Array.isArray(storageTargetRoom)) {
        // Itera sobre cada sala no array.
        storageTargetRoom.forEach((room: RoomType) => {
            // Divide a string 'joined' em partes de data e hora.
            const joinedDateTimeParts = room.joined.split(',');
            const joinedDateParts = joinedDateTimeParts[0].split('/');
            const joinedTimeParts = joinedDateTimeParts[1].split(':');

            // Cria um objeto Date a partir das partes da data e hora.
            const joinedDate = new Date(
                parseInt(joinedDateParts[2]),  // Ano.
                parseInt(joinedDateParts[1]) - 1,  // Mês (ajustado para 0-11).
                parseInt(joinedDateParts[0]),  // Dia.
                parseInt(joinedTimeParts[0]),  // Hora.
                parseInt(joinedTimeParts[1])   // Minutos.
            );

            // Calcula a diferença em milissegundos entre a data atual e a data de 'joined'.
            const difference = Math.abs(currentDate.getTime() - joinedDate.getTime());

            // Se a diferença for menor que a mínima registrada, atualiza a menor diferença e o objeto mais próximo.
            if (difference < minDifference) {
                minDifference = difference;
                closestDateTime = room;
            }
        });

        // Exibe informações de depuração no console.
        console.log('Data mais próxima da atual:', closestDateTime?.joined);
        console.log('Objeto com data mais próxima:', closestDateTime);
        console.log('Data atual:', currentDate.toLocaleDateString());
        console.log('Horas e minutos atuais:', currentDate.getHours(), currentDate.getMinutes());
        
        return closestDateTime; // Retorna o objeto com a data mais próxima.
    }
}
