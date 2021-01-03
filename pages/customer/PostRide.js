import React, {Component, useState} from 'react'
import {
    StatusBar,
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Dimensions,
    Animated,
    Easing,
    Modal,
    Alert,
    Image
} from 'react-native'
import {
    SimpleLineIcons, MaterialIcons, MaterialCommunityIcons,
    FontAwesome5
} from '@expo/vector-icons';

import HeaderBar from '../../src/components/HeaderBar';
import {NavigationContext, useFocusEffect, useNavigation, useRoute} from '@react-navigation/native'
import MapView, {Marker} from 'react-native-maps';

import GooglePlacesInput from '../../src/components/GooglePlacesInput';
import Constants, {StatusBarHeight, isIOS} from '../../src/utils/Constants';
import RestAPI from '../../src/utils/RestAPI';
import MapViewDirections from 'react-native-maps-directions';
import {RidePostView} from './PostRideInfo';
import {UpButton, DownButton} from './MapAccept'
import {SafeAreaView} from 'react-native-safe-area-context';
import moment from "moment";
import {ResErrCodes} from "../../src/utils/DefaultCodes";
import Utils from "../../src/utils/Utils";

let screenHeight = Dimensions.get('window').height;
let screenWidth = Dimensions.get('window').width;

const meMarker = require('../../assets/me_marker.png');
const marker1 = require('../../assets/marker1.png');
const marker2 = require('../../assets/marker2.png');


export const LocateMeButton = ({onMyLocationPress, isInModal = false}) => {

    return <View
        style={{
            borderRadius: 20,
            width: 40, height: 40,
            backgroundColor: 'white',
            position: 'absolute',
            bottom: isInModal ? 30 : 20,
            right: 10,
            ...Constants.style.defaultShadow,

        }}
    >
        <TouchableOpacity style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} onPress={onMyLocationPress}>
            <MaterialIcons name="my-location" size={30} color={Constants.purpleColor}/>
        </TouchableOpacity>
    </View>
}


export const DirectionDataView = ({
                                      distance,
                                      duration,
                                      fromAddr,
                                      toAddr,
                                      currency,
                                      initPricingPlans = null,
                                      minPrice,
                                      serviceFee,
                                      country_code,
                                      onSetMinPrice,
                                      onChangeMinPrice,
                                      isShowMinPrice = false,
                                      isShowFeeData = false,
                                      isInModal = false,

                                      rideItem,
                                      distToPick,
                                      durationToPick,
                                  }) => {

    if (distance == null || duration == null) {
        return null
    }


    let [pricingPlans, setPricingPlans] = useState(initPricingPlans);
    useFocusEffect(React.useCallback(() => {
        if (initPricingPlans == null) {
            RestAPI.getFeeData().then(res => {
                setPricingPlans(res.data.pricing_plans)
            }).catch(err => {

            }).finally(() => {
            })
        }
        return () => {
        }
    }, []))


    const getDistanceUnit = () => {
        if (country_code == null || country_code == 'us') {
            return 'mi';
        }
        return 'Km';
    }

    const getDistance = (dist) => {
        if (country_code == null || country_code == 'us') {
            let miles = Constants.convKmToMiles(dist)
            return miles;
        }
        return dist;
    }

    const RenderDistTimeToPick = ({rideItem, distToPick, timeToPick}) => {
        if (rideItem == null) {
            return null;
        }
        if (rideItem.began_at != null || rideItem.completed_at != null) {
            return null;
        }
        if( rideItem.driver_id == null){
            return null
        }

        if( distToPick == null || timeToPick == null ){
            return null;
        }


        return <>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start', width:'80%' }}>
                <Text style={{color:Constants.purpleColor, fontSize:13}}>To Pick</Text>
            </View>
            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <Text>
                    {getDistance(distToPick)} {getDistanceUnit()}, {timeToPick} mins
                </Text>
            </View>
        </>
    }

    let topOffset = isInModal ? 50 + StatusBarHeight : 20 + StatusBarHeight

    return <>
        <View
            style={{
                backgroundColor: '#fff',
                paddingHorizontal: 5,
                width: '80%',
                borderRadius: 20,
                alignSelf: 'center',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'flex-start',
                position: 'absolute',
                paddingVertical: 8,
                top: topOffset,
                ...Constants.style.defaultShadow,
                zIndex: 1,
            }}
        >
            {
                fromAddr && toAddr ?
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        width: '80%',
                        justifyContent: 'space-around',
                        alignItems: 'flex-start'
                    }}>
                        <Text numberOfLines={1} style={{width: '48%'}}>{Constants.shortString(fromAddr, 15)}</Text>
                        <FontAwesome5 name={'long-arrow-alt-right'} color={Constants.purpleColor} size={20}/>
                        <Text numberOfLines={1}
                              style={{width: '48%', marginLeft: 10}}>{Constants.shortString(toAddr, 15)}</Text>
                    </View> : null
            }

            <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                <Text>
                    {getDistance(distance)} {getDistanceUnit()}, {duration} mins
                </Text>
            </View>

            <RenderDistTimeToPick rideItem={rideItem} distToPick={distToPick} timeToPick={durationToPick}/>

            {
                !isShowMinPrice ? null :
                    <View style={{flex: 1, flexDirection: 'row'}}>
                        <View style={{flex: 3, alignItems: 'flex-end'}}>
                            <Text>Min Price:</Text>
                        </View>
                        <View style={{flex: 4, paddingLeft: 5}}>
                            <Text>{currency} {minPrice}</Text>
                        </View>
                    </View>
            }

        </View>
    </>
}


