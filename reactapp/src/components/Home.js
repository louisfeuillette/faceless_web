import React, { useState, useEffect } from "react";

import Navbar from "./Navbar";

import { connect } from "react-redux";

import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min";

function HomeScreen(props) {
    const [userToDisplay, setUserToDisplay] = useState([]);
    const [messageToSend, setMessageToSend] = useState("")
    const [pseudo, setPseudo] = useState('')

    // useEffect permettant de load les profils à afficher
    useEffect(() => {
        const loadDATA = async ()=> {
            var rawResponse = await fetch('/get-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `tokenFront=${props.token}`
            });
            var response = await rawResponse.json();
            console.log(response, "user du get");
            setUserToDisplay(response.users);
        }
        loadDATA();
    }, [props.token]);

    // set le pseudo de l'utilisateur dans un état lors du clic sur l'icône envoyer
    const handleClick = (arg) => {
        setPseudo(arg.pseudo)
    }

    // déclenche la route pour envoyer le message
    const handleTextToSend = (arg) => {
        console.log(arg._id)
        const createConv = async ()=> {
            var rawResponse = await fetch('/send-msg-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `tokenFront=${props.token}&toIdFront=${arg._id}&contentFront=${messageToSend}`
            });
            var response = await rawResponse.json();
        }
        createConv();
        setMessageToSend('')
        setPseudo("")
    }

    // map sur les utilisateur a display dans la home du user
    var cardToSwipe = userToDisplay.map((e, i) => {
        return (
        <div className="card" key={i}>
            <div className="topCard">
                <img src={e.avatar} className="avatarHome" alt="avatar" />
                <div className="infosTopHome">
                    <p className="pseudoHome">{e.pseudo}</p>
                    <img
                    className="genderHome"
                    src={
                        e.gender === "other"
                        ? "./gender_1_selected.png"
                        : e.gender === "female"
                        ? "./gender_female_selected.png"
                        : e.gender === "male"
                        ? "./gender_male_selected.png"
                        : null
                    }
                    alt="gender"
                    />
                    <p className="textHome">{`${new Date(e.birthDate)
                    .getDay()
                    .toString()}/${new Date(e.birthDate)
                    .getMonth()
                    .toString()}/${new Date(e.birthDate)
                    .getFullYear()
                    .toString()}`}</p>
                </div>
                <p className="textHome">
                    membre depuis le{" "}
                    {`${new Date(e.subscriptionDate).getDay().toString()}/${new Date(
                    e.subscriptionDate
                    )
                    .getMonth()
                    .toString()}/${new Date(e.subscriptionDate)
                    .getFullYear()
                    .toString()}`}
                </p>
                <p className="textHome">Region: {e.localisation.label}</p>
            </div>
            <div className="bottomCardHome">
                <p className="titleHome">En quelques mots:</p>
                <p className="descriptionHome">{e.problem_description}</p>
                <p className="titleHome">Type(s) de souci(s)</p>
                <div className="badgeContainerHome">
                {e.problems_types.map((problem, key) => {
                    return (
                    <div className="badgeProblemHome" key={key}>
                        <p className="textBadgeProblemHome" key={key}>
                        {problem}
                        </p>
                    </div>
                    );
                })}
                </div>
            </div>
            <div className="sendingMsg">
                    {pseudo.includes(e.pseudo) ? (
                        <div className="bottomInputMsg">
                            <input 
                                type='text'
                                className="inputMsg"
                                placeholder="ton message"
                                onChange={(element) => setMessageToSend(element.target.value)}
                                value={messageToSend}
                            />
                            <div className="sendingIcon" onClick={()=> handleTextToSend(e)}>
                                <FontAwesomeIcon
                                    icon={faPaperPlane}
                                    style={{ margin: "10px" }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bottomSendMsg">
                            <div className="sendingIcon" onClick={()=> handleClick(e)}>
                                <FontAwesomeIcon
                                    icon={faPaperPlane}
                                    style={{ margin: "10px" }}
                                />
                            </div>
                        </div>
                    )}
            </div>
        </div>
        );
    });

    if(props.token == "" || null){
        return (
            <Redirect to = "/" />
        )
    } else {
        return (
            <div className="containerHome">
            <Navbar />
            <div className="divCard">{cardToSwipe}</div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { token: state.tokenUser };
}

export default connect(mapStateToProps, null)(HomeScreen);
