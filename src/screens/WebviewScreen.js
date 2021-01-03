import React, { Component, useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, SectionList, ScrollView, StyleSheet, Dimensions, Alert } from 'react-native'

import { NavigationContext, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'

import HeaderBar from '../components/HeaderBar';

import RestAPI from '../utils/RestAPI';
import Constants from '../utils/Constants';
import moment from 'moment';
import { MaterialIcons, AntDesign, FontAwesome, MaterialCommunityIcons , Foundation, Entypo} from '@expo/vector-icons';
import { EmptyHolder } from '../../pages/customer/RideDetail'
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarIndicator, DotIndicator, BallIndicator } from 'react-native-indicators';
import ZStatusBar from '../components/ZStatusBar';
import { WebView } from 'react-native-webview';

export default WebviewScreen = ({})=>{
    
    const navigation = useNavigation();
    const route = useRoute();
    
    let [ isLoading, setIsLoading ] = useState( false )
    
    let link = route.params?.link;
    let title = route.params?.title;
    
    useFocusEffect( React.useCallback(()=>{
        
    }, []))
   
    return (
        <>        
        <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
        <SafeAreaView style={{flex:1}}>
            
                <View style={styles.mainContainer}>
                    <EmptyHolder placeholder={"Loading..."} isLoading={isLoading} isShow={isLoading}/>
                    <WebView source={{ uri: link }} style={{ flex:1, marginTop: 20, }} onLoadStart={()=>{
                        setIsLoading(true)
                    }} onLoadEnd={()=>{
                        setIsLoading(false)
                    }} />
                </View>         
                
                <View
                    style={{
                        position:'absolute',
                        width:40, height:40, 
                        left:10, top : 20,
                        borderRadius:20,
                        shadowOffset:{ width:0, height :5},
                        elevation:5,
                        backgroundColor:Constants.white
                    }}
                >
                <TouchableOpacity style={{flex:1, width : '100%', height:'100%', justifyContent:'center', alignItems:'center'}} onPress={()=>{ navigation.goBack();}}>
                    <Entypo name="chevron-thin-left" size={20} color={Constants.purpleColor}/>
                </TouchableOpacity>                                
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
        height: Constants.WINDOW_HEIGHT,
        width: Constants.WINDOW_WIDTH,
    },
    mainContainer: {
        height: Constants.WINDOW_HEIGHT,
        width: Constants.WINDOW_WIDTH,
        // backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        alignItems: 'stretch',
        // paddingTop:60,
        // paddingBottom:40,
    },


})