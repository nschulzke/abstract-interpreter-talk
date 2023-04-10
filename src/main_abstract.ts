import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from 'node:process';
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
        console.log(abstractInterpret(input, sources));
    } else {
        const rl = readline.createInterface({input, output});
        let text = "";
        do {
            text = await rl.question("> ");
            console.log(abstractInterpret(text, sources));
        } while (text !== "");
    }
})();
