import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, StatusBar, useWindowDimensions, Animated  } from 'react-native';
import { Button, Input } from 'react-native-elements';

import { NavigationContainer, useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import DrawerNav from './DrawerNav';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../../pages/customer/LoginScreen';
import SignupScreen from '../../pages/customer/SignupScreen';
import { Notifications } from 'expo';
import VerifyPhoneScreen from '../../pages/customer/VerifyPhoneScreen';

import FBLoginTest from '../../src/screens/FBLoginTest';

import PostRideInfo from '../../pages/customer/PostRideInfo';
import VerifyEmailScreen from '../../pages/customer/VerifyEmailScreen';
import DriverProfile from '../../pages/driver/DriverProfile';
import CarProfile from '../../pages/driver/CarProfile';
import ForgotPassword from "../../pages/customer/ForgotPassword";
import { PushCodes } from "../utils/DefaultCodes";
import { showMessage, hideMessage } from "react-native-flash-message";
import WebviewScreen from '../screens/WebviewScreen';

import Constants from "../utils/Constants";
import Utils from "../utils/Utils";

const Stack = createStackNavigator();

export const PushMessageType = {
  default: 'default',
  success: 'success',
  info : 'info',
  warning: 'warning',
  danger: 'danger',
}

export default function AppContainer (props){

  let [ notification , setNotification ] = useState()
  
  const _handleNotification = notification => {
    
    setNotification( notification )
    processPush(notification)
    
  };
  
  const processPush = (data)=>{
    const origin = data.origin;
    let json = JSON.stringify(data.data)
    let pushData = data.data;

    switch(origin){
      case 'selected':
        
        processPushType(pushData.push_type,  pushData.body, pushData.data, 'selected');
        break;
      case 'received':
        
        processPushType(pushData.push_type,  pushData.body, pushData.data, 'received');
        break;
      default:    
    }
  }
  
  let _notificationSubscription = Notifications.addListener(_handleNotification);

  const processPushType = (push_type, bodyText, data, triggeredBy)=>{

    if( !global.curUser ){
      // TODO : will not popup any message for not logged in user
       return ;
    }
    let isDriver = null;
    if( Constants.isDriver() ){ isDriver = true }
    if( Constants.isCustomer() ) { isDriver = false;}

    if( isDriver == null ){
      // TODO : Unknown user role, will not popup

      return ;
    }

    let msgData = {
        msgTitle : bodyText,
        msgDesc : '',
        msgType : 'default',
        // msgBGColor : Constants.purpleColor,
        // msgTextColor: 'white',
        // icon:'success', //"success", "info", "warning", "danger"
        duration: 5000,
        onPress : ()=>{}
    }


    switch (push_type) {
      case PushCodes.TEST_PUSH:

        msgData.msgDesc = 'This is only for test, please ignore this.';
        msgData.msgType = PushMessageType.warning;

        break;
      case PushCodes.LEFT_REVIEW_TO_CUSTOMER:
        let review = data;
        let comments = Constants.shortString(review.comments);

        msgData.msgDesc = review.rating + ' Stars,  ' + comments;
        msgData.msgType = PushMessageType.success;

        break;
      case PushCodes.LEFT_REVIEW_TO_DRIVER:
        review = data;
        comments = Constants.shortString(review.comments);
        msgData.msgDesc = review.rating + ' Stars,  ' + comments;

        msgData.msgType = PushMessageType.success;

        break;
      case PushCodes.ACCEPT_FROM_CUSTOMER:
        let bid = data;
        let ride = bid.ride;
        let timeFrom =  Utils.timeDateFullStr(ride.time_from);
        if(ride.is_scheduled == 1){
          msgData.msgDesc = ride.slugId + ',  Scheduled at ' + timeFrom;
        }else{
          msgData.msgDesc = ride.slugId + ',  Immediately at ' + timeFrom;
        }

        msgData.msgType = PushMessageType.info;

        break;
      case PushCodes.ACCEPT_FROM_DRIVER:
        bid = data;
        ride = bid.ride;
        timeFrom =  Utils.timeDateFullStr(ride.time_from);

        if(ride.is_scheduled == 1){
          msgData.msgDesc = ride.slugId + ',  Scheduled at ' + timeFrom;
        }else{
          msgData.msgDesc = ride.slugId + ',  Immediately at ' + timeFrom;
        }

        msgData.msgType = PushMessageType.success;

        break;
      case PushCodes.DECLINED_BID_FROM_CUSTOMER:
        bid = data;
        ride = bid.ride;
        msgData.msgDesc = 'Ride : ' + ride.slugId;
        msgData.msgType = PushMessageType.danger;
        break;
      case PushCodes.CANCELED_BID_FROM_DRIVER:
        bid = data;
        ride = bid.ride;
        msgData.msgDesc = 'Ride : ' + ride.slugId;
        msgData.msgType = PushMessageType.warning;

        break;
      case PushCodes.CANCELED_RIDE_BY_CUSTOMER:
        ride = data;
        // msgData.msgDesc = 'Ride : ' + ride.id;
        msgData.msgType = PushMessageType.danger;
        break;
      case PushCodes.NEW_DRIVER_BID:
        bid = data;
        ride = bid.ride;
        msgData.msgDesc = 'Ride : ' + ride.slugId;
        msgData.msgType = PushMessageType.info;
        break;
      case PushCodes.DRIVER_UPDATE_BID:
        bid = data;
        ride = bid.ride;
        msgData.msgDesc = 'Ride : ' + ride.slugId + ', ' + ride.currency + bid.price ;
        msgData.msgType = PushMessageType.info;
        break;
      case PushCodes.RIDE_BEGAN:
        ride = data;
        msgData.msgDesc = 'Ride : ' + ride.slugId;
        msgData.msgType = PushMessageType.success;
        break;
      case PushCodes.RIDE_WENT_PICK:
        ride = data;
        msgData.msgDesc = 'Ride : ' + ride.slugId;
        msgData.msgType = PushMessageType.success;
        break;
      case PushCodes.RIDE_COMPLETED:
        ride = data;
        msgData.msgDesc = 'Ride : ' + ride.slugId;
        msgData.msgType = PushMessageType.success;
        break;
      case PushCodes.NEW_POST:
        ride = data;        
        msgData.msgDesc = 'Ride : ' + data.slugId;

        msgData.msgType = PushMessageType.info;
        break;
      case PushCodes.UPDATE_RIDE:
        ride = data;
        msgData.msgDesc = 'Ride : ' + ride.slugId;
        msgData.msgType = PushMessageType.info;
        break;
      case PushCodes.DRIVER_UNAPPROVED:
        let driver = data;
        msgData.msgType = PushMessageType.danger;
        break;
      case PushCodes.DRIVER_APPROVED:
        driver = data;
        msgData.msgType = PushMessageType.success;
        break;
      case PushCodes.PURCHASE_MONTHLY:
        
        msgData.msgType = PushMessageType.success;
        break;
      case PushCodes.FAILED_PURCHASE_MONTHLY:
        
        msgData.msgType = PushMessageType.danger;
        break;
      case PushCodes.PURCHASE_TRIAL:
        
        msgData.msgType = PushMessageType.success;
        break;
      case PushCodes.FAILED_PURCHASE_TRIAL:
        
        msgData.msgType = PushMessageType.danger;
        break;
      default :
        msgData.msgDesc = 'Unknown type';
        // warn('Unknown Push code: ' + push_type, JSON.stringify(data))
    }
    
    showMessage({
        message: msgData.msgTitle,
        description: msgData.msgDesc,
        type: msgData.msgType,
        backgroundColor: msgData.msgBGColor, // background color
        color: msgData.msgTextColor, // text color
        icon: msgData.icon,
        duration:msgData.duration,
        onPress: () => {
          if( msgData.onPress ){
            msgData.onPress();
          }
        },
    });


  };


    return (

    <NavigationContainer>
    {/* <DrawerNav/> */}
  
    <Stack.Navigator initialRouteName="Splash" headerMode="none">
    
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen} 
        initialParams={{item:12123}} 
        options={{        
        }} />
    
      <Stack.Screen name="test" component={PostRideInfo} />
      <Stack.Screen name="login" component={LoginScreen}  />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword}  />
      <Stack.Screen name="signup" component={SignupScreen} />
      <Stack.Screen name="verify_phone" component={VerifyPhoneScreen} />
      <Stack.Screen name="verify_email" component={VerifyEmailScreen} />
      
      <Stack.Screen name="driver_profile" component={DriverProfile} />
      
      <Stack.Screen name="fbtest" component={FBLoginTest} />
      <Stack.Screen name="web_page" component={WebviewScreen} />
      <Stack.Screen name="Main" component={DrawerNav} options={{ title: 'Hi Here' }} />
    </Stack.Navigator>
  </NavigationContainer>
    )
}


