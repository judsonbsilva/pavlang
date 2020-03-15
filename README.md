# PavLang

Uma DLS em javascript para auxiliar analistas do comportamento na produção de seus experimentos

## Instalação (para desenvolvedores)

A linguagem foi desenvolvida em TypeScript (TS) e JavaScript (JS), utilizando Babel (transpilador) e Jest para os testes. Os pré-requisitos para rodar a PavLang e ajudar no desenvolvimentosão:
- Node versão >= 13 
- Npm ou Yarn

### Clonando o projeto

Utilizando o git, rode o seguinte comando no terminal:

```sh
git clone REPOSITÓRIO DO GITHUB
```

Depois basta entrar no diretório, instalar as dependências e rodar os testes


```sh
cd pavlang
yarn install
yarn test
```

## Guia Básico

Para começar, declare o que são as respostas e quais são as consequências possíveis

```
# Respostas
R1 = button.botaoA.click
# Consequências
C1 = message("Você foi bem! fez ${C1.times}").show
```
Nesse código o que fizemos foi:
1. Fazer um comentário contendo o texto " Respostas" para manter o código organizado
2. Dizer que a resposta R1 é um clique no botão de nome "botaoA"
3. Comentário
4. Dizer que a consequência C1 é o aparecimento da mensagem de nome "mensagem1"



### Respostas

Uma resposta é um comportamento expresso pelo usuário em decorrência dos estímulos antecedentes ou consequentes. No nosso caso, uma resposta é expressa como a letra "R" maiúscula seguida de um número (de 1 para cima). Ela descreve alguma ação do usuário no programa, como, por exemplo, um clique no botão de nome "amarelo", como no código abaixo:
```
R1 = button.amarelo.click
```

### Consequências

As consequências, ou estímulos consequentes, são estímulos apresentados ao usuário para reforçar ou punir um determinado comportamento (identificado por meio das respostas apresentadas). A consequência, denominada pela letra "C" seguida de um número, descreve uma ação que o programa fará para estimular o usuário, como a aparição de uma mensagem na tela (identificada pelo nome "parabens1")

```
C1 = message.parabens1.show
```