import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from 'node:process';
import {parse} from "./parser/parser";
import {abstractInterpret, AbstractTinyValue, AbstractBoolean, AbstractNumber} from "./visitors/abstract_interpreter";
import Interval from "interval-arithmetic";
import {readFile} from "fs/promises";

const sources: Record<string, AbstractTinyValue> = {
    x: new AbstractNumber(Interval(0, 10)),
    y: new AbstractNumber(Interval(-100, 100)),
    b: new AbstractBoolean([true, false]),
};

(async () => {
    const filename = process.argv[2];
    if (filename) {
        const input = await readFile(filename, "utf-8");
        const cst = parse(input);
        console.log(abstractInterpret(cst, sources));
    } else {
        const rl = readline.createInterface({input, output});
        let text = "";
        do {
            text = await rl.question("> ");
            const cst = parse(text);
            console.log(abstractInterpret(cst, sources));
        } while (text !== "");
    }
})();
