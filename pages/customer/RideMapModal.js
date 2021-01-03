import React, { Component, useState, useReducer, useRef } from 'react'
import {     
    View,
    TouchableOpacity, 
    StyleSheet, 
    Dimensions,
    Modal,
    Text,
    Platform,
    Image
} from 'react-native'
import { Ionicons, SimpleLineIcons , EvilIcons} from '@expo/vector-icons';
import { NavigationContext, useRoute,useFocusEffect, useNavigation } from '@react-navigation/native'
import MapView, { Marker, LocalTile, MarkerIcon} from 'react-native-maps';
import Constants, { StatusBarHeight, isIOS } from '../../src/utils/Constants';
import RestAPI from '../../src/utils/RestAPI';

import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { DirectionDataView, LocateMeButton } from './PostRide'
import { REMINDERS } from 'expo-permissions';
import { HitTestResultTypes } from 'expo/build/AR';

let screenHeight = Dimensions.get('window').height;
let screenWidth = Dimensions.get('window').width;

const meMarker =  require('../../assets/me_marker.png')
const marker1 =  require('../../assets/marker1.png')
const marker2 =  require('../../assets/marker2.png')
const carMarker =  require('../../assets/car_marker.png');
const customerMarker =  require('../../assets/customer_marker.png');


export default class RideMapModal extends Component {
    static contextType = NavigationContext
    item = this.props.item
    
    state = {
        isLoading: false,
        isCustomer : true,
        bidList : this.props.bidList,
        // showModal: this.props.isShowModal,
        isFromSelected : true, 
        yourLocation : {
            name: this.item ? this.item.address_from : '', 
            lat: this.item ?  this.item.location_from.coordinates[0] : 0 , 
            lng : this.item ? this.item.location_from.coordinates[1] : 0},
        dropLocation:{
            name: this.item ? this.item.address_to : '', 
            lat: this.item ? this.item.location_to.coordinates[0] : 0, 
            lng: this.item ? this.item.location_to.coordinates[1] : 0},
        distance : null,
        duration : null,
        region:{
            latitude: global.curLocation.lat,
            longitude: global.curLocation.lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        },
        initialRegion :{
            latitude: global.curLocation.lat,
            longitude: global.curLocation.lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        },
        curLocation:global.curLocation,
        wayPoints : [],
        pricePerKm : 0,
        serviceFee : 0,
        currency : "$",

        liveDriverLocation : null, // {latitude, longitude}
        liveDriverName  : '',
        liveDriverDescription : '',
        liveCustomerLocation,
    };

  
    getMinPrice = ( distance )=>{
        try{
            let price = this.state.serviceFee + distance * this.state.pricePerKm
            price = price.toFixed(3)
            return price;
        }catch(e){
            console.log('Exception in RideMapModal.js, line 300: ', e)
            return 0;
        }

    }

    liveTrackId = null

    liveTracking = ()=>{

        this.liveTrackId = setInterval(()=>{
            let ride = this.props.item
            console.log('liveTracking item data : ', ride)
            if( !ride || !ride.driver_id ){
                console.log('ride item is null in RideMapModal  from live tracking:', ride)
                return
            }
            console.log('Live Tracking for item.driver_id -> ', ride.driver_id);

            if( Constants.isDriver () ){
                let delta = 1;
                if( this.state.liveDriverLocation ){
                    delta = Constants.distance(this.state.liveDriverLocation.latitude, this.state.liveDriverLocation.longitude, global.curLocation.lat, global.curLocation.lng)
                }
                
                if (delta > 0.01 ){
                    this.setState({ 
                        liveDriverLocation: {
                            latitude: global.curLocation.lat, 
                            longitude: global.curLocation.lng,
                            lat: global.curLocation.lat, 
                            lng: global.curLocation.lng,
                        } 
                    })    
                }
                            
            }else{
                this.setState({
                    liveCustomerLocation : {
                        latitude: global.curLocation.lat, 
                        longitude: global.curLocation.lng,
                        lat: global.curLocation.lat, 
                        lng: global.curLocation.lng,
                    }
                })
            }

            let trackedUserId = Constants.isDriver() ? ride.owner_id : ride.driver_id
            if( !trackedUserId ){
                return;
            }

            
            RestAPI.liveDriverLocation(trackedUserId).then(res=>{

                if( res.success == 1 ){
                    let user = res.data;
                    if( !user.location || !user.location.lat ){
                        return;
                    }

                    if( Constants.isDriver () ){                        
                        this.setState({ liveCustomerLocation :{latitude: user.location.lat, longitude: user.location.lng} })
                    }else{
                        let delta = 1;
                        if( this.state.liveDriverLocation ){
                            delta = Constants.distance(this.state.liveDriverLocation.latitude, this.state.liveDriverLocation.longitude,  user.location.lat,  user.location.lng)
                        }
                        
                        if (delta > 0.01 ){
                            this.setState({
                                liveDriverLocation : {latitude: user.location.lat, longitude: user.location.lng},
                                liveDriverName : Constants.ucfirst(user.first_name) + ' ' + Constants.ucfirst(user.last_name),
                                liveDriverDescription : user.address,
                            })
                        }

                    }   

                    
                }
            }).catch(err=>{
                console.log('LiveDriverLocation Err:', err)
            })
        }, 1000)
    }

