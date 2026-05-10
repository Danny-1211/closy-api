import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { config } from '../config/env';
import { GoogleEvent } from '../types/calendar';
import { getTaipeiDayStart } from '../utils/datetime';

export const createOAuth2Client = () => {
  return new OAuth2Client(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET,
    config.GOOGLE_CALENDAR_REDIRECT_URI,
  );
};

export const exchangeCodeForTokens = async (code: string) => {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  return tokens;
};

// Google Calendar REST API 回傳的單一事件型別
type RawGoogleEvent = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

// 將 dateTime 字串轉換為台北時區的 YYYY/MM/DD
const toTaipeiDate = (dateTimeStr: string): string => {
  const date = new Date(dateTimeStr);
  const taipeiMs = date.getTime() + 8 * 60 * 60 * 1000;
  const taipeiDate = new Date(taipeiMs);
  const yyyy = taipeiDate.getUTCFullYear();
  const mm = String(taipeiDate.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(taipeiDate.getUTCDate()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd}`;
};

// 從 dateTime 字串提取 HH:mm
const toHHmm = (dateTimeStr: string): string => {
  const date = new Date(dateTimeStr);
  const taipeiMs = date.getTime() + 8 * 60 * 60 * 1000;
  const taipeiDate = new Date(taipeiMs);
  const hh = String(taipeiDate.getUTCHours()).padStart(2, '0');
  const min = String(taipeiDate.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${min}`;
};

// 使用 axios 呼叫 Google Calendar REST API，回傳按日期分組的事件 Map
export const fetchGoogleCalendarEvents = async (
  accessToken: string,
): Promise<Map<string, GoogleEvent[]>> => {
  const response = await axios.get<{ items?: RawGoogleEvent[] }>(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 2500,
      },
    },
  );

  const items = response.data.items ?? [];
  const eventsByDate = new Map<string, GoogleEvent[]>();

  for (const item of items) {
    if (!item.id || !item.start) continue;

    const startRaw = item.start.dateTime ?? item.start.date;
    const endRaw = item.end?.dateTime ?? item.end?.date;
    if (!startRaw) continue;

    const scheduleDate = toTaipeiDate(startRaw);
    const startTime = item.start.dateTime ? toHHmm(item.start.dateTime) : '';
    const endTime = item.end?.dateTime ? toHHmm(item.end.dateTime) : '';

    const googleEvent: GoogleEvent = {
      googleEventId: item.id,
      title: item.summary ?? '(無標題)',
      startTime,
      endTime,
    };

    const existing = eventsByDate.get(scheduleDate) ?? [];
    existing.push(googleEvent);
    eventsByDate.set(scheduleDate, existing);
  }

  return eventsByDate;
};
