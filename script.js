var temperature = document.getElementById("temperature");
var humidity = document.getElementById("humidity");

var tomorrowTemperature = document.getElementById("tomorrow-temperature");
var tomorrowHumidity = document.getElementById("tomorrow-humidity");

var homeTemperature = document.getElementById("current-home-temperature");
var homeHumidity = document.getElementById("current-home-humidity");

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(function(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    var day = currentDate.getDate().toString().padStart(2, '0');
    var priceClass = 'SE3'; // Replace with the desired price class (e.g., '1', '2', '3')

    var apiUrl = `https://www.elprisetjustnu.se/api/v1/prices/${year}/${month}-${day}_${priceClass}.json`;

    console.log("Latitude: " + latitude + ", Longitude: " + longitude);

    fetch(`https://api.weatherapi.com/v1/current.json?key=c87a618261284f9e8da155626232106&q=${latitude},${longitude}`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        var currentTemp = data.current.temp_c;
        var currentHumidity = data.current.humidity;

        humidity.textContent = currentHumidity + "%";
        temperature.textContent = currentTemp + " C";
      })
      .catch(error => {
        console.log("Error fetching weather data:", error);
      });

    fetch(`https://api.weatherapi.com/v1/forecast.json?key=c87a618261284f9e8da155626232106&q=${latitude},${longitude}&days=2`)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        var forecast = data.forecast.forecastday;
        var tomorrow = forecast[1]; // Index 0 represents the current day, index 1 represents tomorrow

        var tomorrowTemp = tomorrow.day.avgtemp_c;
        var tomorrowHumidityValue = tomorrow.day.avghumidity;

        tomorrowHumidity.textContent = tomorrowHumidityValue + "%";
        tomorrowTemperature.textContent = tomorrowTemp + " C";
      })
      .catch(error => {
        console.log("Error fetching weather data:", error);
      });



      
      fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        var currentHour = currentDate.getHours();
        var currentPrice = null;
        var next12HourPrice = null;
    
        for (var i = 0; i < data.length; i++) {
          var priceData = data[i];
          var startTime = new Date(priceData.time_start);
          var startHour = startTime.getHours();
    
          if (currentHour === startHour) {
            currentPrice = priceData.SEK_per_kWh;
          } else if ((currentHour + 12) % 24 === startHour) {
            next12HourPrice = priceData.SEK_per_kWh;
          }
    
          if (currentPrice !== null && next12HourPrice !== null) {
            break;
          }
        }
    
        if (currentPrice !== null) {
          var currentHourElement = document.getElementById("current-hour-element");
          currentHourElement.textContent = currentPrice.toFixed(5) + " SEK/kWh";
        } else {
          console.log("Current hour's electricity price not found in the API response");
        }
    
        if (next12HourPrice !== null) {
          var tomorrowElectricityElement = document.getElementById("tomorrow-electricity");
          tomorrowElectricityElement.textContent = next12HourPrice.toFixed(5) + " SEK/kWh";
        } else {
          console.log("Electricity price for the next 12 hours not found in the API response");
        }
      })
      .catch(error => {
        console.log("Error fetching electricity price:", error);
      });
    

    
      
    // Read data from the file
    fetch('/putty.log')
  .then(response => response.text())
  .then(data => {
    // Extract the temperature and humidity from the file data
    var regex = /T = (\d+\.?\d*) deg\. C, H = (\d+\.?\d*)%/g;
    var matches = data.match(regex);

    if (matches && matches.length > 0) {
      var lastMatch = matches[matches.length - 1];
      var values = lastMatch.match(/(\d+\.?\d*)/g);

      if (values && values.length === 2) {
        var arduinoTemperature = values[0];
        var arduinoHumidity = values[1];

        homeTemperature.textContent = arduinoTemperature + " C";
        homeHumidity.textContent = arduinoHumidity + "%";
      }
    }
  })
  .catch(error => {
    console.log("Error reading data from the file:", error);
  });

  



  });
} else {
  console.log("Geolocation is not supported by this browser.");
}
