import { Type } from './lexers';

import {
    messageErrors,
    cloneDeep,
    merge,
    getKeys
} from './helpers';

import {
    defaultData,
    validTimeUnits,
    validActions,
    validEvents,
    validInterfaceElements
} from './wordbook';

const responseParser = (code:string) => {
    var parts = code.split('=');
    const part1 = parts[0];
    const part2 = parts[1].split('.'); 

    const element = part2[0];
    const name = part2[1];
    const event = part2[2];

    var toReturn = cloneDeep(defaultData);
    /*
        EXEMPLO 1: button.amarelo.click
        part2[0] = button (element)
        part2[1] = amarelo (id)
        part2[2] = click (event)

        EXEMPLO 2: app.init
        part2[0] = app
        part2[1] = init
    */
    if(part2.length == 2){
        if( !validEvents.includes(part2[1]) )
            toReturn.errors.push(messageErrors.invalidCommand(code, part2[1]));
        else 
            toReturn.events[part2[1]].push(part1);
    } else if(part2.length == 3){
        if( !validInterfaceElements.includes(element) )
            toReturn.errors.push(messageErrors.invalidElement(code, element));
        else if ( !validEvents.includes(event) )
            toReturn.errors.push(messageErrors.invalidResponse(code, event));
        else {
            toReturn.events[event].push(`${name}:${part1}`);
            if( !toReturn.interface[element].includes(name) ){
                toReturn.interface[element].push(name);
            }
        } 
    } else 
        toReturn.errors.push(messageErrors.invalidPoints(code));
    
    if( !toReturn.responses.includes(part1) )
        toReturn.responses.push(part1);

    return toReturn;
}

const consequenceParser = (code:string) => {
    const parts = code.split('=');
    const part1 = parts[0];
    var toReturn = cloneDeep(defaultData);

    var commands = parts[1].split('|').map((cmd) => cmd.split('.'));

    toReturn.actions[part1] = [];
    
    commands.forEach((cmd) => {

        const element = cmd[0];
        const name = cmd[1];
        const action = cmd[2];

        if(cmd.length == 2){
            if( !validActions.includes(cmd[1]) )
                toReturn.errors.push(messageErrors.invalidCommand(code, cmd[1]));
            else 
                toReturn.actions[part1].push(`app:${cmd[1]}`);
        } else if(cmd.length == 3){
            if( !validActions.includes(action) ){
                toReturn.errors.push(messageErrors.invalidConsequence(code, action));
            } else {
                toReturn.actions[part1].push(`${name}:${action}`);

                if( !toReturn.interface[element].includes(name) ){
                    toReturn.interface[element].push(name);
                }
            }
        } else
            toReturn.errors.push(messageErrors.invalidPoints(code));
    });

    return toReturn;
}
/* Regexp simples que deixa passar um caso
   errado que é -5sm->
*/
const hasInterval = /-(\d+)([ms]{1,2})$/;
const hasReason = /\*(\d+)$/;
const hasMany = /\|/;

interface ContingenceType {
    input: string,
    output?: string[],
    runAfter: any
};

const contingenceParser = (code: string) => {
    let toReturn = cloneDeep(defaultData);
    let controller: ContingenceType = {
        input: '',
        output: null,
        runAfter: {
            attempts: 1,
            time: 0,
            timeUnit: null
        }
    };
    try {
        const ctg = code.split('=')[1].split(/->/);
        let R = ctg[0];
        let C = ctg[1];
        /* Tratamento da Resposta (R) */
        /* Se houver um indicador de intervalo */
        if( hasInterval.test(R) ){
            R = R.replace(hasInterval, (_, num, unit) => {
                num = Number(num);
                if( num && validTimeUnits.includes(unit) ){
                    controller.runAfter.time = num;
                    controller.runAfter.timeUnit = unit;
                } else {
                    toReturn.errors.push(
                        messageErrors.invalidContingenceInterval(code)
                    );
                }
                return "";
            });
        }
        /* Se houver um indicador de quantidade (razão) */
        if( hasReason.test(R) ){
            R = R.replace(hasReason, (_, num) => {
                num = Number(num);
                if( num )
                    controller.runAfter.attempts = num
                else {
                    toReturn.errors.push(
                        messageErrors.invalidContingenceInterval(code)
                    );
                }
                return "";
            });
        }
        /* Após ter limpado a string, sobra apenas a resposta de entrada */
        controller.input = R;

        /* Tratamento da Consequência (C) */
        /* Se houver várias consequências para essa resposta,
        transforma "C" em lista */
        let listC : string[];
        if( hasMany.test(C) )
            listC = C.split('|');
        else 
            listC = [C];

        controller.output = listC;
        toReturn.controllers.push(controller);
    } catch(e) {
        toReturn.errors.push(messageErrors.invalidContingence(code));
    }
    return toReturn;
}

const codeParser = (lines: any) => {
    var codeData = cloneDeep(defaultData);
    lines.forEach((line:any) => {
        var data;
        switch(line.type){
            case Type.Response:
                data = responseParser(line.text);
                break;
            case Type.Consequence:
                data = consequenceParser(line.text);
                break;
            case Type.Contingence:
                data = contingenceParser(line.text);
                break;
            case Type.Error:
                data = {
                    errors: codeData.errors.concat(
                        [messageErrors.inLine(line.text)]
                    )
                };
                break;
        }
        
        if( !data ){
            /* Situação não prevista pelo compilador, gera erro */
            data = {
                errors: codeData.errors.concat(
                    [messageErrors.bug(line.text)]
                )
            };
        } else {
            /* Caso saia tudo bem, faz um merge entre os dados antigos e os parseados agora */
            codeData = merge(codeData, data);    
        }
    });
    return codeData;
}

/* Verifica se existe algum elemento sendo chamado nas contingências que não existe no código */
const semanticAnalyse = (parsedCode:any) => {
    let toReturn = cloneDeep(parsedCode);
    const consequences = getKeys(toReturn.actions);
    parsedCode.controllers.forEach((obj:any) => {
        if( !toReturn.responses.includes(obj.input) )
            toReturn.errors.push(messageErrors.undefinedElement(obj.input));
        
        obj.output.forEach((outs:any) => {
            if( !consequences.includes(outs) )
                toReturn.errors.push(messageErrors.undefinedElement(obj.output));
        });
    });
    return toReturn;
}

export { codeParser, semanticAnalyse };