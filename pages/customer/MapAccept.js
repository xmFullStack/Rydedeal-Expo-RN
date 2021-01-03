import React, {Component, useState, useReducer, useRef} from 'react'
import {
    ImageBackground,
    Image,
    Button,
    StatusBar,
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    TextInput,
    StyleSheet,
    TouchableHighlight,
    SafeAreaView,
    Dimensions,
    Animated,
    Easing,
    AsyncStorage
} from 'react-native'

import {Entypo} from '@expo/vector-icons';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import Constants, {StatusBarHeight} from '../../src/utils/Constants';
import HeaderBar from '../../src/components/HeaderBar';

import RideMapView from '../../src/components/RideMapView';
import AcceptMainView from '../../src/components/AcceptMainView';
import EnterBidView from '../../src/components/EnterBidView';

import {OpenMapDirections} from 'react-native-navigation-directions';

import RestAPI from '../../src/utils/RestAPI';
// import { SafeAreaView } from 'react-native-safe-area-context';
import {ResErrCodes} from "../../src/utils/DefaultCodes";
import {MaterialIcons, SimpleLineIcons, EvilIcons} from '@expo/vector-icons';
import ZStatusBar from '../../src/components/ZStatusBar';
import { clearUpdateCacheExperimentalAsync } from 'expo/build/Updates/Updates';

let screenHeight = Dimensions.get('window').height;
let screenWidth = Dimensions.get('window').width;

export const UpButton = ({isShow, isDown = false, onPress}) => {

    if (!isShow) {
        return null;
    }

    return <>
        <TouchableOpacity
            style={{
                width: 50, height: 50,
                borderRadius: 25,
                backgroundColor: '#fff',
                position: 'absolute',
                bottom: 30,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                // elevation:10,
                ...Constants.style.defaultShadow
            }}
            onPress={() => onPress()}>

            <Entypo name={isDown ? "chevron-thin-down" : "chevron-thin-up"} size={30} color={Constants.purpleColor}/>

        </TouchableOpacity>
    </>
}


export const DownButton = ({isShow, onPress, containerStyle}) => {

    if (!isShow) {
        return null;
    }

    return <>
        <TouchableOpacity
            style={{
                width: 46, height: 46,
                borderRadius: 23,
                backgroundColor: '#fffe',
                justifyContent: 'center',
                alignItems: 'center',
                // alignSelf:'center',
                ...Constants.style.defaultShadow,
                ...containerStyle
            }}
            onPress={() => onPress()}>

            <Entypo name={"chevron-thin-down"} size={30} color={Constants.purpleColor}/>

        </TouchableOpacity>
    </>
}

let liveTrackId = null;
let intervalId = null;


