var mqtt;

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
    $('#connIcon').html("signal_wifi_4_bar");
    mqtt.subscribe(topic, {qos: 0});
    $("#wmstatcard").removeClass("hide");
    $("#timecard").removeClass("hide");
    //$('#topic').val(topic);
}
function onConnectionLost(response) {
    //setTimeout(MQTTconnect, reconnectTimeout);
    $('#connIcon').html("signal_wifi_off");
    $('.card').addClass("hide");
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
            $("#wmstatus").html("ist frei!");
        } else {
            if($("#wmstatcard").hasClass("green")) {
                $("#wmstatcard").removeClass("green");
                $("#wmstatcard").addClass("red");
            }
            if($("#wmtimecardbox").hasClass("hide")) {
                $("#wmtimecardbox").removeClass("hide");
            }
            $("#wmstatus").html("ist belegt!");
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
            $('#daemonIcon').html("directions_run");
        } else {
            $('#daemonIcon').html("hotel");
        }
    }
    //$('#ws').prepend('<li>' + topic + ' = ' + payload + '</li>');
};



$(document).ready(function() {
    $('#connIconDiv').click(function() {
        if(mqtt.isConnected()) {
            mqtt.disconnect();
        } else {
            MQTTconnect();
        }
    });

    MQTTconnect();
});
