// Read from console and lex it
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from 'node:process';
import {parse} from "./parser";
import {interpret} from "./interpreter";
import {AbstractBoolean, AbstractNumber, AbstractTinyValue, TinyValue} from "./types";
import {abstractInterpret} from "./abstract_interpreter";
import Interval from "interval-arithmetic";

const rl = readline.createInterface({input, output});

let text = "";
(async () => {
    do {
        text = await rl.question("> ");
        const cst = parse(text);
        const sources: Record<string, TinyValue> = {
            x: 10,
            y: 20,
            b: true,
        }
        const abstractSources: Record<string, AbstractTinyValue> = {
            x: new AbstractNumber(Interval(0, 10)),
            y: new AbstractNumber(Interval(-100, 100)),
            b: new AbstractBoolean([true, false]),
        }
        console.log("Abstract: ", renderSinks(abstractInterpret(cst, abstractSources)));
        console.log("Concrete: ", renderSinks(interpret(cst, sources)));
    } while (text !== "");
})();

function renderSinks(sinks: Record<string, any>) {
    return Object.entries(sinks).map(([name, value]) => `${name}: ${value}`).join(", ");
}
