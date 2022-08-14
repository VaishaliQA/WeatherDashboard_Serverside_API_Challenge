// Varibale created
var city = document.getElementById("city");
var date = document.getElementById("date");
var temp = document.getElementById("temp");
var humidity = document.getElementById("humidity");
var wind = document.getElementById("wind");
var uvIndex = document.getElementById("uv-index");
var cardDeck = document.getElementsByClassName("card-deck");
var error = document.getElementById("errorMsg");
var requestURL = "https://api.openweathermap.org/data/2.5/";
var appId = "aec299195260a001b09706b5bfe740f7";
var exclue = "minutely,hourly";
var cityName = "";
var latitude = "";
var longitude = " ";

// When page ready this function is called
$(document).ready(function () {
  init();
});

// Call weatheroneapi with querystring parameters and fetch data and displayed into html dynamic elements
function getWeatherOneAPI(lat, long) {
  var queryURL =
    requestURL +
    "onecall?lat=" +
    lat +
    "&lon=" +
    long +
    "&exclude=" +
    exclue +
    "&appid=" +
    appId;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    // Check 5 days forecast is removed before displaying data for new city
    $(cardDeck).empty();

    // Get weather icon
    var weatherIcon = response.current.weather[0].icon;
    var iconImg = $("<img>");
    iconImg.addClass("img-fluid");
    iconImg.attr(
      "src",
      "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png"
    );
    $(city).append(iconImg);

    // Update background color of UV Index
    var uvIn = parseInt(response.current.uvi);
    if (uvIn <= 2) {
      $(".color").css({ "background-color": "green", color: "white" });
    } else if (uvIn >= 3 && uvIn <= 5) {
      $(".color").css({ "background-color": "yellow", color: "black" });
    } else if (uvIn >= 6 && uvIn <= 7) {
      $(".color").css({ "background-color": "orange" });
    } else if (uvIn >= 8 && uvIn <= 10) {
      $(".color").css({ "background-color": "red", color: "white" });
    } else if (uvIn >= 11) {
      $(".color").css({ "background-color": "violet", color: "white" });
    }

    //populates others current weather data
    $(temp).text("Temperature: " + response.current.temp + "° F");
    $(humidity).text("Humidity: " + response.current.humidity + "%");
    $(wind).text("Wind Speed: " + response.current.wind_speed + " MPH");
    $(".color").text(response.current.uvi);

    //displays the html to the user
    $("#current").css({ display: "block" });

    //array for the daily response
    var dailyForecast = response.daily;

    for (i = 1; i < dailyForecast.length - 2; i++) {
      // create variable and assign value to those variable
      var dailyDate = moment
        .unix(dailyForecast[i].dt)
        .format("dddd MM/DD/YYYY");
      var dailyTemp = dailyForecast[i].temp.day;
      var dailyHum = dailyForecast[i].humidity;
      var dailyIcon = dailyForecast[i].weather[0].icon;
      var dailyWind = dailyForecast[i].wind_speed;

      //creates dynamic elements and add text, attribute to elments
      var dailyDiv = $("<div class='card text-white bg-primary p-2'>");
      var hDate = $("<h6>").text(dailyDate);
      var imgIcon = $("<img>")
        .attr(
          "src",
          "https://openweathermap.org/img/wn/" + dailyIcon + "@2x.png"
        )
        .addClass("img-fluid")
        .css({ width: "100%" });
      var pTemp = $("<p>").text("Temp: " + dailyTemp + "° F");
      var pWind = $("<p>").text("Wind: " + dailyWind+ " MPH")
      var pHum = $("<p>").text("Humidity: " + dailyHum + "%");

      //appends the dynamic elements to the html
      dailyDiv.append(hDate);
      dailyDiv.append(imgIcon);
      dailyDiv.append(pTemp);
      dailyDiv.append(pWind);
      dailyDiv.append(pHum);
      $(".card-deck").append(dailyDiv);
      //displays this html to the user
      $("#five-day").css({ display: "block" });
    }
  });
}

// This function create dynamic button for city
function searchButton() {
  cityName = $("#city-input").val().trim();

  // create button dynamically and add city which entered by users
  var cityList = $("<button>");
  cityList.addClass("list-group-item list-group-item-action");
  //Convert first letter as capital
  cityName = cityName.charAt(0).toUpperCase()+cityName.slice(1)
  cityList.text(cityName);

  //buttons are added to the list in the sidebar
  $("ul").append(cityList);
  //after the user's city is saved to the list, the input field is cleared out
  $("#city-input").val("");
  getWeather();
}

// Listener event is called when user click on search button
$("#searchBtn").click(function (event) {
  event.preventDefault();
  searchButton();
});

// Method is called when page load
function init() {
  var cityName = localStorage.getItem("cityname");
  if (cityName !== null) {
    var cityList = $("<button>");
    cityList.addClass("list-group-item list-group-item-action");
    cityList.text(cityName);
    $("ul").append(cityList);
    // getWeather()
  }
}

// call forcast api and fetch lattitude and longitude data, validate city and save it in local storage.
function getWeather() {
  var queryURL =
    requestURL + "forecast?q=" + cityName + "&lang=en&appid=" + appId;
  //API call to get the latitude and longitude
  $.ajax({
    url: queryURL,
    method: "GET",
  })
    .then(function (response) {
      //stores the coordinates for lattitude and longitude from the API response
      latitude = response.city.coord.lat;
      longitude = response.city.coord.lon;

      //adds the city name and date to the html page
      $(city).text(response.city.name);
      $(date).text(moment.unix(response.list[0].dt).format("dddd MM/DD/YYYY"));

      //saves the city name to local storage
      localStorage.setItem("cityname", response.city.name);
      //passing the coordinates to the next function
      getWeatherOneAPI(latitude, longitude);
    })
    .catch(function (err) {
      //find button created with the incorrect city name and remove it
      $("button:contains(" + cityName + ")").remove();

      // Display error message visible
      error.setAttribute("style", "display:inline;");

      //error message goes away after 3 seconds
      setTimeout(function () {
        error.setAttribute("style", "display:none;");
      }, 3000);
    });
}

//click event listener for when the user clicks on a city in the back history list
$("ul").on("click", "button", function () {
  cityName = $(this).text();
  getWeather();
});

// when form is submit this evant is call.
$("#city-searchform").submit(function (event) {
  event.preventDefault();
  searchButton();
});
