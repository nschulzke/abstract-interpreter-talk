// Read from console and lex it
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from 'node:process';
import {parse} from "./parser";
import {interpret, TinyValue} from "./interpreter";

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
        console.log(interpret(cst, sources));
    } while (text !== "");
})();
