
const fs = require('fs')
const process = require('process')
const { execSync, exec } = require("child_process");
const { platform } = require('os');

/* fusionc -c <program>.fusion */

let execution_mode
let inputfile
let outputFile
const FUSION_JAR_EXTENSION = '.fuse'

if (process.argv.length > 3) {
    inputfile = process.argv[3];
    outputFile = inputfile.replace(".fusion",".java")
    execution_mode = process.argv[2];
    optional_parameter = process.argv[4]
}


/* Built-in libraries */
function BuiltInLibs() {
    let res = `
    /* Append table */
    public static void AppendInt(ArrayList<Integer> lista, int elemento) {
        lista.add(elemento);
    }
    public static void AppendFloat(ArrayList<Float> lista, float elemento) {
        lista.add(elemento);
    }
    public static void AppendString(ArrayList<String> lista, String elemento) {
        lista.add(elemento);
    }
    public static void AppendBool(ArrayList<Boolean> lista, Boolean elemento) {
        lista.add(elemento);
    }


    /* Remove from table */
    public static void RemoveInt(ArrayList<Integer> lista, int elemento) {
        lista.remove(elemento);
    }
    public static void RemoveFloat(ArrayList<Float> lista, float elemento) {
        lista.remove(elemento);
    }
    public static void RemoveString(ArrayList<String> lista, String elemento) {
        lista.remove(elemento);
    }
    public static void RemoveBool(ArrayList<Boolean> lista, Boolean elemento) {
        lista.remove(elemento);
    }


    /* Table size */
    public static int TableLenInt(ArrayList<Integer> lista) {
        return lista.size();
    }
    public static int TableLenFloat(ArrayList<Float> lista) {
        return lista.size();
    }
    public static int TableLenString(ArrayList<String> lista) {
        return lista.size();
    }
    public static int TableLenBool(ArrayList<Boolean> lista) {
        return lista.size();
    }


    /* New functionalities */
    public static int TableGetInt(ArrayList<Integer> lista, int index) {
        return lista.get(index);
    }
    public static float TableGetFloat(ArrayList<Float> lista, int index) {
        return lista.get(index);
    }
    public static String TableGetString(ArrayList<String> lista, int index) {
        return lista.get(index);
    }



    /* File handling */
    public static void WriteFile(String fileName, String msg) {
        try {
            File __FileCreatorFM = new File(fileName);
            __FileCreatorFM.createNewFile();
            try {
                FileWriter __FileWriter = new FileWriter(fileName);
                __FileWriter.write(msg);
                __FileWriter.flush();
                __FileWriter.close();
              } catch (IOException e) {
                System.out.println("Error occurred during file writing.");
                e.printStackTrace();
              }

        } catch (IOException e) {
            System.out.println("Error occurred during file creation.");
            e.printStackTrace();
        }
    }
    public static void AppendFile(String fileName, String msg) {
        try {
            FileWriter __FileWriter = new FileWriter(fileName);
            __FileWriter.append(msg);
            __FileWriter.flush();
            __FileWriter.close();
        } catch (IOException e) {
            System.out.println("Error occurred during file appending.");
            e.printStackTrace();
        }
    }

    public static String ReadFile(String filename) throws IOException {
        Path filepath = Paths.get(filename);
        byte[] text = Files.readAllBytes(filepath);
        String el = new String(text);
        return el;
    }
    

    /* Generate random integer */
    public static int RandomIntValue(int seed) {
        Random __RandomNumberGenerator = new Random();
        return __RandomNumberGenerator.nextInt(seed);
    }

    /* Math Average */
    public static float MathAverage(float valsum, int valquant) {
        return valsum/valquant;
    }

`
    return res;
}

