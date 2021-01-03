import React, {Component, useEffect, useState} from 'react'
import { 
    View, 
    Text, 
    TouchableOpacity, 
    KeyboardAvoidingView,     
    SectionList, 
    ScrollView, 
    StyleSheet, 
    Dimensions, 
    Alert
} from 'react-native'
import { Input, Icon } from 'react-native-elements';
import { Avatar } from "react-native-elements";
import {FontAwesome, MaterialCommunityIcons, Ionicons, Entypo} from "@expo/vector-icons";
import HeaderBar from '../../src/components/HeaderBar';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';

import { EmptyHolder } from '../customer/RideDetail'
import Constants, { StatusBarHeight } from '../../src/utils/Constants';
import RestAPI from '../../src/utils/RestAPI';
import RNPickerSelect from "react-native-picker-select";
import moment from 'moment';
import { SafeAreaView } from 'react-native-safe-area-context';
import {ResErrCodes} from "../../src/utils/DefaultCodes";
import { showMessage, hideMessage } from "react-native-flash-message";
import {PushMessageType} from "../../src/navigation/AppContainer";
import ZStatusBar from '../../src/components/ZStatusBar';
import { BallIndicator } from 'react-native-indicators';

let windowHeight = Dimensions.get('screen').height;
let windowWidth = Dimensions.get('screen').width;

