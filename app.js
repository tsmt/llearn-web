var mqttserv;

var reconnectTimeout = 2000;

var host = "smittens.de";
var port = 9002;
var path = "/ws";
var useTLS = true;
var cleansession = true;

var username = "llearnJSClient";
var password = "public";

var topic = "llearnd/#"

function MQTTconnect() {
    if (typeof path == "undefined") {
        path = '/mqtt';
    }
    mqtt = new Paho.MQTT.Client(
            host,
            port,
            path,
            "web_" + parseInt(Math.random() * 100, 10)
    );
    var options = {
        timeout: 3,
        useSSL: useTLS,
        cleanSession: cleansession,
        onSuccess: onConnect,
        onFailure: function (message) {
            console.log("Connection failed:" + message.errorMessage + "Retrying");
            //$('#status').val("Connection failed: " + message.errorMessage + "Retrying");
            setTimeout(MQTTconnect, reconnectTimeout);
        }
    };
    mqtt.onConnectionLost = onConnectionLost;
    mqtt.onMessageArrived = onMessageArrived;
    if (username != null) {
        options.userName = username;
        options.password = password;
    }
    console.log("Host="+ host + ", port=" + port + ", path=" + path + " TLS = " + useTLS + " username=" + username + " password=" + password);
    mqtt.connect(options);
}
function onConnect() {
    console.log("connected");
    //$('#status').val('Connected to ' + host + ':' + port + path);
    // Connection succeeded; subscribe to our topic
    mqtt.subscribe(topic, {qos: 0});
    //$('#topic').val(topic);
}
function onConnectionLost(response) {
    //setTimeout(MQTTconnect, reconnectTimeout);
    //$('#status').val("connection lost: " + responseObject.errorMessage + ". Reconnecting");
};
function onMessageArrived(message) {
    var topic = message.destinationName;
    var payload = message.payloadString;
    if(message.destinationName === "llearnd/machine/status") {
        $('#wmstatus').html(message.payloadString);
    } else if (message.destinationName === "llearnd/device/time") {
        var d = new Date(parseInt(message.payloadString) * 1000);
        var timestr = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        $('#time').html(timestr);
    }
    //$('#ws').prepend('<li>' + topic + ' = ' + payload + '</li>');
};


$(document).ready(function() {
    MQTTconnect();
});
