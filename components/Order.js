import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

export default function Order(props) {
  const createOrder = async () => {
    await props.user.functions.createOrder({
      _id: props.userInfo._id,
    });
    alert('Order Created!');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          width: 150,
          height: 70,
          backgroundColor: '#990099',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => createOrder()}>
        <Text style={{color: 'white', fontWeight: 'bold'}}>
          Create New Order
        </Text>
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
