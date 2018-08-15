/* Basic components */
import React, { Component } from "react";
import "./App.css";

/* Main app components */
import { StaticLocations } from "./data/StaticLocations";
import Header from "./components/Header";
import Map from "./components/Map";
import FilterLocations from "./components/FilterLocations";

/* Import API info */
import { CLIENT_ID, CLIENT_SECRET } from "./utils/FourSquareAPI";

/* External libraries */
import escapeRegExp from 'escape-string-regexp';  // src: https://www.npmjs.com/package/escape-string-regexp
import sortBy from 'sort-by';  // src: https://www.npmjs.com/package/sort-by
import ReactDependentScript from "react-dependent-script";  // src: https://www.npmjs.com/package/react-dependent-script

class App extends Component {
    state = {
      locations: StaticLocations,
      filterQuery: "",
      venuesList: [],
      foundVenues: [],
      hamburgerToggled: false,  // Set initial hamburger menu state
      selectedItem: null
    };

  /* Show infowindow */
  showInfo = ( e, selectedItem ) => {
    this.setState({ "selectedItem": selectedItem });
  }

  /* Called after the component has been mounted */
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

  /* Update filterQuery value */
  updateQuery = ( query ) => {
    this.setState({
      filterQuery: query.trim()
    });
  }

   /* Search for specific places */
  searchVenues = ( filterQuery ) => {
    let foundVenues;
    const { venuesList } = this.state;
    if ( filterQuery ) {
      const match = new RegExp(escapeRegExp( filterQuery ), 'i');  // src: Udacity "React Contacts List" mini-course
      foundVenues = venuesList.filter(( venue ) => { match.test( venue.name )});
    } else {
      foundVenues = venuesList;
    }
    foundVenues.sort(sortBy( 'title' ));
  }

  /* Fetch venues from FourSquare */
   /* Fetch data from FourSquare API */
  fetchVenues = () => {
    fetch(`https://api.foursquare.com/v2/venues/search?near=Verona&query=restaurant&category=4bf58dd8d48988d12d941735&limit=5&radius=5000&intent=browse&venuePhotos=1&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&v=20180101&locale=en`)
    .then ( res => res.json() )
    .then( data => {
      const venuesList = data.response.venues;
      if ( venuesList.length === 0 ) {  // Check if the data returned some results
        alert("Error! No available places. Try to refresh the page!");
      }
      venuesList.sort( sortBy( "name" ) );  // Use "sort-by" package functionality to arrange venues alphabetically
      const foundVenues = venuesList;
      this.setState({ 
        venuesList: venuesList,  // Update the state with the newly fetched data
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
    const { hamburgerToggled, locations, foundVenues, selectedItem, filterQuery } = this.state;

    /* Create a new array for the locations to filter, credit: "udacity-react-course: list-contacts project" */
    let showingLocations;

    if ( filterQuery ) {
      const match = new RegExp(escapeRegExp( filterQuery ), "i");
      showingLocations = locations.filter(( location ) => match.test( location.locationName ));
    } else {
      showingLocations = locations;
    }

    return (

      <div id="app-container" role="main">

        {/* Display an error message if there was a probolem with the API call */}
        <div id="display-error-field"></div>
         
         {/* Header component */}
         <Header 
            onClick = { this.toggleHamburgerMenu }
          />
 
          <main className="main-map">

          {/* Side menu */} 
          <aside className = { hamburgerToggled ? "hamburger-show" : "hamburger-hide" }>

            <div id="list-wrapper">

              {/* Input component */}
              <FilterLocations 
                onChange = { this.updateQuery } 
                value = { filterQuery }
                /* venues = { foundVenues } */
              /> 

                <ul id = "list-aside">
                  { showingLocations.map(( item, index ) => {
                    return (
                      <li 
                        tabIndex = "0"
                        role = "button"
                        aria-label = { `Details for ${ item.locationName }` }
                        key = { index } 
                        onClick = { e => this.showInfo( e, item )}> { item.locationName }
                      </li>
                      );
                    })};
                </ul> 
            </div>
          </aside>
       
          {/* Map component */}
          <section className = "map-container" role = "application" tabIndex="-1">
            <ReactDependentScript scripts = {["https://maps.googleapis.com/maps/api/js?key=AIzaSyCfnJ5zhWZyh1ZJDrpsKJFzpDfaDDgJfiM&v=3.exp&libraries=geometry,drawing,places"]}>
              <Map 
                center = {{ lat: 45.438384, lng: 10.991622 }} 
                zoom = { 14 } 
                data = { locations } 
                selectedItem = { selectedItem } 
                foundVenues = { foundVenues }
              />
            </ReactDependentScript>
          </section>
        
        </main>
      </div>
      
    );
  }
}

export default App;