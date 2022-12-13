const fs = require('fs')
const process = require('process')
const { execSync, exec } = require("child_process");
const { platform } = require('os');

/* fusionc -c <program>.fusion */

let execution_mode
let inputfile
let outputFile
let endstack = []

if (process.argv.length > 3) {
    inputfile = process.argv[3];
    outputFile = inputfile.replace(".fusion",".swift")
    execution_mode = process.argv[2];
    optional_parameter = process.argv[4]
}


/* Built-in libraries */
function BuiltInLibs() {
    let res = ``
    return res;
}
function CompileSwift() {
    compile(inputfile)
    execSync(`swiftc ${inputfile.replace('.fusion','.swift')} -o ${inputfile.replace('.fusion','')}`)
}
function TranspileSwift() {
    compile(inputfile)
}


/* Fusion Manpage */
function Manpage() {
    console.log("\n                         FUSION-SWIFT                 ")
    console.log("------------------------------------------------------------------")
    console.log("Transpile to Swift:              fusion-swift -c <program>.fusion")
    console.log("------------------------------------------------------------------")
    console.log("Compile to native machine code:  fusion-swift -o <program>.fusion")
    console.log("------------------------------------------------------------------\n")
    console.log("FusionTS Compiler - Gabriel Margarido (Nightly - 181.2)\n\n")
}

