import React, { Component } from 'react';
import './App.css';

/* Main app components */
import Header from "./Header";
import Map from "./components/Map";
import { StaticLocations } from "./StaticLocations";

/* Map custom sheet */
import MapStyles from "./MapStyles.json";

/* External libraries */
import scriptLoader from 'react-async-script-loader';  // src: https://www.npmjs.com/package/react-async-script-loader 

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
      selectedMarker: "",
      data: []
    };
  }

  /* Initialize map */
  initMap() {
    let mapOptions = {
      zoom: 12,
      center:  new window.google.maps.LatLng( 45.438384, 10.991622 ),
      styles: MapStyles
    };
    map = new window.google.maps.Map(document.getElementById( "map" ), mapOptions);
    this.setState({ map: map });
  }

  /* Lazy loading of the script needed for the scriptLoader decorator, src: https://www.npmjs.com/package/react-async-script-loader  */
  componentWillReceiveProps ({ isScriptLoaded, isScriptLoadSucceed }) {
    if (isScriptLoaded && !this.props.isScriptLoaded) { // load finished
      if (isScriptLoadSucceed) {
        this.initMap();
      } else {
        this.props.onError()
      }
    }
  }

  /* Src: https://www.npmjs.com/package/react-async-script-loader */
  componentDidMount () {
    const { isScriptLoaded, isScriptLoadSucceed } = this.props;
    if (isScriptLoaded && isScriptLoadSucceed) {
      this.initMap();
    }
  }







  render() {





    return (

      <div className="App">

        {/* Header component */}
        <Header />

        {/* Map component */}
        <Map />

      </div>
    );
  }
}

export default scriptLoader(
  [`https://maps.googleapis.com/maps/api/js?key=AIzaSyCfnJ5zhWZyh1ZJDrpsKJFzpDfaDDgJfiM&v=3.exp&libraries=geometry,drawing,places`]
)(App);

