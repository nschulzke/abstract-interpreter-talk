import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from 'node:process';
import {parse} from "./parser/parser";
import {cstToString} from "./visitors/pretty_print";
import {readFile} from "fs/promises";


(async () => {
    const filename = process.argv[2];
    if (filename) {
        const input = await readFile(filename, "utf-8");
        const cst = parse(input);
        console.log(cstToString(cst));
    } else {
        const rl = readline.createInterface({input, output});
        let text = "";
        do {
            text = await rl.question("> ");
            const cst = parse(text);
            console.log(cstToString(cst));
        } while (text !== "");
    }
})();
