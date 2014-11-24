/*
This is a basic Node.js Express web application for scraping Canadian City Weather, then plotting that weather in an informative way.
It consists of:
 1) A Node.js scraper to retrieve the coldest cities in Canada (GET /scrape)
 2) A web application for display of these cities. (GET /page)
 */

// Import various modules required for this application.
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var ejs = require('ejs');

// Start express
var app = express();

// Setup rules
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.listen('8080', "127.0.0.1");
console.log('Magic happens on port 8080');

/**
 * Scrape will collect the cities in Canada and their temperatures via scraping http://timeanddate.com/weather
 */
app.get('/scrape', function(req, res){

	// The URL we will scrape
	country = 'canada';
	url = 'http://www.timeanddate.com/weather/?query='+country+'&sort=6';

	console.log('Scraping has begun.');

	request(url, function(error, response, html){

		// First we'll check to make sure no errors occurred when making the request

		if(!error){
			// Next, we'll utilize the cheerio library on the returned html to give full jQuery functionality

			var $ = cheerio.load(html);

			var output = {"cities": []};

			// Define the variables we're going to capture from http://www.timeanddate.com/
			var city, temperature;
			var json = { city : "", temperature : ""};

			// We'll use page elements of the weather chart to narrow, then grab cities.
			$('table.fw').filter(function(){ // First narrow to .tb-wt (whole table)

				var data = $(this);

				// In examining the DOM we notice that each city starts with an <a>.
				// Utilizing jQuery we can navigate around each <a> to grab the city name and temperature.
				data.find("a").each(function(index){
					json = { city : "", temperature : ""}; // reset json

					city = $(this).text();
					temperature = $(this).parent().next().next().next().text();

					// Once we have our data, we'll store it to our json object.
					json.city = city;
					json.temperature = temperature;

					output.cities.push(json);
				});
			})
		}

		// Sort the output by coldest.
		output.cities.sort(compare_method);

		fs.writeFile('output.json', JSON.stringify(output, null, 4), function(err){
			console.log('File successfully written! - Check your project directory for the output.json file');
		});

		// Finally, we'll just send out a message to the browser since this GET has no UI.
		res.send('File succesfully written! - Check your project directory for the output.json file');

	});

});

/**
 * Page will display the web application which allows plotting and viewing the 10 coldest cities in Canada.
 * Plotting uses flot.js.
 * Mapping uses the Google Maps API v3.
 */
app.get('/page', function(req, res) {
	var parsedJSON = require('./output.json');

	res.render('index.html', {
		cities: parsedJSON
	});
});

// Helper method
function compare_method(a,b) {
	// Simple descending sort rule
	return (parseInt(a.temperature) > parseInt(b.temperature)) ? 1 : ((parseInt(a.temperature) < parseInt(b.temperature)) ? -1 : 0);
}