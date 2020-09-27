import React, {useContext, useState} from 'react';
import Realm from 'realm';
import {getRealmApp} from './db';

const app = getRealmApp();

const AuthContext = React.createContext(null);

const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  let status = false;
  let role = '';

  const logIn = async (phone, password) => {
    console.log(`Logging in as ${phone}...`);
    const creds = Realm.Credentials.emailPassword(phone, password);
    const newUser = await app.logIn(creds);
    if (status) {
      await newUser.functions.registration({
        _id: newUser.id,
        phone,
        role,
      });
    }

    const info = await newUser.functions.userInfo({
      _id: newUser.id,
    });
    setUserInfo(info);

    console.log(`Logged in as ${newUser.id}`);

    setUser(newUser);
  };

  const logOut = () => {
    if (user == null) {
      console.warn("Not logged in -- can't log out!");
      return;
    }
    console.log('Logging out...');
    user.logOut();
    setUser(null);
  };

  const registerUser = async (phone, password, r) => {
    status = true;
    role = r;
    console.log(`Registering as ${phone}...`);
    await app.emailPasswordAuth.registerUser(phone, password);
    logIn(phone, password);
  };

  return (
    <AuthContext.Provider
      value={{
        logIn,
        logOut,
        registerUser,
        user,
        userInfo,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const auth = useContext(AuthContext);
  if (auth == null) {
    throw new Error('useAuth() called outside of a AuthProvider?');
  }
  return auth;
};

export {AuthProvider, useAuth};
