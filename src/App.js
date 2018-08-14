/* Basic components */
import React, { Component } from "react";
import './App.css';

/* Main app components */
/* import { StaticLocations } from "./data/StaticLocations"; */
import Header from "./components/Header";
import Map from "./components/Map";
import FilterLocations from "./components/FilterLocations";

/* Import API info */
import { CLIENT_ID, CLIENT_SECRET } from "./utils/FourSquareAPI";

/* External libraries */
import escapeRegExp from 'escape-string-regexp';  // src: https://www.npmjs.com/package/escape-string-regexp
import sortBy from 'sort-by';  // src: https://www.npmjs.com/package/sort-by
import ReactDependentScript from "react-dependent-script";  // src: https://www.npmjs.com/package/react-dependent-script

/* Define global variables */
let map;  // Define map variable to use in the initMap() function

/* SO proposal... */
const data = [{
  locationCoords: {
    lat: 45.42422,
    lng: 10.991686
  },
  locationName: "Mizuki Lounge Restaurant",
  locationId: "5952389dccad6b171c8d3e58",
  address: "",
},
{
  locationCoords: {
    lat: 45.448458542692556,
    lng: 11.00220835305019
  },
  locationName: "TeodoricoRe Restaurant Bar Verona",
  locationId: "4dcee64f45ddbe15f8956f72",
  address: ""
},
{
  locationCoords: {
    lat: 45.438385,
    lng: 10.991622
  },
  locationName: "Hotel Montemezzi Restaurant",
  locationId: "59c1f834a2a6ce4762f1de1e",
  address: ""
},
{
  locationCoords: {
    lat: 45.44499306798319,
    lng: 10.998014420366752
  },
  locationName: "AMO Opera Restaurant",
  locationId: "52630778498ef9cb50326fb7",
  address: ""
},
{
  locationCoords: {
    lat: 45.44232305284876,
    lng: 10.99606990814209
  },
  locationName: "Sun Restaurant",
  locationId: "5590d1da498e4edbe573034b",
  address: ""
}
];

class App extends Component {
    state = {
      /* locations: StaticLocations, */
      map: {},
      filterQuery: "",
      filteredLocations: [],
      mapInitialization: true,
      infowindowOpen: false,
      venuesList: [],
      foundVenues: [],
      hamburgerToggled: false,  // Set initial hamburger menu state
      selectedItem: null
    };

    /* SO proposal... */
    showInfo(e, selectedItem) {
      this.setState({ "selectedItem": selectedItem });
    }

  /* Account for auth failure */
  gm_authFailure = ( err ) => { 
    const showError = document.querySelector("#display-error-field");
    showError.innerHTML = "Sorry, looks like there's a problem with your authentification";
    console.error("Sorry, the map can be used in development only", err)
  };

  /* Animate markers on click */
  animateMarkers = ( marker ) => {
    marker.setAnimation( window.google.maps.Animation.BOUNCE );
    setInterval( () => {
      marker.setAnimation( null );
    }, 1200 );
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

  /* handleInputChange function for filtering */
  handleInputChange = (e) => {
    this.setState({
      filterQuery: e.target.value,
    })
    console.log(this.state.filterQuery)
  }

   /* Search for specific places */
   searchVenues = ( filterQuery ) => {
    let foundVenues;
    const { venuesList } = this.state;
    if ( filterQuery ) {
      const match = new RegExp(escapeRegExp( filterQuery ), 'i');  // src: Udacity "React Contacts List" mini-course
      return foundVenues = venuesList.filter(( venue ) => { match.test( venue.name )});
    } else {
      return foundVenues = venuesList;
    }
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
    const { hamburgerToggled } = this.state;

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
                onSearch = { this.searchVenues } 
                onChange = { this.handleInputChange } />


            
                <ul id="list-aside">

                {data.map((item, index) => {
                  return <li 
                  key = { index } 
                  onClick = { e => this.showInfo( e, item )} > {item.locationName }</li>;
                })};

                </ul>
              </div>
            </aside>
       
          {/* Map component */}
          <section className="map-container">
          <ReactDependentScript scripts={['https://maps.googleapis.com/maps/api/js?key=AIzaSyCfnJ5zhWZyh1ZJDrpsKJFzpDfaDDgJfiM&v=3.exp&libraries=geometry,drawing,places']}>
            <Map center={{ lat: 45.438384, lng: 10.991622 }} zoom={14} data={data} selectedItem={this.state.selectedItem} />
          </ReactDependentScript>
    
        </section>
        
        </main>
      </div>
      
    );
  }
}

export default App;