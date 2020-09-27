import React, {useEffect, useState} from 'react';
import {SafeAreaView, View, StatusBar, Platform} from 'react-native';
import {useAuth} from './AuthProvider';
import {LogInView} from './LogInView';
import {AuthProvider} from './AuthProvider';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';

import Home from './components/Home';
import Order from './components/Order';

import {check, request, PERMISSIONS} from 'react-native-permissions';

import Geolocation from '@react-native-community/geolocation';
import HomeDriver from './components/HomeDriver';

let intervalId;

const App = () => {
  return (
    <AuthProvider>
      <AppBody />
    </AuthProvider>
  );
};

function AppBody() {
  const {user, logOut, userInfo} = useAuth();
  const [loggedIn, setLoggedIn] = useState(false);

  const Tab = createBottomTabNavigator();

  const askPermission = async () => {
    switch (Platform.OS) {
      case 'ios':
        if (await check(PERMISSIONS.IOS.LOCATION_ALWAYS !== 'granted')) {
          await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
        }
        break;

      case 'android':
        if (
          await check(
            PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION !== 'granted',
          )
        ) {
          await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
        }
        break;
    }
  };

  const getDriverLocation = async () => {
    let currentPos = {latitude: 1.0, longitude: 1.0};
    try {
      Geolocation.watchPosition(
        (position) => {
          currentPos = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        },
        (error) => {
          switch (error.code) {
            case 1:
              if (Platform.OS === 'ios') {
                alert(
                  'To locate your location enable permission for the application in Settings - Privacy - Location',
                );
              } else {
                alert(
                  'To locate your location enable permission for the application in Settings - Apps - AppName - Location',
                );
              }
              break;
            default:
              alert('Error detecting your location');
              // alert(error);
              console.log(error);
          }
        },
      );
    } catch (e) {
      alert(e.message || '');
    }
    intervalId = setInterval(async () => {
      await user.functions.updateDriverLocation({
        _id: userInfo._id,
        location: currentPos,
      });
    }, 10000);
  };

  useEffect(() => {
    askPermission();
    if (userInfo && userInfo.role === 'driver' && user) {
      getDriverLocation();
      setLoggedIn(true);
    }
  }, [userInfo, user]);

  useEffect(() => {
    if (user === null && loggedIn) {
      clearInterval(intervalId);
      setLoggedIn(false);
    }
  }, [user]);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={{flex: 1}}>
        {user == null ? (
          <LogInView />
        ) : userInfo.role == null ? (
          <Text>Loading...</Text>
        ) : userInfo.role == 'customer' ? (
          <NavigationContainer>
            <Tab.Navigator>
              <Tab.Screen
                name="Home"
                children={() => (
                  <Home user={user} userInfo={userInfo} logOut={logOut} />
                )}
              />
              <Tab.Screen
                name="Order"
                children={() => (
                  <Order user={user} userInfo={userInfo} logOut={logOut} />
                )}
              />
            </Tab.Navigator>
          </NavigationContainer>
        ) : (
          <NavigationContainer>
            <Tab.Navigator>
              <Tab.Screen
                name="Home"
                children={() => (
                  <HomeDriver user={user} userInfo={userInfo} logOut={logOut} />
                )}
              />
            </Tab.Navigator>
          </NavigationContainer>
        )}
      </View>
    </>
  );
}

export default App;
