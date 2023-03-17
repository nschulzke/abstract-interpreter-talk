import { writeFileSync } from "fs"
import { resolve } from "path"
import { generateCstDts } from "chevrotain"
import { productions } from "./parser"

const dtsString = generateCstDts(productions)
const dtsPath = resolve(__dirname, "../src", "json_cst.d.ts")
writeFileSync(dtsPath, dtsString)
