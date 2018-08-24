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

class App extends Component {
    state = {
      locations: StaticLocations,
      filterQuery: "",
      venuesList: [],
      foundVenues: [],
      hamburgerToggled: false,  // Set initial hamburger menu state
      selectedItem: null,
      mapApiError: false
    };
  
  componentWillMount = () => {
    this.setState({ mapApiError: window.mapApiError || !navigator.onLine });
  }

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
    this.setState({ mapApiError: window.mapApiError || !navigator.onLine });
    console.log( this.state.mapApiError );  // log to the console for testing...
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
    this.setState({
      foundVenues,
      filterQuery
    });
  }

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
      showError.style.display = "block";
      showError.innerHTML = "Sorry, we couldn't retrieve data properly from FourSquare. Check your URL and try to reload the page.";
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
                onSearch = { this.searchVenues }  // To replace the onChange prop (in progress)
              /> 

                <ul id = "list-aside" aria-labelledby = "Locations list" >
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
          <section className = "map-container">
          {/* Conditional rendering of the Map component */}
          { !this.state.mapApiError && 
              <Map 
                center = {{ lat: 45.438384, lng: 10.991622 }} 
                zoom = { 14 } 
                data = { locations }  // Static locations
                selectedItem = { selectedItem } 
                onFilter = { this.updateQuery }
                foundVenues = { foundVenues.length > 0 ? foundVenues : locations }  // Check if foundVenues is empty. If yes, assign the static locations instead (for future development purposes, as for now they coincide)
              /> }
              { this.state.mapApiError && (
                <div id="error-message">
                  <p>Sorry, the map couldn't load properly. Check your browser console for more details and try again.</p>
                </div>
              ) }
          </section>
        
        </main>
      </div>
    );
  }
}

export default App;