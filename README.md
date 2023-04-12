# Tech Talk: Visitors, Interpreters, Abstract Interpreters

## Syntax Trees

```sh
nvm use
npm run stringify input.clite
```

[Input File](./input.clite)

[Ouptut Image](./output.png)

[Output JSON](./output.json)

## Visitors

```sh
nvm use
npm run printer input.clite
```

[Input File](./input.clite)

[Printer Visitor](./src/visitors/pretty_print.ts)


## Interpreters

```sh
nvm use
npm run concrete input.clite
```

[Input File](./input.clite)

[Interpreter](./src/visitors/interpreter.ts)

## Abstract Interpreters

```sh
nvm use
npm run abstract input.clite
```

[Input File](./input.clite)

[Abstract Interpreter](./src/visitors/abstract_interpreter.ts)
