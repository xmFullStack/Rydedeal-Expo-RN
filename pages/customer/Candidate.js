import React, {Component} from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    StyleSheet,
    Dimensions,

} from 'react-native'

import {Avatar, Image} from "react-native-elements";
import Constants from '../../src/utils/Constants';
import {Linking} from 'expo';
import {AirbnbRating} from 'react-native-ratings';
import {PulseIndicator, BallIndicator} from 'react-native-indicators';

let windowHeight = Dimensions.get('screen').height;
let windowWidth = Dimensions.get('screen').width;


export const ItemCandidate = ({itemBid, ride, currency, isCancellingBid, index, section, onPressReview, onAcceptDriver, onPressCancelBidFromCustomer}) => {

    if (!itemBid || !itemBid.driver) {

        return null;
    }
    let carProfile = itemBid.driver ? itemBid.driver.car : null;
    let avatar = Constants.DefaultAvatar;
    if (itemBid.driver.profile && itemBid.driver.profile.avatar) {
        avatar = {uri: itemBid.driver.profile.avatar}
    }


    let driver = itemBid.driver;
    let ratingAvg = Constants.numberToFix2(driver.rating_avg);

    let driverName = Constants.ucfirst(driver.first_name) + ' ' + Constants.ucfirst(driver.last_name);
    let email = driver.email;
    let phone = driver.phone_number;

    let currencyStr = currency.toUpperCase();
    let priceOfDriver = itemBid.price;

    let isAccepted = itemBid.accepted_at != null

    let isBeganByThisDriver = ride.driver_id == itemBid.driver_id && ride.began_at != null && ride.completed_at != null;

    const onTapCall = () => {
        const tel = phone.replace(/-/g, '');
        const url = `tel:${tel}`

        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(url)
                        .catch((err) => {
                            failed('Oops', 'Phone call is not supported. ' + JSON.stringify(err))
                        });
                }
            });

    }

    let acceptReviewBtnTitle = ''

    if (Constants.isDriver()) {
        acceptReviewBtnTitle = '';
    } else {
        if (isAccepted) {
            acceptReviewBtnTitle = 'Complete';
        } else {
            acceptReviewBtnTitle = 'Accept';
        }
    }

    const onPressCancelBid = () => {

        if (ride.completed_at) {
            alert('Completed Ride', 'This ride was completed already.')
            return;
        }
        if (onPressCancelBidFromCustomer) {
            confirm('Cancel Bid', 'Are you sure to decline this?', () => {
                onPressCancelBidFromCustomer(itemBid.id);
            }, () => {
            })

        }
    }

    const onTapReview = () => {
        onPressReview(itemBid);
    }


    const onTapAccept = () => {

        if (Constants.isDriver()) {

        } else {
            if (isAccepted) {

            } else {
                onAcceptDriver(itemBid);
            }
        }

    }

    const defCarAvatar = <Avatar
        rounded
        source={Constants.default_car}
        size={40}

    />


    return (
        <View style={styles.itemContainer}>
            <View style={styles.itemBody}>
                <View style={styles.itemDate}>
                    <View style={{flexDirection: 'column', alignItems: 'center', paddingHorizontal: 5}}>
                        <Avatar
                            rounded
                            containerStyle={{marginBottom: 10}}
                            source={avatar}
                            size={40}
                        />


                    </View>


                    <View style={styles.itemInfor}>

                        <Text style={{
                            fontSize: 17,
                            color: '#555',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            marginBottom: 5,
                        }}>
                            {driverName}
                        </Text>
                        <AirbnbRating
                            size={12}
                            isDisabled={true}
                            defaultRating={ratingAvg}
                            showRating={false}
                        />
                        {/* <Text style={{fontSize: 14, marginBottom:3,color:'#888'}}>
                                {email}
                            </Text> */}
                        <Text style={{fontSize: 15, color: '#777'}}>
                            Phone: {phone}
                        </Text>
                    </View>
                </View>


                <View style={styles.itemPrice}>

                    <Text style={{fontSize: 17, color: '#6733bb', fontWeight: 'bold', textAlign: 'center'}}>
                        {currencyStr}{priceOfDriver}
                    </Text>
                </View>
            </View>
            <View style={{...styles.itemBody, marginTop: 5}}>
                <View style={styles.itemDate}>
                    <View style={{flexDirection: 'column', alignItems: 'center', paddingHorizontal: 5}}>
                        <Avatar
                            rounded
                            source={carProfile ? {uri: carProfile.photo} : Constants.default_car}
                            containerStyle={{backgroundColor: Constants.white}}
                            size={40}
                            renderPlaceholderContent={defCarAvatar}
                        />


                    </View>


                    <View style={styles.itemInfor}>

                        <Text style={{
                            fontSize: 15,
                            color: '#555',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            marginBottom: 5,
                        }}>
                            {carProfile ? carProfile.name : ''}
                        </Text>

                        <Text style={{fontSize: 14, marginBottom: 3, color: '#888'}}>
                            {carProfile ? carProfile.year_of_model : ''}
                        </Text>

                    </View>
                </View>

            </View>
            <View style={styles.buttonBody}>

                {
                    isBeganByThisDriver ?
                        <TouchableOpacity style={styles.submitReview} onPress={() => onTapReview()}>
                            <Text style={{color: Constants.purpleColor, fontSize: 11,}}> Review </Text>
                        </TouchableOpacity> : null
                }
                {
                    ride.completed_at == null && !isBeganByThisDriver ?
                        (isCancellingBid == false ?
                                <TouchableOpacity style={styles.submitButtonCancel} onPress={() => onPressCancelBid()}>
                                    <Text style={{color: Constants.googleColor, fontSize: 11,}}> Decline </Text>
                                </TouchableOpacity> :
                                <View style={styles.declineLoader}>
                                    <BallIndicator color={Constants.purpleColor} size={30}/>
                                </View>

                        )
                        : null
                }

                {
                    ride.driver_id && ride.driver_id != driver.id || ride.completed_at != null || isAccepted ? null :
                        <TouchableOpacity style={styles.submitButton}
                                          disabled={ride.driver_id && ride.driver_id != driver.id} onPress={() => {
                            onTapAccept()
                        }}>
                            <Text style={styles.submitButtonText}> Accept </Text>
                        </TouchableOpacity>
                }

                <TouchableOpacity style={styles.submitButtonCall} onPress={() => onTapCall()}>
                    <Text style={styles.submitButtonText}> Call </Text>
                </TouchableOpacity>

            </View>
        </View>

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
        height: windowHeight * 0.8,
        width: windowWidth,
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        alignItems: 'center',
    },
    itemContainer: {
        marginTop: 10,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        // height: 160,
        marginHorizontal: 20,
        width: Constants.WINDOW_WIDTH - 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: 'white',
    },
    itemBody: {
        // height: 100,        
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonBody: {
        height: 50,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 8,

    },
    itemDate: {
        // paddingLeft: 20,
        // width: 100,
        // height: 80,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    itemInfor: {
        paddingLeft: 10,
        // height: '60%',
        // width: '55%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemPrice: {
        // height: '100%',
        // width: '20%',
        position: 'absolute',
        top: 0,
        right: 0,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',

    },

    submitButton: {
        marginRight: 5,
        backgroundColor: '#6733bb',
        height: 35,
        paddingHorizontal: 5,
        width: 70,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitButtonCall: {
        marginRight: 10,
        backgroundColor: '#119F3B',
        height: 35,
        width: 70,
        paddingHorizontal: 5,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitButtonText: {
        fontSize: 11,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    submitReview: {
        marginRight: 5,
        backgroundColor: 'white',
        height: 35,
        paddingHorizontal: 5,
        width: 70,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: Constants.purpleColor,
        borderWidth: 1,
    },
    submitButtonCancel: {
        marginRight: 5,
        backgroundColor: 'white',
        height: 35,
        paddingHorizontal: 5,
        width: 70,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: Constants.googleColor,
        borderWidth: 1,
    },
    declineLoader: {
        marginRight: 5,
        backgroundColor: 'white',
        height: 35,
        paddingHorizontal: 5,
        width: 70,

        justifyContent: 'center',
        alignItems: 'center',

    }
})