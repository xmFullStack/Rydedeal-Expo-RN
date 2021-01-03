import React, { useState, useRef } from 'react'
import { 
    View, 
    Text, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    ScrollView, 
    TextInput, 
    StyleSheet, 
    Dimensions ,
    Animated,
    Easing,
    Alert,
} from 'react-native'
import {Avatar, } from 'react-native-elements';
import {  FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { BallIndicator } from 'react-native-indicators';
import { AirbnbRating } from 'react-native-ratings';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Constants from '../../src/utils/Constants';
import { UpButton, DownButton} from '../../pages/customer/MapAccept';

import { Linking } from 'expo';
import moment from "moment";

let screenHeight = Dimensions.get('window').height;
let screenWidth = Dimensions.get('window').width;

export const LeftTapAction = {
    BeginRide : 1,
    AcceptRide : 2,
    CompleteRide : 3,
    LeaveReview : 4,
    GoPick : 5,
}

export default AcceptMainView = (
    {ride, fromAddr, toAddr, userName, avatar, currency, priceMin, onTapPickRyder, onTapBeginRide, onTapComplete, onTapReview, onEnterBid, onAccept, isLoading=false}
    )=>{
    
    const animBottom = new Animated.Value(-Constants.WINDOW_HEIGHT);
    let [bottomOfMainContainer, setBottomOfMainContainer ] = useState(animBottom)
    let [isShownMainView , setIsShowMainView] = useState(true)    
    let [upButtonShow , setUpButtonShow] = useState(false)

    let ownerName = ride && ride.owner ? Constants.ucfirst(ride.owner.first_name) + ' ' + Constants.ucfirst(ride.owner.last_name) : userName;
    let rating_avg = (ride && ride.owner &&  ride.owner.rating_avg) || 0

    let ownerAvatar = ride && ride.owner && ride.owner.profile && ride.owner.profile.avatar ? ride.owner.profile.avatar : Constants.DefaultAvatar;
    let timeFrom = ride && ride.time_from ?  moment(ride.time_from, 'YYYY-MM-DD HH:mm:ss', true).format('ddd, MMM Do, HH:mm') :  ''
    let animViewRef = useRef();

    let isBegan = ride && ride.began_at && !ride.completed_at ? true : false;
    let isCompleted = ride && ride.completed_at ? true : false
    
    
    
    useFocusEffect(React.useCallback(()=>{
        setBottomOfMainContainer(animBottom)   
        showMainView()
        return ()=>{}
    }, []))
    
    const showMainView = ()=>{
        
        Animated.parallel([
            Animated.timing(
                // Animate value over time
                bottomOfMainContainer, // The value to drive
                {
                  toValue: 0, // Animate to final value of 1
                  easing: Easing.ease,
                  duration: 500,
                }
            ),
          
        ]).start(()=>{
            setIsShowMainView(true)
            // this.setState({ isShownMainView : true})
        })

    }
    const hideMainView = (callback)=>{
        
        Animated.parallel([
            Animated.timing(
                // Animate value over time
                bottomOfMainContainer, // The value to drive
                {
                  toValue: -Constants.WINDOW_HEIGHT,
                  easing: Easing.ease,
                  duration: 500,
                }
            ),
         
        ]).start(()=>{
            setIsShowMainView(false)
            setUpButtonShow(true)
            if ( callback ){
                callback()
            }
            
            // this.setState({ isShownMainView : false})
        })
    
    }
    
    const toggleMainView = ()=>{
        
        if ( isShownMainView ){
            hideMainView();
        }else {
            showMainView();
        }
    }
    
    const onAcceptRide = ()=>{
        console.log('On Tap Accept Ride in accept main view');
        if( !ride ){
            alert('Oops', 'Ride data is invalid.')
            return 
        }
        if( ride.others_accepted ){
            alert('Accepted', 'Other driver accepted this request already.')
            return ;
        }
        if( ride.isAccepted ){
            alert('Accepted', 'You have accepted this request already.')
            return ;
        }
        
        if( onAccept ){
            onAccept()
        }
    }

    const onPhoneCall = ()=>{
        const tel = ride.owner.phone_number.replace(/-/g, '');
        const url = `tel:${tel}`
        
        Linking.canOpenURL(url)
        .then( (supported) => {
            if (supported) {
                return Linking.openURL(url)
                    .catch((err) => {
                        failed('Oops','Phone call is not supported. ' + JSON.stringify(err))
                    });
            }
        });
        
    }

    const onPressLeftButton = (leftAction)=>{

        if(ride && ride.others_accepted){
            warn('Oops', 'Other driver accepted already.')
            return
        }else if (leftAction == LeftTapAction.GoPick ){
            confirm('Pick Ryder!', 'Are you ready to pick ryder?', ()=>{
                
                if( onTapPickRyder ){
                    onTapPickRyder(ride.id);
                }
            }, ()=>{})
        } else if (leftAction == LeftTapAction.BeginRide){
            // begin ride

            confirm('Begin Ride', 'Are you ready to begin ride? You can only begin ride after you reached customer already.Let\'s satisfy client with great service.', ()=>{
                
                if( onTapBeginRide ){
                    onTapBeginRide(ride.id);
                }
            }, ()=>{})

            return
        }else if (leftAction == LeftTapAction.CompleteRide ){
            confirm('Complete Ride', 'Are you sure to complete ride? Please tap "Yes" to complete and notify customer to get review.', ()=>{
                if( onTapComplete ){
                    onTapComplete(ride.id);
                }
            }, ()=>{})
            return
        }else if(leftAction == LeftTapAction.LeaveReview ){
            if( onTapReview ){
                onTapReview();
            }
            return;
        }else if(leftAction == LeftTapAction.AcceptRide){

            let msg = 'You will accept this ride with customer\'s price. if you want other price , please tap \'Cancel\' and submit bid.'
            if( ride && ride.isBid ){
                msg = 'You will accept this ride with your bid details. if you want to check bid price again , please tap \'Cancel\'.'
            }
    
            global.confirm('Accept  Ride', msg , ()=>{
                onAcceptRide()
            }, ()=>{
                if(onEnterBid) {
                    hideMainView(()=>{
                        onEnterBid();
                    })
                }
            })    
        }

        
    }

    const RenderMessage = ({text})=>{

        return <Text style={{color:Constants.grayColor, fontSize:13,}}>
            {text}
        </Text>
    }

    const RenderButtons = ({ride, onPress})=>{

        if( !ride ){            
            return <RenderMessage text={'Invalid Ride'}/>            
        }else{ 
            if (Constants.isDriver() ){

                if( ride.driver_id != null){
                    if( ride.driver_id != global.curUser.id ){                        
                        return <RenderMessage text={'Other driver accepted this ride already.'}/>
                    }else{
                        
                        if( ride.reviews_to_customer && ride.reviews_to_customer.length> 0 ){ 
                            
                            return <RenderMessage text={'You have left review for customer.'}/>
                        }else{
                            if (ride.went_pick){
                                if( ride.began_at ){
                                    if( ride.completed_at ){
                                        return <TouchableOpacity
                                                    style = {  styles.submitButton}
                                                    onPress={()=>{ onPress(LeftTapAction.LeaveReview);}}>                        
                                                    <Text style = {styles.submitButtonText}>Leave Review</Text>
                                                </TouchableOpacity>
                                    }else{
                                        return <TouchableOpacity
                                                    style = {  styles.submitButton}
                                                    onPress={()=>{ onPress(LeftTapAction.CompleteRide);}}>                        
                                                    <Text style = {  styles.submitButtonText}>Complete</Text>
                                                </TouchableOpacity>  
                                    }
                                }else{
                                    return <TouchableOpacity
                                                style = {  styles.submitButton}
                                                onPress={()=>{ onPress(LeftTapAction.BeginRide);}}>                        
                                                <Text style = { styles.submitButtonText}>Begin Ride!</Text>
                                            </TouchableOpacity> 
                                }
                            }else{
                                return  <TouchableOpacity
                                            style = {  styles.submitButton}
                                            onPress={()=>{ onPress(LeftTapAction.GoPick);}}>                        
                                            <Text style = { styles.submitButtonText}>Pick Ryder!</Text>
                                        </TouchableOpacity> 
                            }
                        }
                    }                    
                }else{
                    return <>
                        <TouchableOpacity
                            style = {  styles.submitButton}
                            onPress={()=>{ onPress(LeftTapAction.AcceptRide);}}>                        
                            <Text style = { styles.submitButtonText}>Accept Ride</Text>
                        </TouchableOpacity>     

                        <RenderRightButton ride={ride}/>
                    </>
                    
                }

            }else{
                // For Customer
                if (ride.reviews_to_driver && ride.reviews_to_driver.length > 0 ){                    
                    return <RenderMessage text={'You have left review for driver. '}/>                    
                }else{
                    if (ride.went_pick){
                        if( ride.began_at ){
                            if(ride.completed_at){
                                return <TouchableOpacity
                                            style = {  styles.submitButton}
                                            onPress={()=>{ onPress(LeftTapAction.LeaveReview);}}>                        
                                            <Text style = { styles.submitButtonText}>Leave Review</Text>
                                        </TouchableOpacity>  
                            }else{                   
                                
                                return <RenderMessage text={'Driver is on way to the destination.'}/>
                            }
                        }else{
                            return <RenderMessage text={'Driver is on way to the origination.'}/>
                        }
                    }else{
                        return <RenderMessage text={'Driver didn\'t leave to pick ryder.'}/>
                    }
                }                
            }            
        }    
    }

    const RenderRightButton = ({rideItem})=>{

        return   <TouchableOpacity style = {styles.submitButton} onPress={()=>{                    
                    if(onEnterBid) {
                        hideMainView(()=>{
                            onEnterBid(); 
                        });                        
                    }
                }}>
                    <Text style = {styles.submitButtonText}> { rideItem && rideItem.isBid ? 'Show My Bid' : 'Enter Bid' }  </Text>
                </TouchableOpacity>
    }


    return <>
    <Animated.View 
        ref={animViewRef}
        style={{
            position:'absolute',
            bottom:bottomOfMainContainer,
            left:0,right:0,
            paddingTop:5,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',           
            width: screenWidth,
        }}
    >
            <DownButton isShow={true} containerStyle={{marginBottom:5,}} onPress={()=>{hideMainView()}}/>
            
            <View style={{
                paddingTop:10,
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',           
                width: screenWidth,
                borderTopLeftRadius: 40,
                borderTopRightRadius: 40,
                backgroundColor: '#6733bb',
            }}>
                
                <View style={styles.mainBody}>
                    <View style={styles.budget}>
                        <View>
                            <Text  style={{color:'#999'}}>#{ride ? ride.slugId : '##'}</Text>
                            <Text style={{color:'black', fontSize:15, fontWeight:'bold' }}>{timeFrom}</Text>
                        </View>
                        <View style={{alignItems:'flex-end'}}>
                            <Text style={{fontSize: 20, color: 'green', fontWeight: 'bold'}}>{currency}{priceMin}</Text>
                            {
                                isBegan ?
                                    <Text style={{fontSize:14, fontWeight:'bold', color: Constants.purpleColor}}>BEGAN</Text>
                                    : null
                            }
                            {
                                isCompleted ?
                                    <Text style={{fontSize:14, fontWeight:'bold', color: Constants.green}}>COMPLETED</Text>
                                    : null
                            }
                        </View>

                    </View>

                    <View style={{flexDirection:'row', width:'100%', paddingLeft:20 }}>                
                        <MaterialIcons name="airline-seat-recline-extra" size={18} style={{ marginRight : 10,}} color="#444" />
                        <Text>{ride ? ride.seats : '--'}</Text>
                        {
                            ride && ride.type ? 
                            <Text style={{marginLeft:10, color:Constants.purpleColor, fontSize:13}}>{ride.type.title}</Text>
                            : null
                        }
                        
                    </View>

                    <View style={styles.inputLocation}>
                        <View style={styles.inputIcon}>
                            <View style={{borderWidth:5, borderRadius:15, width:15, height:15, borderColor:'blue'}}/>
                            <View>
                                <Text>|</Text>
                                <Text>|</Text>
                                <Text>|</Text>
                            </View>
                            <View style={{borderWidth:5, borderRadius:15, width:15, height:15, borderColor:'green'}}/>
                        </View>
                        <View style={styles.inputFromTo}>
                            <Text style={{fontSize: 12, color: '#777'}}>From</Text>
                            <Text>{fromAddr}</Text>
                            
                            <Text style={{fontSize: 12, color: '#777', marginTop: 20}}>To</Text>
                            <Text>{toAddr}</Text>                        
                        
                        </View>
                    </View>
                    <View style={styles.driver}>
                        <TouchableOpacity>
                            <Avatar
                                rounded
                                source={ownerAvatar}
                                size={50}
                            />
                        </TouchableOpacity>
                        <View style={styles.driverInfor}>
                            <Text style={{fontSize: 16, fontWeight:'bold',color: '#555', paddingLeft: 10}}>{ownerName}</Text>
                            <View style={{alignItems: 'flex-start', paddingLeft: 5}}>
                                <AirbnbRating
                                    starStyle={{width: 17, height: 17}}
                                    defaultRating = {rating_avg}
                                    showRating = {false}
                                    isDisabled={true}                                
                                />
                            </View>
                        </View>
                        <TouchableOpacity onPress={onPhoneCall}>
                            <FontAwesome name="phone" size={30} style={{paddingRight:10, paddingLeft: 30, marginTop: 10,}} color="green" />
                        </TouchableOpacity>
                        {/* <TouchableOpacity>
                            <MaterialIcons name="message" size={30} style={{paddingRight:10, marginTop: 10,}} color="blue" />
                        </TouchableOpacity> */}
                    </View>
                </View>
                <View style={styles.buttonView}>
                {
                    isLoading ?
                     <BallIndicator color={Constants.white} size={30}/> 
                     :
                     <RenderButtons  ride={ride} onPress={onPressLeftButton}/>                     
                    
                }
                     
            </View>
            </View>        
        </Animated.View>
        <UpButton isShow={!isShownMainView} onPress={()=>{
            setUpButtonShow(false)
            toggleMainView()
        }}/>

    </>
}

const styles = StyleSheet.create({
    imageCover: {
        flex: 1,
        resizeMode: 'cover'
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
    inputDescription: {
        width: '100%',
        height: 100,
        marginTop: -5,
        marginLeft: -10,
    },
    textInput: {
        color: '#555',
        width: '100%',
        fontSize: 13,
    },
    mainBody:{
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'white',
        // height: '70%',
        width: '85%',
        borderRadius: 30,
        paddingBottom:10,
        marginBottom:5,
    },
    budget:{
        width: '100%',
        flexDirection:'row',
        justifyContent: 'space-between',
        alignItems:'flex-end',
        marginBottom: 10,
        paddingRight: 30,
        paddingLeft:20,
        paddingTop: 5,
    },
    inputLocation:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        // borderColor:'red', borderWidth:2,
        // height: '50%'
    },
    inputIcon:{
        marginTop: 15,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '15%',
        // height: '100%'
    },
    inputFromTo:{
        marginTop: 0,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        width: '80%',
        paddingBottom:5,
        // height: '90%'
    },
    driver:{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems:'center',
        paddingLeft:25,
        width: '100%',
        height: 55,
    },
    driverInfor:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        width: '45%',
        height: '100%',
    },

    buttonView:{
        marginBottom: 10,
        height: 45,
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'row',
    },
    submitButton: {
        backgroundColor: 'white',
        height: 40,
        width: '48%',
        borderRadius: 10,
        justifyContent:'center',
        alignItems: 'center',
        marginHorizontal:10,
    },
    beginButton:{
        backgroundColor: Constants.green,
        height: 40,
        width: '100%',
        borderRadius: 10,
        justifyContent:'center',
        alignItems: 'center',
        marginHorizontal:10,
    },
    submitButtonText:{
        fontSize: 15,
        fontWeight: 'bold',
        color: '#444',
        textAlign: 'center'
    },
    reviewButton:{
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center'
    },
    completeButton:{
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center'
    },
    beginButtonText:{
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center'
    },
})