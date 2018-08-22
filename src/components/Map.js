/* Import main components */
import React, { Component } from 'react';

/* Map custom sheet */
import MapStyles from "../data/MapStyles.json";

/* Account for auth failure */
window.gm_authFailure = ( err ) => { 
    const showError = document.querySelector("#display-error-field");
    showError.style.display = "block";
    showError.innerHTML = "Sorry, looks like there's a problem with your authentification. Check your API key and try again.";
    console.error("Sorry, the map can be used in development only", err);
};

/* Define global variables */
let map;

class Map extends Component {
    constructor( props ) {
        super( props )
        this.markers = [];
        this.infoWindow = null;
    };

    /* Called after the update occurs */
    componentDidUpdate = () => {
        if ( this.props.selectedItem ) {
            let selectedMarker = this.markers.find( m => {
                return m.id === this.props.selectedItem.locationId;
            });
        this.showInfoWindow( selectedMarker );
        } 
    }

    /* Called after a component is mounted */
    componentDidMount = () => {
        this.initMap();
    }

    /* Initialize map objects */
    initMap = () => {
        let mapOptions = {
            zoom: this.props.zoom,
            center: this.props.center,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            style: MapStyles
        };

        /* Instantiate the map object */
        map = new window.google.maps.Map(document.getElementById("map"), mapOptions);
        
        /* Instantiate the infowindow object */
        this.infoWindow = new window.google.maps.InfoWindow({ maxWidth: 200 });

        /* Instantiate the map boundaries object */
        let bounds = new window.google.maps.LatLngBounds();

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
  
        /* Loop through the locations data and create a marker for each location */
        this.props.foundVenues.forEach( item => {
            const marker = new window.google.maps.Marker({
                map: map,
                id: item.locationId,
                position: item.locationCoords,
                title: item.locationName,
                icon: markerIcon,
                animation: window.google.maps.Animation.DROP,
                photo: item.photo
            });

            /* Listen to click events on the markers */
            marker.addListener( "click", () => {
                this.showInfoWindow( marker );
                this.animateMarkers( marker );
            });

            /* Get markers position on the map and push the newly created markers to the markers array */
            bounds.extend( marker.getPosition() );
            this.markers.push( marker );

            /* Interact when the map is clicked on */
            this.onMapClicked( this.infoWindow );

        });
        map.fitBounds( bounds );
    }

    /* Listen to click events on the map */
    onMapClicked = ( infowindow ) => {
        window.google.maps.event.addListener( map, "click", () => {
            infowindow.close();
        });
    }

    /* Animate markers on click */
    animateMarkers = ( marker ) => {
        marker.setAnimation( window.google.maps.Animation.BOUNCE );
        setInterval( () => {
        marker.setAnimation( null );
        }, 1200 );  // Toggle off the bounce animation after the set amount of time
    }

    /* Show the corresponding infowindow */
    showInfoWindow = ( marker ) => {
        const { foundVenues } = this.props;
        const matchVenue = foundVenues.filter( venue => venue.name === marker.title );   
        const address = `${ matchVenue[0].location.address ? matchVenue[0].location.address : "No address found" }`;  // credit: https://stackoverflow.com/questions/45676974/using-conditionals-inside-template-literals
        const infoContent = `<div id = "info-window">
                                <h3>${ marker.title }</h3>
                                <img class = "info-img" src = "${ marker.photo }" alt = "${ marker.title } photo" />
                                <p>${ matchVenue[0].location.address === undefined ? matchVenue[0].location.formattedAddress : address }</p>
                            </div>`;  // Display formatted address if normal address is not found
        this.infoWindow.setContent( infoContent );
        this.infoWindow.open( marker.map, marker );
        this.animateMarkers( marker );
    }

    render() {
        return (
            <div tabIndex = "0" id = "map" role = "application" aria-label = "Verona Restaurants Explorer" />
        );
    }
}

export default Map;