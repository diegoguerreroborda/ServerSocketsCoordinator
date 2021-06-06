const express = require('express')
const axios = require('axios');
const bodyParser = require('body-parser');
const socketio = require('socket.io')
const http = require('http')
const shell = require('shelljs');
const app = express()
app.use(bodyParser.json())
const server = http.createServer(app)
const io = socketio(server)
const PORT = process.argv[2] || 3010

app.use(express.static('public'))

let hour = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
//let hour = '23:21:04'
//let servers = [{name: "http://localhost:4000/", alive: true}, {name: "http://localhost:4001/", alive: true}]
let servers = [];

let differences = [];
let result = 0;
let portInstance = 4000;

function getHourString(hourC){
    return `${hourC.getHours()}:${hourC.getMinutes()}:${hourC.getSeconds()}`;
}

function getHourExternal() {
    axios.get(`http://worldtimeapi.org/api/timezone/America/Bogota`)
		.then((response) => {
			date = new Date(response.data.utc_datetime);
			//var dateAux = new Date();
			console.log(date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds());
            hour = getHourString(date)
			//console.log(dateAux.getHours() + ':' + dateAux.getMinutes() + ':' + dateAux.getSeconds());
		})
		.catch((error) => {
			console.log('error en post usuario');
	});
}

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

app.get('/list_servers', async(req, res) => {
    console.log(servers)
    await callServers('', hour)
    res.send(servers)
})

setInterval(async function(){ 
    differences = [];
    await getHourExternal();
    console.log('La hora local es...', hour)
    await callServers('', hour);
    await berkeleyAlgorithm();
    await hourNew();
    await callServers('fixed', `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`);
    hour = `${hour.getHours()}:${hour.getMinutes()}:${hour.getSeconds()}`;
}, 60000);

io.on('connection', function (socket) {
    console.log(`client: ${socket.id}`)
    //enviando al cliente
    setInterval(async () => {
        await callServers('', hour)
        socket.emit('server/list_servers', servers)
    }, 5000)
})

app.get('/create_instance', (req, res) => {
    shell.exec(`sh createInstance.sh ${portInstance}`)
    servers.push({name:`http://localhost:${portInstance}/`, alive : true})
    portInstance++;
    res.sendStatus(200)
})

server.listen(PORT, () => {
    console.log(`Server running in port:${PORT}`)
})
