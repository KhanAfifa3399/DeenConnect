import * as SecureStore from 'expo-secure-store';

export async function setToken(token) {
  await SecureStore.setItemAsync('token', token);
}

export async function getToken() {
  return await SecureStore.getItemAsync('token');
}

export async function setUser(user) {
  await SecureStore.setItemAsync('user', JSON.stringify(user));
}

export async function getUser() {
  const userStr = await SecureStore.getItemAsync('user');
  return userStr ? JSON.parse(userStr) : null;
}

export async function clearAuth() {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('user');
}