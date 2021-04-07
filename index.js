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
    console.log('La hora convert', hour)
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
}

function hourNew(){
    hour = convertToDate(hour)
    hour.setTime(hour.getTime() + (result))
    console.log(hour.getHours())
    console.log(hour.getMinutes())
}

async function callServers(afterUrl, localHour){
    console.log("-----------------------")
    for (const host in servers) {
        console.log(servers[host].name)
        await axios({
            method: 'post',
            url : `${servers[host].name}${afterUrl}`,
            data: {
              time: localHour
            }
        }).then(response => {
            console.log('Resultado:', response.data);
            differences.push(response.data)
            servers[host].alive = true;
        }).catch(err => {
            console.log("Apagadooo")
            servers[host].alive = false;
        });
    }
}
/*
app.get('/hour', async(req, res) => {
    differences = [];
    console.log('La hora local es...', hour)
    await callServers('', hour);
    await berkeleyAlgorithm();
    await hourNew();
    await callServers('fixed', `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`);
    hour = `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`;
    res.sendStatus(200)
})
*/

app.get('/list_servers', async(req, res) => {
    console.log(servers)
    await callServers('', hour)
    res.send(servers)
})

setInterval(async function(){ 
    differences = [];
    console.log('La hora local es...', hour)
    await callServers('', hour);
    await berkeleyAlgorithm();
    await hourNew();
    await callServers('fixed', `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`);
    hour = `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`;
}, 60000);

app.listen(PORT, () => {
    console.log(`Server running in port:${PORT}`)
})
