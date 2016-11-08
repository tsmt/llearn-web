var mqtt;

var reconnectTimeout = 2000;

var host = "smittens.de";
var port = 9002;
var path = "/ws";
var useTLS = true;
var cleansession = true;

var username = "llearnJSClient";
var password = "public";

var topic = "llearnd/#";
var rotaryTexts = [
    "Aus", "Kochwäsche 95°C", "Kochwäsche 60°C", "Kochwäsche 40°C", "Kochwäsche 30°C",
    "Mit Vorwäsche 60°C", "Mit Vorwäsche 40°C", "Pflegeleicht 60°C", "Pflegeleicht 40°C",
    "Mix 20°C", "Leichtbügeln Plus 40°C", "Feinwäsche 40°C", "Feinwäsche 30°C",
    "Wolle Plus 20°C", "Kalt", "Feinspülen", "Schleudern", "Pumpen", "30 Min",
    "Baumwolle Eco 40°C", "Baumwolle Eco 60°C"
];
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
    mqtt.subscribe(topic, {qos: 0});
    $("#wmStatCard").removeClass("hide");
    $("#timeCard").removeClass("hide");
    //$('#topic').val(topic);
}
function onConnectionLost(response) {
    //setTimeout(MQTTconnect, reconnectTimeout);
    $('.card').addClass("hide");
    $('#connIcon').html("signal_wifi_off");
    //$('#status').val("connection lost: " + responseObject.errorMessage + ". Reconnecting");
}
function onMessageArrived(message) {
    var topic = message.destinationName;
    var payload = message.payloadString;
    if(message.destinationName === "llearnd/machine/state") {
        var mState = parseInt(message.payloadString);
        if(mState < 2) {
            if(!$("#wmStatusCardTitle").hasClass("white-text")) {
                $("#wmStatusCardTitle").removeClass("black-text");
                $("#wmStatusCardTitle").addClass("white-text");
            }
            if(!$("#wmTimeBox").hasClass("hide")) {
                $("#wmTimeBox").addClass("hide");
            }
            $("#wmStatusCardImg").attr("src", "flowers.jpg")
            $("#wmStatus").html("ist frei! ");
        } else {
            if(!$("#wmStatusCardTitle").hasClass("black-text")) {
                $("#wmStatusCardTitle").removeClass("text-white");
                $("#wmStatusCardTitle").addClass("black-text");
            }
            if($("#wmTimeBox").hasClass("hide")) {
                $("#wmTimeBox").removeClass("hide");
            }
            if($("#ledCard").hasClass("hide")) {
                $("#ledCard").removeClass("hide");
            }
            $("#wmStatusCardImg").attr("src", "laundry.jpg")
            $("#wmStatus").html("ist belegt!");
        }
    } else if (message.destinationName === "llearnd/time") {
        var d = new Date(parseInt(message.payloadString) * 1000);
        var timestr = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        $('#time').html(timestr);
    } else if (message.destinationName === "llearnd/machine/lastBegin") {
        var d = new Date(parseInt(message.payloadString) * 1000);
        var timestr = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        $('.startTime').html(timestr);
    } else if (message.destinationName === "llearnd/state") {
        if(message.payloadString === "online") {
            $('#connIcon').html("signal_wifi_4_bar");
        } else {
            $('#connIcon').html("signal_wifi_4_bar_lock");
        }
    } else if (message.destinationName === "llearnd/learn/text") {
        if(message.payloadString === "rechnen...") {
            $('.endTime').html(message.payloadString);
        } else {
            var d = new Date(parseInt(message.payloadString) * 1000);
            var timestr = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
            $('.endTime').html(timestr);
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
    } else if (message.destinationName === "llearnd/device/rotaryState") {
        $('#rotaryStatus').html(rotaryTexts[parseInt(message.payloadString)]);
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

    MQTTconnect();
});
