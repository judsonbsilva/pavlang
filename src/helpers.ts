const getKeys = (obj: object) => {
  let list = [];
  for(let key in obj)
    if(key)
      list.push(key);
  return list;
}

const isObj = (x:any) => {
  return x && x.constructor == Object;
}

const isStr = (x:any) => {
  return x && x.constructor == String;
}

const isArr = (x:any) => {
  return x && x.constructor == Array;
}

const cloneDeep = (obj: object) => JSON.parse(JSON.stringify(obj));

/* Função para mergear os dados antigos e os novos do codeParser */
const merge = (objA: any, objB: any, isNotUnion?: boolean) => {
  /* Se um dos objetos for inválido retorna o outro */
  if( !objA && !objB ) return null;
  if( !objA ) return objB;
  if( !objB ) return objA;
  
  if( isObj(objA) && isObj(objB) ){
    var newObj = {};
    var keysA = getKeys(objA);
    var keysB = getKeys(objB);
    
    keysA.forEach((key) => {
      newObj[key] = merge(objA[key], objB[key], isNotUnion);
    });
    
    keysB.forEach((key) => {
      if( !keysA.includes(key) ){
        newObj[key] = merge(objA[key], objB[key], isNotUnion);
      }
    });
    
    return newObj;
    
    /* Se for lista faz uma união ou concatena */
  } else if( isArr(objA) && isArr(objB) ){
    let newArr;
    if(isNotUnion ){
      newArr = objA.concat(objB);
    } else {
      newArr = [...objA];
      objB.forEach((x) => {
        if(!newArr.includes(x))
          newArr.push(x)
      });
    }
    return newArr;
  }
  
  return objB;
}


/*
 Mensagens de erro para cada tipo de erro
 */

const messageErrors = {
  inLine: (error: string) => `Erro na linha ${error}`,

  invalidCommand: (line: string, cmd:string) => `Sintaxe incorreta: ${line}
Comando "${cmd}" não identificado.`,
  invalidElement: (line:string, element:string) => `Sintaxe incorreta: ${line}
Elemento "${element}" inválido.`,
  invalidResponse: (line:string, resp:string) => `Sintaxe incorreta: ${line}
Resposta "${resp}" inválida.`,
  invalidConsequence: (line:string, resp:string) => `Sintaxe incorreta: ${line}
Consequência "${resp}" inválida.`,
  invalidPoints: (line:string) => `Sintaxe incorreta: ${line}
A quantidade de pontos parece incorreta.`,
  invalidContingence: (line:string) => `Sintaxe incorreta: ${line}
Contingência "${line}" inválida.`,
  invalidContingenceInterval: (line:string) => `Sintaxe incorreta: ${line}
Intervalo de contingência inválido: "${line}"`,

  undefinedElement: (el:string) => `Erro semântico, o elemento "${el}" não existe`,

  invalidInput: (input:string) => `Entrada inválida ${input}`,

  codeError: (errors:[string]) => `Erro no código:
  ${errors.join('\n')}`,

  alreadyStarted: () => `O app já foi iniciado`,
  notAlreadyStarted: () => `O app não foi iniciado`,

  bug: (line:string) => `Erro catastrófico! ${line}`,
  
};

const convertTime = (time:number, unit:string) => {
  switch(unit){
    case 'ms': return time;
    case 's': return time * 1000;
    case 'm': return time * 60000;
  }
}


export { isObj, isStr, isArr, merge, cloneDeep, messageErrors, getKeys, convertTime }