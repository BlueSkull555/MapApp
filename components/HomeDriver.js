import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Button} from 'react-native';

import Map from './Map';

export default function HomeDriver(props) {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);

  const getDriverOrders = async () => {
    const ordersList = await props.user.functions.driverOrders({
      _id: props.userInfo._id,
    });

    return setOrders(ordersList);
  };

  useEffect(() => {
    if (currentOrder === null) {
      getDriverOrders();
    }
  }, [currentOrder]);

  return currentOrder == null ? (
    <View style={styles.container}>
      <Button onPress={props.logOut} title="Log Out" />
      <Text>Orders</Text>

      {orders.length > 0 &&
        orders.map((order, index) => (
          <TouchableOpacity
            key={order._id}
            style={{
              backgroundColor: '#990099',
              borderRadius: 5,
              margin: '5%',
              width: '50%',
              height: 60,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
            }}
            onPress={() => setCurrentOrder(order)}>
            <Text style={{color: 'white'}}>Order No.: {index + 1}</Text>
            <Text style={{color: 'white'}}>
              Status:
              {order.endTime ? ' Delivered' : ' Ready'}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  ) : (
    <Map
      setCurrentOrder={setCurrentOrder}
      order={currentOrder}
      userInfo={props.userInfo}
      user={props.user}
    />
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
