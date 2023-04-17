import React from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Background from "../components/Location/Background";
import Header from "../components/_App/Header";
import UnitSelect from "../components/_App/UnitSelect";
import Current from "../components/Location/Current";
import Daily from "../components/Location/Daily";
import Hourly from "../components/Location/Hourly";
import { Icon, Menu } from "semantic-ui-react";
import { countries } from "../public/countries";
import weatherResponse from "../utils/weatherResponse";
import { parseCookies, setCookie, destroyCookie } from 'nookies';
import NProgress from "nprogress";

NProgress.configure({ easing: 'ease', speed: 150 });


export default function SearchedLocation({ city, region, country, latitude, longitude, weatherData, units }) {
  NProgress.done();
  let cookies = parseCookies();
  const [unitsState, setUnitsState] = React.useState(units);
  const [loading, setLoading] = React.useState(false);

  const weather = weatherResponse(weatherData);
  const router = useRouter();


  const locationInfo = city + "," + region + "," + country + "," + latitude + "," + longitude;

  setCookie(null, "currentLocation", locationInfo, {
    path: '/',
  })


  let regionAndCountry;
  if (region !== "" && region !== city) {
    regionAndCountry = region + ", "  + country;
  } else {
    regionAndCountry = country;
  }


  const timeOfDay = weather.current.icon.substring(2,3);
  const conditions = weather.current.icon.substring(0,2);
  const clear = ["01", "02"];
  const overcast = ["03", "04", "09", "10", "11", "13", "50"];

  let background = "day-clear"
  if (timeOfDay === "d" && clear.includes(conditions)) {
    background = "day-clear";
  } else if (timeOfDay === "d" && overcast.includes(conditions)) {
    background = "day-overcast"
  } else if (timeOfDay === "n" && clear.includes(conditions)) {
    background = "night-clear";
  } else if (timeOfDay === "n" && overcast.includes(conditions)) {
    background = "night-overcast";
  }


  return (
    <>
      <div class={`page-main ${background}`}>
      <Background conditions={weather.current.icon} />
      <Header units={unitsState} setUnits={setUnitsState} setLoading={setLoading} />
      <div class="page-location">
        <div class="location-main">
          <div class="location-results">
            <div class="location-border">
              <div class={`row location-top-${background}`}>
                <div class="col-6">
                  <p class="location-city"> {city} </p>
                  <p class="location-country"> {regionAndCountry} </p>
                  <p>  {weather.coordinates} </p>
                  <img class="current-icon" src={`/images/icons/${weather.current.icon}.png`}/>
                  <p class="location-temp"> {`${weather.current.temp[unitsState]}` + String.fromCharCode(176)} </p>
                  <p class="location-data"> {`Feels Like ${weather.current.feelsLike[unitsState]}` + String.fromCharCode(176)} </p>
                </div>

                <div class="col-6">
                  <Current weather={weather} units={unitsState} />
                </div>
              </div>
            </div>

            <div class="location-border">
              <div class={`location-top-${background}`}>
                <p class="section-title"> HOURLY FORECAST </p>
                <div class="hourly-row">
                  <Hourly weather={weather} units={unitsState} />
                </div>
              </div>
            </div>

            <div class="location-border">
              <div class={`location-top-${background}`}>
                <p class="section-title"> DAILY FORECAST </p>
                <div class="hourly-row">
                  <Daily weather={weather} units={unitsState} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    </>
  );
}

SearchedLocation.getInitialProps = async ({ query: { search } }) => {
  const geoUrl = `https://proxy-1wq4.onrender.com/https://api.radar.io/v1/geocode/forward?query=${search}`;
  const geoPayload = { headers: { "Authorization": "prj_live_pk_908ae704a7ec458b3aa289281711cf098f68af5a" } };
  const geoResponse = await axios.get(geoUrl, geoPayload);
  const geoData = geoResponse.data.addresses[0];
  const city = geoData.neighborhood ? geoData.neighborhood : geoData.city;
  const region = geoData.state;
  const country = geoData.country;
  const latitude = geoData.latitude;
  const longitude = geoData.longitude;

  const weatherUrl = `https://proxy-1wq4.onrender.com/https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=imperial&appid=a27a7e6cb45357aa26387fcbdf4621cd`;
  const weatherPayload = { headers: { "X-Requested-With": "XMLHttpRequest" } };
  const weatherResponse = await axios.get(weatherUrl, weatherPayload);
  const weatherData = weatherResponse.data;
  return { city, region, country, latitude, longitude, weatherData };
};