/* Compile source-code */
function compile(inputfileF) {
    let regex = /[A-Za-z0-9_$++::.,@#><>=<=>==={}:=\[\]]+|"[^"]+"|"[^"]+"|\([^)]*\)|\[[^\]]*\]|(:)|(=)/g
    let source = fs.readFileSync(inputfileF,'utf8')
   
    source.split(/\r?\n/).forEach(line =>  {
        let stack = line.match(regex)

        /**
         * @error  stack.lenght
         * @fix    stack?.length
         */
        for (let i = 0; i < stack?.length; i++) {
            process.stdout.write("{"+stack[i]+"} ")
            if (stack[i] == 'package') {
                let pkgname = stack[i+1]
                let res = `/* package ${pkgname} */\n`
                fs.writeFileSync(outputFile,res)
            }

            if (stack[i] == 'namespace') {
                // Inheritance and implementation
                if(stack[i+2] == '<' && stack[i+4] == ':') {
                    let extend = stack[i+3]
                    let implements = stack[i+5]
                    let classname = stack[i+1]
                    let res = `/* public class ${classname} extends ${extend} implements ${implements} */\n`
                    fs.appendFileSync(outputFile,res)
                }
                // Inheritance
                else if (stack[i+2] == '<') {
                    let extend = stack[i+3]
                    let classname = stack[i+1]
                    let res = `/* public class ${classname} extends ${extend} */\n`
                    fs.appendFileSync(outputFile,res)
                }
                // Procedural
                else {
                    let classname = stack[i+1]
                    let res = `/* public class ${classname} */\n`
                    fs.appendFileSync(outputFile,res)
                }
                fs.appendFileSync(outputFile, BuiltInLibs())
            }
 
            // End block - Error in namespace
            if (stack[i] == 'end') {
                fs.appendFileSync(outputFile,'}\n')
            }
            if (stack[i] == 'endnamespace') {
                fs.appendFileSync(outputFile,'main()\n')
            }

            // Comentarios
            if (stack[i] == '@com') {
                fs.appendFileSync(outputFile,'/*'+stack[i+1].slice(1,-1)+'*/\n')
            }
                

            // Declaração de variaveis e vetores
            if (stack[i] == '=') {
                let vartype = stack[i-2]
                let varname = stack[i-1]
                let value = stack[i+1]
                let optional_parameter = stack[i+2]

                //if vartype == 'Integer' or varname == 'Double' or varname == 'String' or varname == 'Boolean':
                if (vartype.includes('[]')) {
                    vartype = vartype.replace('int[]','Int')
                    vartype = vartype.replace('float[]','Float')
                    vartype = vartype.replace('String[]','String')
                    vartype = vartype.replace('bool[]','Bool')

                    let res = `var ${varname} = (${value.slice(1,-1)})\n`
                    //let res = `ArrayList<${vartype}> ${varname} = new ArrayList<${vartype}>(${value.slice(1,-1)})\n`
                    fs.appendFileSync(outputFile,res)
                    
                } else if (vartype.includes('{}')) {
                    vartype = vartype.replace('Int{}','Int')
                    vartype = vartype.replace('Float{}','Float')
                    vartype = vartype.replace('String{}','String')
                    vartype = vartype.replace('Bool{}','Bool')

                    let res = `var ${varname}: [${vartype}] = [${value.slice(1,-1)}]\n`
                    //let res = `ArrayList<${vartype}> ${varname} = new ArrayList<${vartype}>(${value.slice(1,-1)})\n`
                    fs.appendFileSync(outputFile,res)

                } else {
                    if (vartype == 'expression') {
                        vartype = vartype.replace('expression','float')
                        let res = `var ${varname}: ${vartype} = ${value.slice(1,-1)}\n`
                        fs.appendFileSync(outputFile,res)
                    } else {
                        //var res 
                        //if (optional_parameter.slice(0,1) == '(') {
                        if (optional_parameter != undefined) {
                            res = `var ${varname}: ${vartype} = ${value}${optional_parameter}\n`
                        } else {            
                            vartype = vartype.replace('int','Int')
                            vartype = vartype.replace('float','Float')
                            vartype = vartype.replace('String','String')
                            vartype = vartype.replace('bool','Bool')
                            vartype = vartype.replace('void','void')

                            if (value.slice(0,1) == '"') {
                                /* Nothing to do */
                                res = `var ${varname}: ${vartype} = ${value}\n`
                            } else {
                                value = value.replace('[','.')
                                value = value.replace(']','')    
                                res = `var ${varname}: ${vartype} = ${value}\n`
                            }
                        }
                        fs.appendFileSync(outputFile,res)
                    }
                }
            }

            // Reatribuicao de variaveis   
            if (stack[i] == ':=') {
                let varname = stack[i-1]
                let value = stack[i+1]

                if(value == 'Remove') {
                    let param = stack[i+2]
                    //let res = `${varname}.remove(at: ${param.slice(1,-1)})\n`
                    let res = 
`if let index = ${varname}.firstIndex(of: ${param}) {
    ${varname}.remove(at: index)
}\n`
                    fs.appendFileSync(outputFile,res)
                } else if(value == 'RemoveLast') {
                    let param = stack[i+2]
                    let res = `${varname}.removeLast()\n`
                    fs.appendFileSync(outputFile,res)
                
                } else if(value == 'RemoveFirst') {
                    let param = stack[i+2]
                    let res = `${varname}.removeFirst()\n`
                    fs.appendFileSync(outputFile,res)
                
                } else if(value == 'RemoveAt') {
                    let param = stack[i+2]
                    let res = `${varname}.remove(at: ${param.slice(1,-1)})\n`
                    fs.appendFileSync(outputFile,res)
                }
                else if(value == 'RemoveAll') {
                    let res = `${varname}.removeAll()\n`
                    fs.appendFileSync(outputFile,res)
                }
                else if(value == 'Append') {
                    let param = stack[i+2]
                    let res = `${varname}.append(${param.slice(1,-1)})\n`
                    fs.appendFileSync(outputFile,res)
                
                } else if(value == 'Slice') {
                    let piece = stack[i+2].replace('..','...')
                    let ret = stack[i+4]
                    let res = `var ${ret} = Array(${varname}[${piece.slice(1,-1)}])\n`
                    fs.appendFileSync(outputFile,res)
                } else {
                    let res = `${varname} = ${value}\n`
                    fs.appendFileSync(outputFile,res)    
                }
            }


            // Importar modulos
            if(stack[i] == '@import') {
                let libname = stack[i+1]
                if(libname == 'fusion.std') {
                    fs.appendFileSync(outputFile,'import Foundation\n')
                    /*fs.appendFileSync(outputFile,'import java.util.ArrayList\n')
                    fs.appendFileSync(outputFile,'import java.util.Random\n')
                    fs.appendFileSync(outputFile,'import java.nio.file.Files\n')
                    fs.appendFileSync(outputFile,'import java.nio.file.Path\n')
                    fs.appendFileSync(outputFile,'import java.nio.file.Paths\n')
                    fs.appendFileSync(outputFile,'import java.io.IOException\n')
                    fs.appendFileSync(outputFile,'import java.io.File\n')
                    fs.appendFileSync(outputFile,'import java.io.FileWriter\n\n')

                    fs.appendFileSync(outputFile,'import java.awt.*\n')
                    fs.appendFileSync(outputFile,'import java.awt.event.*\n')
                    fs.appendFileSync(outputFile,'import javax.swing.*\n\n')*/
                } else {
                    fs.appendFileSync(outputFile,`import ${libname}\n`)
                }
                    
                    //import * as validator from "./ZipCodeValidator";
            }

            if (stack[i] == 'function') {
                let funcname = stack[i+1]
                let args = stack[i+2]
                let delim = stack[i+3]

                if(funcname == 'main') {
                    args = args.replace('args','')
                }
                    

                //args = args.replace('int::','int ')
                //args = args.replace('float::','float ')
                //args = args.replace('String::','String ')
                //args = args.replace('bool::','boolean ')
                //args = args.replace('void::','void ')
                args = args.replace('::',':')


                functype = stack[i+4]
                functype = functype.replace('int','Int')
                functype = functype.replace('float','Float')
                functype = functype.replace('String','String')
                functype = functype.replace('bool','Bool')
                functype = functype.replace('void','Void')

                
                if(delim == ":") {
                    let res = `func ${funcname}${args} -> ${functype} {\n`
                    fs.appendFileSync(outputFile,res)
                } else {
                    console.log(`E01: Error at line ${line}, unknown function-type delimiter at (${funcname})!`)
                }
            }
            if (stack[i] == 'return') {
                let res = `return ${stack[i+1]}\n`
                fs.appendFileSync(outputFile,res)
            }

            if(stack[i] == 'call') {
                let funcname = stack[i+1]
                let args = stack[i+2]

                //args = args.replace('int::','int ')
                //args = args.replace('float::','float ')
                //args = args.replace('String::','String ')
                //args = args.replace('bool::','boolean ')
                //args = args.replace('void::','void ')
                args = args.replace('::',' ')

                if (stack.length > 3) {
                    let return_vartype = stack[i+4]
                    let return_varname = stack[i+5]

                    return_vartype = return_vartype.replace('int','Int')
                    return_vartype = return_vartype.replace('float','Float')
                    return_vartype = return_vartype.replace('String','String')
                    return_vartype = return_vartype.replace('bool','Bool')
                    return_vartype = return_vartype.replace('void','Void')

                    let res = `var ${return_varname} : ${return_vartype} = ${funcname}${args}\n`
                    fs.appendFileSync(outputFile,res)
                } else {
                    let res = `${funcname}${args}\n`
                    fs.appendFileSync(outputFile,res)
                    //console.log(`E01: Error, unknown function-type delimiter at function call (${funcname})!`)    
                }
            }


            // Condicionais
            if (stack[i] == 'if') {
                let expression = stack[i+1]
                let ContainsThen = stack[i+2]

                // Novos operadores
                expression = expression.replace(" is "," == ")
                expression = expression.replace(" isnot "," != ")
                expression = expression.replace(" not "," !")
                expression = expression.replace(" or "," || ")
                expression = expression.replace(" and "," && ")
                
            
                if(ContainsThen == 'do') {
                    let res = `if ${expression} {\n`
                    fs.appendFileSync(outputFile,res)
                } else {
                    console.log(`E02: Error at line ${line}. Expected (do) after (${expression})!`)
                }
                
            }

            if(stack[i] == 'elseif') {
                let expression = stack[i+1]
                let ContainsThen = stack[i+2]
                

                // Novos operadores
                expression = expression.replace(" is "," == ")
                expression = expression.replace(" isnot "," != ")
                expression = expression.replace(" not "," !")
                expression = expression.replace(" or "," || ")
                expression = expression.replace(" and "," && ")


                if(ContainsThen == 'do') {
                    let res = `} else if ${expression} {\n`
                    fs.appendFileSync(outputFile,res)
                } else {
                    console.log(`E03: Error expected (do) after (${expression})!`)
                }
            }
            if (stack[i] == 'else') {
                let res = `} else {\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'while') {
                let expression = stack[i+1]

                // Novos operadores
                expression = expression.replace(" is "," == ")
                expression = expression.replace(" isnot "," != ")
                expression = expression.replace(" not "," !")
                expression = expression.replace(" or "," || ")
                expression = expression.replace(" and "," && ")

                let res = `while ${expression} {\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'for') {
                let iterator = stack[i+1]
                //let Min = stack[i+3].slice(0,stack[i+3].index('.'))
                //let Max = stack[i+3].slice(stack[i+3].index('.')+2, stack[i+3].length)
                let statement = stack[i+3]
                let res
                if (statement.includes('..')) {
                    statement = statement.replace('..','...')
                    res = `for ${iterator} in ${statement} `+'{\n'
                } else {
                    res = `for ${iterator} in ${statement}`+'{\n'
                }
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'times') {
                let times = stack[i-1]
                let res = `for i in 0...${times} {\n`
                fs.appendFileSync(outputFile,res)
            }

            //Interromper ciclos
            if (stack[i] == 'break') {
                let res = 'break\n'
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'continue') {
                let res = 'continue\n'
                fs.appendFileSync(outputFile,res)
            }

            //Type casting
            if (stack[i] == '@cast') {
                let varname = stack[i+1]
                let k_type = stack[i+3]
                let result = stack[i+4]

                k_type = k_type.replace('int','Int')
                k_type = k_type.replace('float','Float')
                k_type = k_type.replace('String','String')
                k_type = k_type.replace('bool','Bool')
                k_type = k_type.replace('void','Void')

                let res = `${k_type} ${result} = ${k_type}(${varname})\n`
                fs.appendFileSync(outputFile,res)
            }

            // New objects
            if(stack[i] == "@new") {
                let obj = stack[i+1]
                let classname = stack[i+3]
                let constructor_params = stack[i+4]
                let res = `var ${obj} = ${classname}${constructor_params}\n`
                fs.appendFileSync(outputFile,res)
            }

            // Exception
            if (stack[i] == 'try') {
                let res = "try {\n"
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'catch') {
                let exception_type = stack[i+1]
                let res = `} catch${exception_type} {\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'finally') {
                let res = "} finally {\n"
                fs.appendFileSync(outputFile,res)
            }

            if (stack[i] == '@Override') {
                let res = `@Override\n`
                fs.appendFileSync(outputFile,re)
            }


            // Standard I/O
            if (stack[i] == 'println') {
                let res = `print(${stack[i+1]})\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'print') {
                let res = `print(${stack[i+1]}, terminator: "")\n`
                fs.appendFileSync(outputFile,res)
            }

            if (stack[i] == 'Scanner') {
                let typedef = stack[i+2]
                let varname = stack[i+3]
                let ScanType = ''

                if (typedef == 'int') {
                    ScanType = '.nextInt()'   
                
                } else if (typedef == 'float') {
                    ScanType = '.nextFloat()'

                } else if (typedef == 'String') {
                    ScanType = '.nextLine()'
               
                } else if (typedef == 'bool') {
                    ScanType = '.nextBoolean()'
                }

                typedef = typedef.replace('int','int')
                typedef = typedef.replace('float','float')
                typedef = typedef.replace('String','String')
                typedef = typedef.replace('bool','boolean')
                typedef = typedef.replace('void','void')

                if (stack[i+1] == ':') {
                    //let res1 = `Scanner sc_${varname} = new Scanner(System.in)\n`
                    //let res2 = `${typedef} ${varname} = sc_${varname}${ScanType}\n`
                    let res1 = `var ${varname} = readLine()\n`
                    fs.appendFileSync(outputFile,res1)

                } else {
                    console.log(`Error at line ${line}`)
                }                    
            }
        //console.log(list)
        }
    })
}

if (process.argv.length > 3) {
    if (execution_mode == "-o") {
        CompileSwift()
    } else if (execution_mode == "-c") {
        TranspileSwift()
    } else {
        Manpage()
    }
} else {
    Manpage()
}
