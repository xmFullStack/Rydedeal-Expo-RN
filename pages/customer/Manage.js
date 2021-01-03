import React, {Component} from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    TouchableHighlight,
    KeyboardAvoidingView,
    SafeAreaView,
    SectionList,
    ScrollView,
    StyleSheet,
    Dimensions,
    Platform,
    StatusBar
} from 'react-native'
import {NavigationContext} from '@react-navigation/native'
import HeaderBar from '../../src/components/HeaderBar';

import RestAPI from '../../src/utils/RestAPI';
import Constants, {StatusBarHeight, isIOS} from '../../src/utils/Constants';
import moment from 'moment'
import {EmptyHolder} from './RideDetail'
import {MaterialIcons} from '@expo/vector-icons';
import {BallIndicator} from 'react-native-indicators';
import PagerIndicator from '../../src/components/PagerIndicator';
import ZStatusBar from '../../src/components/ZStatusBar';

let windowHeight = Dimensions.get('screen').height;
let windowWidth = Dimensions.get('screen').width;


export const ItemManage = props => {

    const {item, index, section, onPressItem, isShowCompletedBegan = true} = props;
    if (!item) {
        return null
    }

    let timeFrom = moment(item.time_from, 'YYYY-MM-DD HH:mm:ss', true).format('ddd, MMM Do, HH:mm')
    let createdAt = moment(item.time_from, 'YYYY-MM-DD HH:mm:ss', true).format('Do MMM')
    let idPrefix = moment(item.time_from, 'YYYY-MM-DD HH:mm:ss', true).format('YYMMDD')
    let rideId = idPrefix + item.id
    let rideType = item && item.type ? item.type.title : 'Unknown'
    let address_from = item ? Constants.shortString(item.address_from, 70) : ''
    let address_to = item ? Constants.shortString(item.address_to, 70) : ''

    let isBegan = item.began_at && !item.completed_at;
    let isCompleted = item.completed_at != null ? true : false

    let isAccepted = item.accepted_at !== null ? true : false;

    let badgeItem = item.bidCount + ' drivers';
    let badgeColor = Constants.purpleColor;
    if (isCompleted) {
        badgeItem = 'Completed';
        badgeColor = Constants.green;
    } else if (isBegan) {
        badgeItem = 'Began';
        badgeColor = Constants.purpleColor;
    } else if (isAccepted) {
        badgeItem = 'Accepted'
        badgeColor = Constants.purpleColor;
    } else {
        badgeItem = item.bidCount + ' Bids';
        if (item.bidCount > 0) {
            badgeColor = Constants.purpleColor;
        } else {
            badgeColor = Constants.grayColor;
        }

    }


    let leftBorderColor = isBegan ? Constants.purpleColor : (isCompleted ? Constants.green : Constants.transparent)
    let borderLeftWidth = leftBorderColor === Constants.transparent ? 0 : 5;

    return (
        <TouchableOpacity onPress={() => onPressItem(item)}>
            <View style={{...styles.itemBody}}>
                <View style={{
                    position: 'absolute',
                    left: -4,
                    top: 30,
                    bottom: 30,
                    width: 5,
                    backgroundColor: leftBorderColor,
                    borderRadius: 3
                }}>
                </View>
                <View style={styles.itemLeft}>
                    <Text style={{fontWeight: 'bold', fontSize: 18}}>
                        {timeFrom}
                    </Text>
                    <Text style={{fontSize: 12, paddingTop: 5}}>Posted On: {createdAt} | {rideType}</Text>
                    <View
                        style={{
                            flexDirection: 'row', justifyContent: 'flex-start', marginTop: 20, alignItems: 'center',
                            width: '100%', height: 15, paddingRight: 10,
                        }}>
                        <View style={{borderWidth: 5, borderRadius: 15, width: 15, height: 15, borderColor: 'blue'}}/>
                        <Text style={{fontSize: 13, paddingLeft: 10}}>{address_from}</Text>
                    </View>
                    <View style={{paddingLeft: 5}}>
                        <Text>|</Text>
                        <Text>|</Text>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',
                            width: '100%', height: 15, paddingRight: 10
                        }}>
                        <View style={{borderWidth: 5, borderRadius: 15, width: 15, height: 15, borderColor: 'green'}}/>
                        <Text style={{fontSize: 13, paddingLeft: 10}}>{address_to}</Text>
                    </View>
                </View>
                <View style={styles.itemRight}>
                    <Text style={{fontSize: 13, fontWeight: 'bold', color: '#999'}}>#{rideId}</Text>

                    <Text style={{fontSize: 14, fontWeight: 'bold', color: badgeColor}}>{badgeItem}</Text>

                    <Text style={{
                        fontSize: 15,
                        fontWeight: 'bold',
                        color: Constants.purpleColor
                    }}>{item.currency}{item.price_min}</Text>

                </View>
            </View>
        </TouchableOpacity>
    )
}