export default MapAccept = ({}) => {

    const navigation = useNavigation();
    const route = useRoute();

    let item = route.params?.item;
    // let [ item , setItem ] = useState(initItem)
    // let parent = route.params?.parent;

    let location_from = item ? item.address_from : '';
    let location_to = item ? item.address_to : '';
    let [isLoading, setIsLoading] = useState(false)
    let [fromAddr, setFromAddr] = useState(location_from);
    let [toAddr, setToAddr] = useState(location_to);
    let [rideDetail, setRideDetail] = useState(item)
    let [isShowMainView, setIsShowMainView] = useState(true)

    let [liveDriverLocation, setLiveDriverLocation] = useState(null);
    let [liveCustomerLocation, setLiveCustomerLocation] = useState(null);

    let [liveDriverName, setLiveDriverName] = useState(null)
    let [liveDriverDescription, setLiveDriverDescription] = useState(null)

    let [onceAlertBegan, setOnceAlertBegan] = useState(false)
    let [onceAlertCompleted, setOnceAlertCompleted] = useState(false)

    let priceMin = rideDetail ? rideDetail.price_min : '0.00';
    let currency = rideDetail ? rideDetail.currency : '$';
    let profile = rideDetail && rideDetail.owner ? rideDetail.owner.profile : null;
    let rideId = rideDetail.id
    let avatar = profile ? {uri: profile.avatar} : require('../../assets/avatar2.jpg');
    let userName = rideDetail && rideDetail.owner ? Constants.ucfirst(rideDetail.owner.first_name) + ' ' + Constants.ucfirst(rideDetail.owner.last_name) : 'Unknown';


    let slugId = rideDetail.slugId
    let [counter, setCounter] = useState(1);

    let [locateMeTrigger, setLocateMeTrigger] = useState(false)

   

    let fromLocation = !rideDetail ? null : {
        latitude: rideDetail.location_from.coordinates[1], longitude: rideDetail.location_from.coordinates[0],
        lat: rideDetail.location_from.coordinates[1], lng: rideDetail.location_from.coordinates[0]
    };

    let toLocation = !rideDetail ? null : {
        latitude: rideDetail.location_to.coordinates[1], longitude: rideDetail.location_to.coordinates[0],
        lat: rideDetail.location_to.coordinates[1], lng: rideDetail.location_to.coordinates[0]
    };

    const checkBeginComplete = async () => {
        let rideItem = rideDetail;
        if (!rideItem) {
            return;
        }
        if (!global.curLocation) {
            return;
        }
        if (!rideItem.driver_id || rideItem.driver_id != global.curUser.id) {
            return;
        }

        let fromLocation = {
            latitude: rideItem.location_from.coordinates[1], longitude: rideItem.location_from.coordinates[0],
            lat: rideItem.location_from.coordinates[1], lng: rideItem.location_from.coordinates[0]
        };
        let toLocation = {
            latitude: rideItem.location_to.coordinates[1], longitude: rideItem.location_to.coordinates[0],
            lat: rideItem.location_to.coordinates[1], lng: rideItem.location_to.coordinates[0]
        };

        let onceAlertBegan = null;
        let onceAlertCompleted = null;
        try {
            onceAlertBegan = await AsyncStorage.getItem("once_alert_began_" + item.id); // '1', '0' | null
        } catch (ex) {
        }
        try {
            onceAlertCompleted = await AsyncStorage.getItem("once_alert_completed_" + item.id);
        } catch (ex) {
        }

        if (!rideItem.began_at) {


            let dist = Constants.distance(fromLocation.lat, fromLocation.lng, global.curLocation.lat, global.curLocation.lng);
            if (dist < 0.1 && onceAlertBegan != '1') {
                setOnceAlertBegan(true)
                await AsyncStorage.setItem("once_alert_began_" + item.id, '1');
                alert('Lets begin ride!', 'You are at nearby to begin ryde.')
            }
        } else if (!rideItem.completed_at) {
            let dist = Constants.distance(toLocation.lat, toLocation.lng, global.curLocation.lat, global.curLocation.lng);
            if (dist < 0.1 && onceAlertCompleted != '1') {
                setOnceAlertCompleted(true)
                await AsyncStorage.setItem("once_alert_completed_" + item.id, '1');
                alert('Lets complete ride!', 'You are at nearby to complete ryde.')
            }
        }

        // setMyLocation({latitude:global.curLocation.lat, longitude:global.curLocation.lng})

    }

    const liveTracking = () => {
        ///**    MapAccept is only for driver so live tracking is not needed ,
        // liveTrackId = setInterval(() => {
            let ride = rideDetail
            console.log('liveTracking item data : ', ride)
            if (!ride || !ride.driver_id) {
                console.log('ride item is null in RideMapModal  from live tracking:', ride)
                return
            }
            console.log('Live Tracking for item.driver_id -> ', ride.driver_id);

            if( Constants.isDriver () ){
                let delta = 1;
                if( liveDriverLocation != null ){
                    delta = Constants.distance(liveDriverLocation.latitude, liveDriverLocation.longitude, global.curLocation.lat, global.curLocation.lng)
                }
                
                if (delta > 0.01 ){
                    
                    setLiveDriverLocation(
                        {
                            latitude: global.curLocation.lat, 
                            longitude: global.curLocation.lng,
                            lat: global.curLocation.lat, 
                            lng: global.curLocation.lng,
                        }
                    )
                }
               
            }else{
                
                setLiveCustomerLocation({
                    latitude: global.curLocation.lat, 
                    longitude: global.curLocation.lng,
                    lat: global.curLocation.lat, 
                    lng: global.curLocation.lng,
                })                
            }

            let trackedUserId = Constants.isDriver() ? ride.owner_id : ride.driver_id
            if (!trackedUserId) {
                return;
            }
            
            RestAPI.liveDriverLocation(trackedUserId).then(res => {
                
                if (res.success == 1) {
                    let user = res.data;
                    if (!user.location || !user.location.lat) {
                        return;
                    }
                    if( Constants.isDriver () ){
                        
                        setLiveCustomerLocation({latitude: user.location.lat, longitude: user.location.lng})                        
                    }else{
                        let delta = 1;
                        if( liveDriverLocation != null ){
                            delta = Constants.distance(liveDriverLocation.latitude, liveDriverLocation.longitude, user.location.lat, user.location.lng)
                        }
                     
                        if (delta > 0.01 ){ 
                            setLiveDriverLocation({latitude: user.location.lat, longitude: user.location.lng})
                            setLiveDriverName(Constants.ucfirst(user.first_name) + ' ' + Constants.ucfirst(user.last_name))
                            setLiveDriverDescription(user.address)
                        }
                    }                    
                }
            }).catch(err => {
                console.log('LiveDriverLocation Err:', err)
            })
        // }, 1000)
    }

    
    const trackingCallback = () => {
        if (intervalId){
            clearInterval(intervalId);
        }
        intervalId = setInterval(() => {
            liveTracking();
            checkBeginComplete()
           
        }, 3000)
        
    }

    useFocusEffect(React.useCallback(() => {
        console.log('usefocureffect is triggered:', counter);
        setCounter(++counter);
        
        trackingCallback();
        return () => {
            if (liveTrackId) {
                clearInterval(liveTrackId);
            }
            if (intervalId) {
                clearInterval(intervalId)
            }
        }
    }, []))

    React.useEffect(() => {
        loadData();
        return () => {
        }
    }, [item])

    const loadData = () => {
        showPageLoader(true)
        setIsLoading(true)
        RestAPI.showRide(rideDetail.id).then(res => {
            if (res.success == 1) {

                setRideDetail(res.data.ride)
            } else {
                failed('Oops', res.msg)
                navigation.goBack();
            }
        }).catch(err => {
            console.log(err)
            failed('Oops', 'Some errors are occured. Please try again.')
        }).finally(() => {
            showPageLoader(false)
            setIsLoading(false)
        })
    }


    const onSubmitBid = (price, desc) => {
        showPageLoader(true)
        setIsLoading(true)
        RestAPI.storeBid({ride_id: rideId, price_min: priceMin, description: desc, price: price}).then(res => {
            if (res.success == 1) {
                loadData();
                alertOk('Success', 'Your offer is submitted to client.', () => {
                    setIsShowMainView(true)
                });
            } else {
                alertOk('Oops', res.msg, () => {
                    if (res.err_code == ResErrCodes.NO_PAYMENT_VERIFY) {
                        navigation.navigate('PaymentVerification');
                    } else if (res.err_code == ResErrCodes.NO_SUBSCRIPTION || res.err_code == ResErrCodes.EXPIRED_SUBSCRIPTION) {
                        // goto driver setting page

                        navigation.navigate('driver_setting');
                    }
                })
            }
        }).catch(err => {
            console.log(JSON.stringify(err));
            failed('Oops', 'Somethings went wrong. please try again.')
        }).finally(() => {
            showPageLoader(false)
            setIsLoading(false)
        })
    }

    const onAcceptRide = () => {
        showPageLoader(true)
        setIsLoading(true)
        RestAPI.acceptFromDriver(rideId).then(res => {
            if (res.success == 1) {
                loadData()
                alert('Success', 'You have accepted ride request. Please contact with customer to confirm request.')
            } else {
                failed('Oops', res.msg)
            }
        }).catch(err => {
            console.log(err)
            failed('Oops', 'Some errors are occurred. Please try again.')
        }).finally(() => {
            showPageLoader(false)
            setIsLoading(false)
        })
    }

    const goPickRyder = (ride_id) => {
        showPageLoader(true)
        RestAPI.goPickRyder(ride_id).then( res => {
            if (res.success == 1){
                let temp = rideDetail;
                temp.went_pick = res.data.went_pick;
                setRideDetail(temp)
                alertOk('Pick Ryder','Navigate to Pick location.', ()=>{
                    //**  TODO Move to pick location 
                    _beginRealTimeNav(global.curLocation.lat, global.curLocation.lng, fromLocation.lat, fromLocation.lng)
                })
            }else{
                failed('Oops', res.msg)
            }
        }).catch( err => {
            console.log(err)
            failed('OOps', 'Failed to set status as picking ryder, please try once more again.');
        }).finally(()=>{
            showPageLoader(false);
        })
    }
    const beginRide = (ride_id) => {
        if (!fromLocation || !toLocation) {
            failed('Oops', 'Ride information is not correct.');
            return;
        }

        showPageLoader(true)
        setIsLoading(true)
        RestAPI.beginRide(ride_id).then(res => {
            if (res.success == 1) {
                let temp = rideDetail;
                temp.began_at = res.data.began_at;
                setRideDetail(temp)
                alertOk('Yeah!', 'Ride is began now.', () => {
                    // go to ride detail page to check customer location.
                    _beginRealTimeNav(fromLocation.lat, fromLocation.lng, toLocation.lat, toLocation.lng)
                })
            } else {
                failed('Oops', res.msg)
            }
        }).catch(err => {
            console.log(err)
            failed('Oops', 'Somethings went wrong. please try again.')
        }).finally(() => {
            showPageLoader(false)
            setIsLoading(false)
        })
    }

    const _gotoStartLocation = () => {
        confirm('Go to start location!', '', () => {
            console.log('tapped go to start location ')
            _beginRealTimeNav(global.curLocation.lat, global.curLocation.lng, fromLocation.lat, fromLocation.lng)
        }, () => {
        })

    }
    const _gotoEndLocation = () => {

        confirm('Go to end location!', '', () => {
            console.log('tapped go to start location ')
            _beginRealTimeNav(global.curLocation.lat, global.curLocation.lng, toLocation.lat, toLocation.lng)
        }, () => {
        })

    }

    const _beginRealTimeNav = (startLat, startLng, endLat, endLng, transportPlan = 'd') => {

        const startPoint = {
            longitude: startLat,
            latitude: startLng
        }

        const endPoint = {
            longitude: endLng,
            latitude: endLat
        }

        // const transportPlan = 'd'; // Available values: d => (by car), w => (by foot), r => (by public transit). If you don’t specify any value, Maps uses the user’s preferred transport type or the previous setting.

        OpenMapDirections(startPoint, endPoint, transportPlan).then(res => {
            console.log('promise result:> ', res)
        });
    }


    const completeRide = (ride_id) => {
        showPageLoader(true)
        setIsLoading(true)
        RestAPI.completeRide(ride_id).then(async (res) => {
            if (res.success == 1) {

                let temp = rideDetail;
                temp.completed_at = res.data.completed_at;
                setRideDetail(temp)

                try {
                    await AsyncStorage.removeItem("once_alert_began_" + rideDetail.id);
                } catch (ex) {
                    console.log('error while removeItem for alert began:', ex)
                }
                try {
                    await AsyncStorage.removeIteme("once_alert_completed_" + rideDetail.id);
                } catch (ex) {
                    console.log('error while removeitem alert completed: ', ex)
                }

                alertOk('Completed!', 'Ride completed!  You can leave review for customer.', () => {
                })
            } else {
                failed('Oops', res.msg)
            }
        }).catch(err => {
            console.log(err)
            failed('Oops', 'Somethings went wrong. please try again.')
        }).finally(() => {
            showPageLoader(false)
            setIsLoading(false)
        })
    }

    const onTapReview = () => {
        let bid = rideDetail.bid;
        navigation.navigate('driver_review', {ride: rideDetail, bid: bid});
    }

    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

    const scrollRef = React.useRef()
    return (
        <>
            {/*<SafeAreaView style={{flex:0}}/>*/}
            {/*<SafeAreaView style={{flex:1}}>*/}
            {/* <ZStatusBar/> */}
            <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
            <View style={{flex: 1, paddingTop: Platform.OS == 'ios' ? StatusBarHeight : 0}}>

                <KeyboardAvoidingView
                    style={{flex: 1}}
                    keyboardVerticalOffset={keyboardVerticalOffset}
                    behavior="padding" enabled>

                    <ScrollView keyboardShouldPersistTaps="always" ref={scrollRef} style={{flex: 1,}}
                                contentContainerStyle={{padding: 0}}>

                        <View style={{
                            flex: 1, justifyContent: 'flex-end',
                            width: Constants.WINDOW_WIDTH,
                            height: Constants.WINDOW_HEIGHT - StatusBarHeight,
                        }}>
                            <RideMapView
                                rideItem={rideDetail}
                                locateMeTrigger={locateMeTrigger}
                                liveCustomerLocation={liveCustomerLocation} // {latitude, longitude}
                                liveDriverLocation={liveDriverLocation} // {latitude, longitude}
                                liveDriverName={liveDriverName}
                                liveDriverDescription={liveDriverDescription}
                                onTapGoToStart={() => {
                                    // _gotoStartLocation();
                                }}
                                onTapGoToEnd={() => {
                                    // _gotoEndLocation();
                                }}
                            />
                            {
                                isShowMainView ?
                                    <AcceptMainView
                                        isLoading={isLoading}
                                        ride={rideDetail}
                                        fromAddr={fromAddr}
                                        toAddr={toAddr}
                                        userName={userName}
                                        avatar={avatar}
                                        currency={currency}
                                        priceMin={priceMin}
                                        onTapPickRyder = {(ride_id)=>{
                                            goPickRyder(ride_id);
                                        }}
                                        onTapBeginRide={(ride_id) => {
                                            beginRide(ride_id);
                                        }}
                                        onTapComplete={(ride_id) => {
                                            completeRide(ride_id)
                                        }}
                                        onTapReview={() => {
                                            onTapReview();
                                        }}
                                        onEnterBid={() => {
                                            setIsShowMainView(false);
                                        }}
                                        onAccept={() => {
                                            onAcceptRide();
                                        }}
                                    />
                                    :
                                    <EnterBidView
                                        isLoading={isLoading}
                                        ride={rideDetail}
                                        currency={currency}
                                        priceMin={priceMin}
                                        isShow={!isShowMainView}
                                        onDescriptionFocus={() => {
                                            if (scrollRef.current) {
                                                scrollRef.current.scrollToEnd({animated: true})
                                            }
                                        }}
                                        onUpdated={() => {
                                            if (global.reloadManageData) {
                                                global.reloadManageData();
                                            }
                                        }}
                                        onCanceled={() => {
                                            if (global.reloadManageData) {
                                                global.reloadManageData();
                                            }
                                        }}
                                        onClosed={() => {
                                            setIsShowMainView(true);
                                        }}
                                        onSubmit={(price, desc) => {
                                            onSubmitBid(price, desc);
                                        }}/>
                            }

                        </View>
                    </ScrollView>

                    <HeaderBar
                        title="Ride Details"
                        isBackLeft={true}
                        rightIcon={<MaterialIcons name="my-location" size={30} color={Constants.purpleColor}/>}
                        onLeftButton={() => {
                            navigation.goBack();
                        }}
                        onRightButton={() => {
                            setLocateMeTrigger(!locateMeTrigger)
                        }}
                    />

                </KeyboardAvoidingView>
            </View>
            {/*</SafeAreaView>*/}
        </>
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
    mainBody: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'white',
        // height: '70%',
        width: '85%',
        borderRadius: 30,
        paddingBottom: 10,
        marginBottom: 5,
    },
    budget: {
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        marginBottom: 5,
        paddingRight: 30,
        paddingTop: 5,
    },
    inputLocation: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        // borderColor:'red', borderWidth:2,
        // height: '50%'
    },
    inputIcon: {
        marginTop: 15,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '15%',
        // height: '100%'
    },
    inputFromTo: {
        marginTop: 0,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        width: '80%',
        paddingBottom: 5,
        // height: '90%'
    },
    driver: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 25,
        width: '100%',
        height: 55,
    },
    driverInfor: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        width: '45%',
        height: '100%',
    },

    buttonView: {
        marginBottom: 0,
        height: '20%',
        width: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    submitButton: {
        backgroundColor: 'white',
        height: 40,
        width: '100%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#444',
        textAlign: 'center'
    },
})
