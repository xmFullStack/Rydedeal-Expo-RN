
import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import MapAccept from '../../pages/customer/MapAccept';

import DriverManage from '../../pages/driver/DriverManage';
import Review from "../../pages/customer/Review";
import CarProfile from "../../pages/driver/CarProfile";

const Stack = createStackNavigator();

export default function DriverManageRideStack({route, navigation}){
  
  
  return (
    <Stack.Navigator initialRouteName="driver_manage_home" headerMode="none">
          
      
      <Stack.Screen name="driver_manage_detail" component={MapAccept} />
      <Stack.Screen name="driver_manage_home" component={DriverManage} />
      <Stack.Screen name="driver_review" component={Review}  />
      <Stack.Screen name="driver_setting" component={CarProfile}/>

    </Stack.Navigator>
  )
}

