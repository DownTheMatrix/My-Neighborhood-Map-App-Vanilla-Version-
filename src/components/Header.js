import React from "react";

function Header( props ) {
    return (
        <header id="header">
            <h1>Verona Explorer</h1>
            <button className = { "hamburger-button" } onClick = { props.onClick }>Toggler</button>
        </header>
    );
}

export default Header;