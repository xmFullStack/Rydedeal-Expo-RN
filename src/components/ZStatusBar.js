import React, { Component, useState } from 'react'
import {
    StatusBar,     
} from 'react-native'
import Constants, {isIOS} from '../utils/Constants';

export default ZStatusBar = ({backgroundColor= Constants.white, barStyle='dark-content'})=>{
   
   return <StatusBar backgroundColor={backgroundColor} barStyle={ isIOS() ? 'dark-content' : barStyle } />
} 
