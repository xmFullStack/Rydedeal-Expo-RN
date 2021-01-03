import React, {Component, useEffect, useState} from 'react'
import {ImageBackground, View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, StyleSheet, Dimensions, TouchableWithoutFeedbackBase } from 'react-native'
import {Input} from 'react-native-elements';
import {FontAwesome, MaterialIcons , AntDesign} from '@expo/vector-icons';
import RNPickerSelect from "react-native-picker-select";
import DatePicker from 'react-native-datepicker';
import Constants, {isIOS} from '../../src/utils/Constants';
import moment from "moment";
import {DownButton} from "./MapAccept";
import { BallIndicator }  from 'react-native-indicators';
import { getInitDateTime } from './PostRide';
import Utils from "../../src/utils/Utils";


let screenHeight = Dimensions.get('window').height;
let screenWidth = Dimensions.get('window').width;

export const RidePostView = ({
    rideId,
    isLoading,
    isShow,
    isUpdate,
    rideTypes,     
    fromLocation, 
    toLocation, 
    onPressTopBar,
    onPressFrom, 
    onPressTo, 
    onPressConfirm , 
    onChangeRideType,
    initDescription ='',     
    initDateTime = null,
    initRideTypeVal = 1, 
    initPrice = null, 
    initSeatCount = 1,
    currency = 'USD',
    onDownTap
})=>{

    let [ dateTime , setDateTime ] = useState(initDateTime)
    let [ seatCount , setSeatCount ] = useState( initSeatCount )
    let [ description , setDescription ] = useState( initDescription)
    let [ rideTypeValue, setRideTypeValue ] = useState( initRideTypeVal )
    let [ price , setPrice ] = useState ( initPrice )
    let [ isScheduled , setIsScheduled ] = useState ( 0 )

    
    const getRydeTypeList= (typeList)=>{
        let types = []
        if ( typeList && typeList.length > 0){
            types = typeList.map(item=>{
                return {label : item.title + ' ('+ item.seats +')', value: item.id , seats: item.seats}
            })
        }    
        return types;
    }
    
    const getMaxSeats = (rideTypeId, typeList)=>{
        let maxSeat = null;
        console.log('ridetypeId:', rideTypeId, ', typeList:', typeList )
        typeList.forEach(item => {
            if( item.value == rideTypeId ){
                maxSeat = item.seats;
            }
        });
        console.log('get maxseat:', maxSeat)
        return maxSeat;
    }
    
    let [ rydeTypes, setRydeTypes ] = useState(getRydeTypeList(rideTypes))
    console.log('initdatetime in view:', initDateTime);

    useEffect(()=>{
        setDateTime(initDateTime)
        setSeatCount(initSeatCount)
        setDescription(initDescription)
        // setRideTypeValue(initRideTypeVal)
    }, [initDescription, initDateTime, initSeatCount])

    useEffect(()=>{
        console.log('Trigger fpr updated init price:', initPrice)
        setPrice(initPrice)
    }, [ initPrice])

    useEffect(()=>{
        if( dateTime ) {
            let newDateTime = dateTime;
            if( isScheduled == 1 ){
                let diff = Utils.CheckTimeDiff(dateTime , getInitDateTime(55), 'minutes');
                if( diff > 0 ){
                    newDateTime = getInitDateTime(55);
                    setDateTime( newDateTime );
                }
            }else{
                newDateTime = getInitDateTime(30);
                setDateTime(newDateTime);
            }

            console.log('New Datetime in useeffect isScheduled: ', newDateTime)
        }

    }, [ isScheduled ])

    useEffect(()=>{

        setRideTypeValue(initRideTypeVal)        
        
        let pickerList = getRydeTypeList(rideTypes)        
        setRydeTypes(pickerList)
        

    }, [initRideTypeVal, rideTypes])

    useEffect(()=>{
        let newSeats = getValidSeats(seatCount)

        if( parseInt(seatCount) != newSeats ){
            setSeatCount(newSeats)
        }

        if( onChangeRideType ){
            onChangeRideType(rideTypeValue)
        }

    }, [ rideTypeValue ])
        
    const getValidSeats = (seats)=>{
        let maxSeats = getMaxSeats(rideTypeValue, rydeTypes)
        console.log('max seats:', maxSeats, ' new seats : ', seats)
        
        let res = 1
        try{
            res = parseInt(seats);     
            // if( isNaN(res) ){
            //     res = 1;
            // }
        }catch(e){
            // res = 1;
        }
          
        
        if ( res > maxSeats ){            
            res = maxSeats;
            console.log('Changed seats cuz bigger than max:', res)
        }
        if ( res <= 0 ){
            res = 1;
            console.log('Changed seats cuz less than 0:', res)
        }
        console.log('get valid seats:', res);
        return res
    }
    // }, [ seatCount ])
    

    const onPostRidePress = ()=>{
        if( onPressConfirm ){

            let fromDateTime = dateTime;
            if(isScheduled == 1){
                fromDateTime = initDateTime
            }

            let timeFromString = dateTime
            if( typeof(fromDateTime) == 'object' ){
                timeFromString = Constants.getDateStr(fromDateTime) + ' ' + Constants.getTimeStr(fromDateTime)
            }else if(typeof(fromDateTime) == 'string'){
                timeFromString = moment(fromDateTime).format('YYYY-MM-DD HH:mm:00')
            }

            onPressConfirm( {
                dateTime : timeFromString,
                seatCount : seatCount, 
                description : description,
                from : fromLocation,
                to : toLocation,
                rideType : rideTypeValue,
                price : price,
                currency : currency,
                isScheduled: isScheduled,
             } )
        }
    }

    if( !isShow ){
        return null
    }
    console.log('From Locatino in sub post view:', fromLocation)
    console.log('To Locatino in sub post view:', toLocation)
    let toAddr = toLocation != null ? toLocation.name : ''
    let fromAddr  = fromLocation != null ? fromLocation.name : ''

    const getShortAddr = (addr)=>{
        if( !addr ){
            return ''
        }
        if ( addr.length > 30 ){
            return addr.substr(0,30) + ' ...'
        }
        return addr
    }

    toAddr = getShortAddr(toAddr)
    fromAddr = getShortAddr(fromAddr)

    console.log('From Locatino in sub post view:', fromLocation, 'addr', fromAddr)
    console.log('To Locatino in sub post view:', toLocation, ' toAddr', toAddr)

    let now = Constants.getDateStr(new Date()) + ' ' + Constants.getTimeStr(new Date());
    let minDate = moment(now, 'YYYY-MM-DD HH:mm:ss').add(30, 'minutes').format('YYYY-MM-DD HH:mm');
    let maxDate = moment(now, 'YYYY-MM-DD HH:mm:ss').add(14, 'days').format('YYYY-MM-DD HH:mm');

    return <>
    <View style={styles.mainContainer}>
        <TouchableOpacity 
            style={{
                width:'100%', 
                height:35,
                alignItems:'center', 
                justifyContent:'center',   
                marginTop:10,                                              
                marginBottom:10,
            }}
            onPress={onPressTopBar}
        >
        
            <View 
                style={{
                    backgroundColor:'#fff9',
                    height:5,
                    width:'50%',
                    borderRadius:5,                                    
                    marginTop:5,
                    marginBottom:15 
                }}/>
            <Text 
                style={{
                    fontWeight:'bold', 
                    fontSize: 16, 
                    color:'white', 
                    paddingBottom: 10,                
                }}>
                WHERE ARE YOU TRAVELLING TODAY?
            </Text>
        </TouchableOpacity>
      
        <View style={styles.topBody}>
            
            
            <View style={{ height: 45, marginBottom:8,width:'48%',  alignItems:'flex-start', justifyContent:'center'}}>
                
                <RNPickerSelect
                    placeholder={{
                        label: 'Ride Type',
                        value: null,
                    }}
                    value={rideTypeValue}
                    onValueChange={(value) => setRideTypeValue( value )}
                    useNativeAndroidPickerStyle={false}
                    style={{...pickerSelectStyles}}
                    items={rydeTypes}
                    Icon={() => {
                        return (
                            <View
                                style={pickerSelectStyles.icon}
                            />
                            );
                        }}
                />
                
            </View>
            <View style={{ height: '100%', width:'49%', alignItems:'flex-start'}}>
                <View style={{ height: '100%',width:'100%' }}>
                    <Input
                        containerStyle={styles.inputHolder}
                        inputStyle={styles.textInput}
                        inputContainerStyle={{borderBottomWidth:0}}
                        placeholderTextColor='darkgrey'
                        placeholder='Seats'
                        overflow="hidden"
                        value={ seatCount ? seatCount.toString() : 1}
                        onChangeText={(val)=>{ setSeatCount( getValidSeats(val) )}}
                        leftIcon={ <MaterialIcons name="airline-seat-recline-extra" size={18} style={{marginLeft: -15, marginRight : 10,}} color="#444" /> }
                    />
                </View>
                {
                    isScheduled == 1 ?
                        <DatePicker
                            style={{width: 200, backgroundColor: 'white', borderRadius: 10}}
                            date={dateTime}
                            mode="datetime"
                            androidMode ='spinner'
                            placeholder="Date & Time"
                            format="YYYY-MM-DD HH:mm"
                            minDate={minDate}
                            maxDate={maxDate}
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            customStyles={{
                                dateIcon: {
                                    position: 'absolute',
                                    left: 0,
                                    top: 4,
                                    marginLeft: 0
                                },
                                dateInput: {
                                    backgroundColor: 'white',
                                    borderRadius: 10,
                                    marginLeft: 0,
                                    borderWidth: 0
                                }
                            }}
                            onDateChange={(date) => {
                                console.log('date change in picker:', date)
                                if( typeof (date) == 'string'){
                                    let mObj = moment(date, 'YYYY-MM-DD HH-mm');
                                    let y = parseInt(mObj.format('YYYY')) ;
                                    let m = parseInt(mObj.format('MM')) - 1;
                                    let d = parseInt(mObj.format('DD'));
                                    let H = parseInt(mObj.format('HH'));
                                    let i = parseInt(mObj.format('mm'));
                                    let dateObj = new Date(y,m,d, H, i);
                                    setDateTime( dateObj )
                                }else{
                                    setDateTime( date )
                                }

                            }}
                        /> : null
                        // <View style={{height:'100%', justifyContent:'center'}}>
                        //         <Text style={{color:'white', fontSize:15}}> { Constants.getDateTimeStr( dateTime )} </Text>
                        //     </View>
                }

            </View>

        </View>
        
        <View style={styles.mainBody}>

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

                    <TouchableOpacity
                        onPress={()=>onPressFrom()}
                        style={{ width:'100%',  borderColor:Constants.purpleColor, borderBottomWidth:1 }}
                    >
                        <Text
                            style={{ paddingTop: 5,}}
                        >
                            {fromAddr} 
                        </Text>
                  
                    </TouchableOpacity>
                    <Text style={{fontSize: 12, color: '#777', marginTop: 10}}>To</Text>
                    
                    <TouchableOpacity
                        onPress={()=>onPressTo()}
                        style={{ width:'100%',  borderColor:Constants.purpleColor, borderBottomWidth:1, }}
                    >
                    <Text style={{paddingTop: 5}}>
                        {toAddr}
                    </Text>
                   
                    </TouchableOpacity>

                </View>

        
        </View>
        <View style={{width:'85%', height:20, justifyContent:'flex-start',  }}>
            <Text style={{color:Constants.white, fontSize:15}}> Price must be higher than {currency}{initPrice}</Text>
        </View>  
        <View style={styles.topBody}>
            
            
            <View style={{width: '100%', height: '100%', flexDirection:'row', }}>
                <View style={{flex:1}}>
                    <Input
                        containerStyle={styles.inputHolder}
                        inputStyle={styles.textInputCenter}
                        inputContainerStyle={{borderBottomWidth:0}}
                        placeholderTextColor='darkgrey'
                        placeholder='Price'
                        overflow="hidden"
                        value={price.toString()}
                        onChangeText={val=>setPrice( val )}
                        // leftIcon={ <FontAwesome name="dollar" size={18} style={{marginLeft: -15,}} color="#444" /> }
                        leftIcon={ <Text style={{fontSize:18, fontWeight:'bold', color:Constants.purpleColor, marginLeft : -15, marginRight : 10}}>{currency}</Text> }
                    />
                </View>                
                          
            </View>
            
        </View>
        
        <View style={styles.description}>
            <Input
                containerStyle={styles.inputHolder}
                inputStyle={styles.textInputCenter}
                inputContainerStyle={{borderBottomWidth:0, borderRadius:2, borderColor:'red', width:'100%', }}
                placeholderTextColor='darkgrey'
                placeholder='Description'
                overflow="hidden"
                multiline={true}
                value={description}
                onChangeText={val=>{setDescription( val )}}
            />
        </View>

        {
            isUpdate ? <View style={{width:'85%', }}>
                <Text style={{ color:Constants.backWhite, fontSize:12}}>
                    #{rideId}
                </Text>
            </View> : null
        }

        
        <View style={{
            paddingBottom:10,
            paddingTop:5,
            width:'100%',
            paddingHorizontal:10,
            marginBottom:10,
            justifyContent: 'center',
            alignItems: 'center'}}>
            {
                isLoading ? <View style={{height:50, marginVertical:5}}><BallIndicator color={Constants.white} size={45}/></View>:
                <TouchableOpacity style = {{
                    backgroundColor: 'white',
                    height: 40,
                    width:'35%',
                    paddingHorizontal:10,
                    borderRadius: 10,
                    justifyContent:'center',
                    alignItems: 'center'}} onPress={onPostRidePress}>
                    <Text style = {styles.submitButtonText}>
                        { isUpdate ? 'Update' : 'Post a Ride'}
                    </Text>
                </TouchableOpacity>
            }
            
            <DownButton isShow={true} onPress={()=> onDownTap() } containerStyle={{position:'absolute', top:5, right:20,}}/>
        </View>

    </View>
                   
    </>
}