export const ItemManageSelected = (props) => {
    const {item, index, section} = props

    if (item == null) {
        return null
    }
    let timeFrom = moment(item.time_from, 'YYYY-MM-DD HH:mm:ss', true).format('ddd, MMM Do, HH:mm')
    let createdAt = moment(item.time_from, 'YYYY-MM-DD HH:mm:ss', true).format('Do MMM')
    let idPrefix = moment(item.time_from, 'YYYY-MM-DD HH:mm:ss', true).format('YYMMDD')
    let rideId = idPrefix + item.id
    let rideType = item && item.type ? item.type.title : 'Unknown'
    let address_from = item ? Constants.shortString(item.address_from, 70) : ''
    let address_to = item ? Constants.shortString(item.address_to, 70) : ''

    return (
        <TouchableOpacity>
            <View style={styles.itemBody1}>
                <View style={styles.itemLeft}>
                    <Text style={{fontWeight: 'bold', color: 'white', fontSize: 18}}>{timeFrom}</Text>
                    <Text style={{fontSize: 12, color: 'white', paddingTop: 5}}>Posted
                        On: {createdAt} | {rideType}</Text>
                    <View
                        style={{
                            flexDirection: 'row', justifyContent: 'flex-start', marginTop: 20, alignItems: 'center',
                            width: '100%', height: 15,
                        }}>0
                        <View style={{
                            borderWidth: 5,
                            borderRadius: 15,
                            width: 15,
                            height: 15,
                            borderColor: 'blue',
                            backgroundColor: 'white'
                        }}/>
                        <Text style={{
                            fontSize: 13,
                            color: 'white',
                            paddingLeft: 10,
                            paddingRight: 10,
                        }}>{address_from}</Text>
                    </View>
                    <View style={{paddingLeft: 5}}>
                        <Text style={{color: 'white',}}>|</Text>
                        <Text style={{color: 'white',}}>|</Text>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',
                            width: '100%', height: 15, paddingRight: 10,
                        }}>
                        <View style={{
                            borderWidth: 5,
                            borderRadius: 15,
                            width: 15,
                            height: 15,
                            borderColor: 'green',
                            backgroundColor: 'white'
                        }}/>
                        <Text style={{fontSize: 13, color: 'white', paddingLeft: 10}}>{address_to}</Text>
                    </View>
                </View>
                <View style={styles.itemRight}>
                    <Text style={{fontSize: 15, color: 'white', fontWeight: 'bold'}}>#{rideId}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

class Manage extends Component {

    static contextType = NavigationContext;

    state = {
        isLoading: false,

        curPage: 1,
        lastPage: 1,
        totalLength: 0,
        rideList: [],
        filterIndex: 0,
    }


