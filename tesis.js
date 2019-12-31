const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');   

function shell(comando) {
    var exec = require('child_process').exec, child;
    // Creamos la función y pasamos el string pwd 
    //let pwd = './__build__/plugins/optim-mop/ibexmop plugins/optim-mop/benchs/osy.txt --cy-contract-full --eps_r=0.001 --ub=ub2 --server_mode --server_in=testin.txt --server_out=testout.txt' ;
    // que será nuestro comando a ejecutar
    child = exec(comando,
        // Pasamos los parámetros error, stdout la salida 
        // que mostrara el comando
        function (error, stdout, stderr) {
            // Imprimimos en pantalla con console.log
            console.log(stdout);
            // controlamos el error
            if (error !== null) {
                console.log('exec error: ' + error);
                return error;
            }
            else {
                return stdout;
            }
        });
}

function createInstanceFile(string,filename) {
   let ress =  shell('cd .. ; cd temp ; mkdir '+filename);
   console.log('CARPETA CREADA PARA INS :', filename);
   
   setTimeout(() => {
    fs.writeFile('../temp/'+ filename +'/load'+filename+'ins.txt', string, function (err) {
        if (err) return err;
        else
        console.log('File is created successfully:',filename);
      });  
   }, 300);
}

router.post("/load", function (req, res, next) {
    console.log("START LOAD");
    
    let body = req.body;
    const file = req.files.loadFile;
    let filename = body.filename;
    let comando = 'cd .. ; cd temp ; mkdir '+ filename+' ; exit';
    console.log(comando);
    console.log(file);
    
    
    let files = [];
    shell(comando);
    setTimeout(() => {
        file.mv('../temp/'+ filename +'/' + file.name +'.tar', function (err, result) {
            if (err)
                throw err;
            
            let comando = 'cd .. ; cd temp ; cd '+ filename +' ; tar -xvf '+ file.name +'.tar ; rm '+ file.name +'.tar ;exit';  
            console.log("comando",comando);
            ress = shell(comando);
            console.log("ress:",ress);
            let loadFile = '';
            let saveFile = '';
            
            setTimeout(() => {
                fs.readdir('../temp/'+ filename, function (err, files) {
                    //handling error
                    if (err) {
                        return console.log('Unable to scan directory: ' + err);
                    } 
                    //listing all files using forEach
                    files.forEach(function (file) {
                        console.log("file for",file);
                        console.log(file.substring(4));
                        
                        // Do whatever you want to do with the file
                        if (file.substring(0,4) == 'save') {
                            saveFile = file;
                        }
                        if (file.substring(0,4) == 'load') {
                            loadFile = file;
                        }
                    });
                    console.log("SAVE LOAD: ",saveFile,loadFile);
                    
                    let ress = crearInstanciaWithFile(filename,saveFile,loadFile);
                });
                res.send({
                    success: true,
                    message: "File uploaded!" + ress
                });
            }, 300);
            

            
            
        })
    }, 500); 
    //console.log(file);
    
})

router.post('/seleccionarZona', (req, res, next) => {
    console.log(req.body);
    if (req.body.tipo == 'zoom_in') {
        let string = 'zoom_in ' + req.body.x[1] + ' ' + req.body.y[1];
        filename = req.body.filename;
        let comandoString = 'echo "' + string + '" >> ' + filename + 'in.txt';
        let comando = 'cd .. ; cd ibex-lib ;' + comandoString;
        //comando = 'cd.. ; cd ibex-lib ; pwd'
        console.log(comando);
        ress = shell(comando);
        console.log(ress);
        res.status(200).json({
            message: 'Comando Enviado "zoom_in"',
            respuesta: ress
        });
    }
    if (req.body.tipo == 'zoom_out') {
        let string = 'zoom_out 1 1 1 1';
        filename = req.body.filename;
        let comandoString = 'echo "' + string + '" >> ' + filename + 'in.txt';
        let comando = 'cd .. ; cd ibex-lib ;' + comandoString;
        //comando = 'cd.. ; cd ibex-lib ; pwd'
        console.log(comando);
        ress = shell(comando);
        console.log(ress);
        res.status(200).json({
            message: 'Comando Enviado "zoom_out"',
            respuesta: ress
        });
    }


});

