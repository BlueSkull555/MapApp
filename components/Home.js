import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Button} from 'react-native-elements';
import OrderDetails from './OrderDetails';
import {useIsFocused} from '@react-navigation/native';

export default function Home(props) {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    getUserOrders();
  }, [currentOrder]);

  useEffect(() => {
    if (orders !== [] && isFocused) {
      getUserOrders();
    }
  }, [isFocused]);

  const getUserOrders = async () => {
    const ordersList = await props.user.functions.orders({
      _id: props.userInfo._id,
    });

    return setOrders(ordersList);
  };

  return currentOrder == null ? (
    <View style={styles.container}>
      <Button onPress={props.logOut} title="Log Out" />
      <Text>Track Orders</Text>

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
            <Text style={{color: 'white'}}>Address: {order.address.name}</Text>
            <Text style={{color: 'white'}}>
              Status:
              {order.endTime
                ? ' Delivered'
                : order.startTime
                ? ' Delivering'
                : ' Prepairing'}
            </Text>
          </TouchableOpacity>
        ))}
    </View>
  ) : (
    <OrderDetails
      setCurrentOrder={setCurrentOrder}
      order={currentOrder}
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
