/**
 * Push notification utilities for Firebase Cloud Messaging
 * Falls back gracefully if credentials are not configured or packages are unavailable
 */

let firebaseAdmin = null;

function initFirebase() {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_CLIENT_EMAIL
  ) {
    try {
      const admin = require('firebase-admin');
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
        });
      }
      firebaseAdmin = admin;
      console.log('✅ Firebase Admin initialized');
    } catch (err) {
      console.warn('⚠️  Firebase Admin package not installed or config error. Push notifications disabled.');
      console.warn('   Error:', err.message);
    }
  } else {
    console.warn('⚠️  Firebase credentials not configured. Push notifications disabled.');
  }
}

initFirebase();

async function sendPushNotification(fcmTokens, { title, body, data = {} }) {
  if (!firebaseAdmin || !fcmTokens || (Array.isArray(fcmTokens) && fcmTokens.length === 0)) {
    console.log(`[Push Mock] To: ${fcmTokens}, Title: ${title}, Body: ${body}`);
    return { success: true, mock: true };
  }

  const tokens = Array.isArray(fcmTokens) ? fcmTokens : [fcmTokens];
  const message = {
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    android: { notification: { sound: 'default', priority: 'high' } },
    apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    tokens,
  };

  try {
    const result = await firebaseAdmin.messaging().sendEachForMulticast(message);
    console.log(`Push notifications sent to ${result.successCount} devices. (${result.failureCount} failed)`);
    return { success: true, messageId: result };
  } catch (err) {
    console.error('FCM error:', err.message);
    return { success: false, error: err.message };
  }
}

async function sendBookingConfirmation(user, appointment) {
  if (user.fcmTokens && user.fcmTokens.length > 0) {
    await sendPushNotification(user.fcmTokens, {
      title: '✅ Appointment Confirmed!',
      body: `Your appointment is booked for ${appointment.date} at ${appointment.slotTime}. Token: #${appointment.tokenNumber}`,
      data: {
        appointmentId: appointment._id.toString(),
        tokenNumber: String(appointment.tokenNumber),
        type: 'booking_confirmation',
      },
    });
  }
}

async function sendLoginNotification(user) {
  if (user.fcmTokens && user.fcmTokens.length > 0) {
    await sendPushNotification(user.fcmTokens, {
      title: '🔐 Login Successful',
      body: `Welcome back, ${user.name}! You are now logged in.`,
      data: { type: 'login_success' },
    }).catch(err => console.error('Login push error:', err.message));
  }
}

async function sendWelcomeNotification(user) {
  if (user.fcmTokens && user.fcmTokens.length > 0) {
    await sendPushNotification(user.fcmTokens, {
      title: '🎉 Welcome to Smart Clinic!',
      body: `Hi ${user.name}, your account has been successfully created. Thank you for joining!`,
      data: { type: 'registration_success' },
    }).catch(err => console.error('Register push error:', err.message));
  }
}

async function sendNextPatientNotification(user) {
  if (user.fcmTokens && user.fcmTokens.length > 0) {
    await sendPushNotification(user.fcmTokens, {
      title: '🕒 You are Next!',
      body: `Hi ${user.name}, the doctor is ready for you soon. You are the next person in the queue. Please be available!`,
      data: { type: 'next_in_queue' },
    }).catch(err => console.error('Next push error:', err.message));
  }
}

module.exports = {
  sendPushNotification,
  sendBookingConfirmation,
  sendLoginNotification,
  sendWelcomeNotification,
  sendNextPatientNotification,
  firebaseAdmin,
};
