/* Basic components */
import React, { Component } from "react";
import './App.css';

/* Main app components */
import { StaticLocations } from "./StaticLocations";
import Header from "./components/Header";
import Map from "./components/Map";
import FilterLocations from "./components/FilterLocations";

/* Import infowindows content */
/* import { infoWindowContent, infoWindowError } from "./InfoWindows"; */

/* Map custom sheet */
import MapStyles from "./data/MapStyles.json";

/* Import API info */
import { CLIENT_ID, CLIENT_SECRET } from "./utils/FourSquareAPI";

/* External libraries */
import scriptLoader from 'react-async-script-loader';  // src: https://www.npmjs.com/package/react-async-script-loader 
import escapeRegExp from 'escape-string-regexp';  // src: https://www.npmjs.com/package/escape-string-regexp
import sortBy from 'sort-by';  // src: https://www.npmjs.com/package/sort-by

/* Define global variables */
let map;  // Define map variable to use in the initMap() function

/* Create markers for the static locations */
let markers = [];

/* Create infowindows */
let infowindows = [];

class App extends Component {
    state = {
      locations: StaticLocations,
      map: {},
      filterQuery: "",
      mapInitialization: true,
      infowindowOpen: false,
      venuesList: [],
      foundVenues: [],
      hamburgerToggled: false,  // Set initial hamburger menu state
    };

  /* Account for auth failure */

  /* Initialize map, src: https://developers.google.com/maps/documentation/javascript/markers && https://stackoverflow.com/questions/3059044/google-maps-js-api-v3-simple-multiple-marker-example */
  initMap = () => {
    const initialCenter = new window.google.maps.LatLng( 45.438384, 10.991622 );
    let mapOptions = {
      zoom: 14,
      center:  initialCenter,
      styles: MapStyles,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP
    };

    /* Create map */
    map = new window.google.maps.Map(document.getElementById( "map" ), mapOptions);

    /* Create infowindow */
    const largeInfoWindow = new window.google.maps.InfoWindow({
      maxWidth: 350
    });

    /* Create map boundaries */
    const bounds = new window.google.maps.LatLngBounds();

    const { locations } = this.state;  // Destructure for readability

    /* Add a custom marker, credit: https://github.com/atmist/snazzy-info-window/blob/master/examples/complex-styles/scripts.js */
    const markerIcon = {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      fillColor: "#e25a00",
      fillOpacity: 0.95,
      scale: 2,
      strokeColor: "#fff",
      strokeWeight: 3,
      anchor: new window.google.maps.Point(12, 24)
  };

    /* Loop through the locations array and create a marker for each coordinates */
    for ( let i = 0; i < locations.length; i++ ) {
      const position = locations[i].locationCoords;
      const locationTitle = locations[i].locationName;

      const newMarker = new window.google.maps.Marker({
        map: map,
        position: position,
        title: locationTitle,
        animation: window.google.maps.Animation.DROP,
        icon: markerIcon,
        id: i
      });

      /* Push the newly created markers to the markers array */
      markers.push( newMarker );

      /* Listen for a click event to open the corresponding infowindow */
      newMarker.addListener("click", () => {
        this.populateInfoWindow( newMarker, largeInfoWindow );
      });

      /* Close infowindow when the map is clicked on */
      this.onMapClicked ( largeInfoWindow );
    
      /* Extend the map boundaries to include the markers */
      bounds.extend( markers[i].position );
    }   
    // Extend the boundaries of the map for each marker
    map.fitBounds (bounds );
  }

  /* Create infowindow content and link it to the corresponding marker */
  populateInfoWindow = ( marker, infowindow ) => {
    let infoWindowContent = `<div id="info-window">
                                <h3>${marker.title}</h3>
                                <img src="" alt="" >
                                <p>Description here</p>
                             </div>`;
    if ( infowindow.marker !== marker ) {
      infowindow.marker = marker;
      infowindow.setContent( infoWindowContent );
      infowindow.open( map, marker );
    /*   infowindow.addListener( "closeclick", () => {
      infowindow.setMarker( null );
      }); */
    }
  }

  /* Display an error message if the map initialization function fails */
  initError = ( err ) => {
    console.log("Can't load the map properly. Error type: ", err);
    this.setState({ mapInitialization: false });
  }

