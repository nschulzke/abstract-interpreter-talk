import { writeFileSync } from "fs"
import { resolve } from "path"
import { generateCstDts } from "chevrotain"
import { productions } from "../parser/parser"

const dtsString = generateCstDts(productions)
const dtsPath = resolve(__dirname, "../ast.d.ts")
writeFileSync(dtsPath, dtsString)