export const UpdatePostRide = ({}) => {

    const navigation = useNavigation();
    const route = useRoute();
    let {ride} = route.params;

    return <PostRide isUpdate={true} ride={ride} navigation={navigation}/>
}

export const getInitDateTime = (beginDelayMins = 30) => {
    let date = new Date();
    console.log('getInitDateTime function param: ', date);
    let now = Constants.getDateStr(date) + ' ' + Constants.getTimeStr(date);
    console.log('getInitDateTime function param  to string : ', now);
    let add30 = moment(now, 'YYYY-MM-DD HH:mm:ss').add(beginDelayMins, 'minutes');
    console.log('getInitDateTime added delaymins : ', add30, beginDelayMins);
    let y = parseInt(add30.format('YYYY'));
    let month = parseInt(add30.format('MM')) - 1;
    let d = parseInt(add30.format('DD'));
    let h = parseInt(add30.format('HH'));
    let m = parseInt(add30.format('mm'));
    let res = new Date(y, month, d, h, m);
    console.log('getInitDateTime function result: ', res, y, month, d, h, m)
    return res;
}

const MarginBottom = -30;

class PostRide extends Component {
    static contextType = NavigationContext;

    animBottom = new Animated.Value(MarginBottom);
    mapViewRef = null;
    refDirectionDataView = null;

    state = {
        isUpdate: false,
        isLoading: false,
        isCustomer: true,
        bottomOfMainContainer: this.animBottom,
        upButtonShow: false,
        pricing_plans: null,
        isShownMainView: true,
        isShowLocationInputModal: false,
        isFromSelected: true,
        yourLocation: null,
        dropLocation: null,
        distance: null,
        duration: null,
        region: {
            latitude:  global.curLocation ? global.curLocation.lat : 0,
            longitude: global.curLocation ? global.curLocation.lng : 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        },
        initialRegion: {
            latitude: global.curLocation ? global.curLocation.lat : 0,
            longitude: global.curLocation ? global.curLocation.lng : 0,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        },
        curLocation: global.curLocation,
        wayPoints: [],

        serviceFee: 0,
        currency: "$",
        initTimeFrom: getInitDateTime(5),
        initPrice: '',
        initRideType: 1,
        oldRide: null,
        initDescription: '',
        initSeatCount: 1,
        selRideType: null,
        feeData: null,
    };


