const lexers = require('../src/lexers');
const parsers = require('../src/parsers');
const helpers = require('../src/helpers');
const wordbook = require('../src/wordbook');
const pavlang = require('../src/interpreter');

test('pre-processing - clean code', () => {
    
    const text1 = `   
    #Respostas
    R1 =    button.amarelo.click
    R2 =    button.a666.click
    R3 =  app.init


    asdfasdfada adf afad
    `;

    const expectedResult1 = `
R1=button.amarelo.click
R2=button.a666.click
R3=app.init
asdfasdfadaadfafad
`;
    expect(lexers.cleanCode(text1)).toBe(expectedResult1);
    
    const text2 = `#Xablau
    R1 = button.blue2.click`;
    const expectedResult2 = `
R1=button.blue2.click`;

    expect(lexers.cleanCode(text2)).toBe(expectedResult2);
});

test('pre-processing - split code', () => {
    
    const text = lexers.cleanCode(`
    #Respostas
    R1 =    button.amarelo.click
    R2 =    button.a666.click
    R3 =  app.init


    asdfasdfada adf afad
    `);

    const expectedResult = (`R1=button.amarelo.click
R2=button.a666.click
R3=app.init
asdfasdfadaadfafad`).split(/\n/g);

    expect(lexers.splitCode(text)).toEqual(expectedResult); 
});

test('lexers - tokenizer', () => {
    
    const text = lexers.splitCode(lexers.cleanCode(`
        #Respostas
        R1 =    button.amarelo.click
        C1 =    message.a666.show
        &1 =  R1*4 -> C1
        asdfasdfada adf afad
        @1 = &1*4 -> app.finish
    `));

    const expectedResult = [
        { text: 'R1=button.amarelo.click', type: lexers.Type.Response },
        { text: 'C1=message.a666.show', type: lexers.Type.Consequence },
        { text: '&1=R1*4->C1', type: lexers.Type.Contingence },
        { text: 'asdfasdfadaadfafad', type: lexers.Type.Error },
        { text: '@1=&1*4->app.finish', type: lexers.Type.Condition }
    ];

    expect(lexers.tokenizer(text)).toEqual(expectedResult); 
});

test('lexers - all', () => {
    const text = `
        #Respostas
        R1 =    button.amarelo.click
        C1 =    message.a666.show
        &1 =  R1*4 -> C1
        asdfasdfada adf afad
        @1 = &1*4 -> app.finish
    `;

    const expectedResult = [
        { text: 'R1=button.amarelo.click', type: lexers.Type.Response },
        { text: 'C1=message.a666.show', type: lexers.Type.Consequence },
        { text: '&1=R1*4->C1', type: lexers.Type.Contingence },
        { text: 'asdfasdfadaadfafad', type: lexers.Type.Error },
        { text: '@1=&1*4->app.finish', type: lexers.Type.Condition }
    ];

    expect(lexers.tokenize(text)).toEqual(expectedResult);
});

test('helpers - clone deep', () => {
    const objA = { a: [1,2,3], b: true, c: 'la la la' };
    const objB = helpers.cloneDeep(objA);

    expect(objA).toEqual(objB);
    expect(objA).not.toBe(objB);
});

test('helpers - merge', () => {
    let objA = helpers.cloneDeep(wordbook.defaultData);
    objA.actions['C1'] = ['bxxx:show'];
    objA.errors.push(helpers.messageErrors.inLine('CREDO'));

    let objB = helpers.cloneDeep(wordbook.defaultData);
    objB.actions['C1'] = ['a666:show'];
    objB.actions['C2'] = ['xablau:hide'];
    objB.interface.button.push('botaoA');

    const result = helpers.merge(objA, objB);

    expect(result).toHaveProperty('actions.C1', ['bxxx:show', 'a666:show']);
    expect(result).toHaveProperty('actions.C2', ['xablau:hide']);
    expect(result).toHaveProperty('interface.button', ['botaoA']);
});

test('parsers - response', () => {
    
    const code = lexers.tokenize(`
        #Respostas
        R1 = button.amarelo.click
        R2 = button.a666.click
        R3 = message.bxxx.click

        asdfasdfada adf afad
    `);

    const result = parsers.codeParser(code);

    expect(result).toHaveProperty('events.click', ['amarelo:R1', 'a666:R2', 'bxxx:R3']);
    expect(result).toHaveProperty('interface.button', ['amarelo', 'a666']);
    expect(result).toHaveProperty('interface.message', ['bxxx']);    
    expect(result).toHaveProperty('errors', [
        helpers.messageErrors.inLine('asdfasdfadaadfafad')
    ]);
    expect(result.responses).toContain('R1');
    expect(result.responses).toContain('R2');
    expect(result.responses).toContain('R3');
});