router.get('/:asd', (req, res, next) => {
    var exec = require('child_process').exec, child;
    // Creamos la función y pasamos el string pwd 
    //let pwd = './__build__/plugins/optim-mop/ibexmop plugins/optim-mop/benchs/'+ req.params.nombreArchivo+'.txt' +' --cy-contract-full --eps_r=0.001 --ub=ub2 --server_mode --server_in=intructions3.txt --server_out=output3.txt';
    // que será nuestro comando a ejecutar
    console.log(shell('echo wenaqlo'))
    res.status(500).json({
        message: 'Order details'
    });
});

router.post('/crearInstancia/:nombreArchivo', (req, res, next) => {
    console.log(req.body);
    filename = req.params.nombreArchivo;
    let ress = crearInstanciaWithFile(filename,req.body.string);
    console.log(ress);
    setTimeout(() => {
        res.status(200).json({
            message: 'Instancia Creada',
            respuesta: ress
        });
    }, 400);
    
});

function crearInstancia(filename,load,save) {
    let instancia = './__build__/plugins/optim-mop/ibexmop plugins/optim-mop/benchs/'+ 'osy' +'.txt --cy-contract-full --eps_r=0.001 --ub=no --server_mode --server_in=' + filename + 'in.txt --server_out=' + filename + 'out.txt';
    if (save) {
        instancia =+ '--input-file='+save;
    }
    if (load) {
    let instancia = './__build__/plugins/optim-mop/ibexmop plugins/optim-mop/benchs/'+ load +'.txt --cy-contract-full --eps_r=0.001 --ub=no --server_mode --server_in=' + filename + 'in.txt --server_out=' + filename + 'out.txt';
        
    }
    let comando = 'cd .. ; cd ibex-lib ;' + instancia;
    //comando = 'cd.. ; cd ibex-lib ; pwd'
    console.log(comando);
    let ress = shell(comando);
    console.log(ress);
    return ress;
}

function crearInstanciaWithFile(filename,string,load,save) {
    let ress = '';
    let instancia = '';
    console.log(save);
    
    if(load){
        instancia = './__build__/plugins/optim-mop/ibexmop ../temp/'+ filename + '/'+ load +' --cy-contract-full --eps_r=0.001 --ub=no --server_mode --server_in=' + filename + 'in.txt --server_out=' + filename + 'out.txt --input-file=../temp/'+ filename + '/' +save;
    }
    else{
        ress = createInstanceFile(string,filename)
        console.log("archvio creado");
        instancia = './__build__/plugins/optim-mop/ibexmop ../temp/'+ filename+ '/load' + filename+ 'ins.txt --cy-contract-full --eps_r=0.001 --ub=no --server_mode --server_in=' + filename + 'in.txt --server_out=' + filename + 'out.txt';
        console.log("instnacia string creado");
        
    }
    console.log(instancia);

    let comando = 'cd .. ; cd ibex-lib ;' + instancia;
    //comando = 'cd.. ; cd ibex-lib ; pwd'
    console.log(comando);
    setTimeout(() => {
        ress = shell(comando);
    }, 300);
    console.log(ress);
    return ress;
}

router.get('/getDatos/:nombreArchivo', (req, res, next) => {
    filename = req.params.nombreArchivo;
    var fs = require('fs');
    var contents = fs.readFile('../ibex-lib/' + filename + 'out.txt', 'utf8', function (err, contents1) {
        var contents = fs.readFile('../ibex-lib/' + filename + 'solution.txt', 'utf8', function (err, contents2) {
            var contents = fs.readFile('../ibex-lib/' + filename + 'out.txt.state', 'utf8', function (err, contents3) {
                console.log(contents2);
                console.log('Datos Enviados desde :::' + filename + ':::');
                res.status(200).json({
                    message: 'Puntos output3',
                    respuesta: contents1,
                    solution: contents2,
                    state: contents3
                });
            });
        });
    });

});

