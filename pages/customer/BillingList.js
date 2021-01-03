import React, {Component, useState} from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    SectionList,

    StyleSheet,
    Platform,

} from 'react-native'
import {useFocusEffect} from '@react-navigation/native'
import HeaderBar from '../../src/components/HeaderBar';
import RestAPI from '../../src/utils/RestAPI';
import Constants, {StatusBarHeight} from '../../src/utils/Constants';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MaterialCommunityIcons, MaterialIcons, Octicons} from '@expo/vector-icons';
import {EmptyHolder} from './RideDetail'
import ZStatusBar from '../../src/components/ZStatusBar';
import {BallIndicator} from 'react-native-indicators';


export const ItemBillingMethod = props => {

    const {last4, item, index, section, onPressRemove, isDefault, onTapDefault} = props

    const onTapRemove = () => {
        if (onPressRemove) {
            onPressRemove(item.id, last4)
        }
    }

    return (
        <View style={isDefault ? styles.itemBodyDefault : styles.itemBody}>
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >

                <View style={styles.itemLeft}>
                    <Text style={{fontWeight: 'bold', fontSize: 18, color: isDefault ? 'white' : 'black'}}>
                        **** **** **** {last4}
                    </Text>
                </View>
                <View style={{flexDirection: 'row', paddingRight: 5}}>
                    {
                        isDefault ? null :
                            <TouchableOpacity style={{paddingTop: 2,}} onPress={() => onTapDefault(item.id)}>
                                <View style={styles.itemRight}>
                                    <Octicons name="checklist" size={22} color={Constants.purpleColor}/>
                                </View>
                            </TouchableOpacity>
                    }

                    <TouchableOpacity onPress={onTapRemove}>
                        <View style={styles.itemRight}>
                            <MaterialCommunityIcons name="trash-can-outline" size={22}
                                                    color={isDefault ? 'white' : Constants.purpleColor}/>
                        </View>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    )
}

export default function BillingList({route, navigation}) {

    let [isLoading, setIsLoading] = useState(false)
    let [billingList, setBillingList] = useState([])
    let [defaultPmId, setDefaultPmId] = useState(null)
    const loadData = () => {
        setIsLoading(true)
        RestAPI.getBillingMethods().then(res => {
            if (res.success == 1) {

                if (res.data && res.data.paymentMethods) {
                    setBillingList([{title: 'Billing Methods', key: 1, data: res.data.paymentMethods.data}])
                    setDefaultPmId(res.data.default)
                    global.curUser.paymentMethods = res.data.paymentMethods.data;
                    global.curUser.defaultPaymentMethod = res.data.default;
                } else {
                    setBillingList([{title: 'Billing Methods', key: 1, data: []}])
                }
            } else {
                failed('Oops', 'Failed to fetch billing list.')
            }
        }).catch(err => {
            failed('Oops', 'Some errors are occured while fetching billing list. try again after a moment.')
        }).finally(() => {
            setIsLoading(false)
        })
    }

    useFocusEffect(React.useCallback(() => {
        loadData()
        global.currentScreen = 'BillingMethod'
        return () => {
        }
    }, []))

    const onRemovePM = (pmId, last4) => {

        confirm('Confirm', 'Are you going to remove this payment method : **** ' + last4, () => {
            setIsLoading(true)
            RestAPI.removePayment(pmId).then(res => {
                if (res.success == 1) {
                    loadData()
                } else {
                    failed('Oops', 'Failed to remove payment method.')
                }
            }).catch(err => {
                failed('Oops', 'Some errors are occured while removing. please try again.')
            }).finally(() => {
                setIsLoading(false)
            })
        }, () => {

        })


    }

    const onPressDefault = (pmId) => {
        setIsLoading(true)
        RestAPI.setDefaultPayment(pmId).then(res => {
            if (res.success == 1) {
                loadData();
            } else {
                failed('Oops', 'Failed to set default payment method.')
            }
        }).catch(err => {
            console.log(err)
            failed('Oops', 'Some errors are occured while setting default method. please try again.')
        }).finally(() => {
            setIsLoading(false)
        })
    }


    return (

        <View style={styles.container}>
            {/* <ZStatusBar/>             */}
            <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
            <View style={styles.mainContainer}>
                {
                    isLoading ? <BallIndicator color={Constants.purpleColor} size={45}/> :
                        <>
                            <EmptyHolder
                                onPressRefresh={() => {
                                    loadData()
                                }}
                                placeholder="There is no any method, please add new method."
                                isShow={billingList.length <= 0 || billingList[0].data.length <= 0}/>

                            <SectionList
                                renderSectionHeader={({section: {title}}) => {
                                }}
                                renderItem={({item, index, section}) =>
                                    <ItemBillingMethod
                                        last4={item.card.last4}
                                        item={item}
                                        index={index}
                                        section={section}
                                        isDefault={defaultPmId == item.id}
                                        onTapDefault={(pmId) => {
                                            onPressDefault(pmId)
                                        }}
                                        onPressRemove={(pmId, last4) => {
                                            onRemovePM(pmId, last4)
                                        }}
                                    />}
                                sections={billingList}
                                keyExtractor={(item, index) => index + '-' + item.id}
                                onRefresh={() => {
                                    loadData()
                                }}
                                refreshing={false}
                                onEndReached={(offset) => {

                                }}
                            />
                        </>
                }

            </View>
            <HeaderBar
                title="Billing Methods"
                rightIcon={<MaterialIcons name="library-add" size={28} color={Constants.purpleColor}/>}
                onLeftButton={() => {
                    navigation.toggleDrawer();
                }}
                onRightButton={() => {
                    navigation.navigate('add_card')
                }}
            />

        </View>

    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        paddingTop: 70,
        height: Constants.WINDOW_HEIGHT - StatusBarHeight,
        width: '100%',
        marginTop: Platform.OS == 'ios' ? StatusBarHeight : 0
        // borderWidth:1, borderColor:'red',
    },
    mainContainer: {
        marginTop: 10,
        width: Constants.WINDOW_WIDTH,
        height: Constants.WINDOW_HEIGHT,
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        alignItems: 'center',
        // borderColor:'red', borderWidth:2,
    },

    itemBody: {
        marginHorizontal: 15,
        marginVertical: 5,
        height: 50,
        width: Constants.WINDOW_WIDTH - 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 0.7,
        borderColor: '#ddd',

        shadowColor: "#666",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.5,
        shadowRadius: 15.00,
        elevation: 5,
        zIndex: 1,
    },

    itemBodyDefault: {
        marginHorizontal: 15,
        marginVertical: 5,
        height: 50,
        width: Constants.WINDOW_WIDTH - 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Constants.purpleColor,
        borderRadius: 20,
        borderWidth: 0.7,
        borderColor: '#ddd',

        shadowColor: "#666",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.5,
        shadowRadius: 15.00,
        elevation: 5,
        zIndex: 1,
    },

    itemLeft: {

        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 25,
    },
    itemRight: {
        marginRight: 8,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    }


})