test('parsers - consequence', () => {
    
    const code = lexers.tokenize(`
        #Respostas
        R1 = button.amarelo.click
        R2 = button.a666.click
        
        #Consequências
        C1 = message.b245.show
        C2 = app.reset
        
        #Contingências
        &1 = R1 * 4 -> C1
        &2 = R2 -5s-> C2
        
        #Condições
        @1 = &1*4 -> app.finish
        
        asdfasdfada adf afad
    `);

    const result = parsers.codeParser(code);
    
    expect(result).toHaveProperty('actions.C1', ['b245:show']);
    expect(result).toHaveProperty('actions.C2', ['app:reset']);
    expect(result).toHaveProperty('interface.button', ['amarelo', 'a666']);
    expect(result).toHaveProperty('interface.message', ['b245']);    
    expect(result).toHaveProperty('errors', [
        helpers.messageErrors.inLine('asdfasdfadaadfafad')
    ]); 
});

test('parsers - simple contingence', () => {
    
    const code = lexers.tokenize(`
        #Respostas
        R1 = button.amarelo.click

        #Consequências
        C1 = message.b245.show
        
        #Contingências
        &1 = R1 -> C1
    `);

    const result = parsers.codeParser(code);
    
    expect(result).toHaveProperty('actions.C1', ['b245:show']);
    expect(result).toHaveProperty('interface.button', ['amarelo']);
    expect(result).toHaveProperty('interface.message', ['b245']);
    expect(result.controllers).toContainEqual({
        input: 'R1',
        output: ['C1'],
        runAfter: {
            attempts: 1,
            time: 0,
            timeUnit: null
        }
    });

});

test('parsers - contingence with fixed reason and interval', () => {
    
    const code = lexers.tokenize(`
        #Respostas
        R1 = button.amarelo.click
        R2 = button.verde.click

        #Consequências
        C1 = message.b245.show
        C2 = message.hellooo123.show
        
        #Contingências
        &1 = R1*5 -> C1
        &2 = R2 -5s-> C2 
    `);

    const result = parsers.codeParser(code);
    
    expect(result.controllers).toContainEqual({
        input: 'R1',
        output: ['C1'],
        runAfter: {
            attempts: 5,
            time: 0,
            timeUnit: null
        }
    });

    expect(result.controllers).toContainEqual({
        input: 'R2',
        output: ['C2'],
        runAfter: {
            attempts: 1,
            time: 5,
            timeUnit: 's'
        }
    });

});


test('parsers - semantic analysis', () => {
    const code = lexers.tokenize(`
        #Respostas
        R1 = button.amarelo.click
        R2 = button.verde.click

        #Consequências
        C1 = message.b245.show
        C2 = message.hellooo123.show
        
        #Contingências
        &1 = R3*5 -> C5
        &2 = R2 -5s-> C2 
    `);

    const data = parsers.codeParser(code);
    const result = parsers.semanticAnalyse(data);

    expect(result.errors).toContain(
        helpers.messageErrors.undefinedElement('R3')
    );

    expect(result.errors).toContain(
        helpers.messageErrors.undefinedElement('C5')
    );
});

test('interpreter - simple', () => {
    
    const code = lexers.tokenize(`
        #Respostas
        R1 = button.amarelo.click

        #Consequências
        C1 = message.b245.show
        
        #Contingências
        &1 = R1 -> C1
    `);

    const data = parsers.codeParser(code);
    const resultData = parsers.semanticAnalyse(data);
    const myMachine = pavlang.createMachine(resultData);

    expect(myMachine('R1'))
        .toHaveProperty('error', helpers.messageErrors.notAlreadyStarted());
    
    expect(myMachine('INIT')).toMatchObject({
        error: null,
        run: 'INIT'
    });

    expect(myMachine('R2'))
        .toHaveProperty('error', helpers.messageErrors.invalidInput('R2'));

    setTimeout(() => {
        const resultR1 = myMachine('R1');

        expect(resultR1).toMatchObject({
            error: null,
            run: [ 'C1' ]
        });

        expect(resultR1.elapsed).toBeGreaterThanOrEqual(400);
        
        const finishResult = myMachine('FINISH');

        expect(finishResult).toMatchObject({
            error: null,
            run: 'FINISH'
        });

        expect(finishResult.history).toHaveLength(3);

    }, 500);
});