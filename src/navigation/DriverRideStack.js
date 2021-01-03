
import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import Review from '../../pages/customer/Review'
import BrowseRide from './../../pages/driver/BrowseRide';
import MapAccept from '../../pages/customer/MapAccept';

const Stack = createStackNavigator();

export default function DriverRideStack({route, navigation}){
  
  
  return (
    <Stack.Navigator initialRouteName="browse_ride" headerMode="none">
          
      <Stack.Screen name="ride_list" component={BrowseRide} />
      <Stack.Screen name="detail" component={Review} />
      <Stack.Screen name="map_accept" component={MapAccept} />      
      
    </Stack.Navigator>
  )
}