router.delete('/:orderId', (req, res, next) => {
    res.status(200).json({
        message: 'Order deleted',
        orderId: req.params.orderId
    });
});

router.post('/getSolution', (req, res, next) => {
    var fs = require('fs');
    console.log(req.body);
    if (req.body.x) {
        //get_solution output_file y1 y2
        let filename = req.body.filename;
        let string = 'upper_envelope ' + filename + 'solution.txt ' + req.body.x + ' ' + req.body.y;
        let comandoString = 'echo "' + string + '" >> ' + filename + 'in.txt';
        let comando = 'cd .. ; cd ibex-lib ;' + comandoString;

        //comando = 'cd.. ; cd ibex-lib ; pwd'
        console.log(comando);
        ress = shell(comando);
        console.log(ress);

        res.status(200).json({
            message: 'Archivo Creado : Get solution',
            respuesta: ress
        });
    }
    res.status(200).json({
        message: 'Datos no validos',
        respuesta: ress
    });


});
router.post('/focus', (req, res, next) => {
    console.log(req.body);
    if (req.body.x) {
        //get_solution output_file y1 y2
        let filename = req.body.filename;
        let string = 'rpm '+ filename + 'sol.txt '+ req.body.x + ' ' + req.body.y;
        let comandoString = 'echo "' + string + '" >> ' + filename + 'in.txt';
        let comando = 'cd .. ; cd ibex-lib ;' + comandoString;

        //comando = 'cd.. ; cd ibex-lib ; pwd'
        console.log(comando);
        ress = shell(comando);
        console.log(ress);

        res.status(200).json({
            message: 'Archivo Creado : RPM '+req.body.x+';'+req.body.y,
            respuesta: ress
        });
    }
    else{
        res.status(404).json({
            message: 'Datos no validos',
            respuesta: ress
        });
    }
    
});

router.post('/comando', (req, res, next) => {
    let value = req.body.comando;
    console.log(req.body);
    let filename = req.body.filename;
    let string = value;
    let comandoString = 'echo "' + string + '" >> ' + filename + 'in.txt';
    let comando = 'cd .. ; cd ibex-lib ;' + comandoString;

    //comando = 'cd.. ; cd ibex-lib ; pwd'
    console.log(comando);
    ress = shell(comando);
    console.log(ress);

    res.status(200).json({
        message: 'Archivo Creado : ' + value,
        respuesta: ress
    });
});

router.post('/crearInstanciaPorNombre/:nombreArchivo', (req, res, next) => {
    filename = req.params.nombreArchivo;
    let nombreArchivo = req.body.nombreArchivo;
    let instancia = './__build__/plugins/optim-mop/ibexmop plugins/optim-mop/benchs/' + nombreArchivo + '.txt  --cy-contract-full --eps_r=0.001 --ub=no --server_mode --server_in=' + filename + 'in.txt --server_out=' + filename + 'out.txt';
    let comando = 'cd .. ; cd ibex-lib ;' + instancia;
    //comando = 'cd.. ; cd ibex-lib ; pwd'
    console.log(comando);
    ress = shell(comando);
    console.log(ress);
    res.status(200).json({
        message: 'Instancia Creada Por Nombre',
        respuesta: ress
    });
});
module.exports = router;

router.get('/download/:downfilename(*)/:filename',(req, res) => {
    var file = req.params.downfilename;
        console.log(file);
        var fileLocation = path.join('../temp/'+file+'/','save.tar');
        console.log(fileLocation);
    let ress =shell('cd ../temp/'+file+'/; tar cvf save.tar load'+file+'ins.txt save'+file+'.state');
    console.log(ress);
    
    setTimeout(() => {
        
        if(fileLocation){
            console.log(':c');
            
            res.download(fileLocation, 'save.tar'); 
        }
        else{
            
            res.status(404).json({
                message: 'Archivo no encontrado'
            });
        }
    }, 300);
   
    
  });

  

