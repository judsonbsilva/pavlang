import { messageErrors, convertTime, cloneDeep } from './helpers';
import { DataType, validAppCmds } from './wordbook';
import { codeParser, semanticAnalyse } from './parsers';

/*  Função que retorna uma máquina de estados
    para lidar com os input (respostas) e outputs
*/

/* Estado padrão da máquina */
interface StateType {
    initialized: boolean,
    counters: object,
    intervals: object,
    variables: object,
    timer: number,
    elapsed: number,
    history: object[]
};

const defaultState: StateType = {
    initialized: false,
    counters: {},
    intervals: {},
    variables: {},
    timer: -1,
    elapsed: 0,
    history: []
};

const createMachine = (data: DataType, interval = 200) => {

    if(data.errors.length > 0){
        return function(){
            return {
                error: messageErrors.codeError(data.errors),
                run: false,
                data
            }
        };
    }
    
    var state = cloneDeep(defaultState);
    var validInputs = validAppCmds.concat(data.responses);

    state.timer = setInterval(() => {
        if( !state.initialized ) return;

        for(let key in state.intervals){
            if(key){
                state.intervals[key] += -interval;
                if(state.intervals[key] < 0)
                    state.intervals[key] = 0; 
            }
        }
        state.elapsed = Date.now() - state.history[0].at;
    }, interval);

    const machine = function(input: string){

        let toReturn:any = {
            /* Se tiver algum erro, retorna */
            error: '',
            /* Se houver alguma consequência, retorna */
            run: false,
            /* Tempo decorrido desde o início */
            elapsed: state.elapsed,
            /* Hora atual */
            at: Date.now(),
            /* Histórico de ações */
            history: null
        };

        /* Caso a entrada seja nula, ou não seja string nem objeto */
        if( !validInputs.includes(input) ){
            toReturn.error = messageErrors.invalidInput(input.toString());
            return toReturn;
        }


        /* Roda comandos específicos (RUN, RESET, FINISH) */
        switch(input){
            case 'INIT':
                /* Se já tiver sido iniciado dá erro */
                if( !state.initialized )
                    state.initialized = true;
                else {
                    toReturn.error = messageErrors.alreadyStarted();
                    return toReturn;
                }

                data.controllers.forEach( (ctrl:any) => {
                    state.counters[ctrl.input] = 0;
                    if( ctrl.runAfter.time ){
                        state.intervals[ctrl.input] = convertTime(
                            ctrl.runAfter.time, ctrl.runAfter.unit
                        );
                    }
                });

                toReturn.run = 'INIT';
                state.history.push(cloneDeep(toReturn));
                return toReturn;
            case 'RESET':
                /* Falta fazer */
                toReturn.error = 'BUG';
                return toReturn;
                break;
            case 'FINISH':
                if( state.initialized ){
                    toReturn.run = 'FINISH';
                    state.history.push(cloneDeep(toReturn));
                    toReturn.history = state.history;
                    clearInterval(state.timer);
                    return toReturn;
                } else {
                    toReturn.error = messageErrors.notAlreadyStarted();
                    return toReturn;
                }
            break;
        }

        if( !state.initialized ){
            toReturn.error = messageErrors.notAlreadyStarted();
            return toReturn;
        }
        /* Aqui pode acontecer um super bug bizzaro
           quando uma resposta (R1) for usada em 
           duas contingências diferentes
        */
        state.counters[input] += 1;
        let consequence: string[] = [];
        data.controllers.forEach( (ctrl:any) => {
            if(ctrl.input == input){
                if( ctrl.runAfter.attempts == 1 )
                    consequence = ctrl.output;
                else if(
                    ctrl.runAfter.attemprs > 1 && 
                    state.counters[input] == ctrl.runAfter.attempts
                ){
                    state.counters[input] = 0;
                    consequence = ctrl.output;
                }
            }
            toReturn.run = consequence;
        });

        if( consequence.length > 0 )
            state.history.push(cloneDeep(toReturn));
        
        return toReturn;
    }

    machine.state = state;
    return machine;
};

const interpreter = (code: string) => {
    const parsedCode = codeParser(code);
    const data = semanticAnalyse(parsedCode);
    return createMachine(data);
};

export { createMachine, interpreter }