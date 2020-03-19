/* Elementos válidos */
const validInterfaceElements = [ 'screen', 'button', 'message', 'app', 'counter' ];
const validActions = ['show', 'enable', 'disable', 'hide', 'reset', 'finish'];
const validEvents = ['click', 'init', 'finish'];
const validTimeUnits = ['s', 'm', 'ms'];
const validAppCmds = ['INIT', 'RESET','FINISH'];

/*
 Conjunto padrão com todos os dados da aplicação, cuidado ao alterar
 */

interface DataType {
    events: object,
    interface: object,
    actions: object,
    errors: string[],
    controllers: object[],
    responses: string[]
};

const defaultData:DataType = {
    events:{ init:[], finish: [], click:[] },
    interface: { button:[], message:[], counter:[], screen: [] },
    actions: {},
    errors: [],
    controllers: [],
    responses: []
};

export {
    DataType,
    defaultData,
    validActions,
    validEvents,
    validTimeUnits,
    validInterfaceElements,
    validAppCmds
}