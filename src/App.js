import React, { Component } from 'react';
import './App.css';

/* Main app components */
import { StaticLocations } from "./StaticLocations";
import Header from "./Header";
import Map from "./components/Map";

/* Map custom sheet */
import MapStyles from "./MapStyles.json";

/* Import API info */
import { CLIENT_ID, CLIENT_SECRET } from "./utils/FourSquareAPI";

/* External libraries */
import scriptLoader from 'react-async-script-loader';  // src: https://www.npmjs.com/package/react-async-script-loader 
import escapeRegExp from 'escape-string-regexp';  // src: https://www.npmjs.com/package/escape-string-regexp
import sortBy from 'sort-by';  // src: https://www.npmjs.com/package/sort-by

/* Define global variables */
let markers = [];
let infoWindows = [];
let map;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: StaticLocations,
      map: {},
      filterQuery: "",
      mapInitialization: true,
      data: [],
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
    /* this.setState({ map: map }); */
    this.renderMarkers()
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
        } else {
          this.initError();
        }
      }
    }

  /* Retrieve the static locations info from the StaticLocations file and render the markers on the map */
  renderMarkers() {   
    const { locations } = this.state;
    locations.map(( location ) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.locationCoords.lat, lng: location.locationCoords.lng  },
        map: map,
        title: location.locationName
      });
    });
  }

  /* Called immediately after the component has been updated */
  componentDidUpdate() {

  }

  /* Src: https://www.npmjs.com/package/react-async-script-loader */
  componentDidMount () {
    console.log("Component did mount!");
  }

  render() {

    return (

      <div className="map-container">

        {/* Header component */}
        <Header />

        {/* Map component */}
        <Map />

      </div>

    );
  }
}

export default scriptLoader(
  [`https://maps.googleapis.com/maps/api/js?key=AIzaSyCfnJ5zhWZyh1ZJDrpsKJFzpDfaDDgJfiM&v=3.exp&libraries=geometry,drawing,places&sensor=true`]
)(App);
