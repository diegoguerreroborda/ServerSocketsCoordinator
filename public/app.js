var app = new Vue({
    el: '#app',
    data: {
      message: '00:00'
    }
})

var app2 = new Vue({
    el: '#app-2',
    data: {
        servers: []
    }
})

var socket = io()

socket.on('server/list_servers', function(data){
    app2.servers = [];
    for(let i=0; i <= data.length; i++){
      app2.servers.push({name: data[i]['name'], alive: data[i]['alive']});
    }
})

function newInstance() {
  fetch('/create_instance')
  .then(response => response.text())
  .then( 
      data => {
          console.log(data)
      }
  );
}