    getMinPrice = (distance, yourLocation, dropLocation, pricing_plans, selRideType) => {
        // TODO: get min price 
        if (this.state.feeData == null) {
            console.log('getMinPrice > priceObj feedata is null return : 0');
            warn('Oops', 'Service fee information is invalid now, please try again after a moment.');
            return null;
        }
        let pricePlan = null;
        try {
            pricePlan = Utils.getPricingPlan(yourLocation.lat, yourLocation.lng, pricing_plans, selRideType)
        } catch (ex) {
            console.log('getMinPrice > priceObj exception : ', ex);
            warn('Invalid  Data', Constants.ucfirst(ex))
            return null;
        }

        this.setState({currency: pricePlan.currency})
        let realDistance = distance;
        if (pricePlan.unit == "mi") {
            realDistance = Constants.convKmToMiles(realDistance);
        }
        let priceObj = Utils.calcPrice(pricePlan, realDistance, selRideType)
        //  priceObj.string, priceObj.currency
        console.log('getMinPrice > priceObj return : ', priceObj);
        return priceObj;
    }

    showMainView = () => {

        Animated.parallel([
            Animated.timing(
                // Animate value over time
                this.state.bottomOfMainContainer, // The value to drive
                {
                    toValue: MarginBottom, // Animate to final value of 1
                    easing: Easing.ease,
                    duration: 500,
                }
            ),

        ]).start(() => {
            this.setState({isShownMainView: true})
        })

    }
    hideMainView = () => {

        Animated.parallel([
            Animated.timing(
                // Animate value over time
                this.state.bottomOfMainContainer, // The value to drive
                {
                    toValue: -Constants.WINDOW_HEIGHT,
                    easing: Easing.ease,
                    duration: 500,
                }
            ),
            // Animated.timing(
            //     // Animate value over time
            //     this.state.mapBottom, // The value to drive
            //     {
            //         toValue: 0,
            //         easing: Easing.ease,
            //         duration: 500,
            //     }
            // )
        ]).start(() => {
            this.setState({isShownMainView: false, upButtonShow: true})
        })

    }

    toggleMainView() {

        if (this.state.isShownMainView) {
            this.hideMainView();
        } else {
            this.showMainView();
        }
    }

    getFeeData = () => {
        RestAPI.getFeeData().then(res => {
            this.setState({feeData: res.data, pricing_plans: res.data.pricing_plans})
        }).catch(err => {

        }).finally(() => {
        })
    }

    componentDidMount() {
        const navigation = this.context

        this._unsubscribe = navigation.addListener('focus', () => {

            global.currentScreen = "Home"
            this.getBasicData();
            this.getFeeData();
            if (this.props.isUpdate) {
                const oldRide = this.props.ride;
                let dateFrom = moment(oldRide.time_from, 'YYYY-MM-DD HH:mm:ss', true).toDate()

                this.setState({
                    oldRide: oldRide,
                    isUpdate: true,
                    initPrice: oldRide.price_min,
                    currency: oldRide.currency,
                    initTimeFrom: dateFrom,
                    initDescription: oldRide.description,
                    initSeatCount: oldRide.seats,
                    initRideType: oldRide.ride_type_id,
                    yourLocation: {
                        name: oldRide.address_from,
                        lat: oldRide.location_from.coordinates[1],
                        lng: oldRide.location_from.coordinates[0]
                    },
                    dropLocation: {
                        name: oldRide.address_to,
                        lat: oldRide.location_to.coordinates[1],
                        lng: oldRide.location_to.coordinates[0]
                    }
                })

                console.log('Old data ', dateFrom, oldRide.description, oldRide.price_min)

            }

        });

        global.updateCurLocationInPostRide = this.updateCurLocation.bind(this);

    }

    updateCurLocation(location) {
        this.setState({curLocation: location})
    }


    componentWillUnmount() {
        this._unsubscribe();
        global.getRegion = null;
        global.updateCurLocationInPostRide = null;
    }

    getBasicData() {
        // this.setState({ isLoading : true })
        showPageLoader(true)
        RestAPI.getPostBasicData().then(res => {
            if (res.success == 1) {

                this.setState({
                    postTypes: res.data.types,
                    serviceFee: res.data.service_fee,
                    currency: res.data.currency,
                    pricing_plans: res.data.pricing_plans
                })

            } else {
                failed('Oops', res.msg)
            }
        }).catch(err => {
            console.log(err)
            failed('Oops', 'Some errors are occured while get basic data, please try reload app.')
        }).finally(() => {
            // this.setState({ isLoading : false })
            showPageLoader(false)
        })
    }

