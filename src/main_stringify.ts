import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from 'node:process';
import {parseLight} from "./parser/parser";
import {cstToString} from "./visitors/pretty_print";
import {readFile, writeFile} from "fs/promises";
import {outputCstImage} from "./visitors/graphviz";


(async () => {
    const filename = process.argv[2];
    if (filename) {
        const input = await readFile(filename, "utf-8");
        console.log(input);
        const cst = parseLight(input);
        await writeFile("output.json", JSON.stringify(cst, null, 2));
        await outputCstImage("output.png", cst);
        console.log("Output written to output.json and output.png")
    } else {
        const rl = readline.createInterface({input, output});
        let text = "";
        do {
            text = await rl.question("> ");
            const cst = parseLight(text);
            await writeFile("output.json", JSON.stringify(cst, null, 2));
            await outputCstImage("output.png", cst);
            console.log("Output written to output.json and output.png")
        } while (text !== "");
    }
})();
