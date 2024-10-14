// Função que transforma um objeto, removendo a palavra "Level" no final de cada chave.
export function transformObject(originalObject: any) {
  // Converte o objeto original em um array de pares [chave, valor].
  let entriesArray = Object.entries(originalObject);
  // Cria um novo objeto vazio que será preenchido com as novas chaves e valores.
  let newObject: any = {};

  // Itera sobre cada par [chave, valor] no array de entradas.
  entriesArray.forEach(([key, value]) => {
      // Atribui a chave original à variável nameLevel.
      let nameLevel: string = key;
      // Adiciona o par chave-valor ao novo objeto. Atualmente, a chave não está sendo modificada.
      newObject[nameLevel] = value;
  });

  // Retorna o novo objeto, que neste momento tem as mesmas chaves e valores que o original.
  return newObject;
}
