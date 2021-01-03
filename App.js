import React, {useState} from 'react';

import {
  View, Text
} from 'react-native';
import AppContainer from './src/navigation/AppContainer';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import Constants from './src/utils/Constants'
import PageLoaderIndicator from './src/components/PageLoaderIndicator'
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from 'expo-location';
import RestAPI from './src/utils/RestAPI';
import FlashMessage from "react-native-flash-message";
import ZMsg, { MsgTypes } from './src/components/ZMsg/ZMsg';
import { withTheme } from 'react-native-elements';

console.disableYellowBox = true;
export function GetAddressFromLocation(lat, lng){
  
  const location = {latitude : lat, longitude: lng}
  
  return new Promise(( resolve, reject )=>{
      Location.reverseGeocodeAsync( location ).then(res=>{
        console.log('ReverseGeoCoding result : ' + JSON.stringify(res))  

        if( res && res.length > 0){
          
          let city = res[0].city;
          global.curCity = city
          
          let address = res[0].name + ',' + res[0].city + ',' + res[0].region + ',' + res[0].country
          let isoCountryCode = res[0].isoCountryCode
          let result = {city:city, latitude: location.latitude, longitude: location.longitude, address : address, isoCountryCode : isoCountryCode}
          
          resolve(result)
        }else{
          resolve(null)
        }
      }).catch(err=>{
        console.log('Error from reverse geo coding: ', err);
        reject(err)
      })
  }) 
  

}


const LocationTaskCallback = ({data, error})=>{
  if( error ){
    console.log('Task manager error: ??????????????????' , error)
    return BackgroundFetch.Result.Failed
  }else{
    const { locations } = data;
    
    console.log( 'Locations in TaskManager : !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',  locations );
    if( !locations ){
      console.log('locations is undefined. ~~~~~~~~~~~~~~:(:(:(:(:(:(:(:(:(:(:(:(:(:(~~~~~~~~~~')
      return BackgroundFetch.Result.Failed
    }
    let index = locations.length  - 1
    if( index >= 0){
      
      global.curLocation = {lat: locations[index].coords.latitude, lng: locations[index].coords.longitude}

      console.log('Global background location fetched:', global.curLocation)
      if( !global.curUser ){
        console.log('GetAddresFromLocation : cur user is null, ');
        return BackgroundFetch.Result.NoData;
      }
      GetAddressFromLocation(global.curLocation.lat, global.curLocation.lng).then(data=>{

        if( data == null ){
          console.log('Failed to get city from location by location.reverseGeoLocation....... :(:(.')
        }else{
          console.log('Will Store this data for user current location:', data)
          RestAPI.storeAddress(data).then(res=>{
            if( res.success == 1){
              console.log('Stored current location and address : ', res);
            }else{
              console.log('Failed to store current location and address : ', res);
            }
          }).catch(err=>{
            console.log('Failed to store address, err: ', err);
          })
        }
      }).catch(err=>{
        console.log('Err while getaddressfromlocation:', err)
      })
      if( global.setTestLiveData ){
          global.setTestLiveData(JSON.stringify(global.curLocation))
      }
      
      if( global.updateCurLocationInPostRide ){
          global.updateCurLocationInPostRide(global.curLocation)
      }
      
      return BackgroundFetch.Result.NewData;
      
    }
    return BackgroundFetch.Result.NoData;
  }
}


TaskManager.defineTask(Constants.LocationTaskName, ({data, error})=>LocationTaskCallback({data, error}));


