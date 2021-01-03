
import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import Manage from '../../pages/customer/Manage';

import Review from '../../pages/customer/Review'
const Stack = createStackNavigator();

export default function ManageRideStack({route, navigation}){


  return (
    <Stack.Navigator initialRouteName="manage" headerMode="none">
          
      <Stack.Screen name="manage" component={Manage}  />
      
      <Stack.Screen name="review" component={Review}  />
      
    </Stack.Navigator>
  )
}

