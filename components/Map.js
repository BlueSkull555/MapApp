import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, Platform, TouchableOpacity} from 'react-native';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

import Feather from 'react-native-vector-icons/Feather';

import {getDistance} from 'geolib';

import Geolocation from '@react-native-community/geolocation';

let intervalId;

export default function Map(props) {
  const [region, setRegion] = useState();

  const [destination, setDestination] = useState();

  const [fitStatus, setFitStatus] = useState(true);
  const [startStatus, setStartStatus] = useState(false);
  const [nearPlace, setNearPlace] = useState(false);
  const [nearAddress, setNearAddress] = useState(false);

  const [resetDir, setResetDir] = useState(false);

  const [order, setOrder] = useState(null);

  const GOOGLE_MAPS_APIKEY = 'AIzaSyAgNMeY9fGQNhNqbP08ziRZtgYda64gb6s';
  let currentPos = {latitude: 1.0, longitude: 1.0};
  const getDriverLocation = async () => {
    try {
      Geolocation.watchPosition(
        (position) => {
          setRegion({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
          currentPos = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          if (order.collected === false) {
            if (
              position.coords.latitude >= order.placeAddress.latitude - 0.001 &&
              position.coords.latitude <= order.placeAddress.latitude + 0.001 &&
              position.coords.longitude >=
                order.placeAddress.longitude - 0.001 &&
              position.coords.longitude <= order.placeAddress.longitude + 0.001
            ) {
              setNearPlace(true);
            }
          } else {
            if (
              position.coords.latitude >= order.address.latitude - 0.001 &&
              position.coords.latitude <= order.address.latitude + 0.001 &&
              position.coords.longitude >= order.address.longitude - 0.001 &&
              position.coords.longitude <= order.address.longitude + 0.001
            ) {
              setNearAddress(true);
            }
          }
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
  };

  const startInterval = async () => {
    intervalId = setInterval(async () => {
      await props.user.functions.updateOrderLocation({
        _id: order._id,
        location: currentPos,
      });
    }, 10000);
  };

  useEffect(() => {
    if (startStatus) {
      startInterval();
    }
  }, [startStatus]);

  const getOrderDetails = async () => {
    const currentOrder = await props.user.functions.getOrder({
      _id: props.order._id,
    });
    setOrder(currentOrder);
    setDestination({
      latitude: currentOrder.placeAddress.latitude,
      longitude: currentOrder.placeAddress.longitude,
    });
  };

  useEffect(() => {
    getDriverLocation();
    getOrderDetails();
  }, []);

  const handleCollect = async () => {
    setDestination({
      latitude: order.address.latitude,
      longitude: order.address.longitude,
    });
    setResetDir(true);
    const currentOrder = await props.user.functions.handleCollect({
      _id: props.order._id,
    });
    setOrder(currentOrder);
    setResetDir(false);
  };

  const handleDelivered = async () => {
    const startToPlaceAddressDistance = getDistance(
      {
        latitude: order.driveTimeLine[0].latitude,
        longitude: order.driveTimeLine[0].longitude,
      },
      order.placeAddress,
    );
    const placeAddressToAddressDistance = getDistance(
      order.placeAddress,
      order.address,
    );
    const totalDistance =
      startToPlaceAddressDistance + placeAddressToAddressDistance;
    await props.user.functions.handleDelivered({
      order_id: props.order._id,
      totalDistance,
      driver_id: props.userInfo._id,
    });
    clearInterval(intervalId);
    props.setCurrentOrder(null);
  };

  const handleStart = async () => {
    setStartStatus(true);
    await props.user.functions.handleStart({
      _id: props.order._id,
    });
  };

  let mapView = null;

  const onReady = (result) => {
    if (mapView) {
      mapView.fitToCoordinates(result.coordinates, {
        edgePadding: {
          right: 20,
          bottom: 20,
          left: 20,
          top: 20,
        },
      });
      setFitStatus(false);
    }
  };

  const onError = (errorMessage) => {
    alert(errorMessage);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={{position: 'absolute', flex: 1, width: '100%', height: '100%'}}
        showsUserLocation={true}
        followsUserLocation={startStatus ? true : false}
        enableHighAccuracy={true}
        ref={(c) => (mapView = c)}
        initialRegion={region}>
        {destination ? <MapView.Marker coordinate={destination} /> : null}
        {region && destination && (
          <MapViewDirections
            origin={region}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="#990099"
            onReady={fitStatus ? onReady : null}
            onError={onError}
            resetOnChange={resetDir}
          />
        )}
      </MapView>
      <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 20}}>
        <TouchableOpacity
          style={{
            width: 70,
            height: 70,
            backgroundColor: '#990099',
            borderRadius: 63,
            alignItems: 'center',
            justifyContent: 'center',
            display: startStatus ? 'none' : 'flex',
          }}
          onPress={() => handleStart()}>
          <Feather name="navigation-2" size={40} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 200,
            height: 70,
            backgroundColor: '#990099',
            borderRadius: 63,
            alignItems: 'center',
            justifyContent: 'center',
            display: nearPlace ? 'flex' : 'none',
          }}
          onPress={handleCollect}>
          <Text style={{color: 'white', fontSize: 20}}>Order Collected</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            width: 200,
            height: 70,
            backgroundColor: '#990099',
            borderRadius: 63,
            alignItems: 'center',
            justifyContent: 'center',
            display: nearAddress ? 'flex' : 'none',
          }}
          onPress={handleDelivered}>
          <Text style={{color: 'white', fontSize: 20}}>Order Delivered</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

Map.navigationOptions = () => ({
  header: false,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
