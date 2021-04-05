const express = require('express')
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.json())
const PORT = process.argv[2] || 3000

let hour = new Date();
let servers = [{name: "http://localhost:3000/", alive: true}, {name: "http://localhost:3001/", alive: true}]

//Enviar hora fija a todos los servers conectados.
app.get('/hour', async(req, res) => {
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
            //res.send('hola');
        }).catch(err => {
            console.log("Está apagado ñro")
            //res.send('pailas')
                //servers[host].alive = false;
        });
    }
    res.send('hpolno sé que poner aquí :v');
})

app.listen(PORT, () => {
    console.log(`Server running in port:${PORT}`)
})
