import React, { useState, useEffect } from "react";

import Navbar from "./Navbar";

import { connect } from "react-redux";

import { Redirect } from "react-router-dom";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane
} from "@fortawesome/free-solid-svg-icons";

import "./Message.css";

function Message(props) {
    const [myUser, setMyUser] = useState('')
    const [message, setMessage] = useState([])
    const [messageToSend, setMessageToSend] = useState("")
    const [allLastMessages, setAllLastMessages] = useState([]);
    const [userCardToShow, setUserCardToShow] = useState([]);
    const [convId, setConvId] = useState('')
    const [showProfil, setShowProfil] = useState(false);
    const [toId, setToId] = useState('')

    useEffect(() => {
        const loadDATA = async () => {
            var rawResponse = await fetch("/message", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `tokenFront=${props.token}`,
            });
            var response = await rawResponse.json();
            setMyUser(response.userId)
            setAllLastMessages(response.message);
        };
        loadDATA();
    }, []);

    const handleShowCard = (arg) => {
        setUserCardToShow(arg.userCard);
        setConvId(arg.convId)
        setToId(arg.userCard._id)
        setShowProfil(true);

        const loadDATA = async () => {
            var rawResponse = await fetch("/get-message", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `conversation_id=${arg.convId}`,
            });
            var response = await rawResponse.json();
            setMessage(response.conversations)
        };
        loadDATA();
    };

    const handleTextToSend = () => {
        const loadDATA = async () => {
            var rawResponse = await fetch("/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `conversationIdFront=${convId}&fromIdFront=${myUser}&toIdFront=${toId}&contentFront=${messageToSend}`,
            });
            var response = await rawResponse.json();
            setMessage([...message, response.newMessageData])
            setMessageToSend('')
        };
        loadDATA();
    }

    var lastMsg = allLastMessages.map((element, i) => {
        return (
            <div
                key={i}
                className="msgFromConversation"
                onClick={() => handleShowCard(element)}
            >
                <div className="informationsMsg">
                <img src={element.userAvatar} className="imgAvatarMsg" alt="avatar"/>
                <div className="pseudoDateMsg">
                    <p className="pseudoMsg">{element.userPseudo}</p>
                    <p className="dateMsg">
                    Le {new Date(element.dateLastMessage).getDay().toString()}/
                    {new Date(element.dateLastMessage).getMonth().toString()}/
                    {new Date(element.dateLastMessage).getFullYear().toString()} à{" "}
                    {new Date(element.dateLastMessage).getHours().toString()}:
                    {new Date(element.dateLastMessage).getMinutes().toString()}
                    </p>
                </div>
                </div>
                <div className="messageUserDiv">
                <p className="lastMsg">Dernier message: {element.lastMessage}</p>
                </div>
            </div>
        );
    });

    var msg = message.map((element, i) => {
        return (
            <div key={i} className={element.from_id === myUser ? "myMsgStyle" : "hisMsgStyle"}>
                <div className={element.from_id === myUser ? "myMsg" : "otherMsg"}>
                    <p className={element.from_id === myUser ? "myTextMessage" : "hisTextMessage"}>{element.content}</p>
                </div>
            </div>
        )
    })

    console.log(props.token, "token message page")

    if(props.token == ""){
        return (
            <Redirect to = "/" />
        )
    } else {
        return (
            <div className="containerMessage">
            <Navbar />
            <div className="displayMessage">
                <div className="convDiv">{lastMsg}</div>

                {showProfil ? (
                    <div className="msgDiv">
                        <div>
                            {msg}
                        </div>
                        <div className="bottomInputMsg">
                            <input 
                                type='text'
                                className="inputMsg"
                                placeholder="ton message"
                                onChange={(e) => setMessageToSend(e.target.value)}
                                value={messageToSend}
                            />
                            <div className="sendingIcon" onClick={()=> handleTextToSend()}>
                            <FontAwesomeIcon
                                icon={faPaperPlane}
                                style={{ margin: "10px" }}
                            />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="userDiv">
                    <p className="descriptionHome">Tes messages s'afficheront ici</p>
                </div>
                )}

                {showProfil ? (
                <div className="card">
                    <div className="topCard">
                    <img
                        src={userCardToShow.avatar}
                        className="avatarHome"
                        alt="avatar"
                    />
                    <div className="infosTopHome">
                        <p className="pseudoHome">{userCardToShow.pseudo}</p>
                        <img
                        className="genderHome"
                        src={
                            userCardToShow.gender === "other"
                            ? "./gender_1_selected.png"
                            : userCardToShow.gender === "female"
                            ? "./gender_female_selected.png"
                            : userCardToShow.gender === "male"
                            ? "./gender_male_selected.png"
                            : null
                        }
                        alt="gender"
                        />
                        <p className="textHome">{`${new Date(userCardToShow.birthDate)
                        .getDay()
                        .toString()}/${new Date(userCardToShow.birthDate)
                        .getMonth()
                        .toString()}/${new Date(userCardToShow.birthDate)
                        .getFullYear()
                        .toString()}`}</p>
                    </div>
                    <p className="textHome">
                        membre depuis le{" "}
                        {`${new Date(userCardToShow.subscriptionDate)
                        .getDay()
                        .toString()}/${new Date(userCardToShow.subscriptionDate)
                        .getMonth()
                        .toString()}/${new Date(userCardToShow.subscriptionDate)
                        .getFullYear()
                        .toString()}`}
                    </p>
                    <p className="textHome">
                        Region: {userCardToShow.localisation.label}
                    </p>
                    </div>
                    <div className="bottomCardHome">
                    <p className="titleHome">En quelques mots:</p>
                    <p className="descriptionHome">
                        {userCardToShow.problem_description}
                    </p>
                    <p className="titleHome">Type(s) de souci(s)</p>
                    <div className="badgeContainerHome">
                        {userCardToShow.problems_types.map((problem, key) => {
                        return (
                            <div className="badgeProblemHome" key={key}>
                                <p className="textBadgeProblemHome">
                                    {problem}
                                </p>
                            </div>
                        );
                        })}
                    </div>
                    </div>
                </div>
                ) : (
                <div className="userDiv">
                    <p className="descriptionHome">Clique sur une conversation</p>
                </div>
                )}
            </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { token: state.tokenUser };
}

export default connect(mapStateToProps, null)(Message);