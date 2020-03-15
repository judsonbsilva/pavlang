// Tipos de declaração e mensagens
enum Type {
    Response, Contingence, Consequence, Condition, Error
}

// Retira quebras de linhas, espaços e comentários
const cleanCode = (code: string) => code.replace(/\#.+\n/g, "\n").replace(/ +/g, "").replace(/\n{2,}/g, "\n");
// Quebra o código pelas linhas e exclui as linhas vazias
const splitCode = (code: string) => code.split(/\n/g).filter((n) => n);

// Retorna o tipo de cada linha (RESPONSE, CONTINGENCE, CONSEQUENCE, CONDITION, ERROR)
const lineTokenizer = (line:string, index:number) => {
    let toReturn = { text: line, type: Type.Error };

    if( /^R\d+=/.test(line) )
        toReturn.type = Type.Response;
    else if( /^C\d+=/.test(line) )
        toReturn.type = Type.Consequence;
    else if( /^&\d+=/.test(line) )
        toReturn.type = Type.Contingence;
    else if( /^@\d+=/.test(line) )
        toReturn.type = Type.Condition;
    
    return toReturn; 
};
// Define os tipos de cada linha
const tokenizer = (lines:string[]) => lines.map((line, index) => lineTokenizer(line, index));

const tokenize = (code:string) => tokenizer(splitCode(cleanCode(code)));

export { Type, tokenize, cleanCode, splitCode, lineTokenizer, tokenizer }