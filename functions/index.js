const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.addNode = functions.https.onRequest(async (req, res) => {
  // Grab the uId parameter
  const uId = req.query.uId
  // Grab the json body
  const nodeBody = req.body
  const node = {
    title: nodeBody.title,
    type: nodeBody.type,
    description: nodeBody.description,
    access: (nodeBody.access === "true"),
    status: nodeBody.status,
    dependenciesSatisfied: (nodeBody.dependenciesSatisfied === "true"),
    radius: parseInt(nodeBody.radius, 10),
    left: parseInt(nodeBody.left, 10),
    top: parseInt(nodeBody.top, 10)
  }
  // Push the new node into the Realtime Database using the Firebase Admin SDK.
  const snapshot = await admin.database().ref(uId + '/nodes').push(node)

  // Setup notification
  /* const payload = {
    data: {
      msgtitle: 'New Node Added to Your SkillsOrganizer',
      msgbody: '(Title: ' + node.title + '). Review and Setting It'
    }
  } */

  const payload = {
    "notification": {
      "title": "New Node Added to Your SkillsOrganizer",
      "body": "(Title: " + node.title + "). Review and Setting It"
    }
  }

  // Clean invalid tokens
  function cleanInvalidTokens (tokensWithKey, results) {

    const invalidTokens = []

    if (results) {
      results.forEach((result, i) => {
        if ( !result.error ) return
  
        console.error('Failure sending notification to', tokensWithKey[i].token, result.error)
        
        switch(result.error.code) {
          case "messaging/invalid-registration-token":
          case "messaging/registration-token-not-registered":
            invalidTokens.push(admin.database().ref(uId + '/tokens').child(tokensWithKey[i].key).remove())
            break
          default:
            break
        }
      })
    }
    return Promise.all(invalidTokens)
  }
  // Send notifications
  return admin.database().ref(uId + '/tokens').once('value').then(async (data) => {
    if (!data.val()) return
    const snapshot = data.val()
    const tokensWithKey = []
    const tokens = []
    for (let key in snapshot) {
      tokens.push(snapshot[key].token)
      tokensWithKey.push({
        token: snapshot[key].token,
        key: key
      })
    }
    // Send response to the client
    // res.status(200).send(snapshot.ref.toString())
    return admin.messaging().sendToDevice(tokens, payload).then(function(response) {
      // See the MessagingDevicesResponse reference documentation for
      // the contents of response.
      res.status(200).send(response)
      cleanInvalidTokens(tokensWithKey, (response) ? response.results : null)
      return console.log("Successfully sent message:", response)
    })
    .catch(function(error) {
      cleanInvalidTokens(tokensWithKey, (response) ? response.results : null)
      console.log("Error sending message:", error)
      res.status(500).send(response)
    })
    /* const response = await admin.messaging().sendToDevice(tokens, payload).then(function(response) {
      // See the MessagingDevicesResponse reference documentation for
      // the contents of response.
      res.status(200).send(response)
      return console.log("Successfully sent message:", response)
    })
    .catch(function(error) {
      console.log("Error sending message:", error)
    })
    // res.status(200).send(response)
    return await cleanInvalidTokens(tokensWithKey, (response) ? response.results : null)
      // .then(() => admin.database().ref('/notifications').child(NOTIFICATION_SNAPSHOT.key).remove()) */
  })
})
