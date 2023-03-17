// Read from console and lex it
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from 'node:process';
import {parse} from "./parser";
import {cstToString} from "./pretty_print";

const rl = readline.createInterface({input, output});

let text = "";
(async () => {
    do {
        text = await rl.question("Enter some text: ");
        const cst = parse(text);
        console.log("Parse tree: ", cstToString(cst));
    } while (text !== "");
})();
