# Tech Talk: Visitors, Interpreters, Abstract Interpreters

## Syntax Trees

[Driver](./src/main_stringify.ts)

[Input File](./input.clite)

```sh
nvm use
npm run stringify input.clite
```

[Ouptut Image](./output.png)

[Output JSON](./output.json)

## Visitors

[Driver](./src/main_printer.ts)

[Input File](./input.clite)

```sh
nvm use
npm run printer input.clite
```

[Printer Visitor](./src/visitors/pretty_print.ts)

[Graph Visitor](./src/visitors/graphviz.ts)


## Interpreters

[Driver](./src/main_concrete.ts)

[Input File](./input.clite)

```sh
nvm use
npm run concrete input.clite
```

[Interpreter](./src/visitors/interpreter.ts) 

## Abstract Interpreters

[Driver](./src/main_abstract.ts)

[Input File](./input.clite)

```sh
nvm use
npm run abstract input.clite
```

[Abstract Interpreter](./src/visitors/abstract_interpreter.ts)