export default function App() {


  const zMsgRef = React.useRef()
  
  const [msgTitle, setmsgTitle] = useState('Rydedeal')
  const [msgtext, setmsgtext] = useState('')
  const [msgType, setMsgType] = useState(MsgTypes.success)
  const [ showFullLoader , setShowFullLoader ] = useState(false)
  const [ isShowPageLoader, setIsShowPageLoader ] = useState(false)
  
  
  global.alert = (title, text, type=MsgTypes.success)=>{    
    global.onTapOkMsgButton = null;
    global.onTapCancelMsgButton = null
    if( zMsgRef.current ){
      setmsgTitle(title)
      setmsgtext(text)
      setMsgType(type)
      setShowFullLoader(false)
      zMsgRef.current.showMsg();      
    }
  }
  global.warn= (title, text,  type=MsgTypes.warn)=>{    
    global.onTapOkMsgButton = null;
    global.onTapCancelMsgButton = null
    if( zMsgRef.current ){
      setmsgTitle(title)
      setmsgtext(text)
      setMsgType(type)
      setShowFullLoader(false)
      zMsgRef.current.showMsg();      
    }
  }

  global.error = (title, text, type=MsgTypes.error)=>{    
    global.onTapOkMsgButton = null;
    global.onTapCancelMsgButton = null
    if( zMsgRef.current ){
      setmsgTitle(title)
      setmsgtext(text)
      setMsgType(type)
      setShowFullLoader(false)
      zMsgRef.current.showMsg();      
    }
  }

  global.failed = (title, text, type=MsgTypes.failed)=>{    
    console.log('failed > set null for both button actions')
    global.onTapOkMsgButton = null;
    global.onTapCancelMsgButton = null
    if( zMsgRef.current ){
      setmsgTitle(title)
      setmsgtext(text)
      setMsgType(type)
      setShowFullLoader(false)
      zMsgRef.current.showMsg();      
    }
  }

  
  global.alertOk = (title, text, onTapOk, type=MsgTypes.success, )=>{
    console.log('alertOk > set null for both button actions')
    global.onTapOkMsgButton = null;
    global.onTapCancelMsgButton = null
    if( zMsgRef.current ){
      global.onTapOkMsgButton = onTapOk;    
      setmsgTitle(title)
      setmsgtext(text)
      setMsgType(type)
      setShowFullLoader(false)
      
      zMsgRef.current.showMsg();      
    }
  }
  
  global.confirm = (title, text,  onTapOk, onTapCancel)=>{    
    console.log('Confirm > set null for both button actions')
    global.onTapOkMsgButton = null;
    global.onTapCancelMsgButton = null
    if( zMsgRef.current ){
      console.log('confirm > set both buttons actions')
      global.onTapOkMsgButton = onTapOk;
      global.onTapCancelMsgButton = onTapCancel

      setmsgTitle(title)
      setmsgtext(text)
      setMsgType(MsgTypes.confirm)
      setShowFullLoader(false)      
      
      
      console.log(typeof(global.onTapOkMsgButton), typeof(global.onTapCancelMsgButton))

      zMsgRef.current.showMsg();      
    }
  }
  
  global.showPageLoader = (isShow)=>{
    setIsShowPageLoader(isShow)
  }

  const onTapOkMsg = ()=>{

    if( global.onTapOkMsgButton ){
      console.log('Called onTapOkMsgButton')
      global.onTapOkMsgButton()
    }else{
      console.log('onTapOkMsgButtons is null')
    }
  }
  
  const onTapCancelMsg = ()=>{
    if( global.onTapCancelMsgButton ){
      console.log('Called onTapCancelMsgButton')
      global.onTapCancelMsgButton()
    }else{
      console.log('onTapCancelMsgButton is null')
    }
  }

  
  return (
     <SafeAreaProvider>
      <AppContainer/>
        <FlashMessage position="top" />
        <ZMsg ref={zMsgRef} isLoadingIndicator={showFullLoader} title={msgTitle} text={msgtext} type={msgType} onTapOkButton={()=>{onTapOkMsg()}} onTapCancelButton={()=>{onTapCancelMsg()}} />
        <PageLoaderIndicator isPageLoader = {isShowPageLoader}/>        
     </SafeAreaProvider>
    
  );
}



function myTask() {
  try {
    // fetch data here...
    const backendData = "Simulated fetch " + Math.random();
    let date = new Date();
    let timestamp = date.toLocaleTimeString()
    console.log( timestamp + " myTask() ", backendData);

    Location.watchPositionAsync({
      enableHighAccuracy: true,
      timeInterval: 5000,
      mayShowUserSettingsDialog : true,
      distanceInterval : 10
    }, ( locResult )=>{
      console.log('Watchposition call back result **************&&&&&&&&&&&&&&&&&&&&&&')
        global.curLocation = {lat : locResult.coords.latitude , lng: locResult.coords.longitude}
        
        if( global.updateCurLocationInPostRide ){
          global.updateCurLocationInPostRide(global.curLocation)
        }
    
    }).then(rr=>{
        console.log('Get Cur Position in MyTask> Watch position Async.', rr)
    }).catch(er=>{
        console.log('Err occured while Cur Position in MyTask> Watch position Async.', er)
    })
    
    Location.getCurrentPositionAsync().then(res=>{
      let date = new Date();
      let time = date.toLocaleTimeString();
      
      console.log(time + ' >Location : backend> getCurrentPositionAsync : ' + JSON.stringify(res))
    }).catch(err=>{
      let date = new Date();
      let time = date.toLocaleTimeString();
      
      console.log(time + ' backend :> getCurrentPositionAsync: ' + JSON.stringify(err))
    });
    
    console.log( 'after watch position : > ' + timestamp + " myTask() ", backendData);
    
    if( global.setTestLiveData ){
        global.setTestLiveData(backendData)
    }
    return backendData
      ? BackgroundFetch.Result.NewData
      : BackgroundFetch.Result.NoData;
  } catch (err) {
    return BackgroundFetch.Result.Failed;
  }
}


async function initBackgroundFetch(taskName, taskFn,interval = 1) {
  try {
    if (!TaskManager.isTaskDefined(taskName)) {
      TaskManager.defineTask(taskName, taskFn);
    }
    const options = {
      minimumInterval: interval // in seconds
    };
    await BackgroundFetch.registerTaskAsync(taskName, options);
  } catch (err) {
    console.log("registerTaskAsync() failed:", err);
  }
}

initBackgroundFetch('myTaskName', myTask, 1);