/* Fusion Manpage */
function Manpage() {
    console.log("\n                         FUSION                 ")
    console.log("------------------------------------------------------------------")
    console.log("Transpile to Java:               fusion -o <program>.fusion")
    console.log("Compile from Java to bytecode:   fusion -j <program>.java\n")
 
    console.log("Compile from Fusion to bytecode:     fusion -c <program>.fusion")
    console.log("Package all bytecodes as FUSE:       fusion -l <program>.fusion --ar=<package>")
    console.log("------------------------------------------------------------------")
    console.log("Run FUSE package:      fusion --run <program>.fuse --ar=<package>")
    console.log("------------------------------------------------------------------\n")
    console.log("Fusion Compiler - Gabriel Margarido (Nightly - 181.1)\n\n")
}
/* Java Packages Handling */
function Jar() {
    execSync("javac -d . *.java")
}
function SingleJar(java) {
    execSync("javac -d . "+java.replace(".fusion",".java"))
}
function ClearJava(java) {
    if (process.platform == 'win32') {
        execSync('del /f '+java)
    } else {
        execSync('rm -Rf '+java)
    }
}
function ManifestFusion(java,package) {
    if (process.platform == 'win32') {
        //execSync('gzip -cvr '+package.replace("--ar=",'')+' > '+java.replace(".fusion",FUSION_JAR_EXTENSION))//+' && del /f '+java)
        execSync('tar -czvf '+java.replace(".fusion",FUSION_JAR_EXTENSION)+' '+package.replace("--ar=",''))//+' && del /f '+java)
        //os.system(f'zip -r '+java+'.'+FUSION_JAR_EXTENSION+' '+java)
    } else {
        //execSync('gzip -cvr '+package.replace("--ar=",'')+' > '+java.replace(".fusion",FUSION_JAR_EXTENSION))//+' && del /f '+java)
        execSync('tar -czvf '+java.replace(".fusion",FUSION_JAR_EXTENSION)+' '+package.replace("--ar=",''))//+' && rm -Rf '+java)
        //os.system(f'zip -r '+java+'.'+FUSION_JAR_EXTENSION+' '+java)
    }

}