    ratingCompleted(rating) {
        console.log("Rating is: " + rating)
    }

    onFocusYourLocation = () => {
        this.setState({isShowLocationInputModal: true, isFromSelected: true})
    }
    onFocusDropLocation = () => {
        this.setState({isShowLocationInputModal: true, isFromSelected: false})
    }

    getRegion = () => {
        let locations = [global.curLocation, this.state.yourLocation, this.state.dropLocation, ...this.state.wayPoints]

        let center = null;
        let deltaLat = 0.5;
        let deltaLng = 0.5;

        //  let sumLat = 0; let sumLng =0;
        let maxLat = global.curLocation ? global.curLocation.lat : 0;
        let minLat = global.curLocation ? global.curLocation.lat : 0
        let maxLng = global.curLocation ? global.curLocation.lng : 0;
        let minLng = global.curLocation ? global.curLocation.lng : 0
        //  let count = 0;
        locations.forEach(item => {
            if (item) {
                // count ++;
                // sumLat += item.lat
                // sumLng += item.lng
                minLat = Math.min(item.lat, minLat)
                minLng = Math.min(item.lng, minLng)
                maxLat = Math.max(item.lat, maxLat)
                maxLng = Math.max(item.lng, maxLng)
            }
        })


        center = {
            lat: (maxLat + minLat) / 2, lng: (maxLng + minLng) / 2
        }
        deltaLat = (maxLat - minLat) * 1.5;
        deltaLng = (maxLng - minLng) * 1.5;
        deltaLat = deltaLat <= 0 ? 0.05 : deltaLat;
        deltaLng = deltaLng <= 0 ? 0.05 : deltaLng;
        let region = {
            latitude: center.lat,
            longitude: center.lng,
            latitudeDelta: deltaLat > 360 ? deltaLat / 1.5 : deltaLat,
            longitudeDelta: deltaLng > 360 ? deltaLng / 1.5 : deltaLng,
        }
        this.setState({region: region})
        return region;


    }

    setLocation = (isFrom, location, placeId, callback) => {
        // this.setState({ isLoading : true })
        showPageLoader(true)
        if (location) {
            RestAPI.geoCodingFromLocationIQ(location.lat, location.lng).then(res => {

                let loc = {name: res.display_name, lat: location.lat, lng: location.lng}
                if (isFrom) {
                    this.setState({yourLocation: loc}, () => {
                        // this.getRegion()
                        callback(true)
                    })
                } else {
                    this.setState({dropLocation: loc}, () => {
                        // this.getRegion();
                        callback(true)
                    })
                }
            }).catch(err => {
                failed('Oops', 'Failed to get location information. ' + JSON.stringify(err))
                callback(false)
            }).finally(() => {
                showPageLoader(false)
                // this.setState({ isLoading  : false })
            })
        } else if (placeId) {
            RestAPI.geoGoogleReverse(placeId, Constants.GoogleApiKey).then(res => {
                if (res.results && res.results.length > 0) {
                    let data = res.results[0]
                    let loc = {
                        name: data.formatted_address,
                        lat: data.geometry.location.lat,
                        lng: data.geometry.location.lng
                    }
                    if (isFrom) {
                        this.setState({yourLocation: loc}, () => {
                            // this.getRegion();
                            callback(true)
                        })
                    } else {
                        this.setState({dropLocation: loc}, () => {
                            // this.getRegion()
                            callback(true)
                        })
                    }
                } else {
                    failed('Oops', 'Failed to get location from address. please try again.')
                    callback(false)
                }
            }).catch(err => {
                failed('Oops', 'Failed to get location from address, please try again. ' + JSON.stringify(err))
                callback(false)
            }).finally(() => {
                showPageLoader(false)
                // this.setState({ isLoading : false })
            })
        }


    }

    onMyLocationPress = () => {
        if (this.mapViewRef) {
            let region = this.getRegion();
            this.mapViewRef.animateToRegion(region, 500)
        }
    }

