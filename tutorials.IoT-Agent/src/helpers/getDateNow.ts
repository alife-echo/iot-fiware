// Função que retorna a data atual no formato 'DD/MM/YY'.
export const getDateNow = (): string => {
  const date = new Date(); // Obtém a data e hora atuais.

  // Formata o dia com dois dígitos, adicionando zero à esquerda se necessário.
  const day = String(date.getDate()).padStart(2, '0');
  // Formata o mês com dois dígitos, adicionando zero à esquerda. O mês começa em 0, por isso o "+1".
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  // Pega os últimos dois dígitos do ano (YY).
  const year = String(date.getFullYear()).slice(-2);

  // Retorna a data no formato 'DD/MM/YY'.
  return `${day}/${month}/${year}`;
};
