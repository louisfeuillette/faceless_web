import React from "react";

import {Link} from 'react-router-dom';

import './Registration.css'

export default function Home() {

  return (
    <div className="container">
      <img src='./Logo.png' alt="logo"/>
      <Link to="/Quizz"><button className="bouton"> s'inscrire </button></Link>
      <Link to="/SignIn"><button className="bouton"> se connecter </button></Link>
    </div>
  );
}
