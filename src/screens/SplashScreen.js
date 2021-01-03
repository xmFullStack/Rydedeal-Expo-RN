import React from 'react';
import { 
  ImageBackground, 
  Image, 
  View, 
  Text, 
  TouchableOpacity,
  Dimensions, 
  TextInput, 
  StyleSheet, 
  StatusBar,
    Alert,
  AsyncStorage,
  Platform
} from 'react-native'

import { BallIndicator } from "react-native-indicators";
import { NavigationContainer, useNavigation, useFocusEffect } from '@react-navigation/native';
import { GetAddressFromLocation} from "../../App";

import RestAPI from '../utils/RestAPI';
import { Notifications } from 'expo'
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import Constants from '../utils/Constants';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as BackgroundFetch from 'expo-background-fetch';
import { MsgTypes } from '../components/ZMsg/ZMsg';


export default function SplashScreen({route, navigation}) {
  
  
  global.currentScreen = "";

  const _getUUID = async()=>{
    let UUID = null;
      if ( Platform.OS == 'android' ){
          UUID =  Application.androidId
      }else if( Platform.OS == 'ios' ){
          UUID = await Application.getIosIdForVendorAsync()
      }

      return UUID;
  }

  const _checkPermission = async ()=>{

      let UUID = await _getUUID();
      global.UUID = UUID;
      if ( Device.isDevice ){
        let token = await _getPushTokenAsync()
        global.expoPushToken = token
      }else{
        // simulator
          global.expoPushToken = 'texttoken from simulator'
      }

      const resLoc = await Permissions.getAsync(
        Permissions.LOCATION,
      );
      console.log('resLoc', resLoc)
      if ( resLoc.status !== 'granted') {
        
        const  askLoc = await Permissions.askAsync(Permissions.LOCATION)
        if( askLoc.status == 'granted'){
        
        }else{
          // warn('Oops', 'Rydedeal can not work correctly without location permission. Please check again: ' + askLoc.status)
          alertOk('Oops', 'Rydedeal can not work correctly without location permission. Please check again, ', ()=>{
              _bootstrapAsync();
          }, MsgTypes.warn)
          return false;
        }
      }


      // const resCam = await Permissions.getAsync(
      //   Permissions.CAMERA,
      // );
      // console.log('resCam', resCam)
      // if (resCam.status !== 'granted') {
        
      //   const  askCam = await Permissions.askAsync(Permissions.CAMERA)
      //   if( askCam.status != 'granted'){
      //     warn('Oops', 'You can not use camera without allowing this permission.')
      //   }
      // }
      
      // const resRoll = await Permissions.getAsync(
      //   Permissions.CAMERA_ROLL,
      // );
      // console.log('resRoll', resRoll)
      // if (resRoll.status !== 'granted') {
      //   const  askRoll = await Permissions.askAsync(Permissions.CAMERA_ROLL)
      //   if( askRoll.status != 'granted'){
      //     warn('Oops', 'You can not use camera roll without allowing this permission.')
      //   }
      // }

      try{
        let {coords} = await _getLocationAsync()
        global.curLocation = {lat : coords.latitude, lng: coords.longitude}

        let geoData = await GetAddressFromLocation(global.curLocation.lat, global.curLocation.lng)

        if( global.curUser ){
            let res = await RestAPI.storeAddress(geoData)
            console.log('Uploaded location address to server.')
        }

      }catch(exception){
        console.log('current location not found:  error: ' + exception.message)
      }

      return true;
  }

  const _getLocationAsync = async () => {

    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      failed('Permission Failed','Permission to access location was denied')      
    }
    
    let location = await Location.getCurrentPositionAsync();
    
    return location
  
  };

  const _getPushTokenAsync = async()=>{

    const resPush = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    console.log('resPush', resPush)
    if (resPush.status !== 'granted') {
      
      const askRes = await Permissions.askAsync(Permissions.NOTIFICATIONS)
      console.log('statusAskPush', askRes.status)
      if( askRes.status != 'granted'){
        warn('Oops', 'You can not receive push notification without allowing this permission.')
        return 
      }
    }
    

    let token = await Notifications.getExpoPushTokenAsync();

    return token;

  }

  const _bootstrapAsync = async ()=>{
    
    let res = await _checkPermission();
    if( res == false ){
      return;
    }
    
    let status = await BackgroundFetch.getStatusAsync()
    if( status == BackgroundFetch.Status.Available){
      console.log('Available')
    }else if( status == BackgroundFetch.Status.Denied ){
      console.log('Denied')
    }else if( status == BackgroundFetch.Status.Restricted ){
      console.log('Restricted')
    }
    
    let result = await Location.hasStartedLocationUpdatesAsync(Constants.LocationTaskName)
    if( !result ){
      console.log('hasStartedLocationUpdatesAsync Triggering************************')
      await Location.startLocationUpdatesAsync(Constants.LocationTaskName, {
        accuracy : Location.Accuracy.BestForNavigation,
        showsBackgroundLocationIndicator : true,                
        distanceInterval: 5,
      })     
    }
    
    
    console.log( 'Loading cur user from local')
    
    AsyncStorage.getItem('cur_user', ( err, data)=>{
        console.log( err, data)     
    }).then(data=>{
      global.curUser = JSON.parse( data )
      console.log('Cur user data at Splash : ', global.curUser)
      if( global.curUser != null ) {
          console.log('Call CheckToken API:')
          
         RestAPI.checkToken(global.expoPushToken, global.UUID).then(async(res) =>{
            
           global.curUser = res.data
           await AsyncStorage.setItem('cur_user', JSON.stringify(global.curUser))

           if( !global.curUser.phone_verified_at ){
              navigation.navigate('verify_phone');
              return 
           }
           if(!global.curUser.email_verified_at ){
              navigation.navigate('verify_email');
              return 
           }

          
           if( Constants.isDriver() && !global.curUser.car ){
              Constants.getInitRoute(true);
              navigation.navigate('Main');
              return 
           }
             
            Constants.getInitRoute(true);
            navigation.navigate('Main');
           
         }).catch(err=>{
             console.log('err while call check token api.', err)
            navigation.navigate('login');
         })
         
      }else{
          console.log('Cur user is null.')
         navigation.navigate('login');     
      }
    }).catch(err=>{
      console.log('Err while get async data ', err)
      navigation.navigate('login');
    });
    
  }
  
 

  useFocusEffect(React.useCallback(()=>{
    _bootstrapAsync();  
    return ()=>{}
  }, []))
  
  return (
    
    <ImageBackground  source={require('../../assets/signup.jpg')} blurRadius={2} style = {styles.imageCover}>
    
      <Image
        style={{ width:'80%', marginTop:-200}}
        resizeMode={"contain"}
        source={require("../../assets/logo_white_trans.png")}
      />
      <BallIndicator style={{ position: 'absolute', bottom: 20 }} color={'white'} />
    </ImageBackground>
    
  );
}
  
  const styles = StyleSheet.create({
    imageCover: {
      flex: 1,
      width:'100%',
      height:'100%',
      resizeMode: 'contain',
      justifyContent:'center',
      alignItems:'center',
    },
    container: {
      flex: 1,
      // backgroundColor: '#6a51ae' ,
      alignItems: 'stretch',
      justifyContent: 'flex-start',
    },
  });


  