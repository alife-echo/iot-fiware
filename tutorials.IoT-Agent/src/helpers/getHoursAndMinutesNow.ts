// Função que retorna a hora e os minutos atuais no formato 'HH:MM'.
export const getHoursAndMinutesNow = (): string => {
  const date = new Date(); // Obtém a data e hora atuais.

  // Formata as horas com dois dígitos, adicionando zero à esquerda se necessário.
  const hours = String(date.getHours()).padStart(2, '0');
  // Formata os minutos com dois dígitos, adicionando zero à esquerda se necessário.
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // Retorna a string no formato 'HH:MM'.
  return `${hours}:${minutes}`;
};