    onLocationInputPress = (data, details) => {
        console.log('Location Input address Data', data, ' : details:>', details)
        if (data) {
            if (data.geometry && data.geometry.location) {
                let location = data.geometry.location
                this.setLocation(this.state.isFromSelected, location, null, () => {
                })
            } else {
                let placeId = data.place_id
                this.setLocation(this.state.isFromSelected, null, placeId, () => {
                })
            }
        }

        this.setState({isShowLocationInputModal: false})
    }

    chkValidation = (params) => {
        if (!params.rideType) {
            warn('Validation Error', 'Ride type is not selected.')
            return false
        }
        if (params.seatCount <= 0) {
            warn('Validation Error', 'Seat count is not right.')
            return false
        }
        if (!params.from) {
            warn('Validation Error', 'Origin address is not valid.')
            return false
        }
        if (!params.to) {
            warn('Validation Error', 'Destination address is not valid.')
            return false
        }

        let minPrice = this.getMinPrice(this.state.distance, this.state.yourLocation, this.state.dropLocation, this.state.pricing_plans, this.state.selRideType)
        if (minPrice == null) {
            // warn('Oops', 'Service fee information is invalid. please try in other location.')
            return false;
        }

        minPrice = minPrice.value * 100;

        try {
            let price = parseFloat(params.price).toFixed(2)
            price *= 100;
            console.log(price, minPrice, this.state.distance)

            if (isNaN(price) || price < minPrice) {
                warn('Validation Error', 'Pirce must be larger than min price.')

                return false
            }
        } catch (e) {

            warn('Validation Error', 'Price is not correct value.');
            return false
        }


        return true
    }
    onPostRide = ({dateTime, seatCount, description, from, to, rideType, price, currency, isScheduled = 0}) => {

        if (!this.chkValidation({dateTime, seatCount, description, from, to, rideType, price})) {
            return
        }

        let time_to = Utils.timeStrAdded(dateTime, this.state.duration, 'minutes');

        const navigation = this.context
        if (this.props.isUpdate) {
            showPageLoader(true)
            // this.setState({ isLoading : true });
            let updateData = {
                id: this.props.ride.id,
                dateTime: dateTime,
                time_to: time_to,
                seats: seatCount,
                description: description,
                address_from: from.name,
                location_from_lat: from.lat,
                location_from_lng: from.lng,
                address_to: to.name,
                location_to_lat: to.lat,
                location_to_lng: to.lng,
                ride_type: rideType,
                salary_min: price,
                is_scheduled: isScheduled,
                distance: this.state.distance,
                distance_unit: 'km',
                duration: this.state.duration
            };

            RestAPI.updateRide(updateData).then(res => {
                if (res.success == 1) {
                    alert('Success', 'Your request is updated.')
                    navigation.goBack()
                } else {
                    failed('Oops', res.msg)
                }
            }).catch(err => {
                console.log(err)
                failed('Oops', 'Failed to update ride request. Some errors are occurred. please try again.')
            }).finally(() => {
                showPageLoader(false)
                // this.setState({isLoading : false })
            })
        } else {
            showPageLoader(true)
            // this.setState({ isLoading : true })
            RestAPI.postRide({
                dateTime,
                time_to,
                seatCount,
                description,
                from,
                to,
                rideType,
                price,
                currency,
                isScheduled,
                distance: this.state.distance,
                distance_unit: 'km',
                duration: this.state.duration
            }).then(res => {
                if (res.success == 1) {

                    // alert( 'Success', 'Your request is posted.\n' + res.data.available_drivers + ' drivers are nearby.')
                    alert('Success', 'Your request is posted.')
                    navigation.navigate('Manage')

                } else {
                    if (res.err_code == ResErrCodes.NoCard) {
                        failed('Oops', res.msg + '  Go to Billing Method and add new method as default method.');
                        navigation.navigate('BillingMethod');

                    } else {
                        failed('Oops', res.msg);
                    }
                }
            }).catch(err => {
                console.log(err)
                failed('Oops', 'Failed to post new ride request. Some errors are occurred.  please try again.')

            }).finally(() => {
                showPageLoader(false)
                // this.setState({isLoading : false })

            })
        }


    }

