import React, { Component, useState } from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, SectionList, ScrollView, StyleSheet, Dimensions } from 'react-native'

import { NavigationContext, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'

import HeaderBar from '../../src/components/HeaderBar';

import RestAPI from '../../src/utils/RestAPI';
import Constants from '../../src/utils/Constants';
import { EmptyHolder } from './RideDetail'
import moment from 'moment';
import {BallIndicator} from "react-native-indicators";
import { SafeAreaView } from 'react-native-safe-area-context';
import ZStatusBar from '../../src/components/ZStatusBar';

let windowHeight = Dimensions.get('screen').height;
let windowWidth = Dimensions.get('screen').width;



export const ItemTransaction = ({item, index, section}) => {
    
    let data = item ? item.item : null
    if( !data ){
        return null
    }
    
    let initSlugId =  data.slugId ;
    let amount = 0
    try{
        amount = ( parseFloat(data.amount) / 100 ).toFixed(2)
    }catch(e){
        console.log('Exception amount parse in transaction.js line:32', e);
    }

    
    let month = moment(data.created_at, 'YYYY-MM-DD HH:mm:ss', true).format('MMM')
    let date = moment(data.created_at, 'YYYY-MM-DD HH:mm:ss', true).format('Do')
    let year = moment(data.created_at, 'YYYY-MM-DD HH:mm:ss', true).format('YYYY')
            
    
    return (
        // <TouchableOpacity>
            <View style={styles.itemBody}>
                <View style={styles.itemDate}>
                    <Text style={{fontSize: 17, color:'#555', fontWeight: 'bold', textAlign:'center'}}>{month}{"\n"}{date}</Text>
                    <Text style={{fontSize: 12, color:'#555'}}>{year}</Text>
                </View>
                <View style={styles.itemInfor}>
                    <Text style={{fontSize: 17, color:'#555', fontWeight: 'bold', textAlign:'center'}}>Ride ID: </Text>
                    <Text>#{initSlugId}</Text>
                    <Text style={{fontSize: 13, color:'#35e141', fontWeight:'bold'}}>Successful</Text>
                </View>
                <View style={styles.itemPrice}>
                    <Text style={{fontSize: 20, color:'#35e141', fontWeight: 'bold', textAlign:'center'}}>${amount}</Text>
                    <Text style={{fontSize: 12, color:'#999'}}>Paid</Text>
                </View>
            </View>
        // </TouchableOpacity>
    )
}


export default Transaction = ({})=>{
    const navigation = useNavigation();
    const route = useRoute();
    let [ isLoading, setIsLoading ] = useState( false )
    let [ data, setData ] = useState([])

    useFocusEffect( React.useCallback(()=>{
        global.currentScreen = 'Transaction'
        loadData();
        
    }, []))

    const loadData = ()=>{
        setIsLoading( true )
        RestAPI.getTransactionList().then(res=>{
            if ( res.success == 1 ){
                
                setData([{title:'Transactions', key:0, data: res.data}])
            }else{
                failed('Oops', 'Failed to fetch data, Because ' + res.msg)
            }
        }).catch(err=>{
            console.log(err)
            failed('Oops', 'Some errors are occurred while fetching transaction list. please try again.')
        }).finally(()=>{
            setIsLoading( false )
        })
    }

    let isEmpty = data.length <= 0 || data[0].data.length <= 0;


    return (
        <>
        {/* <ZStatusBar/> */}
        <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
        <SafeAreaView style={{flex:1}}>
            <View style = {styles.container}>         
            <View style={styles.mainContainer}>
                <EmptyHolder placeholder={"There is no any transactions."} isShow={isEmpty}/>
                <SectionList
                    renderSectionHeader={()=>null}
                    keyExtractor={(item, index)=>item + '_' + index}
                    sections={data}
                    renderItem={(item, index, section)=>{
                        return <ItemTransaction item={item} index={index} section={section}/>
                    }}
                    onRefresh={()=>loadData()}
                    refreshing={false}
                    onEndReached={offset=>{}}
                />
            </View>

            <HeaderBar
                title="Transactions"
                onLeftButton = {()=>{navigation.toggleDrawer();}}
                rightIcon = {isLoading ? <BallIndicator color={Constants.purpleColor} size={20}/> : null}
                onRightButton={()=>{
                    if( isLoading ){

                    }else{
                        navigation.navigate('user_detail')
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
        paddingTop: 50,
        height: windowHeight,
        width: windowWidth,
    },
    mainContainer: {
        height: Constants.WINDOW_HEIGHT -80,
        width: windowWidth,
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        alignItems: 'center',
    },
    itemBody:{
        marginTop: 10,
        height: 90,
        width: windowWidth*0.9,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 0.7,
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
})