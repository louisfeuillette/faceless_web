import React from "react";

import { Link } from "react-router-dom";

import "./Navbar.css"

function Navbar(props) {
    return (
        <div className="navBar">
            <div>
                <img src="./logo-faceless.png" className="logoBouton" alt="logo"/>
            </div>
            <div>
                <Link to="/Home" className="boutons">Rencontre</Link>
                <Link to="/Profil" className="boutons">Mon profil</Link>
                <Link to="/Message" className="boutons">Message</Link>
            </div>
        </div>
    );
}

export default Navbar;
