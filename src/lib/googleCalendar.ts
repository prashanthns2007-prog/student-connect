import config from '../../firebase-applet-config.json';

const CLIENT_ID = config.oAuthClientId;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly';

let tokenClient: any = null;
let gapiInited = false;
let gsiInited = false;

export const initGoogleCalendar = () => {
  return new Promise<void>((resolve) => {
    const checkInit = () => {
      if (gapiInited && gsiInited) {
        resolve();
      }
    };

    // Initialize GAPI
    (window as any).gapi.load('client', async () => {
      await (window as any).gapi.client.init({
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      });
      gapiInited = true;
      checkInit();
    });

    // Initialize GSI
    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined at request time
    });
    gsiInited = true;
    checkInit();
  });
};

export const syncEventToGoogleCalendar = async (event: {
  summary: string;
  description: string;
  start: string; // ISO date
  end: string;   // ISO date
}) => {
  return new Promise<void>((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
        return;
      }

      try {
        await (window as any).gapi.client.calendar.events.insert({
          calendarId: 'primary',
          resource: {
            summary: event.summary,
            description: event.description,
            start: {
              date: event.start.split('T')[0],
              timeZone: 'UTC',
            },
            end: {
              date: event.end.split('T')[0],
              timeZone: 'UTC',
            },
          },
        });
        resolve();
      } catch (err) {
        reject(err);
      }
    };

    if ((window as any).gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};
