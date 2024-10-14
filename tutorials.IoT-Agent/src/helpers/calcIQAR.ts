// Define um intervalo de índice, mapeando faixas de concentração de poluentes para índices de qualidade do ar.
interface IndexRange {
    indexInitial: number;
    indexFinal: number;
    concentrationInitial: number;
    concentrationFinal: number;
}

// Define os dados dos sensores, incluindo o nome e o valor atual do sensor.
interface SensorData {
    sensorName: string;
    sensorValue: number | null;
}

// Etiquetas de qualidade do ar de acordo com os valores dos índices.
const qualityLabels = ['Boa', 'Moderada', 'Ruim', 'Muito Ruim', 'Péssima'];

// Retorna a etiqueta de qualidade correspondente a um dado índice.
function getQualityLabel(index: number): string {
    if (index <= 40) return qualityLabels[0];
    if (index <= 80) return qualityLabels[1];
    if (index <= 120) return qualityLabels[2];
    if (index <= 200) return qualityLabels[3];
    return qualityLabels[4];
}

// Calcula o índice baseado no valor do sensor, ajustando-o conforme o intervalo de concentração.
function calculateIndex(sensorValue: number, ranges: IndexRange[]): number {
    const range = ranges.find(range => sensorValue >= range.concentrationInitial && sensorValue <= range.concentrationFinal);
    if (range) {
        const { indexInitial, indexFinal, concentrationInitial, concentrationFinal } = range;
        // Calcula o índice interpolando o valor do sensor dentro do intervalo de concentração.
        return indexInitial + ((indexFinal - indexInitial) / (concentrationFinal - concentrationInitial)) * (sensorValue - concentrationInitial);
    } else {
        // Se o valor do sensor for maior que o último intervalo, retorna o índice máximo.
        return ranges[ranges.length - 1].indexFinal;
    }
}

// Arredonda o valor do sensor para o número mais próximo. Se for ímpar, arredonda novamente.
function roundValue(sensorValue: number): number {
    const rounded = Math.round(sensorValue);
    if (rounded % 2 !== 0 && rounded !== 500) return Math.round(sensorValue);
    return rounded;
}

// Função principal que calcula o Índice de Qualidade do Ar (IQAR) com base nos dados dos sensores.
export function calcIQAR(sensorData: SensorData[]): [string, Record<string, number>] {
    const iqarValues: number[] = []; // Armazena os valores de índice de cada sensor.
    const sensorDataObject: Record<string, number> = {}; // Armazena os índices calculados de cada sensor.

    // Faixas de concentração para diferentes sensores e seus respectivos intervalos de índices.
    const indexRanges: Record<string, IndexRange[]> = {
        CO_MQ9_Level: [{ indexInitial: 0, indexFinal: 40, concentrationInitial: 0, concentrationFinal: 9 },
                        { indexInitial: 41, indexFinal: 80, concentrationInitial: 10, concentrationFinal: 11 },
                        { indexInitial: 81, indexFinal: 120, concentrationInitial: 12, concentrationFinal: 13 },
                        { indexInitial: 121, indexFinal: 200, concentrationInitial: 14, concentrationFinal: 15 },
                        { indexInitial: 201, indexFinal: 400, concentrationInitial: 16, concentrationFinal: 50 }],
        CO_MQ135_Level: [{ indexInitial: 0, indexFinal: 40, concentrationInitial: 0, concentrationFinal: 9 },
                          { indexInitial: 41, indexFinal: 80, concentrationInitial: 10, concentrationFinal: 11 },
                          { indexInitial: 81, indexFinal: 120, concentrationInitial: 12, concentrationFinal: 13 },
                          { indexInitial: 121, indexFinal: 200, concentrationInitial: 14, concentrationFinal: 15 },
                          { indexInitial: 201, indexFinal: 400, concentrationInitial: 16, concentrationFinal: 50 }],
        O3_MQ131_Level: [{ indexInitial: 0, indexFinal: 40, concentrationInitial: 0, concentrationFinal: 100 },
                          { indexInitial: 41, indexFinal: 80, concentrationInitial: 101, concentrationFinal: 130 },
                          { indexInitial: 81, indexFinal: 120, concentrationInitial: 131, concentrationFinal: 160 },
                          { indexInitial: 121, indexFinal: 200, concentrationInitial: 161, concentrationFinal: 200 },
                          { indexInitial: 201, indexFinal: 400, concentrationInitial: 201, concentrationFinal: 800 }]
    };

    // Itera pelos dados de cada sensor e calcula o índice correspondente.
    for (const sensor of sensorData) {
        if (sensor.sensorName !== 'CO_MQ9_Level' && sensor.sensorName !== 'CO_MQ135_Level' && sensor.sensorName !== 'O3_MQ131_Level') {
            continue; // Ignora sensores não reconhecidos.
        }
        if(Number.isNaN(sensor.sensorValue) || sensor.sensorValue === null){
            continue; // Ignora valores inválidos ou nulos.
        }

        const roundedValue = roundValue(sensor.sensorValue); // Arredonda o valor do sensor.
        const ranges = indexRanges[sensor.sensorName]; // Obtém as faixas para o sensor atual.
        const index = calculateIndex(roundedValue, ranges); // Calcula o índice para o valor arredondado.
        iqarValues.push(index); // Armazena o índice.
        sensorDataObject[`${sensor.sensorName}_IQAR`] = index; // Armazena o índice no objeto de dados.
    }

    // Determina o maior índice para obter a pior qualidade do ar.
    const maxIndex = Math.max(...iqarValues);
    const quality = getQualityLabel(maxIndex); // Obtém a etiqueta de qualidade com base no índice máximo.

    return [quality, sensorDataObject]; // Retorna a qualidade geral e os índices calculados por sensor.
}