function RunFuse() {
    execSync(`tar -xzvf ${inputfile}`)
    let package = process.argv[4].replace('--ar=','')
    if (platform.platform == 'win32') {
        exec(`java ${package}.Main`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            process.stdout.write(`${stdout}`);
        });
    } else {
        exec(`java ${package}.Main`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            process.stdout.write(`${stdout}`);
        });
    }

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
            //console.log(list[i])
            if (stack[i] == 'package') {
                let pkgname = stack[i+1]
                let res = `package ${pkgname};\n`
                fs.writeFileSync(outputFile,res)
            }

            if (stack[i] == 'namespace') {
                // Inheritance and implementation
                if(stack[i+2] == '<' && stack[i+4] == ':') {
                    let extend = stack[i+3]
                    let implements = stack[i+5]
                    let classname = stack[i+1]
                    let res = `public class ${classname} extends ${extend} implements ${implements} {\n`
                    fs.appendFileSync(outputFile,res)
                }
                // Inheritance
                else if (stack[i+2] == '<') {
                    let extend = stack[i+3]
                    let classname = stack[i+1]
                    let res = `public class ${classname} extends ${extend}`+`{\n`
                    fs.appendFileSync(outputFile,res)
                }
                // Procedural
                else {
                    let classname = stack[i+1]
                    let res = `public class ${classname} {\n`
                    fs.appendFileSync(outputFile,res)
                }
                fs.appendFileSync(outputFile, BuiltInLibs())
            }
 
            // End block
            if (stack[i] == 'end') {
                fs.appendFileSync(outputFile,'}\n')
            }
            if (stack[i] == 'endnamespace') {
                fs.appendFileSync(outputFile,'}\n')
            }

            // Comentarios
            if (stack[i] == '@com') {
                fs.appendFileSync(outputFile,'/*'+stack[i+1].slice(1,-1)+'*/\n')
            }
                

            // Declaração de variaveis e vetores
            if (stack[i] == '=') {
                let vartype = stack[i-2]
                let varname = stack[i-1]
                let value
                let optional_parameter

                /* It has value for variable */
                if (stack[i+1] != 'undefined') {
                    value = stack[i+1]
                    optional_parameter = stack[i+2]


                    vartype = vartype.replace('int','int')
                    vartype = vartype.replace('float','float')
                    vartype = vartype.replace('String','String')
                    vartype = vartype.replace('bool','boolean')
                    vartype = vartype.replace('void','void')

                    //if vartype == 'Integer' or varname == 'Double' or varname == 'String' or varname == 'Boolean':
                    if (vartype.includes('[]')) {
                        vartype = vartype.replace('int[]','int[]')
                        vartype = vartype.replace('float[]','float[]')
                        vartype = vartype.replace('String[]','String[]')
                        vartype = vartype.replace('bool[]','boolean[]')

                        let res = `${vartype} ${varname} = {${value.slice(1,-1)}};\n`
                        fs.appendFileSync(outputFile,res)
                    
                    } else if (vartype.includes('{}')) {
                        vartype = vartype.replace('Int{}','Integer')
                        vartype = vartype.replace('Float{}','Float')
                        vartype = vartype.replace('String{}','String')
                        vartype = vartype.replace('Bool{}','Boolean')

                        let res = `ArrayList<${vartype}> ${varname} = new ArrayList<${vartype}>(${value.slice(1,-1)});\n`
                        fs.appendFileSync(outputFile,res)

                    } else {
                        if (vartype == 'expression') {
                            vartype = vartype.replace('expression','float')
                            let res = `${vartype} ${varname} = ${value.slice(1,-1)};\n`
                            fs.appendFileSync(outputFile,res)
                        } else {
                            /* Float values 'f' handling */
                            if (vartype == 'float') { value = value+'f' }
                            
                            let res
                            if (optional_parameter != undefined) {
                                res = `${vartype} ${varname} = ${value}${optional_parameter};\n`
                            } else {
                                res = `${vartype} ${varname} = ${value};\n`
                            }
                            fs.appendFileSync(outputFile,res)
                        }
                    }
                /* It does not have value for variable */
                } else {
                    if (vartype == 'expression') {
                        vartype = vartype.replace('expression','float')
                        let res = `${vartype} ${varname};\n`
                        fs.appendFileSync(outputFile,res)
                    } else {
                        /* Float values 'f' handling */
                        if (vartype == 'float') { value = value+'f' }
                        let res = `${vartype} ${varname};\n`
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
                    fs.appendFileSync(outputFile,'import java.util.Scanner;\n')
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
                    fs.appendFileSync(outputFile,'import javax.swing.*;\n\n')
                } else {
                    fs.appendFileSync(outputFile,'import '+libname+';\n')
                }
            }

            if (stack[i] == 'function') {
                let funcname = stack[i+1]
                let args = stack[i+2]
                let delim = stack[i+3]
                
                if(funcname == 'main') {
                    args = args.replace('args','String[] args')
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
                functype = functype.replace('String','String')
                functype = functype.replace('bool','boolean')
                functype = functype.replace('void','void')

                if(delim == ":") {
                    /* Dynamic and overriding function */
                    if(stack[i-1] != undefined && stack[i-1] == 'override') {
                        let res = `\n@Override\npublic ${functype} ${funcname}${args} {\n`
                        fs.appendFileSync(outputFile,res)
                    }
                    /* Dynamic function without overriding function */
                    else if(stack[i-1] != undefined && stack[i-1] == 'dynamic') {
                        let res = `public ${functype} ${funcname}${args} {\n`
                        fs.appendFileSync(outputFile,res)
                    } 
                    /* Static function without overriding */
                    else {
                        let res = `public static ${functype} ${funcname}${args} {\n`
                        fs.appendFileSync(outputFile,res)
                    }
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
                    return_vartype = return_vartype.replace('String','String')
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
                let res = `${classname} ${obj} = new ${classname}${constructor_params};\n`
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


            // Swing/AWT
            // ActionListeners
            if (stack[i] == '@AddActionListener') {
                let element = stack[i+1]
                let action_method = stack[i+3]
                let res = element+".addActionListener(new java.awt.event.ActionListener() { public void actionPerformed(java.awt.event.ActionEvent evt) { "+action_method+"; }});\n"
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == '@Override') {
                let res = `@Override\n`
                fs.appendFileSync(outputFile,re)
            }


            // Standard I/O
            if (stack[i] == 'println') {
                let res = `System.out.println(${stack[i+1]});\n`
                fs.appendFileSync(outputFile,res)
            }
            if (stack[i] == 'print') {
                let res = `System.out.print(${stack[i+1]});\n`
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
                    let res1 = `Scanner sc_${varname} = new Scanner(System.in);\n`
                    let res2 = `${typedef} ${varname} = sc_${varname}${ScanType};\n`

                    fs.appendFileSync(outputFile,res1)
                    fs.appendFileSync(outputFile,res2)

                } else {
                    console.log(`Error at line ${line}`)
                }                    
            }

        }
        //console.log(list)
    })
}

if (process.argv.length > 3) {
    if (execution_mode == "-o") {
        compile()
    } else if (execution_mode == "-c") {
        compile()
        Jar()
    } else if (execution_mode == "-j") {
        Jar()
    } else if (execution_mode == "-nx") {
        compile()
        SingleJar(inputfile) //FIX ME
    } else if (execution_mode == "-l") {
        ManifestFusion(inputfile,optional_parameter)
        //.slice(inputfile.indexOf('=')+1,inputfile.length)
    } else if (execution_mode == "--run") {
        RunFuse()
    } else {
        Manpage()
    }
} else {
    Manpage()
}
