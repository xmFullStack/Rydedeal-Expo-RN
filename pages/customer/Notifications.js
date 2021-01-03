import React, { Component, useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, SectionList, ScrollView, StyleSheet, Dimensions, Alert } from 'react-native'

import { NavigationContext, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'

import HeaderBar from '../../src/components/HeaderBar';

import RestAPI from '../../src/utils/RestAPI';
import Constants from '../../src/utils/Constants';
import { EmptyHolder } from './RideDetail'
import moment from 'moment';
import { MaterialIcons, AntDesign, FontAwesome, MaterialCommunityIcons , Foundation} from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';

import { SafeAreaView } from 'react-native-safe-area-context';

import { BarIndicator, DotIndicator, BallIndicator } from 'react-native-indicators';
import ZStatusBar from '../../src/components/ZStatusBar';

let windowHeight = Dimensions.get('screen').height;
let windowWidth = Dimensions.get('screen').width;



export const ItemNotification = ({item, index, section}) => {
    
    const navigation = useNavigation();
    const route = useRoute();
    
    console.log('******************* notify item **********************', item)
    let itemData = item.item;
    let notificationId = itemData.id;
    let notifyData = itemData.data;

    if( !notifyData ){
        console.log('notifydata is empty,' , notifyData)
        return <Text> {JSON.stringify(item)} </Text>
        // return null
    }

    let ride = notifyData.ride;
    let bid = notifyData.bid;
    let title = notifyData.title;
    let driver = notifyData.driver;
    let customer = notifyData.customer;

    
    const onPressNotifcation = ()=>{
         if(bid){
            if( Constants.isDriver()){
                
                navigation.navigate('noti_driver_manage_detail', {item: bid.ride_id,})
            }else{
                
                navigation.navigate('ride_detail', {item_id: bid.ride_id});
            }
        }else if( ride ){
            if( Constants.isDriver()){
                
                navigation.navigate('noti_driver_manage_detail', {item: ride,})
            }else{
                
                navigation.navigate('ride_detail', {item_id: ride.id});
            }
        }
    }
    
    let pre  = "App\\Notifications\\"
    let notifyType = itemData.type.substr(pre.length)
    
    let slugid = notificationId.substr(-6).toUpperCase();
    let subTitle = '';
    
    let humanTime = itemData.human_time;
    
    let driverName = driver ? Constants.ucfirst(driver.first_name) + ' ' + Constants.ucfirst(driver.last_name) : 'Unknown';
    let rideSlugId = ride ? '#'+moment(ride.created_at, 'YYYY-MM-DD HH:mm:ss', true).format('YYYYMMDD') + ride.id : '';

    let icon = <MaterialIcons name="notifications-active" size={25} color={Constants.backWhite}/>
    let color = Constants.purpleColor;

    switch(notifyType){
        case "NewAcceptedDriver":
            icon = <FontAwesome name="drivers-license-o" size={25} color={Constants.backWhite}/>
            color = Constants.green
            if( !driver ){
                subTitle = 'Unknown Driver...';
            }else{
                subTitle =  driverName + '\nTel:' + driver.phone_number;
            }            
            
            break;  
        case "NewAppliedDriver":
            icon = <FontAwesome name="drivers-license-o" size={25} color={Constants.backWhite}/>
            color = Constants.blueColor
            if( !driver ){
                subTitle = 'Unknown Driver...';
            }else{
                subTitle =  driverName + ' \nTel:' + driver.phone_number;
            }   
            break;  
            
        case "RideAlerts":
            icon = <AntDesign name="car" size={25} color={Constants.backWhite}/>
            
            if( ride ){
                let from = moment(ride.time_from, 'YYYY-MM-DD HH:mm:ss', true).format('MMM Do, YYYY') 
                subTitle= 'At ' + from
            }else{                
                subTitle="Invalid ride. Ignore this."   
            }
            break;
        case "RideCancelled":
            color = Constants.redColor
            icon = <MaterialCommunityIcons name="cancel" size={25} color={Constants.backWhite}/>
            if( ride ){
                subTitle= rideSlugId 
            }else{                
                subTitle="Invalid ride. Ignore this."   
            }
            break;
        case "DriverApproved":
            color = Constants.green
            icon = <AntDesign name="checkcircleo" size={25} color={Constants.backWhite}/>
            break;
        case "DriverUnapproved":
            color = Constants.redColor
            icon = <FontAwesome name="drivers-license" size={25} color={Constants.backWhite}/>
            break;
        case "NewUserRegistered":
            
            break;
        case "RideAccepted":
            icon = <AntDesign name="car" size={25} color={Constants.backWhite}/>
            color = Constants.green
            if( ride ){
                let from = moment(ride.time_from, 'YYYY-MM-DD HH:mm:ss', true).format('MMM Do, YYYY') 
                subTitle= 'At ' + from
            }else{                
                subTitle="Invalid ride. Ignore this."   
            }
            break;
        case "VerifyApiEmail":
                        
            break;
        case "UpdateBid":

            color = Constants.purpleColor

            if( bid && driver ){
                subTitle= Constants.ucfirst(driver.first_name ) + ' ' + Constants.ucfirst(driver.last_name) + '\nTel:' + driver.phone_number
            }else{
                subTitle="Invalid bid or driver data. Ignore this."
            }
            break;
        case "DriverCancelledBid":

            // icon = <AntDesign name="car" size={25} color={Constants.backWhite}/>
            color = Constants.googleColor

            if( bid && driver ){
                subTitle= Constants.ucfirst(driver.first_name ) + ' ' + Constants.ucfirst(driver.last_name) + '\nTel:' + driver.phone_number
            }else{
                subTitle="Invalid bid or driver data. Ignore this."
            }
            break;
        case 'CustomerCancelledBid':
            color = Constants.googleColor

            if( customer ){
                subTitle= Constants.ucfirst(customer.first_name ) + ' ' + Constants.ucfirst(customer.last_name) + '\nTel:' + customer.phone_number
            }else{
                subTitle="Invalid customer data. Ignore this."
            }
            break;
        case 'UpdateRide':
            color = Constants.blueColor

            if( ride && customer ){
                subTitle= Constants.ucfirst(customer.first_name ) + ' ' + Constants.ucfirst(customer.last_name) + '\nTel:' + customer.phone_number
            }else{
                subTitle="Invalid ride or customer data. Ignore this."
            }
            break;
        case "CompleteRide":

            color = Constants.green
            icon = <Foundation name={'marker'} size={25} color={'white'}/>
            if( ride ){
                if( Constants.isDriver() && customer){
                    subTitle= Constants.ucfirst(customer.first_name ) + ' ' + Constants.ucfirst(customer.last_name) + '\nTel:' + customer.phone_number
                }else if ( Constants.isCustomer() && driver ){
                    subTitle= Constants.ucfirst(driver.first_name ) + ' ' + Constants.ucfirst(driver.last_name) + '\nTel:' + driver.phone_number
                }

            }else{
                subTitle="Invalid bid or driver data. Ignore this."
            }
            break;
        case "LeftReview":
            icon = <FontAwesome name="star" size={25} color={Constants.backWhite}/>
            let review = notifyData.review;
            ride = review.ride;

            color = Constants.yellow
            title += ' ' + review.rating + ' Stars';
            if( ride ){
                subTitle= Constants.shortString(review.comments, 20)
            }else{
                subTitle="Review is invalid with removed ride. Ignore this."
            }
            break;
        case "RideBegan":

            color = Constants.purpleColor;
            icon = <Foundation name={'marker'} size={25} color={'white'}/>
            if( ride ){
                try{
                    let beganAt = (ride.began_at.date.split('.'))[0]
                    subTitle = moment( beganAt, 'YYYY-MM-DD HH:mm:ss', true).format('ddd, MMM Do, HH:mm')
                }catch(ex){
                    console.log(ex.message())

                    subTitle = ' Invalide Date.'
                }

                // subTitle = 'At ' + moment(ride.began_at, 'YYYY-MM-DD HH:mm:ss', true).format('ddd, MMM Do, HH:mm')
            }else{
                subTitle="Invalid ride or driver data. Ignore this."
            }
            break;
        case "PaidTrial":
            title = 'Trial Plan Purchased';
            icon = <MaterialIcons name="schedule" size={25} color={Constants.backWhite}/>
            subTitle = notifyData.title;
            color = Constants.yellow

            break;
        case "PaidMonthly":
            title = 'Monthly Plan Purchased';
            icon = <MaterialIcons name="schedule" size={25} color={Constants.backWhite}/>
            subTitle = notifyData.title;
            color = Constants.green

            break;
        // case "RideBegan":
        //     icon = <FontAwesome name="star" size={25} color={Constants.backWhite}/>
        //     let review = notifyData.review;
        //     ride = review.ride;
        //0
        //     color = Constants.yellow
        //     title += ' ' + review.rating + ' Stars';
        //     if( ride ){
        //         subTitle= Constants.shortString(review.comments, 20)
        //     }else{
        //         subTitle="Review is invalid with removed ride. Ignore this."
        //     }
        //     break;
        default:
            console.log('Not working notifyType', notifyType)
            console.log('notify data ', itemData)
            return <Text>New: {JSON.stringify(itemData)}  TYPE: {notifyType}</Text>
            // return null;
            
    }
    
    return (
        // <TouchableOpacity>
            <TouchableOpacity style={styles.itemBody} onPress={onPressNotifcation}>
               <View style={{flexDirection:'row'}}>
                    <View style={{width:50, height:50, marginRight:10, borderRadius:25, backgroundColor:color, justifyContent:'center', alignItems:'center'}}>
                        {icon}
                    </View>
                    <View style={{height:'100%', }}>
                        <Text style={{fontSize:15}}>{title}</Text>
                        <Text style={{fontSize:12, color:'#888', marginTop:10,}}>{subTitle}</Text>
                    </View> 
               </View>
               <View style={{alignItems:'flex-end', justifyContent:'space-between', height:'100%', position:'absolute', top:8, bottom:8, right:10 }}>
                    <Text style={{fontSize:11}}>{rideSlugId}</Text>
                    <Text style={{fontSize:11, color:'#888'}}>{humanTime}</Text>
               </View>
            </TouchableOpacity>
        // </TouchableOpacity>
    )
}
export default Notifications = ({})=>{
    const navigation = useNavigation();
    const route = useRoute();

    let [ isLoading, setIsLoading ] = useState( false )
    let [ data, setData ] = useState([])
    let [ curPage, setCurPage ] = useState(1)
    let [ lastPage, setLastPage ] = useState(1)
    
    
    let [ notifyList, setNotifyList ] = useState()
    
    useFocusEffect( React.useCallback(()=>{
        global.currentScreen = 'Notifications'
        setCurPage(1)
    }, []))
    
    React.useEffect(()=>{
        loadData();
    }, [ curPage ])

    const loadData = ()=>{
        if( curPage > lastPage ){
            return ;
        }
        setIsLoading( true )
        RestAPI.getNotifications(curPage).then(res=>{
            console.log(res)
            if ( res.success == 1 ){
                let newData = [];
                if( res.data.current_page  == 1 ){
                    newData = res.data.data;                    
                }else if( res.data.current_page > 1 ){
                    newData = [...notifyList, ...res.data.data]
                }

                setNotifyList( newData )

                setLastPage(res.data.last_page)

            }else{
                failed('Oops', 'Failed to fetch data, Because ' + res.msg)
            }
        }).catch(err=>{
            console.log(err)
            failed('Oops', 'Some errors are occured while fetching notification list. please try again.')
        }).finally(()=>{
            setIsLoading( false )
        })
    }

    const markAsRead = (id)=>{
        setIsLoading( true )
        RestAPI.markAsRead(id).then(res=>{
            console.log(res)
            if ( res.success == 1 ){
                let newData = notifyList.filter(item=>item.id != id);
                
                setNotifyList( newData )
                
                setLastPage(res.data.last_page)
            }else{
                failed('Oops', 'Failed to mark as read,  Because ' + res.msg)
            }
        }).catch(err=>{
            console.log(err)
            failed('Oops', 'Some errors are occured while mark as read. please try again.')
        }).finally(()=>{
            setIsLoading( false )
        })
    }

    // let isEmpty = data.length <= 0 || data[0].data.length <= 0;
    let isEmpty = notifyList && notifyList.length > 0 ? false : true;
    
    // console.log('notify llist data ****************', notifyList)
    return (
        <>
        {/* <ZStatusBar/> */}
        <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
        <SafeAreaView style={{flex:1}}>
            <View style = {styles.container}>         
                <View style={styles.mainContainer}>

                    <EmptyHolder placeholder={"Nothing..."} isLoading={isLoading} isShow={isEmpty} onPressRefresh={loadData}/>
                    <SwipeListView
                        contentContainerStyle={{paddingBottom:40}}
                        data={notifyList}
                        renderItem={ (data, rowMap) => ( <ItemNotification item={data}/> )}
                        renderHiddenItem={ (data, rowMap) => (
                            <View style={styles.rowHidden}>
                                <TouchableOpacity 
                                    onPress={()=>markAsRead(data.item.id)}
                                    style={{width:60, height:80, justifyContent:'center', alignItems:'center', backgroundColor:'#fff', borderColor:'#aaa' , borderRadius:20 }}>
                                    <AntDesign  name="close" size={30} color={Constants.purpleColor}/>
                                </TouchableOpacity>
                            </View>
                        )}

                        onEndReachedThreshold={0.5}
                        onEndReached={()=>{
                            if( curPage < lastPage){
                                
                                setCurPage(curPage + 1)
                            }
                        }}
                        onRefresh={() => { 
                            if( curPage == 1 ){
                                loadData()
                            }else{
                                setCurPage(1)
                            } 
                        }}
                        refreshing={isLoading}
                        leftOpenValue={0}
                        rightOpenValue={-70}
                    />
                    
                </View>
            
                <HeaderBar 
                    title="Notifications" 
                    rightIcon={
                        isLoading ? 
                        <BallIndicator color={Constants.purpleColor} size={20}/>
                        :
                        <MaterialIcons name="refresh" color={Constants.purpleColor} size={30}/>
                    }
                    onLeftButton = {()=>{navigation.toggleDrawer();}}
                    onRightButton={()=>{                        
                        if( curPage == 1 ){
                            loadData()
                        }else{
                            setCurPage(1)
                        }
                    }}
                    
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
        height: windowHeight,
        width: windowWidth,
    },
    mainContainer: {
        height: windowHeight,
        width: windowWidth,
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop:60,
        paddingBottom:40,
    },
    itemBody:{
        marginTop: 5,
        paddingHorizontal:15,
        paddingVertical:10,
        height: 80,
        width: windowWidth*0.9,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    itemDate:{
        width: 65,
        height: 65,
        borderWidth: 0.5,
        borderRadius: 10,
        borderColor: '#fff',
        backgroundColor: 'white',
        shadowColor: "#333",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5.00,
        elevation: 10,
        flexDirection: 'column',
        justifyContent:'center',
        alignItems: 'center',
    },
    itemInfor:{
        paddingLeft: 10,
        height: '60%',
        width: '55%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    itemPrice:{
        height: '60%',
        
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
    },
    seeButton:{
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#6733bb',
        height: 55,
        width: '50%',
        borderRadius: 15,
    },
    submitButtonText:{
        padding: 15,
        fontSize: 17,
        color: '#fff',
        textAlign: 'center'
    },
    rowHidden:{
        flexDirection:'row', 
        justifyContent:'flex-end', 
        alignItems:'center', 
        height:'100%',
        
    }
})