    componentDidMount() {
        const navigation = this.context
        this._unsubscribe = navigation.addListener('focus', () => {
            // do something
            global.currentScreen = "Manage"
            this.loadData();
        });

    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    loadData = () => {
        if (this.state.isLoading) {
            return;
        }
        this.setState({isLoading: true})
        let is_completed = null;
        if (this.state.filterIndex == 1) {
            is_completed = 0
        }
        if (this.state.filterIndex == 2) {
            is_completed = 1
        }

        RestAPI.getRideList(this.state.curPage, is_completed).then(res => {

            if (res.success == 1) {
                let newData = res.data.data
                if (this.state.curPage > 1 && this.state.rideList.length > 0) {
                    newData = [...this.state.rideList[0].data, ...newData]
                }
                this.setState({
                    lastPage: res.data.last_page,
                    totalLength: res.data.total,
                    rideList: [{title: 'Rides', key: 0, data: newData}]
                })

            } else {
                failed('Oops', res.msg)
            }
        }).catch(err => {
            console.log(err)
            failed('Oops', 'Some errors are occured while fecthing ride list. please try again.')
        }).finally(() => {
            this.setState({isLoading: false})
        })
    }

    loadNextPage = () => {

        let {isLoading, curPage, lastPage} = this.state
        if (isLoading) {
            return;
        }
        if (curPage < lastPage) {
            this.setState({curPage: curPage + 1}, () => {
                this.loadData();
            })
        } else {
            console.log('Loaded all list from server, for ride list.')
        }
    }

    goToDetail = (itemId) => {
        const navigation = this.context

        navigation.navigate('ride_detail', {item_id: itemId, onCancelRide: this.onCancelRide.bind(this)})
    }

    onTapFilterItem = (index, title) => {
        if (!this.state.isLoading) {
            this.setState({filterIndex: index, curPage: 1}, () => {
                this.loadData();
            })
        }
    }
    onCancelRide = (canceledRideId) => {
        let list = this.state.rideList
        if (list.length > 0) {
            let data = list[0].data

            let newList = [];
            data.forEach((item, index) => {
                if (item.id != canceledRideId) {
                    newList.push(item)
                }
            })
            this.setState({rideList: [{title: 'Rides', key: 0, data: newList}]})

        } else {
            return
        }


    }

    render() {
        const navigation = this.context

        return (
            <View style={styles.container}>
                {/* <ZStatusBar/> */}
                <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
                <View style={styles.mainContainer}>
                    <PagerIndicator titleList={['All', 'Pending', 'Completed']} tabIndex={this.state.filterIndex}
                                    onTapItem={this.onTapFilterItem} itemWidth={'33%'}/>
                    <EmptyHolder
                        placeholder="No Accepted Rides."
                        isShow={!this.state.isLoading && (this.state.rideList.length <= 0 || this.state.rideList[0].data.length <= 0)}
                        onPressRefresh={() => this.loadData()}
                    />{
                    this.state.isLoading ? <BallIndicator color={Constants.purpleColor} size={40}/> :
                        <SectionList
                            contentContainerStyle={{paddingBottom: 20}}
                            renderSectionHeader={({section: {title}}) => {
                            }}
                            renderItem={({item, index, section}) =>
                                <ItemManage item={item} index={index} section={section} onPressItem={(itemObj) => {
                                    this.goToDetail(item.id)
                                }}/>}
                            sections={this.state.rideList}
                            keyExtractor={(item, index) => index + '-' + item.id}
                            onRefresh={() => {
                                this.setState({curPage: 1}, () => {
                                    this.loadData()
                                })
                            }}
                            refreshing={this.state.isLoading}
                            onEndReachedThreshold={0.5}
                            onEndReached={(offset) => {
                                console.log('End reached: Offset is :', offset)
                                this.loadNextPage()
                            }}
                        />
                }

                </View>
                <HeaderBar
                    title="Manage Rides"
                    onLeftButton={() => {
                        navigation.toggleDrawer();
                    }}
                    rightIcon={this.state.isLoading ? <BallIndicator color={Constants.purpleColor} size={20}/> : null}
                    onRightButton={() => {
                        if (this.state.isLoading) {

                        } else {
                            navigation.navigate('user_detail')
                        }
                    }}
                />

            </View>
        )
    }
}

export default Manage

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        paddingTop: 50,
        marginTop: isIOS() ? StatusBarHeight : 0,
        height: windowHeight,
        width: windowWidth,

    },
    mainContainer: {

        height: Constants.WINDOW_HEIGHT - 80,
        width: windowWidth,
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        alignItems: 'center',
    },
    itemBody: {
        marginTop: 10,
        marginHorizontal: 5,
        height: 180,
        width: windowWidth * 0.9,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingRight: 10,
        ...Constants.style.defaultShadow,

        zIndex: 1,
    },
    itemBody1: {
        marginTop: 10,
        height: 180,
        width: windowWidth * 0.9,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6733bb',
        borderRadius: 20,
        borderWidth: 0.7,
        borderColor: '#ddd',
    },
    itemLeft: {
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 20,
        paddingRight: 10
    },
    itemRight: {
        position: 'absolute',
        top: 10,
        right: 15,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-end'
    }


})