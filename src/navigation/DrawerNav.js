import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  StatusBar, 
  useWindowDimensions, 
  Animated,
    TouchableOpacity,
  ImageBackground, 
  AsyncStorage , 
  Image, 
  Platform} 
from 'react-native';
import { Avatar } from 'react-native-elements';
const appJson = require('../../app.json');

import {createDrawerNavigator , DrawerItem, useIsDrawerOpen, DrawerContentScrollView } from '@react-navigation/drawer';

import PostRide, {UpdatePostRide} from '../../pages/customer/PostRide';

import Manage from '../../pages/customer/Manage';
import Payment from '../../pages/customer/Payment';
import Transaction from '../../pages/customer/Transaction'
import NewPassword from '../../pages/customer/NewPass';

import CarProfile from '../../pages/driver/CarProfile';
import PaymentVerification from '../../pages/driver/PaymentVerification';
import MapAccept from '../../pages/customer/MapAccept'
import Notifications from "../../pages/customer/Notifications";
import Constants from '../utils/Constants';
import { useRoute, useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import ManageRideStack from './ManageRideStack'
import RideDetail from '../../pages/customer/RideDetail'
import BillingList from '../../pages/customer/BillingList';
import AddCard from '../../pages/customer/AddCard';
import UserDetail, { GetAvatar, GetUserName } from '../../pages/customer/UserDetail';

import RestAPI from '../utils/RestAPI';
import Review from '../../pages/customer/Review'
import WebviewScreen from '../screens/WebviewScreen';
import DriverRideStack from './DriverRideStack';
import DriverManageRideStack from './DriverManageRideStack';

const Drawer = createDrawerNavigator();
const drawer = Drawer
function ProfileItem ({ containerStyle, avatar, userName, onPress}){

  let profile = avatar ? avatar : require('../../assets/avatar1.jpg')
  let profileName = userName ? userName : 'User Name'
  return (    
      <TouchableOpacity onPress={()=>{
        if(onPress){
              onPress();
        }
      }}>

      <View
        style={{        
              flexDirection:'row',
              justifyContent:'flex-start',
              alignItems:'center',        
              ...containerStyle
        }}
      >
        <Avatar
              rounded
              source={avatar}
              size={40}
        />
        <Text
              style={{fontSize:15, marginLeft:10}}
        >
            { Constants.ucfirst(userName) }
        </Text>
      </View>
      </TouchableOpacity>
  )
}

function CustomDrawerContent(props) {

  
  let { navigation, pageList } = props
  
  let [ notifyCount , setNotifyCount ] = useState()

  const isCurrentRoute=(name)=>{
      return  name == global.currentScreen
  }
  
  useFocusEffect(()=>{  
    loadNotifyData();
  })
  
  
  const loadNotifyData = ()=>{
        

    RestAPI.getCountAllNotifications().then(res=>{
        console.log(res)

        if ( res.success == 1 ){
            
            setNotifyCount(res.data)
        
        }else{

        }
    }).catch(err=>{
        console.log(err)

    }).finally(()=>{

    })
}


  return (
      <ImageBackground
        source={require('../../assets/menu_back.png')}
        resizeMode="stretch"
        style={styles.menuBack}
      >
        <View style={{
          width:'90%',            
          flexDirection:'row', 
          justifyContent:'flex-start',
          alignItems:'center',
          marginTop: Platform.OS == 'ios' ? 20 : 5,
          }}>
            <Image source={require('../../assets/icon.png')} style={{width:50, height:50, }} resizeMode={'stretch'}/>
              <Text style={styles.menuTitle}>
                  RYDEDEAL
              </Text>
          </View>
        <DrawerContentScrollView {...props} 
          
          alwaysBounceVertical = {true}
          alwaysBounceHorizontal={false}
          horizontal={false}
          vertical={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          
          contentContainerStyle={styles.drawerContentScroll}
        > 
          
          {
            pageList.map((item, index)=>{
              let focused = isCurrentRoute(item.name)
              return (
                
                <View key={'d'+index}>
                <DrawerItem
                  key={index}
                  label={item.label}
                  style={styles.drawerItem}
                  labelStyle={styles.itemLabel}
                  activeTintColor={'white'}
                  focused={focused}
                  activeBackgroundColor={Constants.purpleColor}
                  inactiveBackgroundColor = {'white'}
                  inactiveTintColor={Constants.purpleColor}
                  onPress={() => {
                    navigation.navigate(item.name)
                  }}
                />
                { 
                  item.label == 'Notifications' && notifyCount > 0 && 
                  <View style={{
                    position:'absolute', left:160, top:15, 
                    paddingHorizontal:8,
                    height:28, borderRadius : 14,
                    backgroundColor: focused ? 'white' : Constants.purpleColor,
                    justifyContent:'center', alignItems:'center'
                  }}>
                    <Text style={{color: focused ? Constants.purpleColor : 'white', fontSize:13}}>{notifyCount}</Text>
                  </View>
                }
                </View>
              )
            })
          }
          <DrawerItem
            label={"Log out"}
            style={styles.drawerItem}
            labelStyle={styles.itemLabel}
            activeTintColor={'white'}
            focused={false}
            activeBackgroundColor={Constants.purpleColor}
            inactiveBackgroundColor = {'white'}
            inactiveTintColor={Constants.purpleColor}
            onPress={async() => {
              let token = global.curUser.token 
              RestAPI.logout(token).then(res=>{
              
              }).catch(err=>{
              
              }).finally(()=>{
              
              })
              global.curUser = null;
              await AsyncStorage.removeItem('cur_user')              
              navigation.popToTop();
            }}
          />
            
        </DrawerContentScrollView>
              
          <ProfileItem 
            containerStyle={{
              marginBottom : 20,
              marginLeft:5,
              heigh:50,
              width:'50%',
            }}
            onPress={()=>{
                navigation.navigate('user_detail')
            }}
            avatar={GetAvatar()} 
            userName={GetUserName()}/>

      <View style={{position:'absolute', bottom:3, left:10}}><Text style={{color:Constants.purpleColor, fontSize:11}}>Version:{appJson.expo.ios.buildNumber}</Text></View>
    </ImageBackground>
      
  );
  }
  
  
  
  
  export default function DrawerNav (props){
      const route = useRoute();
      const navigation = useNavigation();
      
      console.log('DrawerNav -->> Global CurLocation', global.curLocation)
      const currentRouteName = (route)=>{
          if( !route.state || !route.state.history ){
            return null
          }
          
          let lastKey = route.state.history[0].key;
          let lastRouteName = null;
          
          route.state.routes.forEach(item => {
              if( item.key == lastKey ){
                lastRouteName = item.name      
              }
          });

          return lastRouteName
      }
      
      // React.useEffect(() => {
      //   // const unsubscribe = navigation.addListener('drawerOpen', (e) => {
      //     let initRoute = Constants.getInitRoute(true);
      //   // });
      
      //   // return unsubscribe;
      // }, [currentRouteName]);
    

      let pageList = [];
      if( Constants.isCustomer() ){
        pageList = [ 
          {name:'Manage', label:'Manage Rides'}, 
          {name:'Home', label:'Post a Ride'}, 
          // {name:'Messages', label:'Messages'}, 
          {name:'Transaction', label:'Transaction History'}, 
          {name:'BillingMethod', label:'Billing Method'}, 
          {name:'Notifications', label:'Notifications'}, 
          {name:'PwdChange', label:'Change Password'},       
        ]
      }
      if( Constants.isDriver() ){
        pageList = [ 
          {name:'driver_ride_browse', label:'Browse Rides'}, 
          {name:'driver_manage', label:'Manage Rides'}, 
          
          // {name:'Messages', label:'Messages'}, 
          {name:'Transaction', label:'Transaction History'},
          {name:'BillingMethod', label:'Billing Method'},
          {name:'PaymentVerification', label:'Payment'}, 
          {name:'Notifications', label:'Notifications'}, 
          {name:'PwdChange', label:'Change Password'},       
          {name:'Setting', label:'Setting'},       
        ]
      }
      

      
      let initRoute = Constants.getInitRoute(false);

      // useFocusEffect(React.useCallback(()=>{
      //   initRoute = Constants.getInitRoute(true);
      // }, []))
      
      
      return (
        <Drawer.Navigator
          initialRouteName={initRoute } 
          drawerType={"front"} 
          
          // statusBarAnimation={'slide'} 
          hideStatusBar={false}
          drawerStyle={styles.drawer}  
          drawerContent={props=>
            <CustomDrawerContent 
              {...props} 
              currentRouteName = {currentRouteName(route)} 
              pageList={pageList}
              // onUpdateNotifcaion={data=>{ setNotificationList(data) }}
            />
          }
        > 

          <Drawer.Screen name="Manage" component={ManageRideStack} />
          <Drawer.Screen name="driver_manage" component={DriverManageRideStack}/>
          <Drawer.Screen name="Home" component={PostRide} />
          <Drawer.Screen name="update_ride" component={UpdatePostRide} />

          <Drawer.Screen name="Transaction" component={Transaction} />
          <Drawer.Screen name="BillingMethod" component={BillingList} />
          <Drawer.Screen name="PwdChange" component={NewPassword} />
          <Drawer.Screen name="ride_detail" component={RideDetail}  />
          <Drawer.Screen name="add_card" component={AddCard}/>
          <Drawer.Screen name="user_detail" component={UserDetail}/>
          <Drawer.Screen name="web_page" component={WebviewScreen}/>
          <Drawer.Screen name="Notifications" component={Notifications} />
          
          <Drawer.Screen name="root_review" component={Review} />
          <Drawer.Screen name="noti_driver_manage_detail" component={MapAccept} />
          <Drawer.Screen name="driver_ride_browse" component={DriverRideStack}/>
          <Drawer.Screen name="PaymentVerification" component={PaymentVerification}/>
          <Drawer.Screen name="Setting" component={CarProfile}/>
          
          
        </Drawer.Navigator>
      )

  }

  
 
  

  

  const styles = StyleSheet.create({
  menuBack:{              
      height:'100%',
      width:'95%',
      paddingLeft:0,
      marginLeft:0,
  },
  drawerContentScroll:{
      paddingTop:20, 
      paddingBottom:20,
      marginLeft:0,
      
      
  },
  menuTitle:{
      fontSize:25,
      fontWeight:'bold',               
      paddingLeft:0,
      color:Constants.purpleColor,
      paddingTop:30,
      marginBottom:20,
      
  },
  drawerItem:{
      width:'65%',
      height:50,
      marginLeft:-10,
      borderTopRightRadius:25,
      borderBottomRightRadius: 25,
      // backgroundColor:'#fff'
      
  },
  itemLabel:{
      // color: Constants.backWhite,
      fontSize:18,
      fontWeight:"bold",
      paddingLeft:20,      
  },
  drawer:{
      backgroundColor: '#fff0',
      width: Constants.WINDOW_WIDTH ,                                
      paddingVertical: 0,
      paddingRight: 0,                
  }


  })