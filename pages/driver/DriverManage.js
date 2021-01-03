import React, {Component, useEffect, useState} from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    TouchableHighlight,
    KeyboardAvoidingView,

    SectionList,
    ScrollView,
    StyleSheet,
    Dimensions
} from 'react-native'
import {ItemManage} from '../customer/Manage';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {setAutoFocusEnabled} from 'expo/build/AR';
import RestAPI from '../../src/utils/RestAPI'
import HeaderBar from '../../src/components/HeaderBar';

import {EmptyHolder} from '../customer/RideDetail'
import Constants, {StatusBarHeight} from '../../src/utils/Constants';
import {SafeAreaView} from 'react-native-safe-area-context';
import PagerIndicator from '../../src/components/PagerIndicator';
import ZStatusBar from '../../src/components/ZStatusBar';
import {BallIndicator} from 'react-native-indicators';

let windowHeight = Dimensions.get('screen').height;
let windowWidth = Dimensions.get('screen').width;

export default DriverManage = () => {

    const navigation = useNavigation();
    const route = useRoute();

    let [isLoading, setIsLoading] = useState(false)
    let [curPage, setCurPage] = useState(1)
    let [lastPage, setLastPage] = useState(1)
    let [total, setTotal] = useState(0)

    let [rideList, setRideList] = useState([])
    let [filterIndex, setFilterIndex] = useState(0)

    useFocusEffect(React.useCallback(() => {

        // loadData();
        global.reloadManageData = loadData.bind(this);
        global.currentScreen = 'driver_manage'

        return () => {

        }
    }, []))

    useEffect(() => {
        loadData()
    }, [curPage, filterIndex])

    const loadData = () => {
        if (isLoading) {
            return;
        }
        setIsLoading(true)

        let is_completed = null;
        if (filterIndex === 1) {
            is_completed = 0
        }
        if (filterIndex === 2) {
            is_completed = 1;
        }
        // console.log('is_completed:', is_completed)
        // console.log('filterIndex:', filterIndex)
        // warn('is_completed:, filterindex:' + filterIndex, JSON.stringify(is_completed))
        RestAPI.getDriverRides(curPage, is_completed).then(res => {

            if (res.success == 1) {

                setLastPage(res.data.bids.last_page)
                setTotal(res.data.bids.total)
                // setCurPage( res.data.bids.current_page)

                setRideList([{title: 'Rides', key: 0, data: res.data.rides}])

            } else {
                failed('Oops', res.msg)
            }
        }).catch(err => {
            console.log(err)
            failed('Oops', 'Some errors are occured while fecthing ride list. please try again')
        }).finally(() => {
            setIsLoading(false)
        })
    }


    const goToDetail = (item) => {
        navigation.navigate('driver_manage_detail', {item: item})
    }

    const onTapFilterItem = (index, title) => {
        if (!isLoading) {
            setCurPage(1)
            setFilterIndex(index)
        }
    }


    return <>
        {/* <ZStatusBar/> */}
        <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>

                <View style={styles.mainContainer}>
                    <PagerIndicator titleList={['All', 'Pending', 'Completed']} tabIndex={filterIndex}
                                    onTapItem={(index, title) => {
                                        onTapFilterItem(index, title)
                                    }} itemWidth={'33%'}/>
                    {
                        isLoading ? <BallIndicator color={Constants.purpleColor} size={40}/> :
                            <>
                                <SectionList
                                    contentContainerStyle={{paddingBottom: StatusBarHeight}}
                                    renderSectionHeader={({section: {title}}) => {
                                    }}
                                    renderItem={({item, index, section}) =>
                                        <ItemManage
                                            item={item}
                                            index={index}
                                            section={section}
                                            onPressItem={(itemObj) => {
                                                goToDetail(item)
                                            }}
                                        />
                                    }
                                    sections={rideList}
                                    keyExtractor={(item, index) => index + '-' + item.id}
                                    onRefresh={() => {

                                        if (curPage == 1) {
                                            loadData();
                                        } else {
                                            setCurPage(1)
                                        }

                                    }}
                                    onEndReachedThreshold={0.5}
                                    refreshing={isLoading}
                                    onEndReached={(offset) => {
                                        if (curPage < lastPage) {
                                            console.log(curPage, '<', lastPage)
                                            setCurPage(curPage + 1)
                                        }
                                    }}
                                />
                                <EmptyHolder
                                    placeholder="There is no any rides where you bid."
                                    isLoading={isLoading}
                                    isShow={rideList.length == 0 || rideList[0].data.length == 0}
                                    onPressRefresh={() => {
                                        loadData()
                                    }}/>
                            </>
                    }


                </View>
                <HeaderBar
                    title="Manage Rides"
                    onLeftButton={() => {
                        navigation.toggleDrawer();
                    }}
                    onRightButton={() => {
                        navigation.navigate('user_detail')
                    }}
                />

            </View>

        </SafeAreaView>
    </>

}


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingTop: 50,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        height: windowHeight,
        width: windowWidth,
    },
    mainContainer: {
        height: '100%',
        width: windowWidth,
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        alignItems: 'center',
    },
    itemBody: {
        marginTop: 10,
        height: 170,
        width: windowWidth * 0.9,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 0.7,
        borderColor: '#ddd',
    },
    itemBody1: {
        marginTop: 10,
        height: 170,
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
        width: '70%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 20
    },
    itemRight: {
        width: '30%',
        height: '65%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    }


})