export default function PostRideInfo({}){


    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;
    return (
        <ImageBackground  source={require('../../assets/map.jpg')} blurRadius={0} style = {styles.imageCover}>
            <KeyboardAvoidingView
                style={{ flex: 1}}
                keyboardVerticalOffset = {keyboardVerticalOffset}
                behavior="padding" enabled>
                <ScrollView keyboardShouldPersistTaps="always">
                    
                    <RidePostView />
                    
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    )
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
    mainContainer: {
        marginTop: 0,
        paddingBottom:20,
        flexDirection: 'column',
        alignItems: 'center',
        // height: screenHeight*0.55,
        width: screenWidth,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        backgroundColor: '#6733bb',
    },
    input: {
        width: '100%',
        height: 30,
        marginTop: -5,
        marginLeft: -10,
    },
    textInput: {
        color: '#555',
        width: '100%',
        fontSize: 20,
    },
    textInputCenter: {
        color: '#555',
        width: '100%',
        fontSize: 15,
        textAlign: 'left',

    },
    mainBody:{
        marginTop: 0,
        marginBottom:5,
        padding:10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 150,
        width: '85%',
        borderRadius: 15,
    },
    inputIcon:{
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: 30,
    },
    inputFromTo:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '85%',
    },
    topBody:{
        marginTop: 5,
        marginBottom:0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '85%',
        height: 50,
    },
    buttonView:{
        // marginTop: -20,
        paddingBottom:10,
        paddingTop:5,
        // height: '20%',

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
        color: 'black',
        textAlign: 'center'
    },
    inputHolder: {
        // height: 40,
        backgroundColor:'white',
        borderRadius: 10,
        width: '100%',
    },
    reviewText:{
        height: '75%',
        width: '100%',
        color: '#555',
        textAlign: 'center',
        fontSize: 16,
    },
    description:{
        marginTop: 0,
        marginBottom:5,
        width: '85%',
        height: 80,
        backgroundColor: 'white',
        alignItems: 'flex-start',
        borderRadius: 10,
    }

});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        textAlign: 'center',
        width: '100%',
        height: 40,
        fontSize: 17,
        borderColor: 'transparent',
        borderRadius: 10,
        backgroundColor: 'white',
        color: 'black',
        paddingRight: 10, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        textAlign: 'center',
        width: Constants.WINDOW_WIDTH * 0.40,
        height: 40,
        fontSize: 17,
        borderColor: '#555',
        borderRadius: 10,
        backgroundColor: 'white',
        color: 'black',
        paddingRight: 10, // to ensure the text is never behind the icon
    },
    icon: {
        position: 'absolute',
        backgroundColor: 'transparent',
        borderTopWidth: 7,
        borderTopColor: '#00000099',
        borderRightWidth: 5,
        borderRightColor: 'transparent',
        borderLeftWidth: 5,
        borderLeftColor: 'transparent',
        width: 0,
        height: 0,
        top: 17,
        right: isIOS() ? 15 : 15,
    },
});