/* Basic components */
import React, { Component } from "react";
import './App.css';

/* Main app components */
import { StaticLocations } from "./StaticLocations";
import Header from "./components/Header";
import Map from "./components/Map";

/* Import infowindows content */
import { infoWindowContent, infoWindowError } from "./InfoWindows";

/* Map custom sheet */
import MapStyles from "./MapStyles.json";

/* Import API info */
import { CLIENT_ID, CLIENT_SECRET } from "./utils/FourSquareAPI";

/* External libraries */
import scriptLoader from 'react-async-script-loader';  // src: https://www.npmjs.com/package/react-async-script-loader 
import escapeRegExp from 'escape-string-regexp';  // src: https://www.npmjs.com/package/escape-string-regexp
import sortBy from 'sort-by';  // src: https://www.npmjs.com/package/sort-by

/* Define global variables */
/* let markers = [];
let infoWindows = []; */
let map;
let fetchData = null;
let buildMap = {}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: StaticLocations,
      map: {},
      filterQuery: "",
      mapInitialization: true,
      data: [],
      hamburgerToggled: false,  // Set initial hamburger menu state
      markers: [],  // new!!!
      infoWindows: []  // new!!!
    };
  }

  /* Initialize map, src: https://developers.google.com/maps/documentation/javascript/markers */
  initMap() {
    let myLatlng = new window.google.maps.LatLng( 45.438384, 10.991622 );
    let mapOptions = {
      zoom: 14,
      center:  myLatlng,
      styles: MapStyles
    };
    map = new window.google.maps.Map(document.getElementById( "map" ), mapOptions);
    this.setState({ map: map });
    this.renderMarkers();
  }

  /* Display error messages if the map initialization fails */
  initError( err ) {
    console.log("Can't load the map properly. Error type: ", err);
    this.setState({ mapInitialization: false });
  }

  /* Lazy loading of the script needed for the scriptLoader decorator, src: https://www.npmjs.com/package/react-async-script-loader  */
  componentWillReceiveProps ({ isScriptLoaded, isScriptLoadSucceed }) {
    if (isScriptLoaded && !this.props.isScriptLoaded) { // load finished
      if (isScriptLoadSucceed) {
        this.initMap();
        /* this.fetchVenues(); */  // API call to FourSquare
      } else {
        this.initError();
      }
    }
  }

  /* Retrieve the static locations info from the StaticLocations file and render the markers on the map */
  renderMarkers() {  // src: https://developers.google.com/maps/documentation/javascript/markers
    const { locations } = this.state;
    locations.map(( location ) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.locationCoords.lat, lng: location.locationCoords.lng },
        map: map,
        title: location.locationName,
        animation: window.google.maps.Animation.DROP
      });
    });
  }

  /* Create the markers infowindows, src: https://developers.google.com/maps/documentation/javascript/infowindows */
  createInfoWindow( marker, infoWindow ) {
    
  }

  /* Called immediately after the component has been updated */
  componentDidUpdate() {

  }

  /* Src: https://www.npmjs.com/package/react-async-script-loader */
  componentDidMount () {
    console.log("Component did mount!");
    if ( window.screen.width > 500 ) {  // Toggle automatically hamburger menu if screen size is greater than...
      this.setState({ hamburgerToggled: true }); 
    }
  }

   /* Toggle the hamburger menu function */
   toggleHamburgerMenu = () => {
    if (this.state.hamburgerToggled) {
      this.setState({ hamburgerToggled: false });
    } else {
      this.setState({ hamburgerToggled: true });
    }
  }

  /* Fetch venues from FourSquare */
  fetchVenues() {
    let foundVenues = [];
    StaticLocations.map(( location ) => {
      fetch(`https://api.foursquare.com/v2/venues/${ location.locationId }` +
      `?client_id=${ CLIENT_ID }` +
      `&client_secret=${ CLIENT_SECRET }` +
      `&v=20180101&locale=en`)
      .then( response  => response.json())
      .then( data => {
        if ( data.meta.code === 200) {  // Check if the request code returns success status
          foundVenues.push( data.response.venue )
        }
      }).catch( err => {
        fetchData = false;
        console.log("The fetch attempt failed. Error: ", err);
      });
    });
    this.setState({ markers: foundVenues });
    console.log(this.state.markers);
  }

  render() {

    /* Destructure state variables for readability */
    const { hamburgerToggled } = this.state;

    return (

      <div className="app-container" role="main">

        {/* Header component */}
        <Header />

        {/* Side menu */}
        <main className="main-map">
          <aside className = { hamburgerToggled ? "hamburger-show" : "hamburger-hide" }>
          
            <div id="list-wrapper">
            <ul id="list-aside">
              <li>list-item</li>
              <li>list-item</li>
              <li>list-item</li>
              <li>list-item</li>
              <li>list-item</li>
            </ul>
            </div>

          </aside>
       
        {/* Map component */}
        <section className="map-container">
          <Map />
        </section>
        </main>
      </div>
    );
  }
}

export default scriptLoader(
  [`https://maps.googleapis.com/maps/api/js?key=AIzaSyCfnJ5zhWZyh1ZJDrpsKJFzpDfaDDgJfiM&v=3.exp&libraries=geometry,drawing,places`]
)(App);