export const ItemBrowseRide = ({item, onPress}) => {
    
    let profile = item.owner ? item.owner.profile : null;
    let name = item.owner ? Constants.ucfirst(item.owner.first_name )+ ' ' + Constants.ucfirst(item.owner.last_name) : 'Unknown';
    
    let avatar = profile && profile.avatar ? {uri: profile.avatar} : require('../../assets/avatar2.jpg')
    
    // let unit = 'K';
    // let distUnit =  Constants.curUserCityUnit ();
    // if( distUnit == 'mi'){
    //     unit = 'M'
    // }
    let distUnit = item.distance_unit
    let fromLocation = !item ? null : {
        latitude : item.location_from.coordinates[1], longitude: item.location_from.coordinates[0],
        lat : item.location_from.coordinates[1], lng: item.location_from.coordinates[0]
    };

    let toLocation = !item ? null : {
        latitude : item.location_to.coordinates[1], longitude: item.location_to.coordinates[0],
        lat : item.location_to.coordinates[1], lng: item.location_to.coordinates[0]
    };

    // let distance = Constants.distance(fromLocation.lat, fromLocation.lng, toLocation.lat, toLocation.lng, unit)
    let distance = '--'
    if( global.curLocation ){
        distance = Constants.distance(fromLocation.lat, fromLocation.lng, global.curLocation.lat, global.curLocation.lng, distUnit)
    }
    
    // let distance = item.distance
    
    let timeCreatedAt = moment(item.time_from, 'YYYY-MM-DD HH:mm:ss', true).format('HH:mm,  D MMM YYYY')
    
    
    return (
        <TouchableOpacity
            style={{
                width:Constants.WINDOW_WIDTH * 0.9
            }}
            onPress={()=>{
                if( onPress ){
                    onPress();
                }
            }}>
            <View style={styles.itemBody}>
                <View style={styles.itemAvatar}>
                    <Avatar
                        rounded
                        source={avatar}
                        size={60}
                    />
                </View>
                <View style={styles.itemInfor}>
                    <Text style={styles.itemName}>{name}</Text>
                    <Text style={styles.itemDate}>{timeCreatedAt}</Text>
                    <Text style={styles.itemDate} numberOfLines={1}><Entypo name={"location-pin"} size={16} color={Constants.purpleColor}/>{item.address_from}</Text>
                    <Text style={styles.itemDate} numberOfLines={1}><Entypo name={"location-pin"} size={16} color={Constants.green}/>{item.address_to}</Text>
                </View> 
                <View style={ !item.isBid ? styles.itemMeter : styles.itemMeterIsBidded}>
                    <Text style={styles.itemMeterInfor1}>{distance}{distUnit}</Text>
                    <Text style={styles.itemMeterInfor1}>{parseFloat(item.duration).toFixed(0)}mins</Text>
                    {/* <Text style={styles.itemMeterInfor2}>Away</Text>                  */}
                </View>
                <View
                    style={{position:'absolute', top:5, right:10,alignItems:'flex-end'}}>
                    <Text style={{color:'#999', fontSize:12}}>#{item.slugId}</Text>
                    <Text style={{color:Constants.purpleColor, fontWeight:'bold', fontSize:12}}>{item.type.title}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default function BrowseRide({}){
    
    const navigation = useNavigation();
    const route = useRoute();
    
    let [rideList, setRideList] = useState([])
    let [isLoading , setIsLoading] = useState(false)
    let [curPage, setCurPage] = useState(1)
    let [lastPage, setLastPage] = useState(1)
    let [total, setTotal] = useState(0)
    let [selCityId , setSelCityId] = useState(global.curUser && global.curUser.cities.length >= 0 ? global.curUser.cities[0].id : 0)
    let [cityList, setCityList] = useState([])
    
    useFocusEffect( React.useCallback(()=>{
        getCityList().then(res=>{
        }).catch(err=>{        
        });
        
        global.currentScreen = 'driver_ride_browse'
        return ()=>{}
    }, []))

    useEffect(()=>{
        loadData()
    }, [curPage, selCityId])

    
    const getCityList = ()=>{
        
        return new Promise((resolve, reject)=>{
            RestAPI.getPostBasicData().then(res=>{
                if( res.success == 1){
                    let list = res.data.city_list.map(item=>{
                        return {label: item.name, value: item.id}
                    })
                    setCityList(list)
                    resolve(cityList)
                }else{
                    failed('Oops', res.msg)
                    setCityList(null)
                    reject(res.msg)
                }
            }).catch(err=>{
                console.log(err)
                failed('Oops', 'Failed to get city list. please try again.')
                reject('Some errors are occured. Please try again.')
            }).finally(()=>{})
        })
        
    }
    
    const loadData = ()=>{
        if( !global.curUser || !global.curUser.cities || global.curUser.cities.length <= 0 ){
            warn('Oops', 'Your profile does not contain city field, please update your profile with correct city.')
            navigation.navigate("user_detail")            
            return 
        }
        if( isLoading ){
            return;
        }

        setIsLoading(true)
        // showPageLoader(true)
        RestAPI.getRideList(curPage , 0, global.curLocation.lat, global.curLocation.lng, selCityId).then(res=>{
            
            if(res.success == 1){
                let list = res.data.data
                setLastPage( res.data.last_page)
                setTotal( res.data.total)
                setCurPage(res.data.current_page)
                
                if( rideList.length > 0 && curPage > 1 ){
                    list = [...rideList[0].data, ...list]
                }
                console.log('length of browse rides.',list.length, list)
                setRideList([{title:'Rides', key:0, data: list}])
            }else{

                if( res.err_code == ResErrCodes.EXIST_ACCEPTED_RIDES ){

                    alert('Accepted Ride Exist', res.msg)
                    let item = res.data[0]
                    navigation.navigate('map_accept', {item:item});
                    // navigation.navigate('driver_manage');
                    
                }else{
                    failed('Oops', res.msg )
                }

            }
        }).catch(err=>{
            console.log(err);
            failed('Oops', 'Somethings wrong. please try again after a moment. ')
        }).finally(()=>{
            setIsLoading(false)
            // showPageLoader(false)
        })
    }

    // useEffect(()=>{
    //     loadData()
    // }, [selCityId])

    const onchangeCity=(value)=>{
        setSelCityId(value)
        setCurPage(1)
        console.log('new city Id ' + value)
        // loadData()
    }
    
    const onItemPress = (item)=>{
        navigation.navigate('map_accept', {item: item})
    }

    return (
        <>
        {/* <ZStatusBar/> */}
        <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
        <SafeAreaView style={{flex:1}}>
            <View style = {styles.container}>
                
                <View
                    style={{
                        width:'90%',   
                        height: 45,                          
                        borderBottomColor:'#999',
                        borderBottomWidth:1,
                        flexDirection:'row',                                        
                        alignItems:'center',
                        paddingLeft:6,
                    }}
                >
                        <MaterialCommunityIcons  name="city" size={20} color={'#444'}/>
                        <RNPickerSelect
                            placeholder={{
                                label: 'Select City',
                                value: null,
                            }}
                            onValueChange={(value) => onchangeCity(value) }
                            useNativeAndroidPickerStyle={false}
                            style={{...pickerSelectStyles}}
                            items={cityList}
                            value={selCityId}
                            Icon={() => {
                                return (
                                    <View
                                        style={pickerSelectStyles.icon}
                                    />
                                );
                            }}
                        />
                    </View>

            <View style={styles.mainContainer}>
                <EmptyHolder
                    // isLoading={isLoading}
                    placeholder="Nothing to show" 
                    isShow={rideList.length <= 0 || rideList[0].data.length<= 0 }
                    onPressRefresh={loadData}
                />
                <SectionList                    
                    contentContainerStyle={{paddingBottom:StatusBarHeight}}
                    renderSectionHeader={({ section: { title } }) => { }}
                    renderItem={({ item, index, section }) => <ItemBrowseRide item={item} onPress={()=>onItemPress(item)}/> }
                    sections={rideList}
                    keyExtractor={(item, index) => index + '-' + item.id}
                    onRefresh={() => {
                        if( curPage == 1){
                            loadData();
                        }else{
                            setCurPage(1)
                        }
                        
                    }}
                    refreshing={false}
                    onEndReachedThreshold={0.5}
                    onEndReached={(offset) => {
                        if( curPage < lastPage ){
                            console.log(curPage, '<', lastPage)
                            setCurPage(curPage + 1)
                        }
                    }}
                />                             
            </View>

            <HeaderBar 
                title="Browse Rides" 
                rightIcon={isLoading ? <BallIndicator color={Constants.purpleColor} size={20}/> : null}
                onLeftButton = {()=>{navigation.toggleDrawer();}}
                onRightButton={()=>{ navigation.navigate('user_detail') }}
            />
        </View>
        </SafeAreaView>
        </>
    )
}


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        paddingTop:65,
        height: windowHeight,
        width: windowWidth,
    },
    mainContainer: {
        flex:1,
        width: windowWidth,
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        alignItems: 'center',
    },
    itemBody:{
        marginTop: 10,
        height: 90,
        paddingHorizontal:5,
        // width: Constants.WINDOW_WIDTH*0.85,
        width:'100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 0.7,
        borderColor: '#ddd'
    },
    itemAvatar:{
        height: '100%',
        width: 60,
        marginHorizontal:5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemInfor:{
        height: '100%',
        paddingVertical:10,
        width: '50%',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
    },
    itemMeter:{
        position:'absolute',
        bottom:0,
        right:0,
        // marginTop: 40,
        height:'50%',
        
        paddingHorizontal:15,
        backgroundColor: '#6733bb',
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemMeterIsBidded:{
        position:'absolute',
        bottom:0,
        right:0,
        // marginTop: 40,
        height:'50%',
        
        paddingHorizontal:15,
        backgroundColor: Constants.green,
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemName:{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom:5,
    },
    itemDate:{
        fontSize: 12,
        marginVertical:5,

    },
    itemMeterInfor1:{
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white'
    },
    itemMeterInfor2:{
        fontSize: 10,
        color: 'white'
    },
    locationInput:{
        flexDirection: 'row',
        justifyContent: 'center',
        width: windowWidth * 0.9,
        height: 55,
    },

    input: {
        width: '80%',
    },
    textInput: {
        fontSize: 14,
        color: '#555',
        width: '100%',
    },
})


const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        marginLeft:18,        
        textAlign: 'left',
        width: Constants.WINDOW_WIDTH * 0.9-40,
        height: 40,
        fontSize: 17,
        borderColor: 'transparent',
        borderRadius: 10,
        backgroundColor: 'transparent',
        color: 'black',
        paddingRight: 10, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        marginLeft:18,        
        textAlign: 'left',
        
        width: Constants.WINDOW_WIDTH * 0.9-40,
        height: 40,
        fontSize: 17,
        borderColor: '#555',
        borderRadius: 10,
        backgroundColor: 'transparent',
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
        right: 15,
    },
});
