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
    $("#wmStatCard").removeClass("hide");
    $("#showIcon").removeClass("hide");
    $("#daemonIcon").removeClass("hide");
    //$('#topic').val(topic);
}
function onConnectionLost(response) {
    //setTimeout(MQTTconnect, reconnectTimeout);
    $('#connIcon').html("signal_wifi_off");
    $('.card').addClass("hide");
    $("#showIcon").addClass("hide");
    $("#daemonIcon").addClass("hide");
    //$('#status').val("connection lost: " + responseObject.errorMessage + ". Reconnecting");
}
function onMessageArrived(message) {
    var topic = message.destinationName;
    var payload = message.payloadString;
    if(message.destinationName === "llearnd/machine/state") {
        var mState = parseInt(message.payloadString);
        if(mState < 2) {
            if(!$("#wmStatCard").hasClass("green")) {
                $("#wmStatCard").removeClass("red");
                $("#wmStatCard").addClass("green");
            }
            if(!$("#wmTimeCard").hasClass("hide")) {
                $("#wmTimeCard").addClass("hide");
            }
            $("#wmStatus").html("ist frei!");
        } else {
            if(!$("#wmStatCard").hasClass("red")) {
                $("#wmStatCard").removeClass("green");
                $("#wmStatCard").addClass("red");
            }
            if($("#wmTimeCard").hasClass("hide")) {
                $("#wmTimeCard").removeClass("hide");
            }
            $("#wmStatus").html("ist belegt!");
        }
    } else if (message.destinationName === "llearnd/time") {
        var d = new Date(parseInt(message.payloadString) * 1000);
        var timestr = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        $('#time').html(timestr);
    } else if (message.destinationName === "llearnd/machine/lastBegin") {
        var d = new Date(parseInt(message.payloadString) * 1000);
        var timestr = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        $('#startTime').html(timestr);
    } else if (message.destinationName === "llearnd/state") {
        if(message.payloadString === "online") {
            $('#daemonIcon').html("directions_run");
        } else {
            $('#daemonIcon').html("hotel");
        }
    } else if (message.destinationName === "llearnd/device/leds") {
        var leds = message.payloadString.split(',');
        for(i = 0; i < leds.length; i++) {
            var ledId = "#settingsLed" + i;
            if(leds[i] === "1") {
                if(!$(ledId).hasClass("red-text")) {
                    $(ledId).addClass("red-text");
                }
            } else {
                if($(ledId).hasClass("red-text")) {
                    $(ledId).removeClass("red-text");
                }
            }
        }
    }
    //$('#ws').prepend('<li>' + topic + ' = ' + payload + '</li>');
};



$(document).ready(function() {
    $('#connIcon').click(function() {
        if(mqtt.isConnected()) {
            mqtt.disconnect();
        } else {
            MQTTconnect();
        }
    });

    $('#showIcon').click(function() {
        $("#timeCard").removeClass("hide");
        $("#wmTimeCard").removeClass("hide");
        $("#ledCard").removeClass("hide");
        $(this).addClass("hide");
    });

    MQTTconnect();
});
