
var express = require('express');
var app = express();
var request = require('request');
var events  = require('events');
var eventEmitter = new events.EventEmitter();


app.get('/getEventsWithWeather/:location', function (req, res) {
    var result={
        'eventsList': []
    };
    var currentEvent = '';


    // Create an event handler as follows
    var connectHandler = function connected() {
        console.log('connection succesful.');
        request('http://api.eventful.com/json/events/search?app_key=F5886d5cVJ4M8sXR&location='+req.params.location+'&date=Today', function (error, response, body)
        {
            //Check for error
            if(error){
                return console.log('Error:', error);
            }

            //Check for right status code
            if(response.statusCode !== 200){
                return console.log('Invalid Status Code Returned:', response.statusCode);
            }
            //All is good. Print the body
            body = JSON.parse(body);
            eventRes = body.events.event;

            //for(var i=0;i<eventRes.length;i++)
            for(var i=0;i<2;i++)
            {

                latitude=eventRes[i].latitude;
                longitude=eventRes[i].longitude;
                event=eventRes[i];

                console.log("index 1"+i);


                result.eventsList.push({
                    'title': event.title,
                    'address': event.venue_address,
                    'description': event.description,
                    'latitude': event.latitude,
                    'longitude': event.longitude,
                    'start_time':event.start_time,
                    'venue_name':event.venue_name,
                    'url':event.url


                });
            };



        });
        // Fire the data_received event
        eventEmitter.emit('data_received');
    }

// Bind the connection event with the handler
    eventEmitter.on('connection', connectHandler);

// Bind the data_received event with the anonymous function
    eventEmitter.on('data_received', function(){

        for(var i=0;i<result.eventsList.length;i++)
        {
            console.log("index"+i);
            event=result.eventsList[i];

            currentEvent=event;
            request('http://api.wunderground.com/api/dc3009047269d125/conditions/q/' + event.latitude + ',' + event.longitude + '.json', function (error, response, body)
            {
                if (error) {
                    console.log(weatherUrl);
                    //return console.log('Error weather:', error);
                    return callback(error);
                }

                body1 = JSON.parse(body);
                weatherRes = body1.current_observation.temperature_string;
                //weatherArray.push(weatherRes);
                console.log(weatherRes);

                result.eventsList.push({
                    'title': event.title,
                    'address': event.venue_address,
                    'description': event.description,
                    'latitude': event.latitude,
                    'longitude': event.longitude,
                    'start_time':event.start_time,
                    'venue_name':event.venue_name,
                    'url':event.url,
                    'Weather': weatherRes
                });





            });
        }
        console.log('data received succesfully.');
        eventEmitter.emit('data_final');

    });


    eventEmitter.on('data_final', function(){

        res.contentType('application/json');
        res.write(JSON.stringify(result));
        res.end();
        console.log(result);
        console.log('data generated succesfully.');


    });

// Fire the connection event
    eventEmitter.emit('connection');

    console.log("Program Ended.");



})

var server = app.listen(81, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})