  /* Lazy loading of the script needed for the scriptLoader decorator, src: https://www.npmjs.com/package/react-async-script-loader  */
  componentWillReceiveProps = ({ isScriptLoaded, isScriptLoadSucceed }) => {
    if ( isScriptLoaded && !this.props.isScriptLoaded ) { // load finished
      if ( isScriptLoadSucceed ) {
        this.initMap();
      } else {
        this.initError();
      }
    }
  }

  /* Retrieve the static locations info from the StaticLocations file and render the markers on the map */
/*   renderMarkers () {  // src: https://developers.google.com/maps/documentation/javascript/markers
    const { locations } = this.state;
    locations.map(( location ) => {
      const marker = new window.google.maps.Marker({
        position: { lat: location.locationCoords.lat, lng: location.locationCoords.lng },
        map: map,
        title: location.locationName,
        animation: window.google.maps.Animation.DROP
      });
    });
  } */

  /* Create the markers infowindows, src: https://developers.google.com/maps/documentation/javascript/infowindows */
  createInfoWindow( marker, infoWindow ) {
    
  }

  /* Called immediately after the component has been updated */
  componentDidUpdate = () => {
    
  }

  /* Src: https://www.npmjs.com/package/react-async-script-loader */
  componentDidMount = () => {
    console.log("Component did mount!");
    if ( window.screen.width > 500 ) {  // Toggle automatically hamburger menu if screen size is greater than...
      this.setState({ hamburgerToggled: true }); 
    }
    this.fetchVenues();   // API call to FourSquare
  }

   /* Toggle the hamburger menu function */
   toggleHamburgerMenu = () => {
    if ( this.state.hamburgerToggled ) {
      this.setState({ hamburgerToggled: false });
    } else {
      this.setState({ hamburgerToggled: true });
    }
  }

  /* Listen to click events on the map */
  onMapClicked = ( infowindow ) => {
    window.google.maps.event.addListener( map, "click", () => {
      infowindow.close();
    });
  }

  /* Fetch venues from FourSquare */
   /* Fetch data from FourSquare API */
   fetchVenues = () => {
    fetch(`https://api.foursquare.com/v2/venues/search?near=Verona&query=hotel&category=4bf58dd8d48988d12d941735&limit=5&radius=5000&intent=browse&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=20180101&locale=en`)
    .then ( res => res.json() )
    .then( data => {
      const venuesList = data.response.venues;
      if ( venuesList.length === 0 ) {  // Check if the data returned some results
        window.alert("Error! No available places. Try to refresh the page!");  // To delete after refactor
      }
      venuesList.sort( sortBy( "name" ) );  // Use "sort-by" package functionality to arrange venues alphabetically
      const foundVenues = venuesList;
      this.setState({ 
        venuesList: venuesList, 
        foundVenues: foundVenues
      }) 
      console.log("VenuesList :", this.state.venuesList);
      console.log("FoundVenues :", this.state.foundVenues);
    })
    .catch( err => {  // Notify the user about the error type
      const showError = document.querySelector("#display-error-field");
      showError.innerHTML = "Sorry, we couldn't retrieve data correctly. Try to reload the page.";
      console.error("Sorry, we couldn't retrieve data properly. An error occurred with the FourSquare API", err)
    })
  }

  render() {

    /* Destructure state variables for readability */
    const { hamburgerToggled, foundVenues, locations } = this.state;

    return (

      <div id="app-container" role="main">

        {/* Display an error message if there was a probolem with the API call */}
        <div id="display-error-field"></div>

         {/* Header component */}
         <Header 
          onClick = { this.toggleHamburgerMenu }/>
 
          <main className="main-map">

          {/* Side menu */} 
          <aside className = { hamburgerToggled ? "hamburger-show" : "hamburger-hide" }>

            <div id="list-wrapper">

              {/* Input component */}
              <FilterLocations 
              />

              <ul id="list-aside">
                { locations.map(( location, index ) => {
                  return (
                  <li 
                    role = "button"
                    key = { index }
                    onClick = { () => alert( "clicked on " + location.locationName ) }
                    >{ location.locationName }</li>
                  );
                })};
              </ul>
            </div>
          </aside>
       
        {/* Map component */}
        <section className="map-container">
          <Map 
            google = { this.props.google } 
            className = { "map-component" }
            role = "application" />
        </section>
        
        </main>
      </div>
    );
  }
}

export default scriptLoader(
  [`https://maps.googleapis.com/maps/api/js?key=AIzaSyCfnJ5zhWZyh1ZJDrpsKJFzpDfaDDgJfiM&v=3.exp&libraries=geometry,drawing,places`]
)(App);
