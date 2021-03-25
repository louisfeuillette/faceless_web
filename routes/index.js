var express = require('express');
var router = express.Router();

const UserModel = require('../models/user');
const ConversationsModel = require('../models/conversations')
const MessagesModel = require('../models/messages');

var uid2 = require("uid2");

var bcrypt = require('bcrypt');
const cost = 10;


// vérification à l'inscription si l'email existe déjà et si l'email est sous le bon format exemple + @ + hébergeur + .com/fr...
router.post('/email-check', async function(req, res, next) {

  var user = await UserModel.findOne({ email: req.body.emailFront })

  var result;
  var error;

  const regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  var testEmail = regex.test(String(req.body.emailFront).toLowerCase());

  if (testEmail == false) {
    res.json({ result: false, error: 'Ça ne ressemble pas à un email valide !' })
  } else if (user) {
    res.json({ result: false, error: 'Cet email est déjà associé à un compte existant !' })
  } else {
    res.json({ result: true })
  }
});

// vérification de l'existence du pseudo dans la base de données à l'inscription
router.post('/pseudo-check', async function(req, res, next) {

  var user = await UserModel.findOne({ pseudo: req.body.pseudoFront })

  var result;
  var error;

  if (user) {
    res.json({ result: false, error: 'Ce pseudo existe déjà !'})
  } else {
    res.json ({ result: true})
  }
})

// première étape de l'inscription (obligatoire) et crée le user en BDD 
router.post('/sign-up-first-step', async function(req, res, next) {

  // hash qui permet de crypter le mot de passe lors de l'enregistrement en BDD
  const hash = bcrypt.hashSync(req.body.passwordFront, cost);

  // date du jour 
  var la_date = new Date();

  // date de naissance
  var dateOfBirth = new Date(req.body.ageFront);

  // l'utilisateur a-t-il 18 ans ?
  var condition = 86400000 * 365 * 18;

  var isAdult;

  // si la date du jour - la date de naissance est supérieur a la condition, alors l'utilisateur est adulte, sinon il est mineur
  if((la_date - dateOfBirth) > condition){
    isAdult = true
  } else {
    isAdult = false
  }

  var user = await new UserModel({
    token: uid2(32),
    email: req.body.emailFront,
    password: hash,
    pseudo: req.body.pseudoFront,
    birthDate: req.body.ageFront,
    problems_types: JSON.parse(req.body.problemsFront),
    subscriptionDate: new Date(),
    is_adult: isAdult,
    statut: 'active',
  })

  var userSaved = await user.save();

  res.json({user: userSaved})
})

// update de l'utilisateur s'il renseigne des infos supplémentaires
router.post('/sign-up-second-step', async function (req, res, next) {

  var problemDesc = req.body.problemDescriptionFront;
  var localisation = req.body.localisation;
  var gender = req.body.genderFront;
  var avatar = req.body.avatarFront;
  
  // si la localisation du front n'est pas définit, je mets la localisation = à France
  req.body.localisationFront == 'undefined' || req.body.localisationFront == undefined || req.body.localisationFront == '' ? localisation = 'France' : localisation = req.body.localisationFront;
  
  // si le genre n'est pas définit, je mets le genre à string vide
  req.body.genderFront == 'undefined' ? gender = '' : gender = req.body.genderFront;

  // comme au dessus mais pour la description problème
  req.body.problemDescriptionFront == 'undefined' ? problemDesc = '' : problemDesc = req.body.problemDescriptionFront;

  // pareil mais pour l'avatar
  req.body.avatarFront == 'undefined' ? avatar = 'https://i.imgur.com/atDrheA.png' : avatar = req.body.avatarFront;

  var user = await UserModel.updateOne(
    { token: req.body.tokenFront }, // ciblage à gauche de la virgule et update les infos à droite
    {
      problem_description: problemDesc,
      gender: gender,
      localisation: {label: req.body.localisationFront, coordinates: JSON.parse(req.body.coordinatesFront)},
      avatar: avatar,
    }
  );

  var userUpdated = await UserModel.findOne({token: req.body.tokenFront})

  var result;
  user ? result = true : result = false

  res.json({ result, userUpdated});
});

// affiche les users de la home page
router.post('/get-user', async function (req, res, next) {

  var userToDisplay = await UserModel.find({
    token: { $ne: req.body.tokenFront }
  })

  var result;
  userToDisplay ? result = true : result = false;

  res.json({ result, users: userToDisplay });
});

