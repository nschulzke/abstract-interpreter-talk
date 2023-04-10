import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from 'node:process';
import {parse} from "./parser/parser";
import {interpret, TinyValue} from "./visitors/interpreter";
import {readFile} from "fs/promises";

const sources: Record<string, TinyValue> = {
    x: 10,
    y: 20,
    b: true,
};

(async () => {
    const filename = process.argv[2];
    if (filename) {
        const input = await readFile(filename, "utf-8");
        console.log(interpret(input, sources));
    } else {
        const rl = readline.createInterface({input, output});
        let text = "";
        do {
            text = await rl.question("> ");
            console.log(interpret(text, sources));
        } while (text !== "");
    }
})();
