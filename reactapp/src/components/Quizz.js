import React, { useState } from "react";

import { Link } from "react-router-dom";

import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faHeart,
  faUsers,
  faChild,
  faBriefcase,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";

import "./Quizz.css";

function Quizz(props) {
  const [page, setPage] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [age, setAge] = useState("");
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState("");

  // declenche la route pour verifier que le 
  // mail n'est pas deja utilisé -> renvoi une erreur sinon
  const handleEmail = async () => {
    var rawResponse = await fetch("/email-check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `emailFront=${email}`,
    });
    var response = await rawResponse.json();
    setError(response.error);
    if (response.result === true) {
      setPage(page + 1);
    } else {
      setError(response.error)
    }
  };

  // page precedente du quizz
  const handleClickBack = () => {
    setPage(page - 1);
  };

  // page suivante du quizz
  const handlePassword = () => {
    if (password !== "") {
      setPage(page + 1);
      setError("");
    } else {
      setError("champs vide !");
    }
  };

  // declenche la route pour verifier que le 
  // pseudo n'est pas deja utilisé -> renvoi une erreur sinon
  const handlePseudo = async () => {
    var rawResponse = await fetch("/pseudo-check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `pseudoFront=${pseudo}`,
    });
    var response = await rawResponse.json();
    setError(response.error)
    if (response.result === true && pseudo !== "") {
      setPage(page + 1);
    } else {
      setError(response.error);
    }
  };

  // verifie si l'utilisateur a bien 13 ans
  // sinon il ne peut pas se cree de compte
  const handleAge = () => {
    var la_date = new Date();

    // l'utilisateur a-t-il 13 ans ?
    var condition = 86400000 * 365 * 13;

    if (la_date - new Date(age) < condition || age == "") {
      setError("il faut avoir 13 ans pour se créer un compte");
    } else {
      setPage(page + 1);
    }
  };

  // met les problem dans un tableau 
  // s'il existe deja, il le supp
  const handleSelectProblems = (arg) => {
    var problemsCopie = [...problems];
    if (problemsCopie.includes(arg)) {
      setProblems(problemsCopie.filter((e) => e != arg));
    } else {
      problemsCopie.push(arg);
      setProblems(problemsCopie);
    }
  };

  // declenche la route qui enregistre le profil en BDD
  const handleSaveUser = async () => {
    var rawResponse = await fetch("/sign-up-first-step", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `emailFront=${email}&passwordFront=${password}&pseudoFront=${pseudo}&ageFront=${age}&problemsFront=${JSON.stringify(
        problems
        )}`,
      });
      var response = await rawResponse.json();
      console.log(response, "SAVED USER");
      props.onAddUserInfo(response.user.token);
  };

  return (
    <div className="container">
      {page === 0 ? (
        <div className="setup">
          <p className="title">Salut,</p>
          <p className="text">C'est quoi ton email ?</p>
          <input
            type="email"
            className="input"
            placeholder="ton email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <p className="emailError">{error}</p>
          <div className="divBoutonValider">
            <button className="bouton" onClick={() => handleEmail()}>
              valider
            </button>
          </div>
        </div>
      ) : page === 1 ? (
        <div className="setup">
          <p className="text">Crée ton mot de passe</p>
          <input
            type="password"
            className="input"
            placeholder="ton mot de passe"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <p className="emailError">{error}</p>
          <div className="divBoutonValider">
            <button className="bouton" onClick={() => handlePassword()}>
              valider
            </button>
          </div>

          <div className="divPreviousQuizz">
            <button className="boutonRetour" onClick={() => handleClickBack()}>
              <FontAwesomeIcon
                icon={faChevronLeft}
                style={{ marginRight: "10px" }}
              />
              retour
            </button>
          </div>
        </div>
      ) : page === 2 ? (
        <div className="setup">
          <p className="text">Comment veux-tu qu’on t’appelle ?</p>
          <input
            type="text"
            className="input"
            placeholder="ton pseudo"
            onChange={(e) => setPseudo(e.target.value)}
            value={pseudo}
          />
          <p className="emailError">{error}</p>
          <div className="divBoutonValider">
            <button className="bouton" onClick={() => handlePseudo()}>
              valider
            </button>
          </div>

          <div className="divPreviousQuizz">
            <button className="boutonRetour" onClick={() => handleClickBack()}>
              <FontAwesomeIcon
                icon={faChevronLeft}
                style={{ marginRight: "10px" }}
              />
              retour
            </button>
          </div>
        </div>
      ) : page === 3 ? (
        <div className="setup">
          <p className="text">C’est quoi ta date de naissance ?</p>
          <input
            type="date"
            className="input"
            onChange={(e) => setAge(e.target.value)}
            value={age}
          />
          <p className="emailError">{error}</p>
          <div className="divBoutonValider">
            <button className="bouton" onClick={() => handleAge()}>
              valider
            </button>
          </div>

          <div className="divPreviousQuizz">
            <button className="boutonRetour" onClick={() => handleClickBack()}>
              <FontAwesomeIcon
                icon={faChevronLeft}
                style={{ marginRight: "10px" }}
              />
              retour
            </button>
          </div>
        </div>
      ) : page === 4 ? (
        <div className="setup">
          <p className="text">Sélectionne ton ou tes soucis :</p>

          <div
            className={
              problems.includes("Amoureux")
                ? "problemSelected"
                : "problemUnselected"
            }
            onClick={() => handleSelectProblems("Amoureux")}
          >
            <FontAwesomeIcon icon={faHeart} style={{ marginRight: "10px" }} />
            <p className="textProblems">Amoureux</p>
          </div>

          <div
            className={
              problems.includes("Familial")
                ? "problemSelected"
                : "problemUnselected"
            }
            onClick={() => handleSelectProblems("Familial")}
          >
            <FontAwesomeIcon icon={faUsers} style={{ marginRight: "10px" }} />
            <p className="textProblems">Familial</p>
          </div>

          <div
            className={
              problems.includes("Physique")
                ? "problemSelected"
                : "problemUnselected"
            }
            onClick={() => handleSelectProblems("Physique")}
          >
            <FontAwesomeIcon icon={faChild} style={{ marginRight: "10px" }} />
            <p className="textProblems">Physique</p>
          </div>

          <div
            className={
              problems.includes("Professionnel")
                ? "problemSelected"
                : "problemUnselected"
            }
            onClick={() => handleSelectProblems("Professionnel")}
          >
            <FontAwesomeIcon
              icon={faBriefcase}
              style={{ marginRight: "10px" }}
            />
            <p className="textProblems">Professionnel</p>
          </div>

          <div
            className={
              problems.includes("Scolaire")
                ? "problemSelected"
                : "problemUnselected"
            }
            onClick={() => handleSelectProblems("Scolaire")}
          >
            <FontAwesomeIcon
              icon={faGraduationCap}
              style={{ marginRight: "10px" }}
            />
            <p className="textProblems">Scolaire</p>
          </div>

          <div className="divBoutonValider">
            <Link to="/OptionalQuizz">
              <button className="bouton" onClick={() => handleSaveUser()}>
                valider
              </button>
            </Link>
          </div>

          <div className="divPreviousQuizz">
            <button className="boutonRetour" onClick={() => handleClickBack()}>
              <FontAwesomeIcon
                icon={faChevronLeft}
                style={{ marginRight: "10px" }}
              />
              retour
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function mapDispatchToProps(dispatch) {
  return {
    onAddUserInfo: function (arg) {
      dispatch({ type: "ADD_USER", payload: arg });
    },
  };
}

export default connect(null, mapDispatchToProps)(Quizz);