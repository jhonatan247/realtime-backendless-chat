// Initialize Firebase
var config = {
  apiKey: "AIzaSyCEb5aWCGKm7zCIK1jJ0DhxUMZ7PDDR5u0",
    authDomain: "hackathon-msft.firebaseapp.com",
    databaseURL: "https://hackathon-msft.firebaseio.com",
    projectId: "hackathon-msft",
    storageBucket: "",
    messagingSenderId: "490868198980"
};
firebase.initializeApp(config);
var mensajesMostrados = false;
var database = firebase.database();
var chats = firebase.database().ref().child('chats');
var chat = document.getElementById("chat");
var numero_mensajes = 0;
chats.once('value', function(snap){
    var objeto = snap.val();
    numero_mensajes = Object.keys(objeto).length-1;
    console.info("numero mensajjes" + numero_mensajes);
    document.getElementById("notificaciones").innerHTML = ""+numero_mensajes;
});

var getFromServer = function (snapshot) {
    var username = snapshot.child('persona').val();
    if(username == '')
      username = 'Unnamed';
    var fecha = snapshot.child('fecha').val();
    var mensaje = snapshot.child('mensaje').val();
    chat.innerHTML += crearMensaje(username, fecha, mensaje);
    chat.scrollTop = chat.scrollHeight;
}

chats.limitToLast(1).on('child_added', function(snap){
  getFromServer(snap);
});

function anadirMensajesPerdidos(e){
  if(!mensajesMostrados){
    chat.innerHTML ="";
    chats = firebase.database().ref().child('chats');

    chats.once('value', function(snap) {
      var objeto = snap.val();
      mensajes_keys = Object.keys(objeto);

      for (var i = 0; i < mensajes_keys.length ; i++) {
        var contenedor = snap.child(mensajes_keys[i]);
        getFromServer(contenedor);
      }

      document.getElementById("notificaciones").innerHTML = "0";

    });
    mensajesMostrados = true;
  }
}

function sendToServer(texto){
    var username = document.getElementById("username");
    var date = new Date();
    var fecha = formatFecha(date);
    chats.push({
        persona: username.value,
        fecha: fecha,
        mensaje : texto
    });
};



function crearMensaje(username, fecha, mensaje){

  if(mensaje == '(((server)))LOGOUT(((server)))')
      mensaje='<strong><i class="red">Ha salido</i></strong>';
  if(mensaje == '(((server)))LOGIN(((server)))')
      mensaje='<strong><i class="blue">Ha entrado</i></strong>';
    return '<div class="app__meeting"> <p class="app__meeting-name"><span class="app__meeting-time"><b>'+ username+':</b> '+ mensaje + '</span></p><p class="app__meeting-info">' + fecha + '</p> </div>';

}

function adios(){
    sendToServer('(((server)))LOGOUT(((server)))');
}

function send(e){
    var mensaje = document.getElementById("mensaje");
    if (e.keyCode == 13 && mensaje.value != ""){
        sendToServer(mensaje.value);
        mensaje.value = '';
    }
    return false;
}

function formatFecha(date){
    var horas = date.getHours();
    var minutos = date.getMinutes();
    if (horas > 12){
      horas -= 12;
      return horas + " : " + zeroFill(minutos, 2) + " pm";
    } else {
      return horas + " : " + zeroFill(minutos, 2) + " am";
    }
}

function zeroFill( number, width ) {
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
}

function enableVoiceRecognition () {
  var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 5;
  recognition.start();

  recognition.onresult = function(event) {
      console.log('You said: ', event.results[0][0].transcript);
      chat.innerHTML += crearMensaje('Bot', 'hoy', event.results[0][0].transcript);
  };
};


$(document).ready(function () {
  var animating = false,
      username = "",
      submitPhase1 = 400,
      submitPhase2 = 200,
      logoutPhase1 = 600,
      $login = $(".login"),
      $app = $(".app");

  function ripple(elem, e) {
    $(".ripple").remove();
    var elTop = elem.offset().top,
        elLeft = elem.offset().left,
        x = e.pageX - elLeft,
        y = e.pageY - elTop;
    var $ripple = $("<div class='ripple'></div>");
    $ripple.css({top: y, left: x});
    elem.append($ripple);
  };

  $(document).on("click", ".login__submit", function(e) {

  sendToServer('(((server)))LOGIN(((server)))');
    if (animating) return;
    animating = true;
    var that = this;

    username = document.getElementById("username").value;
    if(username == '')
      username = 'Unnamed';
    document.getElementById("saludo").innerHTML = "Welcome, " + username;

    ripple($(that), e);
    $(that).addClass("processing");
    setTimeout(function() {
      $(that).addClass("success");
      setTimeout(function() {
        $app.show();
        $app.css("top");
        $app.addClass("active");
      }, submitPhase2 - 70);
      setTimeout(function() {
        $login.hide();
        $login.addClass("inactive");
        animating = false;
        $(that).removeClass("success processing");
      }, submitPhase2);
    }, submitPhase1);
  });

  $("#username").keyup(function( event ) {
    if ( event.which == 13 ) {
       event.preventDefault();
       console.log(event.which);
       $( ".login__submit" ).trigger( "click" );
    }
  });

  $(document).on("click", ".app__logout", function(e) {

  sendToServer('(((server)))LOGOUT(((server)))');
    if (animating) return;
    $(".ripple").remove();
    animating = true;
    var that = this;
    $(that).addClass("clicked");
    setTimeout(function() {
      $app.removeClass("active");
      $login.show();
      $login.css("top");
      $login.removeClass("inactive");
    }, logoutPhase1 - 120);
    setTimeout(function() {
      $app.hide();
      animating = false;
      $(that).removeClass("clicked");
    }, logoutPhase1);
  });
});
