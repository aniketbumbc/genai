import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

/**
 *  This is one time run file. Only to give access to calendar
 */

dotenv.config();
const app = express();
const PORT = 3600;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

app.get('/auth', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar'];

  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
    prompt: 'consent',

    // If you only need one scope, you can pass it as a string
    scope: scopes,
  });

  console.log('URL', url);
  res.redirect(url);
});

app.get('/googlecallback', async (req, res) => {
  const code = req.query.code as string;
  // This will provide an object with the access_token and refresh_token.
  // Save these somewhere safe so they can be used at a later time.
  const { tokens } = await oauth2Client.getToken(code);
  //   oauth2Client.setCredentials(tokens);
  // exchange code with refresh token / access token

  console.log(tokens);

  res.send('Connected to the app. You can close the tab');
});

app.listen(PORT, () => console.log('Server is running on Port 3600'));
