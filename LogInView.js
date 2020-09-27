import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Button, Text, Input} from 'react-native-elements';
import {useAuth} from './AuthProvider';

export function LogInView() {
  const [phone, setPhone] = useState('55555555');
  const [password, setPassword] = useState('test@123');
  const [error, setError] = useState();
  const {logIn, registerUser} = useAuth();
  const [authMode, setAuthMode] = useState('Login');
  const [role, setRole] = useState('customer');
  const [buttonStatus, setButtonStatus] = useState(true);

  useEffect(() => {
    if (phone.length === 8 && password.length >= 8) {
      setButtonStatus(false);
    }
  }, [phone, password]);

  return (
    <>
      <Text h3>{authMode}</Text>
      <Input
        autoCapitalize="none"
        placeholder="phone"
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={8}
      />
      <Input
        secureTextEntry={true}
        placeholder="password"
        onChangeText={setPassword}
      />
      {authMode === 'Register' && (
        <View style={{justifyContent: 'space-between', marginBottom: '5%'}}>
          <Text style={{fontWeight: 'bold', fontSize: 20, marginBottom: '2%'}}>
            Choose your role:
          </Text>
          <Button
            disabled={role === 'customer'}
            title={'Customer'}
            onPress={() => setRole('customer')}
          />
          <Button
            disabled={role === 'driver'}
            title={'Driver'}
            onPress={() => setRole('driver')}
          />
        </View>
      )}
      <Button
        onPress={async () => {
          console.log(`${authMode} button pressed with phone ${phone}`);
          setError(null);
          try {
            if (authMode === 'Login') {
              await logIn(phone, password);
            } else {
              await registerUser(phone, password, role);
              setAuthMode('Login');
            }
          } catch (e) {
            setError(`Operation failed: ${e.message}`);
          }
        }}
        title={authMode}
        disabled={buttonStatus}
      />
      <Text>{error}</Text>
      <ToggleAuthModeComponent setAuthMode={setAuthMode} authMode={authMode} />
    </>
  );
}

const ToggleAuthModeComponent = ({authMode, setAuthMode}) => {
  if (authMode === 'Login') {
    return (
      <Button
        title="Haven't created an account yet? Register"
        type="outline"
        onPress={async () => {
          setAuthMode('Register');
        }}
      />
    );
  } else {
    return (
      <Button
        title="Have an account already? Login"
        type="outline"
        onPress={async () => {
          setAuthMode('Login');
        }}
      />
    );
  }
};