// je charge le profil user pour afficher les informations sur la page de modification du profil
router.post('/load-profil', async function (req, res, next) {

  var userBeforeUpdate = await UserModel.findOne({ token: req.body.tokenFront })

  res.json({ userFromBack: userBeforeUpdate });
});

// modifie l'utilisateur en base de donnée
router.put('/update-profil', async function (req, res, next) {

  const hash = bcrypt.hashSync(req.body.passwordFront, cost);

  var userBeforeUpdate = await UserModel.findOne({ token: req.body.tokenFront })

  var userUpdated = await UserModel.updateOne(
    {token: req.body.tokenFront},
    {
      email: req.body.emailFront,
      password: req.body.passwordFront == "" ? userBeforeUpdate.password : hash,
      localisation: {label: req.body.localisationFront, coordinates: JSON.parse(req.body.coordinatesFront)},
      gender: req.body.genderFront,
      problem_description: req.body.descriptionProblemFront,
      problems_types: JSON.parse(req.body.problemsTypeFront),
    }
  )

  var userAfterUpdate = await UserModel.findOne({ token: req.body.tokenFront })

  var result;
  userAfterUpdate ? result = true : result = false

  res.json({ userSaved: userAfterUpdate, result });
})

// route pour le sign in classique + envoie des erreurs 
router.post('/sign-in', async function (req, res, next) {

  var result = false;
  let user = null;
  var error = [];
  var token = null;

  console.log(error,'les erreurs')

  if (req.body.emailFromFront == ''
    || req.body.passwordFromFront == ''
  ) {
    error.push('champs vides')
  }


  user = await UserModel.findOne({
    email: req.body.emailFromFront,
  })
  console.log(user, 'user find sign in ');

  if (user) {
    if (bcrypt.compareSync(req.body.passwordFromFront, user.password)) {
      token = user.token
      result = true
    } else {
      error.push('mot de passe incorrect')
    }
  } else {
    error.push('email incorrect')
  }

  res.json({ result, user, token, error });
});

// route pour l'affichage de message depuis la page message
router.post('/message', async function (req, res, next) {

  user = await UserModel.findOne({token: req.body.tokenFront})

  conversations = await ConversationsModel.find({participants: user._id})

  var messageToDisplay = [];
  
  await Promise.all(conversations.map(async (element, i)=>{
    var lastMessage = await MessagesModel.findOne({conversation_id: element._id}).sort({date: -1})

    // ternaire pour savoir lequel des 2 doit être 'l'envoyeur' / 'envoyé'
    var userToDiscuss;
    element.participants[0] != user._id ? userToDiscuss = element.participants[1] : userToDiscuss = element.participants[0]

    var userToDiscussWith = await UserModel.findOne({_id: userToDiscuss})

    messageToDisplay.push({
      userAvatar: userToDiscussWith.avatar,
      userPseudo: userToDiscussWith.pseudo,
      lastMessage: lastMessage.content,
      dateLastMessage: lastMessage.date,
      userCard: userToDiscussWith,
      convId: lastMessage.conversation_id,
    })
  }))

  res.json({message: messageToDisplay, userId: user._id});
});

// récupère les messages avec l'utilisateur sur lequel on a cliqué
router.post('/get-message', async function (req, res, next) {

  conversations = await MessagesModel.find({conversation_id: req.body.conversation_id})

  res.json({conversations});
});

// envoie de message depuis la page message
router.post('/send-message', async function (req, res, next) {

  var newMsg = new MessagesModel ({
    conversation_id: req.body.conversationIdFront,
    from_id: req.body.fromIdFront,
    to_id: req.body.toIdFront,
    content: req.body.contentFront,
    date: new Date(),
  })

  var newMessageData = await newMsg.save()

  res.json({newMessageData});
});

// envoie de message depuis la home page (création d'un conv et d'un msg)
router.post('/send-msg-user', async function (req, res, next) {

  var myId = await UserModel.findOne({
    token: req.body.tokenFront
  })

  var newConv = new ConversationsModel ({
    participants: [myId, req.body.toIdFront]
  })

  var ConvData = await newConv.save()

  var newMsg = await new MessagesModel ({
    conversation_id: ConvData._id,
    from_id: myId._id,
    to_id: req.body.toIdFront,
    content: req.body.contentFront,
    date: new Date(),
    // read: false,
  })

  var newMessageData = await newMsg.save()

  res.json({newMessageData});
});

module.exports = router;
