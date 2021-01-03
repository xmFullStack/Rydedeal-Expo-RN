import React from 'react';
import { Button, StyleSheet, Text, View, Alert } from 'react-native';
import { AuthSession } from 'expo';

import * as Facebook from 'expo-facebook';
import RestAPI from '../utils/RestAPI';
import * as GoogleSignIn from 'expo-google-sign-in';

const FB_APP_ID = '203737747626817';

export default class FBLoginTest extends React.Component {
  state = {
    result: null,
    liveData : 'initvalud'
  };
  
  componentDidMount() {
    this.googleInitAsync();
    global.setTestLiveData = this.setLiveData.bind(this)
  }
  
  setLiveData(data){
    this.setState({liveData : data})
  }

  googleInitAsync = async () => {
    //{
      // You may ommit the clientId when the firebase `googleServicesFile` is configured
    //   clientId: '275372917947-ms6um8baail2dj6io3qk33qp2md047np.apps.googleusercontent.com',
    // }
    await GoogleSignIn.initAsync({clientId : "275372917947-ms6um8baail2dj6io3qk33qp2md047np.apps.googleusercontent.com"});
    this._googleSyncUserWithStateAsync();
  };

  _googleSyncUserWithStateAsync = async () => {
    const user = await GoogleSignIn.signInSilentlyAsync();
    console.log('google syncuserwithstate', user)
    this.setState({ user });
  };

  gooleSignOutAsync = async () => {
    await GoogleSignIn.signOutAsync();
    console.log( 'google signout async')
    this.setState({ user: null });
  };

  googleSignInAsync = async () => {
    try {
      await GoogleSignIn.askForPlayServicesAsync();
      const result = await GoogleSignIn.signInAsync();
      console.log('google signin async:', result)
      alert('Google signin', JSON.stringify( result ))
      // if (type === 'success') {
      //   // this._googleSyncUserWithStateAsync();
      
      // }
    } catch (ex) {
      console.log('google signin async failed:', ex)
      failed('Oops', 'login: Error:' + ex.message);
    }
  };

  onPressGoogleLogin = () => {
    if (this.state.user) {
      this.gooleSignOutAsync();
    } else {
      this.googleSignInAsync();
    }
  };

  onFblogIn = async ()=>{

    await Facebook.initializeAsync(FB_APP_ID)

    Facebook.logInWithReadPermissionsAsync({
      permissions: ['public_profile', 'email'],
    }).then(result =>{
      alert('Success', 'Success result : '+  JSON.stringify( result ))
      console.log( result );
      
      RestAPI.getFBProfile( result.token ).then( fbProfile =>{
        console.log( 'fbProfile : ', fbProfile)
      }).catch( fberr =>{
        console.log( fberr )
        failed('Oops', 'Failed to get Facebook profile. ' + JSON.stringify( fberr ))
      })
      
    }).catch( err=>{
      failed('Oops', 'Failed err :  ' + JSON.stringify( err ))
    })

  }
  

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.liveData}</Text>
        <Button title="Open FB Auth" onPress={this.onFblogIn} />
        <Button title="Google Signin" onPress={this.onPressGoogleLogin} />        
          {this.state.result ? <Text>{JSON.stringify(this.state.result)}</Text> : null}
        </View>
    );
  }

 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});