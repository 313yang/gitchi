import { kv } from '@vercel/kv';

export async function getRegisteredAt(username) {
  return kv.get(`gitchi:registered:${username}`);
}

export async function setRegisteredAt(username, date) {
  await kv.set(`gitchi:registered:${username}`, date, { nx: true });
}

export async function resetRegisteredAt(username, date) {
  await kv.set(`gitchi:registered:${username}`, date);
}

export async function getDiedAt(username) {
  return kv.get(`gitchi:died:${username}`);
}

export async function setDiedAt(username, date) {
  await kv.set(`gitchi:died:${username}`, date, { nx: true });
}

export async function clearDiedAt(username) {
  await kv.del(`gitchi:died:${username}`);
}
