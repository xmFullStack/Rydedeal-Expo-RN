import React, {useState, useRef} from 'react'
import {
    StyleSheet,
    Image
} from 'react-native'

import {useFocusEffect} from '@react-navigation/native'
import MapView, {Marker, LocalTile, MarkerIcon} from 'react-native-maps';
import Constants, {isIOS} from '../../src/utils/Constants';

import MapViewDirections from 'react-native-maps-directions';

import {DirectionDataView, LocateMeButton} from '../../pages/customer/PostRide'


const meMarker = require('../../assets/me_marker.png')
const marker1 = require('../../assets/marker1.png')
const marker2 = require('../../assets/marker2.png')
const carMarker = require('../../assets/car_marker.png');
const customerMarker = require('../../assets/customer_marker.png');


export const getRegion = (locations) => {

    let center = null;
    let deltaLat = 0.5;
    let deltaLng = 0.5;

    //  let sumLat = 0; let sumLng =0;
    let maxLat = global.curLocation.lat;
    let minLat = global.curLocation.lat
    let maxLng = global.curLocation.lng;
    let minLng = global.curLocation.lng

    locations.forEach(item => {
        if (item) {
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
    let region = {
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: deltaLat > 360 ? deltaLat / 1.5 : deltaLat,
        longitudeDelta: deltaLng > 360 ? deltaLng / 1.5 : deltaLng,
    }
    return region;

}

export default RideMapView = ({
                                  rideItem,
                                  initialRegion = null,
                                  isInModal = false,
                                  bidList = null,
                                  showAcceptedDriverOnly = false,
                                  liveCustomerLocation=null,
                                  liveDriverLocation = null, // {latitude, longitude}
                                  liveDriverName = '',
                                  liveDriverDescription = '',
                                  locateMeTrigger = false,
                                  onTapGoToStart,
                                  onTapGoToEnd,
                              }) => {

    if (rideItem == null) {
        return null;
    }

    if (!initialRegion) {
        initialRegion = {
            latitude: global.curLocation.lat,
            longitude: global.curLocation.lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };
    }

    let fromAddr = rideItem.address_from
    let toAddr = rideItem.address_to

    let fromLocation = {
        latitude: rideItem.location_from.coordinates[1], longitude: rideItem.location_from.coordinates[0],
        lat: rideItem.location_from.coordinates[1], lng: rideItem.location_from.coordinates[0]
    };
    let toLocation = {
        latitude: rideItem.location_to.coordinates[1], longitude: rideItem.location_to.coordinates[0],
        lat: rideItem.location_to.coordinates[1], lng: rideItem.location_to.coordinates[0]
    };

    let customerLocation = null;
    let customerAddr = null;
    if (rideItem && rideItem.owner && rideItem.owner.profile && rideItem.owner.profile.location && rideItem.owner.profile.location.coordinates) {
        customerLocation = {
            latitude: rideItem.owner.profile.location.coordinates[1],
            longitude: rideItem.owner.profile.location.coordinates[0]
        }
        customerAddr = rideItem.owner.profile.address;
    }

    console.log('check', JSON.stringify(initialRegion))
    const [region, setRegion] = useState(initialRegion)
    const [distance, setDistance] = useState();
    const [duration, setDuration] = useState();
    const [wayPoints, setWayPoints] = useState([]);

    const [ distToPick, setDistToPick ] = useState(null);
    const [ timeToPick, setTimeToPick ] = useState(null);

    const mapViewRef = useRef();

    const [didMount, setDidMount] = useState(false)


    let intervalId = null;
  

    useFocusEffect(React.useCallback(() => {
        // trackingCallback();
        setDidMount(true)
        return () => {
            setDidMount(false)
            if (intervalId) {
                clearInterval(intervalId)
            }
        }
    }, []))

    React.useEffect(() => {
        if (didMount) {
            onTapLocateMe()
        }
    }, [locateMeTrigger])


    const onTapLocateMe = () => {
        let region = getRegion([fromLocation, toLocation, global.curLocation, ...wayPoints])
        setRegion(region)
        if (mapViewRef.current) {
            mapViewRef.current.animateToRegion(region, 500);
        }

    }

    const RenderLiveMarker = ({liveDriverLoc, liveCustomerLoc} ) => {

        if (Constants.isDriver()){
            if( liveCustomerLoc == null ){
                return null;
            }
            return <Marker
                        name={'owner_location'}
                        coordinate={liveCustomerLoc}
                        title={"Customer Location"}
                        anchor={{x: 0.5, y: 0.5}}
                        description={''}
                    >
                        <Image source={customerMarker} style={{width: 50, height: 50}}/>
                    </Marker>
        }else{
            if( liveDriverLoc == null ){
                return null;
            }
            return  <Marker
                        name={'driver_location'}
                        coordinate={liveDriverLoc}
                        title={"Driver Location"}
                        anchor={{x: 0.5, y: 0.5}}
                        description={''}
                    >
                        <Image source={carMarker} style={{width: 50, height: 50}}/>                        
                    </Marker>
        }
    
    }

    const RenderBidDriversMarker = ({liveDriverLocation, rideItem, bidList}) => {
         
        if(Constants.isCustomer() && !liveDriverLocation && rideItem.driver_id == null && bidList != null ){
            return bidList.map((bid, index) => {
                
                let loc = bid.driver && bid.driver.profile && bid.driver.profile.location && bid.driver.profile.location.coordinates ? bid.driver.profile.location.coordinates : null
                    
                if (!loc) return null;
                
                let location = {latitude: loc[1], longitude: loc[0]}
    
                let desc = rideItem.currency + '' + bid.price
    
                if (showAcceptedDriverOnly && !bid.accepted_at) {
                    return null;
                }
    
                return <Marker
                    name={bid.driver.name + '_' + index}
                    coordinate={location}
                    anchor={{x: 0.5, y: 0.5}}
                    title={Constants.ucfirst(bid.driver.first_name) + ' ' + Constants.ucfirst(bid.driver.last_name)}
                    description={desc}
                >
                    <Image source={carMarker} style={{width: 50, height: 50}}/>
                </Marker>
            })
        }else{
            return null;
        }        
    }

    const RenderMeMarker  = ({liveDriverLocation, liveCustomerLocation}) => {

        let myLoc = null;
        if ( Constants.isDriver() ){
            myLoc = liveDriverLocation;
        }else if (Constants.isCustomer()){
            myLoc = liveCustomerLocation;
        }

        if (myLoc == null){
            return null;
        }
        return <Marker
                name="Me"
                // icon={meMarker}
                // image={meMarker}
                coordinate={myLoc}
                title={"Me"}
                onPress={(event) => {

                }}
                anchor={{x: 0.5, y: 0.5}}
                description={"I'm Here."}>
                <Image source={meMarker} style={{width: 80, height: 80}}/>
            </Marker>
    }

    return <>
        <MapView
            ref={mapViewRef}
            style={styles.mapStyle}
            initialRegion={initialRegion}
            // region={region}
            onPress={event => {
                console.log('coordinate: ', event.nativeEvent.coordinate)
            }}
            onRegionChange={(event) => {
            }}
        >

            <RenderMeMarker liveDriverLocation={liveDriverLocation} liveCustomerLocation={liveCustomerLocation}/>
                    
            <RenderLiveMarker liveDriverLoc={liveDriverLocation} liveCustomerLoc={liveCustomerLocation} />

            <RenderBidDriversMarker liveDriverLocation={liveDriverLocation} rideItem={rideItem} bidList={bidList}/>
         

            <Marker
                name="From"
                coordinate={fromLocation}
                title={"From"}
                anchor={{x: 0.5, y: 1}}
                description={fromAddr}
                onPress={(event) => {
                    if (onTapGoToStart) {
                        onTapGoToStart();
                    }
                }}
            >
                <Image source={marker1} style={styles.iosMapMarker}/>
            </Marker>

            <Marker
                name="To"
                coordinate={toLocation}
                title={"To"}
                anchor={{x: 0.5, y: 1}}
                onPress={(event) => {
                    if (onTapGoToEnd) {
                        onTapGoToEnd();
                    }
                }}
                description={toAddr}>
                <Image source={marker2} style={styles.iosMapMarker}/>
            </Marker>


            <MapViewDirections
                origin={rideItem.began_at != null && rideItem.completed_at == null && liveDriverLocation != null ? liveDriverLocation : fromLocation}
                destination={toLocation}
                apikey={Constants.GoogleApiKey}
                strokeWidth={5}
                strokeColor="#2C80BE"
                mode={"DRIVING"}
                onStart={(origin, destination, waypoints) => {
                }}
                onReady={(dirRes) => {

                    let points = dirRes.coordinates.length > 0 ? dirRes.coordinates.map(item => {
                        return {lat: item.latitude, lng: item.longitude}
                    }) : [];
                    let dirDistance = dirRes.distance;
                    let dirDuration = dirRes.duration;

                    try {
                        dirDistance = dirDistance.toFixed(3);
                    } catch (e) {
                        dirDistance = 0;
                        console.log('Exception RideMapModal.js; line 214:', e)
                    }

                    try {
                        dirDuration = dirDuration.toFixed(2);
                    } catch (e) {
                        dirDuration = 0;
                        console.log('Exception in RideMapModal.js line 220:', e)
                    }

                    setDistance(dirDistance);
                    setDuration(dirDuration);
                    setWayPoints(points);

                    let region = getRegion([fromLocation, toLocation, global.curLocation, ...points])

                    setRegion(region)
                    if (mapViewRef && mapViewRef.current) {
                        mapViewRef.current.animateToRegion(region, 500);
                    }
                    console.log(' onReady:  distance ', dirRes.distance, ' duration', dirRes.duration, ' route:', dirRes.coordinates)
                }}
            />

           
        {
            (liveDriverLocation != null && rideItem.began_at == null && rideItem.completed_at == null 
            ||  (rideItem.driver_id == null && liveDriverLocation && Constants.isDriver())
            || (rideItem.driver_id == global.curUser.id && Constants.isDriver())
            ) ? 
            <MapViewDirections
                origin={liveDriverLocation}
                destination={fromLocation}
                apikey={Constants.GoogleApiKey}
                strokeWidth={5}
                strokeColor={Constants.purpleColor}
                mode={"DRIVING"}
                onStart={(origin, destination, waypoints) => {
                }}
                onReady={(dirRes) => {

                    let points = dirRes.coordinates.length > 0 ? dirRes.coordinates.map(item => {
                        return {lat: item.latitude, lng: item.longitude}
                    }) : [];
                    let dirDistance = dirRes.distance;
                    let dirDuration = dirRes.duration;

                    try {
                        dirDistance = dirDistance.toFixed(3);
                    } catch (e) {
                        dirDistance = 0;
                        console.log('Exception RideMapModal.js; line 214:', e)
                    }

                    try {
                        dirDuration = dirDuration.toFixed(2);
                    } catch (e) {
                        dirDuration = 0;
                        console.log('Exception in RideMapModal.js line 220:', e)
                    }

                    setDistToPick(dirDistance);
                    setTimeToPick(dirDuration);

                }}
            /> : null
            
        }


        </MapView>

        <DirectionDataView
            fromAddr={fromAddr}
            toAddr={toAddr}
            country_code={rideItem && rideItem.city ? rideItem.city.country_code : null}
            isInModal={isInModal}
            isShowMinPrice={false}
            isShowFeeData={false}
            distance={distance}
            duration={duration}
            minPrice={rideItem.price_min}
            currency={rideItem.currency}

            rideItem={rideItem}
            distToPick={distToPick}
            durationToPick={timeToPick}
        />

        {
            isInModal ?
                <LocateMeButton isInModal={isInModal} onMyLocationPress={() => {
                    onTapLocateMe()
                }}/>
                : null
        }


    </>

}


const styles = StyleSheet.create({
    iosMapMarker: {

        width: 30,
        height: 45,
        top: isIOS() ? -20 : 0,

    },
    mapStyle: {
        position: 'absolute',
        left: 0, top: 0,
        width: Constants.WINDOW_WIDTH,
        height: Constants.WINDOW_HEIGHT,
    },
})
