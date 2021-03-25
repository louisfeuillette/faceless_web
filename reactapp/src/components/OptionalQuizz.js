import React, { useState } from "react";

import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import "./Quizz.css";
import { Link, Redirect } from "react-router-dom";

function OptionalQuizz(props) {
    const [page, setPage] = useState(0);
    const [description, setDescription] = useState("");
    const [search, setSearch] = useState("");
    const [townList, setTownList] = useState([]);
    const [coords, setCoords] = useState([]);
    const [gender, setGender] = useState("");
    const [imgAvatarSelected, setImgAvatarSelected] = useState(
        "https://i.imgur.com/atDrheA.png"
    );

    const [error, setError] = useState("");

    // event du clic pour set sa description + envoi d'erreur
    const handleDescription = () => {
        if (description !== "") {
        setPage(page + 1);
        } else {
        setError("champs vide ! tu peux tout de même passer à la suite");
        }
    };

    // event pour la recherche de ville avec l'API 
    const onChangeText = async (search) => {
        setSearch(search);
        console.log(search, "Search Town");

        // fetcher les villes dès qu'il y a plus de 2 caractères saisis dans le champs
        if (search.length > 2) {
        const uri = `https://api-adresse.data.gouv.fr/search/?q=${search}&type=municipality&autocomplete=1`;
        const data = await fetch(uri);
        const body = await data.json();
        const townsAPI = body.features;
        const townsApiName = [];
        townsAPI &&
            townsAPI.map((town) => {
            return townsApiName.push({
                label: town.properties.label,
                //   postcode: town.properties.postcode,
                coordinates: town.geometry.coordinates,
            });
            });
        setTownList(townsApiName);
        setSearch(search);
        }
    };

    // renvoi une liste de villes selon l'input onChangeText
    const TownListComponent = townList.map((item, i, arr) => {
        return (
        <div key={i}>
            <p
            className="inputProp"
            onClick={() => {
                setSearch(item.label);
                setCoords([item.coordinates[0], item.coordinates[1]])
                setTimeout(() => {
                setTownList([]);
                }, 500);
            }}
            >
            {item.label}
            </p>
        </div>
        );
    });

    var imgAvatarSrc = [
        "https://i.imgur.com/HgBDc9B.png",
        "https://i.imgur.com/NBYvxKX.png",
        "https://i.imgur.com/urOQgGD.png",
        "https://i.imgur.com/clPw5Nx.png",
        "https://i.imgur.com/Wm5vVmF.png",
        "https://i.imgur.com/YSesoUz.png",
        "https://i.imgur.com/mMzuMuT.png",
        "https://i.imgur.com/EHaBuT9.png",
        "https://i.imgur.com/21c3YgT.png",
        "https://i.imgur.com/17T5sWH.png",
        "https://i.imgur.com/97zBLZM.png",
        "https://i.imgur.com/aK9HbPT.png",
        "https://i.imgur.com/T7wBkkk.png",
        "https://i.imgur.com/fJYbMZO.png",
    ];

    // map sur l'ensemble des images pour choisir son avatar
    var imgAvatar = imgAvatarSrc.map((img, key) => {
        return (
        <img
            src={img}
            key={key}
            className="imgAvatar"
            onClick={() => setImgAvatarSelected(img)}
            alt="imgAvatar"
        />
        );
    });

    // declenche la route pour update le profil precedement save en BDD lors de la fin du quizz optionnel 
    // petite sécurité : save le token seulement lorsque l'on reçoit la réponse du back
    const handleClickNextSaveUser = async () => {
        var rawResponse = await fetch(`/sign-up-second-step`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `problemDescriptionFront=${description}&localisationFront=${
            search}&coordinatesFront=${JSON.stringify(coords)}&genderFront=${gender}&avatarFront=${imgAvatarSelected}&tokenFront=${props.tokenFromStore}`,
        });
        var response = await rawResponse.json();

        if (response.result == true) {
            props.addToken(response.userUpdated.token)
        }
    };

    // page precedente du quizz optionnel
    const handleClickBack = () => {
        setPage(page - 1);
    };

    // page suivante du quizz optionnel
    const handleClickNext = () => {
        setPage(page + 1);
    };

    if(props.tokenFromStore == '' || null){
        return (
            <Redirect to = "/" />
        )
    } else {
        return (
            <div className="container">
            {page === 0 ? (
                <div className="setup">
                <p className="text">Tu veux décrire ton soucis ?</p>
                <input
                    type="text"
                    className="input"
                    placeholder="ta description"
                    onChange={(e) => setDescription(e.target.value)}
                    value={description}
                />
                <p className="emailError">{error}</p>
                <div className="divBoutonValider">
                    <button className="bouton" onClick={() => handleDescription()}>
                    valider
                    </button>
                </div>

                <div className="nextQuizz">
                    <button className="boutonSuivant" onClick={() => handleClickNext()}>
                    suivant
                    <FontAwesomeIcon
                        icon={faChevronRight}
                        style={{ marginRight: "10px" }}
                    />
                    </button>
                </div>
                </div>
            ) : page === 1 ? (
                <div className="setup">
                <p className="text">D'où viens-tu ?</p>
                <input
                    type="text"
                    className="input"
                    placeholder="ta ville"
                    onChange={(e) => onChangeText(e.target.value)}
                    value={search}
                />
                {TownListComponent.length > 0 && (
                    <div className="townsListQuizz">{TownListComponent}</div>
                )}
                <div className="divPreviousNextQuizz">
                    <button className="boutonRetour" onClick={() => handleClickBack()}>
                    <FontAwesomeIcon
                        icon={faChevronLeft}
                        style={{ marginRight: "10px" }}
                    />
                    retour
                    </button>
                    <button className="boutonSuivant" onClick={() => handleClickNext()}>
                    suivant
                    <FontAwesomeIcon
                        icon={faChevronRight}
                        style={{ marginRight: "10px" }}
                    />
                    </button>
                </div>
                </div>
            ) : page === 2 ? (
                <div className="setup">
                <p className="text">Tu es ?</p>
                <div className="genderDiv">
                    <div
                    onClick={() => {
                        gender === "other" ? setGender("") : setGender("other");
                    }}
                    >
                    <img
                        src={
                        gender === "other"
                            ? "gender_1_selected.png"
                            : "./gender_1.png"
                        }
                        alt="gender"
                    />
                    </div>

                    <div
                    onClick={() => {
                        gender === "female" ? setGender("") : setGender("female");
                    }}
                    >
                    <img
                        src={
                        gender === "female"
                            ? "gender_female_selected.png"
                            : "./gender_female.png"
                        }
                        alt="gender"
                    />
                    </div>

                    <div
                    onClick={() => {
                        gender === "male" ? setGender("") : setGender("male");
                    }}
                    >
                    <img
                        src={
                        gender === "male"
                            ? "gender_male_selected.png"
                            : "./gender_male.png"
                        }
                        alt="gender"
                    />
                    </div>
                </div>

                <div className="divPreviousNextQuizz">
                    <button className="boutonRetour" onClick={() => handleClickBack()}>
                    <FontAwesomeIcon
                        icon={faChevronLeft}
                        style={{ marginRight: "10px" }}
                    />
                    retour
                    </button>
                    <button className="boutonSuivant" onClick={() => handleClickNext()}>
                    suivant
                    <FontAwesomeIcon
                        icon={faChevronRight}
                        style={{ marginRight: "10px" }}
                    />
                    </button>
                </div>
                </div>
            ) : page === 3 ? (
                <div className="setup">
                <div className="selectedAvatarDiv">
                    <img src={imgAvatarSelected} className="selectedAvatar" alt="selectedAvatar"/>
                </div>
                <p className="text">Choisi ton avatar !</p>

                <div className="avatarDiv">{imgAvatar}</div>

                <div className="divPreviousNextQuizz">
                    <button className="boutonRetour" onClick={() => handleClickBack()}>
                    <FontAwesomeIcon
                        icon={faChevronLeft}
                        style={{ marginLeft: "10px" }}
                    />
                    retour
                    </button>
                    <Link to="/Home">
                    <button
                    className="boutonSuivant"
                    onClick={() => handleClickNextSaveUser()}
                    >
                    suivant
                    <FontAwesomeIcon
                        icon={faChevronRight}
                        style={{ marginRight: "10px" }}
                    />
                    </button>
                    </Link>
                </div>
                </div>
            ) : null}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch){
    return {
        addToken: function(arg){
            dispatch({type: 'ADD_USER', payload: arg})
        }
    }
}

function mapStateToProps(state) {
    return { tokenFromStore: state.tokenUser }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OptionalQuizz);