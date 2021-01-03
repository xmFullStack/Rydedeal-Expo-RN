import React, { Component, useState } from 'react'
import { View, Text, TouchableOpacity, TouchableHighlight, KeyboardAvoidingView, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { Input } from 'react-native-elements';
import { NavigationContext, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import HeaderBar from '../../src/components/HeaderBar';
import ZStatusBar from '../../src/components/ZStatusBar';

let screenHeight = Dimensions.get('screen').height * 0.4;
let screenWidth = Dimensions.get('screen').width * 0.85;

export default Payment = ({})=>{
    const navigation = useNavigation();
    const route = useRoute();
    
    let [  selIndex , setSelIndex ] =  useState(0)

    useFocusEffect( React.useCallback(()=>{
        
        global.currentScreen = 'BillingMethod'
        return ()=>{}
    }, []))


    return (
        <>
        {/* <ZStatusBar/> */}
        <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
        <View style={styles.mainView}>
            <View style={styles.topBarView}>

            </View>
            <View style={styles.bodyView}>
                <View style={styles.titleView}>
                    <Text style={{fontSize: 20, fontWeight:'bold', color: '#666'}}>Add Payment Method</Text>
                    <View style={styles.line}></View>
                </View>
                <View style={styles.categoryView}>
                    <TouchableOpacity
                        onPress={() =>{ setSelIndex(0) }}
                        style={
                            selIndex != 0
                            ? styles.debitCardCategoryViewUnselect
                            : styles.debitCardCategoryViewSelect
                        }>
                        <Text style={
                            selIndex != 0
                                ?styles.subTitleUnselect
                                :styles.subTitleSelect
                        }>
                            Debit Card
                        </Text>
                        <View style={styles.circle}></View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>{setSelIndex(1)}}
                        style={
                            selIndex != 1
                                ? styles.debitCardCategoryViewUnselect
                                : styles.debitCardCategoryViewSelect
                        }>
                        <Text style={
                            selIndex != 1
                                ?styles.subTitleUnselect
                                :styles.subTitleSelect
                        }>
                            Credit Card
                        </Text>
                        <View style={styles.circle}></View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={2}
                        onPress={() => {setSelIndex(2)}}
                        style={
                            selIndex != 2
                                ? styles.debitCardCategoryViewUnselect
                                : styles.debitCardCategoryViewSelect
                        }>
                        <Text style={
                            selIndex != 2
                                ?styles.subTitleUnselect
                                :styles.subTitleSelect
                        }>
                            Cash
                        </Text>
                        <View style={styles.circle}></View>
                    </TouchableOpacity>

                </View>
            </View>
            <HeaderBar 
                title="Payment" 
                onLeftButton = {()=>{navigation.toggleDrawer();}}
                onRightButton={()=>{  }}
                />
        </View>
        </>
    )
}


const styles = StyleSheet.create({
    mainView: {
        flex:1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        backgroundColor: '#f5f5f5',
    },
    topBarView:{
        height: Dimensions.get('window').height * 0.15
    },
    bodyView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    titleView: {
        height: '10%',
        width: screenWidth,
    },
    categoryView: {
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: screenWidth,
        height: screenHeight,
    },
    debitCardCategoryViewSelect: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 70,
        width: '100%',
        paddingLeft: "10%",
        paddingRight: "10%",
        backgroundColor: '#6733bb',
        borderRadius: 25,
    },
    debitCardCategoryViewUnselect: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 70,
        width: '100%',
        paddingLeft: "10%",
        paddingRight: "10%",
        backgroundColor: '#fff',
        borderRadius: 25,
    },
    creditCardCategoryView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: '25%',
        width: '100%',
        backgroundColor: '#6733bb',
        borderRadius: 25,
    },
    cashCategoryView: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: '25%',
        width: '100%',
        backgroundColor: '#6733bb',
        borderRadius: 25,
    },
    line:{
        marginTop: '3%',
        width:'10%',
        borderBottomColor: '#6733bb',
        borderBottomWidth: 2,
    },
    subTitleSelect:{
        fontWeight: 'bold',
        color: 'white',
        fontSize: 18,
    },
    subTitleUnselect:{
        fontWeight: 'bold',
        color: '#666',
        fontSize: 18,
    },
    circle: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: 'blue',
        width: 18,
        height: 18,
        borderRadius: 9
    }
})