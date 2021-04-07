const express = require('express')
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json())
const PORT = process.argv[2] || 3000

let hour = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
//let hour = '23:21:04'
let servers = [{name: "http://localhost:3000/", alive: true}, {name: "http://localhost:3001/", alive: true}]

let differences = [];
let result = 0;

function convertToDate(currentD){
    var pieces = currentD.split(':')
    let currenTime = new Date()
    if(pieces.length === 3) {
        let hour = parseInt(pieces[0], 10);
        let minute = parseInt(pieces[1], 10);
        let second = parseInt(pieces[2], 10);
        currenTime.setHours(hour)
        currenTime.setMinutes(minute)
        currenTime.setSeconds(second)
        return currenTime;
    }
}

function berkeleyAlgorithm(){
    let sum = 0
    for (let i = 0; i < differences.length; i++) {
        sum = sum + (differences[i] * 60000)
    }
    result = (sum/differences.length)
    console.log(sum)
    console.log(result)
}

function hourNew(){
    hour = convertToDate(hour)
    hour.setTime(hour.getTime() + (result))
    console.log('Nueva hora', hour)
    console.log(hour.getHours())
    console.log(hour.getMinutes())
}

//Enviar hora fija a todos los servers conectados.
app.all('/hour', async(req, res, next) => {
    //axios post a todos
    console.log("*****************")
    for (const host in servers) {
        console.log(servers[host].name)
        await axios({
            method: 'post',
            url : servers[host].name,
            data: {
              time: hour
            }
        }).then(response => {
            console.log('Responde melon:', response.data);
            differences.push(response.data)
            servers[host].alive = true;
            //contador para ver cuantos están prendidos
        }).catch(err => {
            console.log("Está apagado ñro")
            servers[host].alive = false;
            //Ver si sin poner numero aquí sirve.
        });
    }
    berkeleyAlgorithm();
    hourNew();
    //res.send('no sé que poner aquí :v');
    next()
})

app.get('/hour', async(req, res) => {
    //Va a enviar la hora ya ajustada.
    console.log("-----------------------")
    for (const host in servers) {
        console.log(servers[host].name)
        await axios({
            method: 'post',
            url : `${servers[host].name}fixed`,
            data: {
              time: `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`
            }
        }).then(response => {
            console.log('Desface:', response.data);
            //Se va a una lista de ajustes.
        }).catch(err => {
            console.log("Apagadooo")
        });
    }
    res.send('no sé que poner aquí :v');
})

app.listen(PORT, () => {
    console.log(`Server running in port:${PORT}`)
})
