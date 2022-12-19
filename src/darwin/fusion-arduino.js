
const fs = require('fs')
const process = require('process')
const { execSync, exec } = require("child_process");
const { platform } = require('os');
const path = require('path');
const exp = require('constants');
/* fusionc -c <program>.fusion */

let execution_mode
let inputfile
let outputFile

if (process.argv.length > 3) {
    packagedir = process.argv[3]
    inputfile = process.argv[4];
    let dir = packagedir;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, 0755);
    }
    outputFile = dir+'/'+inputfile.replace(".fusion",".ino")
    execution_mode = process.argv[2];
    optional_parameter = process.argv[4]
}


/* Built-in libraries */
function BuiltInLibs() {
    let res = ``
    return res;
}

/* Fusion Manpage */
function Manpage() {
    console.log("\n                   FUSION-ARDUINO (Arduino)                ")
    console.log("------------------------------------------------------------------")
    console.log("Compile to Arduino C++:   fusion-ino -o <Package> <Program>.fusion")
    console.log("------------------------------------------------------------------\n")
    console.log("Fusion-Arduino Compiler - Gabriel Margarido (Nightly - 181.4)\n\n")
}

/* Compile source-code */
function compile() {
    let regex = /[A-Za-z0-9_$++::.,@#><>=<=>===:=\[\]]+|"[^"]+"|"[^"]+"|\([^)]*\)|\[[^\]]*\]|(:)|(=)/g
    let source = fs.readFileSync(inputfile,'utf8')
   
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
                fs.appendFileSync(outputFile,'\n')
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
                vartype = vartype.replace('int','int')
                vartype = vartype.replace('float','float')
                vartype = vartype.replace('String','string')
                vartype = vartype.replace('bool','boolean')
                vartype = vartype.replace('void','void')

                //if vartype == 'Integer' or varname == 'Double' or varname == 'String' or varname == 'Boolean':
                if (vartype.includes('[]')) {
                    vartype = vartype.replace('int[]','int[]')
                    vartype = vartype.replace('float[]','float[]')
                    vartype = vartype.replace('String[]','string[]')
                    vartype = vartype.replace('bool[]','boolean[]')
                    
                    let res = `${vartype} ${varname} = {${value.slice(1,-1)}};\n`
                    //let res = `ArrayList<${vartype}> ${varname} = new ArrayList<${vartype}>(${value.slice(1,-1)});\n`
                    fs.appendFileSync(outputFile,res)
                
                } else if (vartype.includes('{}')) {
                    vartype = vartype.replace('Int{}','int[]')
                    vartype = vartype.replace('Float{}','float[]')
                    vartype = vartype.replace('String{}','string[]')
                    vartype = vartype.replace('Bool{}','boolean[]')
                    
                    let res = `${vartype} ${varname} = {${value.slice(1,-1)}};\n`
                    //let res = `ArrayList<${vartype}> ${varname} = new ArrayList<${vartype}>(${value.slice(1,-1)});\n`
                    fs.appendFileSync(outputFile,res)

                } else {
                    if (vartype == 'expression') {
                        vartype = vartype.replace('expression','float')
                        let res = `${vartype} ${varname} = ${value.slice(1,-1)};\n`
                        fs.appendFileSync(outputFile,res)
                    } else {
                        if (value == 'undefined') {
                            res = `${vartype} ${varname};\n`
                        } else {
                            if (optional_parameter != undefined) {
                                res = `${vartype} ${varname} = ${value}${optional_parameter};\n`
                            } else {
                                res = `${vartype} ${varname} = ${value};\n`
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
                let res = `${varname} = ${value};\n`
                fs.appendFileSync(outputFile,res)
            }


            // Importar modulos
            if(stack[i] == '@import') {
                let libname = stack[i+1]
                if(libname == 'fusion.std') {
                    /*fs.appendFileSync(outputFile,'import java.util.Scanner;\n')
                    fs.appendFileSync(outputFile,'import java.util.ArrayList;\n')
                    fs.appendFileSync(outputFile,'import java.util.Random;\n')
                    fs.appendFileSync(outputFile,'import java.nio.file.Files;\n')
                    fs.appendFileSync(outputFile,'import java.nio.file.Path;\n')
                    fs.appendFileSync(outputFile,'import java.nio.file.Paths;\n')
                    fs.appendFileSync(outputFile,'import java.io.IOException;\n')
                    fs.appendFileSync(outputFile,'import java.io.File;\n')
                    fs.appendFileSync(outputFile,'import java.io.FileWriter;\n\n')

                    fs.appendFileSync(outputFile,'import java.awt.*;\n')
                    fs.appendFileSync(outputFile,'import java.awt.event.*;\n')
                    fs.appendFileSync(outputFile,'import javax.swing.*;\n\n')*/
                } else {
                    if (libname.includes("./")) {
                        fs.appendFileSync(outputFile,`#include "${libname.slice(2,libname.length)}"\n`)
                    } else {
                        fs.appendFileSync(outputFile,`#include <${libname}>\n`)
                    }
                    
                    //import * as validator from "./ZipCodeValidator";
                }
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
                args = args.replace('::',' ')


                functype = stack[i+4]
                functype = functype.replace('int','int')
                functype = functype.replace('float','float')
                functype = functype.replace('String','string')
                functype = functype.replace('bool','boolean')
                functype = functype.replace('void','void')

                
                if(delim == ":") {
                    let res = `${functype} ${funcname}${args} {\n`
                    fs.appendFileSync(outputFile,res)
                } else {
                    console.log(`E01: Error at line ${line}, unknown function-type delimiter at (${funcname})!`)
                }
            }
            if (stack[i] == 'return') {
                let res = `return ${stack[i+1]};\n`
                fs.appendFileSync(outputFile,res)
            }

            /* Function call based on parenthesis
            <function> <identifier><params>
            ~= <identifier><params> */
            if(stack[i].slice(0,1) == '('
            && stack[i-1].match(/[A-Za-z0-9]/) && stack[i-2] == undefined) {
                let funcname = stack[i-1]
                let args = stack[i]

                if (stack.length > 3) {
                    let return_vartype = stack[i+2]
                    let return_varname = stack[i+3]

                    return_vartype = return_vartype.replace('int','int')
                    return_vartype = return_vartype.replace('float','float')
                    return_vartype = return_vartype.replace('String','string')
                    return_vartype = return_vartype.replace('bool','boolean')
                    return_vartype = return_vartype.replace('void','void')

                    let res = `${return_vartype} ${return_varname} = ${funcname}${args};\n`
                    fs.appendFileSync(outputFile,res)
                } else {
                    let res = `${funcname}${args};\n`
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
                expression = expression.replace("ON", "HIGH")
                expression = expression.replace("OFF", "LOW")
                
            
                if(ContainsThen == 'do') {
                    let res = `if (${expression}) {\n`
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
                expression = expression.replace("ON", "HIGH")
                expression = expression.replace("OFF", "LOW")
                

                if(ContainsThen == 'do') {
                    let res = `} else if (${expression}) {\n`
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

                let res = `while(${expression}) {\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'for') {
                let iterator = stack[i+1]
                let Min = stack[i+3].slice(0,stack[i+3].index('.'))
                let Max = stack[i+3].slice(stack[i+3].index('.')+2, stack[i+3].length)

                let res = 'for (int '+iterator+'='+Min+';'+iterator+'<'+Max+';'+iterator+'++) '+'{\n'
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'times') {
                let times = stack[i-1]
                let res = `for (int i=0; i<${times}; i++) {\n`
                fs.appendFileSync(outputFile,res)
            }

            //Interromper ciclos
            if (stack[i] == 'break') {
                let res = 'break;\n'
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'continue') {
                let res = 'continue;\n'
                fs.appendFileSync(outputFile,res)
            }

            //Type casting
            if (stack[i] == '@cast') {
                let varname = stack[i+1]
                let k_type = stack[i+3]
                let result = stack[i+4]

                k_type = k_type.replace('int','int')
                k_type = k_type.replace('float','float')
                k_type = k_type.replace('String','String')
                k_type = k_type.replace('bool','boolean')
                k_type = k_type.replace('void','void')

                let res = `${k_type} ${result} = (${k_type}) ${varname};\n`
                fs.appendFileSync(outputFile,res)
            }

            // New objects
            if(stack[i] == "@new") {
                let obj = stack[i+1]
                let classname = stack[i+3]
                let constructor_params = stack[i+4]
                let res = `${classname} ${obj}${constructor_params};\n`
                fs.appendFileSync(outputFile,res)
            }

            // Exception
            /*if (stack[i] == 'try') {
                let res = "try {\n"
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'catch') {
                let exception_type = stack[i+1]
                let res = `} catch {\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'finally') {
                let res = "} finally {\n"
                fs.appendFileSync(outputFile,res)
            }*/

            /*if (stack[i] == '@Override') {
                let res = `@Override\n`
                fs.appendFileSync(outputFile,re)
            }*/


            // Standard I/O
            if (stack[i] == 'println') {
                let res = `Serial.println(${stack[i+1]});\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'print') {
                let res = `Serial.print(${stack[i+1]});\n`
                fs.appendFileSync(outputFile,res)
            }


            /* ARDUINO FUNCTIONS */
            if (stack[i] == 'SetOutput') {
                let res = `pinMode(${stack[i+1]}, OUTPUT);\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'SetInput') {
                let res = `pinMode(${stack[i+1]}, INPUT);\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'Enable') {
                let res = `digitalWrite(${stack[i+1]}, HIGH);\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'Disable') {
                let res = `digitalWrite(${stack[i+1]}, LOW);\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'wait') {
                let res = `delay(${stack[i+1]});\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'SerialCom') {
                let res = `Serial.begin(${stack[i+1]});\n`
                fs.appendFileSync(outputFile,res)
            }



            /*if (stack[i] == 'Scanner') {
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
                    let res1 = `Scanner sc_${varname} = new Scanner(System.in);\n`
                    let res2 = `${typedef} ${varname} = sc_${varname}${ScanType};\n`

                    fs.appendFileSync(outputFile,res1)
                    fs.appendFileSync(outputFile,res2)

                } else {
                    console.log(`Error at line ${line}`)
                }                    
            }*/

        }
        //console.log(list)
    })
}

if (process.argv.length > 3) {
    if (execution_mode == "-o") {
        compile()
    } else {
        Manpage()
    }
} else {
    Manpage()
}