    componentDidMount(){
        const navigation = this.context
        this._unsubscribe = navigation.addListener('focus', () => {
            
            console.log('BidList:  ******************', this.props.bidList)
            // do something
            // global.currentScreen = "Manage"
        });
        
        Location.watchPositionAsync({enableHighAccuracy: true }, ( locResult )=>{
            global.curLocation = {lat : locResult.coords.latitude , lng: locResult.coords.longitude}
            this.setState({ curLocation : global.curLocation })
        })

        this.liveTracking();


    }
    
    componentWillUnmount(){
        // this._unsubscribe();
        if( this.liveTrackId ){
            clearInterval(this.liveTrackId);
        }
    }


    getRegion = (locations)=>{
        
         let center = null;
         let deltaLat = 0.5; let deltaLng = 0.5;

         
         let maxLat= global.curLocation.lat ; let minLat = global.curLocation.lat
         let maxLng = global.curLocation.lng ; let minLng = global.curLocation.lng
        
         locations.forEach( item =>{
            if ( item ){                
                minLat = Math.min(item.lat , minLat)
                minLng = Math.min( item.lng , minLng )
                maxLat = Math.max( item.lat , maxLat )
                maxLng = Math.max( item.lng , maxLng)
            }
         })
        

         center = {
             lat: ( maxLat + minLat ) / 2, lng : ( maxLng + minLng ) / 2
         }
         deltaLat = ( maxLat - minLat ) * 3 / 2 ;
         deltaLng = ( maxLng - minLng ) * 3 / 2 ;
         let region = {
            latitude: center.lat,
            longitude: center.lng,
            latitudeDelta: deltaLat > 360 ? deltaLat / 1.5 : deltaLat,
            longitudeDelta: deltaLng > 360 ? daltaLng / 1.5 : deltaLng,
         }
         this.setState({ region : region })
        

    }
    
    render() {


        const item = this.props.item

        if( !item ){
            return null
        }
        
        if( this.props.isShowModal == false ){
            return null;
        }

        let yourLocation = { 
            name: item.address_from, 
            lat: parseFloat(item.location_from.coordinates[1]) , 
            lng : parseFloat(item.location_from.coordinates[0]) 
        }
        let dropLocation = { 
            name: item.address_to, 
            lat:  parseFloat(item.location_to.coordinates[1])  , 
            lng :  parseFloat( item.location_to.coordinates[0] )
        }

        let from = {latitude:item.location_from.coordinates[1], longitude:item.location_from.coordinates[0]}
        let to = {latitude:item.location_to.coordinates[1], longitude:item.location_to.coordinates[0]}
        
        const {distance, duration } = this.state
        console.log('BidList in render of RideMapModal::::::::::::::::::',  this.props.bidList)
        
        let topOffset =  50
        
        return (             
               
        <Modal
            transparent={true}
            visible={this.props.isShowModal}>        
            
            <RideMapView
                rideItem={this.props.item}
                bidList={this.props.bidList}
                isInModal={true}
                liveCustomerLocation={this.state.liveCustomerLocation}
                liveDriverLocation = {this.state.liveDriverLocation} // {latitude, longitude}
                liveDriverName  = {this.state.liveDriverName}
                liveDriverDescription = {this.state.liveDriverDescription}
            />
           
            <TouchableOpacity 
                style={{
                    position:'absolute',
                    top: topOffset, 
                    right:10,
                    borderRadius:25,
                    // width:50,height:50,
                    justifyContent:'center',
                    alignItems:'center',
                    borderColor:'#fff0',
                    borderWidth:1,
                    elevation:10,
                    shadowOffset:{
                        width:0,
                        height:3,
                    },
                    shadowOpacity:0.5,
                    // shadowOpacity: 0.5,
                    // shadowRadius: 15.00,
                    zIndex: 1,
                }}
                onPress={()=>{
                    const { onCloseModal} = this.props
                    if( onCloseModal ){
                        onCloseModal()
                    }
                }}>
                
                    <View
                        style={{
                            borderRadius:20,
                            width:40,height:40,
                            
                            backgroundColor:Constants.purpleColor,
                            justifyContent:'center',
                            alignItems:'center',

                            // elevation: 10,
                            
                        }}
                    >
                        <EvilIcons name="close" size={30} color={'#fff'} />
                    </View>
                
            </TouchableOpacity>

            </Modal>

        )
    }
}


const styles = StyleSheet.create({
    iosMapMarker : {

        width:30,
        height:45,
        top: isIOS() ? -20 : 0,

    },   
    mapStyle: {
        position:'absolute',
        left:0, top:0,
        width: Constants.WINDOW_WIDTH,
        height: Constants.WINDOW_HEIGHT,
    },
    imageCover: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent:'flex-start',
        alignItems:'center',
        
    },
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: screenHeight,
        width: screenWidth,
    },
    
    input: {
        width: '100%',
        height: 30,
        marginTop: -5,
        marginLeft: -10,
    },
    inputDisabled: {
        width: '100%',
        height: 30,
        marginTop: -5,
        
        // marginLeft: -10,
    },
    textInput: {
        color: '#555',
        width: '100%',
        fontSize: 13,
    },
    mainBody:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        height: '55%',
        width: '85%',
        borderRadius: 30,
    },
    inputIcon:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '15%',
    },
    inputFromTo:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '85%',
    },


    buttonView:{
        marginBottom: -30,
        height: '20%',
        width: '35%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitButton: {
        backgroundColor: 'white',
        height: 40,
        width: '100%',
        borderRadius: 10,
        justifyContent:'center',
        alignItems: 'center'
    },
    submitButtonText:{
        fontSize: 15,
        fontWeight: 'bold',
        color: '#444',
        textAlign: 'center'
    },
})
