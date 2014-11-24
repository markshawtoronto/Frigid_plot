// document ready function
$(document).ready(function() {
	// Initialize
	var coldest_10 = [];
	var map;
	var marker;
	for (i = 0; i < 10; i++)
	{
		coldest_10.push(cold_cities.cities[i].city);
		console.log(coldest_10[i]+'is very cold!');

		$('#city_dropdown').append($('<option/>', {
			value: coldest_10[i],
			text : coldest_10[i]
		}));
	}

	google.maps.event.addDomListener(window, 'load', initialize);

	// Update on change
	$("#city_dropdown").change(function()
	{
		draw_temperature_graph($(this).val());
		$("#title_0").html($(this).val()+' Daily Temperature');
	});

	// Initialize google maps
	function initialize() {
		var myLatlng = new google.maps.LatLng(0,0);
		var mapOptions = {
			zoom: 4,
			center: myLatlng
		};
		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

		draw_temperature_graph(coldest_10[0]);
		$("#title_0").html(coldest_10[0] + ' Daily Temperature');
	}

	function draw_temperature_graph(city)
	{
		$.ajax({
			url: 'https://api.openweathermap.org/data/2.5/forecast/city?q='+city+',ca&units=metric&mo',
			dataType: 'jsonp',
			success: function (weather_data) {
				// Flot expects an Array of data series, one for each line
				plot_data = [];

				// Validate city is Canadian and we got a response from OpenWeather
				if (weather_data['city']['country'] !== 'Canada')
				{
					alert('Sorry. OpenWeather Public API is missing this city or API unavailable.');
					return;
				}

				// Initialize temperature data series:
				plot_data[0] = {'label':'Temperature','data':[]};
				for (index = 0; index < weather_data['list'].length; ++index)
				{
					var test = weather_data['list'][index]['dt'];
					plot_data[0]['data'].push([parseInt(weather_data['list'][index]['dt'])*1000, weather_data['list'][index]['main']['temp']]);
				}

				// Find location on google maps using openweather coordinates
				var coord = weather_data['city']['coord'];
				var latitude = coord.lat;
				var longitude = coord.lon;

				var newLatlng = new google.maps.LatLng(latitude, longitude);
				if (marker != undefined)
					marker.setPosition(newLatlng);
				else
					marker = new google.maps.Marker({
						position: newLatlng,
						map: map
					});
				map.setCenter(newLatlng);

				var weather_div = $("#weather_graph_0"); // Set active div

				//graph options
				var options = {
					series: {
						grow: {
							active: false,
							stepMode: "linear",
							steps: 50,
							stepDelay: true
						},
						lines: {
							show: true,
							lineWidth: 4,
							steps: false
						},
						points: {
							show:true,
							radius: 5,
							symbol: "circle",
							fill: true,
							borderColor: "#fff"
						}
					},
					yaxis: {
					},
					xaxis: {
						mode: "time",
						timeformat: "%b %d",
						minTickSize: [1, "day"],
						tickLength: 0, // hide gridlines
						timezone: "browser" // use browser timezone
					},
					grid:
					{
						borderWidth: 0, // hide the graph border
						show: true,
						aboveData: true,
						color: "#3f3f3f" ,
						labelMargin: 5,
						axisMargin: 0,
						borderWidth: 0,
						borderColor:null,
						minBorderMargin: 5 ,
						clickable: true,
						hoverable: true,
						autoHighlight: true,
						mouseActiveRadius: 20
					},
					legend:
					{
						container: $("#weather_legend_0"), // move legend to its own container
						noColumns: 10 // Up to 10 legend columns (horizontal orientation)
					},
					tooltip: true, //activate tooltip
					tooltipOpts: {
						xDateFormat: "%b %d %I%P",
						content: "%s : %y.2&deg;C<br>Date: %x",
						shifts: {
							x: -30,
							y: -50
						}
					}
				};

				$.plot(weather_div, plot_data, options);

				var yaxisLabel = $("<div class='axisLabel yaxisLabel'></div>")
					.html("Temperature (&deg;C)")
					.appendTo(weather_div);
				var xaxisLabel = $("<div class='axisLabel xaxisLabel'></div>")
					.html("Time (browser timezone)")
					.appendTo(weather_div);
			}
		});
	}
}); //End document ready functions