    render() {
        const navigation = this.context
        if( global.curLocation == null ){
            warn('Oops', 'Rydedeal does not get your location correctly, please allow location permission after reload app.')
            navigation.popToTop();
            return null
        }
        const {yourLocation, dropLocation, distance, duration} = this.state
        

        const {isUpdate} = this.props;
        const oldRide = this.props.ride;

        const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;
        const isLocationReady = yourLocation && dropLocation

        if( Constants.curUserCity() == null ){
            warn('Oops', 'Your profile does not contain city field, please update your profile with correct city.');
            navigation.navigate('user_detail');
            return null;

        }
        return (

            <View style={{marginTop: isIOS() ? StatusBarHeight : 0, flex: 1}}>
                {/* <ZStatusBar/> */}
                <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
                <KeyboardAvoidingView
                    style={{flex: 1}}
                    keyboardVerticalOffset={keyboardVerticalOffset}
                    behavior="padding"
                    enabled>
                    <ScrollView
                        keyboardShouldPersistTaps="always"
                        style={{
                            // borderWidth:2, borderColor:'green',
                            flex: 1
                        }} contentContainerStyle={{flex: 1, padding: 0, paddingBottom: isIOS() ? 30 : 0}}>
                        <View style={{
                            flex: 1, justifyContent: 'flex-end', alignItems: 'stretch',
                            // height:Constants.WINDOW_HEIGHT - StatusBarHeight,
                        }}>
                            <MapView
                                ref={ref => this.mapViewRef = ref}
                                style={styles.mapStyle}
                                initialRegion={this.state.initialRegion}
                                // region={this.state.region}
                                onPress={event => {
                                    console.log('coordinate: ', event.nativeEvent.coordinate)
                                    let coor = event.nativeEvent.coordinate
                                    let loc = {lat: coor.latitude, lng: coor.longitude}
                                    this.setLocation(this.state.isFromSelected, loc, null, (result) => {
                                        if (result == true) {
                                            this.setState({isFromSelected: !this.state.isFromSelected})
                                        }
                                    })

                                }}
                                onRegionChange={(event) => {

                                }}>

                                {
                                    this.state.curLocation != null && global.curLocation &&
                                    <Marker
                                        name="Me"
                                        // icon={meMarker}
                                        // image={meMarker}
                                        coordinate={{
                                            latitude: global.curLocation ? global.curLocation.lat : 0,
                                            longitude: global.curLocation ? global.curLocation.lng  : 0
                                        }}
                                        title={"Me"}
                                        onPress={(event) => {
                                            let coor = event.nativeEvent.coordinate
                                            let loc = {lat: coor.latitude, lng: coor.longitude}
                                            this.setLocation(this.state.isFromSelected, loc, null, (result) => {
                                                if (result == true) {
                                                    this.setState({isFromSelected: !this.state.isFromSelected})
                                                }
                                            })
                                        }}
                                        anchor={{x: 0.5, y: 0.5}}
                                        description={"I'm Here."}>
                                        <Image source={meMarker} style={{width: 80, height: 80}}/>
                                    </Marker>
                                }
                                {
                                    this.state.yourLocation != null &&
                                    <Marker
                                        name="From"
                                        // icon={marker1}
                                        // image={marker1}
                                        coordinate={{
                                            latitude: this.state.yourLocation.lat,
                                            longitude: this.state.yourLocation.lng
                                        }}
                                        title={"From"}
                                        centerOffset={{x: 0.5, y: 1}}
                                        anchor={{x: 0.5, y: 1}}
                                        description={"From Here."}>
                                        <Image source={marker1} style={styles.iosMarkerStyle}/>
                                    </Marker>

                                }
                                {
                                    this.state.dropLocation != null &&
                                    <Marker
                                        name="To"
                                        // icon={marker2}
                                        // image={marker2}
                                        coordinate={{
                                            latitude: this.state.dropLocation.lat,
                                            longitude: this.state.dropLocation.lng
                                        }}
                                        title={"To"}
                                        centerOffset={{x: 0.5, y: 1}}
                                        anchor={{x: 0.5, y: 1}}
                                        description={"To Here."}>
                                        <Image source={marker2} style={styles.iosMarkerStyle}/>
                                    </Marker>
                                }

                                {
                                    isLocationReady &&
                                    <MapViewDirections
                                        origin={{
                                            latitude: this.state.yourLocation.lat,
                                            longitude: this.state.yourLocation.lng
                                        }}
                                        destination={{
                                            latitude: this.state.dropLocation.lat,
                                            longitude: this.state.dropLocation.lng
                                        }}
                                        apikey={Constants.GoogleApiKey}
                                        strokeWidth={5}
                                        strokeColor="#2C80BE"
                                        mode={"DRIVING"}
                                        onStart={(origin, destination, waypoints) => {
                                        }}
                                        onReady={(dirRes) => {
                                            //  TODO:  min pricec calculate after once get direction from begin to end.
                                            let points = dirRes.coordinates.length > 0 ? dirRes.coordinates.map(item => {
                                                return {lat: item.latitude, lng: item.longitude}
                                            }) : []

                                            let dirDistance = dirRes.distance;
                                            try {
                                                dirDistance = dirDistance.toFixed(3)
                                            } catch (e) {
                                                console.log('Exception in PostRide.js line 776', e);
                                                dirDistance = 0;
                                            }

                                            let dirDuration = dirRes.duration;
                                            try {
                                                dirDuration = dirDuration.toFixed(2)
                                            } catch (e) {
                                                console.log('Exception in PostRide.js line :784', e);
                                                dirDuration = 0;
                                            }

                                            this.setState({
                                                distance: dirDistance,
                                                duration: dirDuration,
                                                wayPoints: points
                                            }, () => {
                                                let region = this.getRegion()
                                                if (this.mapViewRef) {
                                                    this.mapViewRef.animateToRegion(region, 500);
                                                }
                                            })

                                            let price = this.getMinPrice(dirRes.distance, this.state.yourLocation, this.state.dropLocation, this.state.pricing_plans, this.state.selRideType)
                                            if (price == null) {
                                                return
                                            }
                                            this.setState({initPrice: price.value})

                                        }}
                                    />
                                }

                            </MapView>

                            <DirectionDataView
                                fromAddr={''}
                                toAddr={''}
                                minPrice={this.state.initPrice}
                                initPricingPlans={this.state.pricing_plans}
                                country_code={global.curUser && global.curUser.cities && global.curUser.cities.length > 0 ? global.curUser.cities[0].country_code : null}
                                isShowMinPrice={false}
                                isShowFeeData={false}
                                distance={distance}
                                duration={duration}
                                currency={this.state.currency}/>

                            <Animated.View
                                style={{
                                    // position:'absolute',
                                    marginBottom: this.state.bottomOfMainContainer,
                                    // left:0,
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    // borderColor:'red', borderWidth:2,
                                    backgroundColor: '#0000',
                                    width: screenWidth,
                                }}
                            >

                                <RidePostView
                                    // isLoading={this.state.isLoading}
                                    rideId={isUpdate ? oldRide.slugId : null}
                                    isShow={true}
                                    isUpdate={this.state.isUpdate}
                                    rideTypes={this.state.postTypes}
                                    fromLocation={this.state.yourLocation}
                                    toLocation={this.state.dropLocation}
                                    currency={this.state.currency}
                                    initDateTime={this.state.initTimeFrom}
                                    initPrice={this.state.initPrice}
                                    initRideTypeVal={isUpdate ? this.state.initRideType : (this.state.postTypes && this.state.postTypes.length > 0 ? this.state.postTypes[0].id : 0)}
                                    initDescription={this.state.initDescription}
                                    initSeatCount={this.state.initSeatCount}
                                    onChangeRideType={(ridetype) => {
                                        this.setState({selRideType: ridetype}, () => {
                                            if (this.state.yourLocation && this.state.dropLocation && this.state.pricing_plans) {
                                                let minPrice = this.getMinPrice(this.state.distance, this.state.yourLocation, this.state.dropLocation, this.state.pricing_plans, ridetype)
                                                if (minPrice) {
                                                    this.setState({initPrice: minPrice.value});
                                                }
                                            }
                                        })
                                    }}
                                    onDownTap={() => this.hideMainView()}
                                    onPressFrom={() => this.onFocusYourLocation()}
                                    onPressTo={() => this.onFocusDropLocation()}
                                    onPressTopBar={() => {
                                        this.toggleMainView()
                                    }}
                                    onPressConfirm={this.onPostRide}/>

                            </Animated.View>
                            <UpButton isShow={this.state.upButtonShow} onPress={() => {
                                this.setState({upButtonShow: false})
                                this.toggleMainView()
                            }}/>

                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>


                <HeaderBar
                    title="Post Ride"
                    rightIcon={<MaterialIcons name="my-location" size={30} color={Constants.purpleColor}/>}
                    onLeftButton={() => {
                        navigation.toggleDrawer();
                    }}
                    onRightButton={() => {
                        this.onMyLocationPress();
                    }}
                />

                <Modal
                    transparent={true}
                    style={{marginTop: StatusBarHeight}}
                    visible={this.state.isShowLocationInputModal}>

                    <View
                        style={{
                            width: '100%',
                            height: 55 + StatusBarHeight,
                            backgroundColor: Constants.purpleColor,
                            alignItems: 'center',
                            paddingTop: 15 + StatusBarHeight,

                        }}
                    >
                        <TouchableOpacity
                            style={{
                                width: 50, height: 50,
                                position: 'absolute',
                                left: 10, top: 20 + StatusBarHeight,
                            }}
                            onPress={() => {
                                this.setState({isShowLocationInputModal: !this.state.isShowLocationInputModal})
                            }}>
                            <SimpleLineIcons name="arrow-left" size={18} color="white"/>
                        </TouchableOpacity>
                        <Text
                            style={{
                                color: 'white',
                                fontSize: 18
                            }}
                        >
                            Find Location By Search
                        </Text>

                        <TouchableOpacity
                            style={{
                                width: 50, height: 50,
                                position: 'absolute',
                                right: 10, top: 5 + StatusBarHeight,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onPress={() => {
                                this.setState({isShowLocationInputModal: !this.state.isShowLocationInputModal})
                                this.hideMainView();
                            }}>
                            <MaterialCommunityIcons name="map-marker-radius" size={25} color="white"/>
                        </TouchableOpacity>


                    </View>
                    <View style={{
                        height: 45,
                        width: '100%',
                        justifyContent: 'center',
                        backgroundColor: Constants.purpleColor,
                    }}>
                        <TouchableOpacity style={{height: 45, width: '100%', backgroundColor: Constants.purpleColor}}
                                          onPress={() => {
                                              this.onLocationInputPress({
                                                  geometry: {
                                                      location: {
                                                          lat: global.curLocation.lat,
                                                          lng: global.curLocation.lng
                                                      }
                                                  }
                                              }, '')
                                          }}>
                            <View style={{
                                height: 45,
                                width: '100%',
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingLeft: 20
                            }}>
                                <MaterialIcons name="my-location" size={25} color={Constants.white}/>
                                <Text style={{fontSize: 15, color: Constants.white, marginLeft: 10}}>Current
                                    Location</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            flexWrap: 'wrap',
                            backgroundColor: '#fff'
                        }}>

                        <GooglePlacesInput
                            onPressItem={(data, details) => {

                                this.onLocationInputPress(data, details)
                            }}/>
                    </View>
                </Modal>
            </View>
        )
    }
}

export default PostRide


const styles = StyleSheet.create({
    iosMarkerStyle: {
        width: 30,
        height: 45,
        top: isIOS() ? -20 : 0,
    },
    mapStyle: {
        position: 'absolute',
        left: 0, right: 0, top: 0, bottom: 0,
    },
    imageCover: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'flex-start',
        alignItems: 'center',

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

    },
    textInput: {
        color: '#555',
        width: '100%',
        fontSize: 13,
    },
    mainBody: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        height: '55%',
        width: '85%',
        borderRadius: 30,
    },
    inputIcon: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '15%',
    },
    inputFromTo: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '85%',
    },


    buttonView: {
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
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#444',
        textAlign: 'center'
    },
})
