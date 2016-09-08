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
    mqtt.connect(options);
}
function onConnect() {
    //$('#status').val('Connected to ' + host + ':' + port + path);
    // Connection succeeded; subscribe to our topic
    $('#conn_icon').html("signal_wifi_4_bar");
    mqtt.subscribe(topic, {qos: 0});
    //$('#topic').val(topic);
}
function onConnectionLost(response) {
    //setTimeout(MQTTconnect, reconnectTimeout);
    $('#conn_icon').html("signal_wifi_off");
    //$('#status').val("connection lost: " + responseObject.errorMessage + ". Reconnecting");
};
function onMessageArrived(message) {
    var topic = message.destinationName;
    var payload = message.payloadString;
    if(message.destinationName === "llearnd/machine/state") {
        var mState = parseInt(message.payloadString);
        if(mState < 2) {
            if($("#wmstatcard").hasClass("red")) {
                $("#wmstatcard").removeClass("red");
                $("#wmstatcard").addClass("green");
            }
            if(!$("#wmtimecardbox").hasClass("hide")) {
                $("#wmtimecardbox").addClass("hide");
            }
            if(mState > 0) {
                $("#wmstatus").html("... ist angeschaltet.");
            } else {
                $("#wmstatus").html("... ist ausgeschaltet.");
            }
        } else {
            if($("#wmstatcard").hasClass("green")) {
                $("#wmstatcard").removeClass("green");
                $("#wmstatcard").addClass("red");
            }
            if($("#wmtimecardbox").hasClass("hide")) {
                $("#wmtimecardbox").removeClass("hide");
            }
            $("#wmstatus").html("... läuft.");
        }
    } else if (message.destinationName === "llearnd/time") {
        var d = new Date(parseInt(message.payloadString) * 1000);
        var timestr = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        $('#time').html(timestr);
    } else if (message.destinationName === "llearnd/machine/lastBegin") {
        var d = new Date(parseInt(message.payloadString) * 1000);
        var timestr = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        $('#starttime').html(timestr);
    } else if (message.destinationName === "llearnd/state") {
        if(message.payloadString === "online") {
            $('#daemon_icon').html("directions_run");
        } else {
            $('#daemon_icon').html("hotel");
        }
    }
    //$('#ws').prepend('<li>' + topic + ' = ' + payload + '</li>');
};


$(document).ready(function() {
    MQTTconnect();
});
