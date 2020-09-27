import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

import AntDesign from 'react-native-vector-icons/AntDesign';

let intervalId;
export default function OrderDetails(props) {
  const [region, setRegion] = useState();

  const [destination, setDestination] = useState();

  const [driverLoc, setDriverLoc] = useState();

  const [order, setOrder] = useState(null);

  const [collected, setCollected] = useState(false);

  const [addressPath, setAddressPath] = useState(false);

  const [status, setStatus] = useState(null);

  const GOOGLE_MAPS_APIKEY = 'AIzaSyAgNMeY9fGQNhNqbP08ziRZtgYda64gb6s';
  let data;

  const getOrderLocation = async () => {
    intervalId = setInterval(async () => {
      if (order) {
        data = await props.user.functions.getDriverLocation({
          driver_id: order.driverId,
          order_id: order._id,
        });

        setDriverLoc(data.location);
        if (collected === false) {
          setCollected(data.collected);
        }
        if (collected === true && addressPath === false) {
          setRegion({
            latitude: order.placeAddress.latitude,
            longitude: order.placeAddress.longitude,
          });
          setDestination({
            latitude: order.address.latitude,
            longitude: order.address.longitude,
          });
          setAddressPath(true);
        }
        if (addressPath) {
          if (
            driverLoc.latitude >= order.address.latitude - 0.001 &&
            driverLoc.latitude <= order.address.latitude + 0.001 &&
            driverLoc.longitude >= order.address.longitude - 0.001 &&
            driverLoc.longitude <= order.address.longitude + 0.001
          ) {
            clearInterval(intervalId);
            props.setCurrentOrder(null);
          }
        }
      }
    }, 10000);
  };

  const getOrderDetails = async () => {
    const currentOrder = await props.user.functions.getOrder({
      _id: props.order._id,
    });
    setStatus(null);
    if (currentOrder.startTime && currentOrder.endTime === null) {
      setOrder(currentOrder);
      const startPoint = currentOrder.driveTimeLine[0];
      setRegion({
        latitude: startPoint.latitude,
        longitude: startPoint.longitude,
      });
      setDestination({
        latitude: currentOrder.placeAddress.latitude,
        longitude: currentOrder.placeAddress.longitude,
      });
      getOrderLocation(currentOrder);
    } else {
      if (currentOrder.startTime) {
        setStatus('Delivered');
      } else {
        setStatus('Prepairing');
      }
    }
  };

  useEffect(() => {
    getOrderDetails();
  }, []);

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
    }
  };

  const onError = (errorMessage) => {
    alert(errorMessage);
  };
  return status == null ? (
    <View style={styles.container}>
      <MapView
        style={{position: 'absolute', flex: 1, width: '100%', height: '60%'}}
        showsUserLocation={true}
        enableHighAccuracy={true}
        ref={(c) => (mapView = c)}
        initialRegion={region}>
        {destination && <MapView.Marker coordinate={destination} />}
        {driverLoc && (
          <MapView.Marker
            coordinate={driverLoc}
            image={require('../assets/driver.png')}
          />
        )}
        {region && destination && (
          <MapViewDirections
            origin={region}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={3}
            strokeColor="#990099"
            onReady={onReady}
            onError={onError}
            resetOnChange={true}
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
          }}
          onPress={() => props.setCurrentOrder(null)}>
          <AntDesign name="back" size={40} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      <Text>{status}</Text>
      <TouchableOpacity
        style={{
          width: 70,
          height: 70,
          backgroundColor: '#990099',
          borderRadius: 63,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => props.setCurrentOrder(null)}>
        <AntDesign name="back" size={40} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
