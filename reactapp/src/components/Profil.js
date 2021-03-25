import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import Navbar from "./Navbar";

import { Redirect } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import "./Profil.css";

function ProfilScreen(props) {
    const [avatar, setAvatar] = useState("https://i.imgur.com/HgBDc9B.png");
    const [pseudo, setPseudo] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [gender, setGender] = useState("");
    const [search, setSearch] = useState("");
    const [townList, setTownList] = useState([]);
    const [coords, setCoords] = useState([]);

    const [localisation, setLocalisation] = useState("");
    const [problemDescription, setProblemDescription] = useState("");
    const [problems, setProblems] = useState(["Amoureux"]);

    const [emailVisible, setEmailVisible] = useState(false);
    const [mdpVisible, setMdpVisible] = useState(false);
    const [descriptionVisible, setDescriptionVisible] = useState(false);

    // load les datas de l'utilisateur grace au token (map state to props)
    useEffect(() => {
        async function loadDATA() {
            var rawResponse = await fetch(`/load-profil`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `tokenFront=${props.token}`,
            });
            var response = await rawResponse.json();

            var avatar = response.userFromBack.avatar;
            setAvatar(avatar);

            var pseudo = response.userFromBack.pseudo;
            setPseudo(pseudo);

            var email = response.userFromBack.email;
            setEmail(email);

            var localisation = response.userFromBack.localisation.label;
            if (response.userFromBack.localisation) {
                setLocalisation(localisation);
            }

            var gender = response.userFromBack.gender;
            setGender(gender);

            var problemDescription = response.userFromBack.problem_description;
            setProblemDescription(problemDescription);

            var problems_types = response.userFromBack.problems_types;
            setProblems(problems_types);
        }
        loadDATA();
    }, []);

    // event pour la recherche de ville avec l'API 
    const onChangeText = async (search) => {

        setSearch(search);

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
                setCoords([item.coordinates[0], item.coordinates[1]]);
                setLocalisation(item.label);
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

    // permet de switch entre input et email en dur 
    const handleClickEmail = () => {
        setEmailVisible(!emailVisible);
    };

    // permet de switch entre input et mdp en dur 
    const handleClickPassword = () => {
        setMdpVisible(!mdpVisible);
    };

    // permet de switch entre input et mdp en dur 
    const handleClickDescription = () => {
        setDescriptionVisible(!descriptionVisible);
    };

    // ajoute ou enleve un probleme 
    const handleSelectProblems = (element) => {
        var problemsCopy = [...problems];
        if (problemsCopy.includes(element) == false) {
        problemsCopy.push(element);
        setProblems(problemsCopy);
        } else {
        problemsCopy = problemsCopy.filter((e) => e != element);
        setProblems(problemsCopy);
        }
    };

    // declenche la route pour update et save ton user en BDD 
    const handleSaveProfil = () => {
        async function updateUser() {
        var rawResponse = await fetch("/update-profil", {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `tokenFront=${props.token}&emailFront=${email}&passwordFront=${password}&localisationFront=${localisation}&coordinatesFront=${JSON.stringify(
            coords
            )}&genderFront=${gender}&descriptionProblemFront=${problemDescription}&problemsTypeFront=${JSON.stringify(problems)}`,
        });
        var response = await rawResponse.json();

        if (response.userSaved.email) {
            setEmail(response.userSaved.email);
            setEmailVisible(false);
        }

        if (response.userSaved.password) {
            setPassword(response.userSaved.password);
            setMdpVisible(false);
        }

        if (response.userSaved.localisation) {
            setLocalisation(response.userSaved.localisation.label);
        }

        if (response.userSaved.problem_description) {
            setProblemDescription(response.userSaved.problem_description);
            setDescriptionVisible(false);
        }

        if (response.userSaved.problems_types) {
            setProblems(response.userSaved.problems_types);
        }
        }
        updateUser();
    };

    if(props.token == ""){
        return (
            <Redirect to = "/" />
        )
    } else {
        return (
            <div className="containerProfil">
            <Navbar />
            <div className="titleProfil">
                <p>Mon profil</p>
            </div>

            <div className="infosTopProfil">
                <img className="avatarProfil" src={avatar} alt="avatar"/>
                <div className="pseudoMailMdp">
                <p className="unchangeableText">{pseudo}</p>
                <div className="mail">
                    {!emailVisible ? (
                    <>
                        <p className="changeableText">{email}</p>
                        <FontAwesomeIcon
                        onClick={() => handleClickEmail()}
                        icon={faEdit}
                        style={{ color: "#BCC8F0", cursor: "pointer" }}
                        />
                    </>
                    ) : (
                    <>
                        <input
                        type="text"
                        className="inputText"
                        placeholder="ton nouveau email"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                        />
                    </>
                    )}
                </div>

                {!mdpVisible ? (
                    <div className="badgeMdp">
                    <p className="textBadgeMdp" onClick={() => handleClickPassword()}>
                        mot de passe
                    </p>
                    </div>
                ) : (
                    <>
                    <input
                        type="password"
                        className="inputText"
                        placeholder="mot de passe"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                    />
                    </>
                )}
                </div>
            </div>

            <div className="infosMidProfil">
                <div className="town">
                <p className="titleMidProfil">Change ta ville:</p>
                <input
                    type="text"
                    className="inputTown"
                    placeholder={localisation}
                    onChange={(e) => onChangeText(e.target.value)}
                    value={search}
                />
                {TownListComponent.length > 0 && (
                    <div className="townsList">{TownListComponent}</div>
                )}
                </div>

                <div className="genderProfil">
                <p className="titleMidProfil">Genre:</p>
                <div className="genderPick">
                    <div
                    onClick={() => {
                        gender === "other" ? setGender("") : setGender("other");
                    }}
                    >
                    <img
                        className="img"
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
                        className="img"
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
                        className="img"
                        src={
                        gender === "male"
                            ? "gender_male_selected.png"
                            : "./gender_male.png"
                        }
                        alt="gender"
                    />
                    </div>
                </div>
                </div>
            </div>

            <div className="infosBottomProfil">
                <div className="titleBottomDiv">
                <p className="titleBottom">En quelques mots:</p>
                <FontAwesomeIcon
                    onClick={() => handleClickDescription()}
                    icon={faEdit}
                    style={{
                    color: "#BCC8F0",
                    cursor: "pointer",
                    margin: "15px 10px 5px 10px",
                    }}
                />
                </div>
                {!descriptionVisible ? (
                <p className="description">{problemDescription}</p>
                ) : (
                <input
                    type="text"
                    className="inputDescription"
                    placeholder={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    value={problemDescription}
                />
                )}
                <p className="titleBottom">Types de soucis:</p>
                <div className="badgeContainer">
                <div
                    onClick={() => {
                    handleSelectProblems(`Amoureux`);
                    }}
                    className={
                    problems.includes("Amoureux") ? "badgeProblem" : "badgeProblemBis"
                    }
                >
                    <p className="textBadgeProblem">Amoureux</p>
                </div>
                <div
                    onClick={() => {
                    handleSelectProblems(`Familial`);
                    }}
                    className={
                    problems.includes("Familial") ? "badgeProblem" : "badgeProblemBis"
                    }
                >
                    <p className="textBadgeProblem">Familial</p>
                </div>
                <div
                    onClick={() => {
                    handleSelectProblems(`Physique`);
                    }}
                    className={
                    problems.includes("Physique") ? "badgeProblem" : "badgeProblemBis"
                    }
                >
                    <p className="textBadgeProblem">Physique</p>
                </div>
                <div
                    onClick={() => {
                    handleSelectProblems(`Professionnel`);
                    }}
                    className={
                    problems.includes("Professionnel")
                        ? "badgeProblem"
                        : "badgeProblemBis"
                    }
                >
                    <p className="textBadgeProblem">Professionnel</p>
                </div>
                <div
                    onClick={() => {
                    handleSelectProblems(`Scolaire`);
                    }}
                    className={
                    problems.includes("Scolaire") ? "badgeProblem" : "badgeProblemBis"
                    }
                >
                    <p className="textBadgeProblem">Scolaire</p>
                </div>
                </div>
            </div>
            <button className="boutonSaveProfil" onClick={() => handleSaveProfil()}>
                enregistrer
            </button>
            </div>
        );
    }
}

function mapStateToProps(state) {
  return { token: state.tokenUser };
}

export default connect(mapStateToProps, null)(ProfilScreen);
