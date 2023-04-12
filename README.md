# Tech Talk: Visitors, Interpreters, Abstract Interpreters

## Syntax Trees

[Driver](./src/main_stringify.ts)

```sh
nvm use
npm run stringify input.clite
```

[Input File](./input.clite)

[Ouptut Image](./output.png)

[Output JSON](./output.json)

## Visitors

[Driver](./src/main_printer.ts)

```sh
nvm use
npm run printer input.clite
```

[Input File](./input.clite)

[Printer Visitor](./src/visitors/pretty_print.ts)

[Graph Visitor](./src/visitors/graphviz.ts)


## Interpreters

[Driver](./src/main_concrete.ts)

```sh
nvm use
npm run concrete input.clite
```

[Input File](./input.clite)

[Interpreter](./src/visitors/interpreter.ts) 

## Abstract Interpreters

[Driver](./src/main_abstract.ts)

```sh
nvm use
npm run abstract input.clite
```

[Input File](./input.clite)

[Abstract Interpreter](./src/visitors/abstract_interpreter.ts)
