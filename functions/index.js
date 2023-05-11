// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin.firestore().collection('messages').add({original: original});
  // Send back a message that we've successfully written the message
  res.json({result: `Message with ID: ${writeResult.id} added.`});
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore.document('/messages/{documentId}')
    .onCreate((snap, context) => {
      // Grab the current value of what was written to Firestore.
      const original = snap.data().original;

      // Access the parameter `{documentId}` with `context.params`
      functions.logger.log('Uppercasing', context.params.documentId, original);

      const uppercase = original.toUpperCase();

      // You must return a Promise when performing asynchronous tasks inside a Functions such as
      // writing to Firestore.
      // Setting an 'uppercase' field in Firestore document returns a Promise.
      return snap.ref.set({uppercase}, {merge: true});
    });

// Listen for new users and send a push notification to all users when there is a new user
exports.newUserAddedPushNotification = functions.firestore.document('/Users/{userName}')
      .onCreate( async (snap, context) => {


      // get the name of user that was added
      const userName = snap.data().name;

      // Notification details.
      const payload = {
        notification: {
          title: 'New user added',
          body: `${userName} has joined the club`
        }
      };

      // get the userTokens of all devices
      let tokens  = ['c-z1-N7DTi-T32q2jeqzS0:APA91bFws5NyHeLSO75PXll5TA0Xcb2mxW72cvu27hGWmcKgplDa0xlX5x1sMciDVMqA-05u5JkZdGJyTnAhIBEbXfub7Q9YnLYjf7VPT_Rm2G3M8tBrFSbBgI_rdNUQkj7wMcgtX898'];
      /*const userTokensResult = await admin.firestore().collections('/UserTokens').get()
      for (document in userTokensResult) {
          userTokens.push(document.data().)
      }*/
      // send notification
      return admin.messaging().sendToDevice(tokens, payload);
    });