import React, { Component, useCallback, useState } from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { Input } from 'react-native-elements';
import { NavigationContext, useFocusEffect, useRoute, useNavigation } from '@react-navigation/native'
import HeaderBar from '../../src/components/HeaderBar';
import RestAPI from '../../src/utils/RestAPI';

import { SafeAreaView} from "react-native-safe-area-context";
import ZStatusBar from '../../src/components/ZStatusBar';
import Constants from '../../src/utils/Constants';
import { BallIndicator } from 'react-native-indicators';

let screenHeight = Dimensions.get('screen').height * 0.35;
let screenWidth = Dimensions.get('screen').width * 0.8;

export default  NewPassword = ({})=>{

    let [ newPwd , setNewPwd ] = useState('')
    let [ oldPwd , setOldPwd ] = useState('')
    let [ rePwd , setRePwd ] = useState('')
    let [ isLoading, setIsLoading ] = useState(false)

    const route = useRoute();
    const navigation = useNavigation();

    let  oldPwdRef = React.useRef(null)
    let  newPwdRef = React.useRef(null)
    let  rePwdRef = React.useRef(null)

    useFocusEffect( React.useCallback(()=>{
        console.log('Calling FocusEffect for PwdChange')
        global.currentScreen = 'PwdChange'
        return ()=>{}
    }, []))

    const onSubmit = ()=>{
        if( newPwd != rePwd ){
            warn('Oops', 'Password is not correct.')
            return 
        }
        if(!newPwd){
            warn('Oops', 'Please enter new password.')
            return 
        }
        if(!oldPwd){
            warn('Oops', 'Please input old password.')
            return 
        }
        setIsLoading( true )
        RestAPI.changePwd(newPwd, global.curUser.email, oldPwd).then(res=>{
            if( res.success == 1){
                alert('Success', 'Updated your password successfully.')
                setOldPwd('')
                setNewPwd('')
                setRePwd('')
                navigation.goBack();
            }else{
                failed('Oops', 'Failed to update password.')
            }
        }).catch(err=>{
            console.log(err)
            failed('Oops', 'Some errors are occurred while update password. please try again after a moment.')
        }).finally(()=>{
            setIsLoading( false )
        })
    }


    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

    return (
        <>
        {/* <ZStatusBar/> */}
        <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
        <SafeAreaView style={{flex:1}}>
        
        <KeyboardAvoidingView
            keyboardVerticalOffset={keyboardVerticalOffset}
            style={{ flex: 1}}
            behavior="padding" enabled>
            <ScrollView keyboardShouldPersistTaps="always" style = {styles.container} contentContainerStyle = {{ alignItems: 'center',  }}>
                <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                    <View style={{height: Dimensions.get('window').height * 0.15, }}>
                    </View>
                    <View style={styles.mainContainer}>
                        <View style={{ marginTop: 15, alignItems: 'center', justifyContent: 'center'}}>
                            <Text style={styles.TopText}>New Password</Text>
                        </View>
                        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop:5,}}>
                            <Input
                                ref= {ref=>oldPwdRef=ref}
                                containerStyle={styles.input}
                                inputStyle={styles.textInput}
                                inputContainerStyle={{borderBottomWidth:0}}
                                placeholderTextColor='darkgrey'
                                overflow="hidden"
                                secureTextEntry={true}
                                placeholder='Old Password'
                                value={oldPwd}
                                onChangeText={val=>setOldPwd(val)}
                                onSubmitEditing={()=>newPwdRef.focus()}
                            />
                            <Input
                                ref= {ref=>newPwdRef=ref}
                                containerStyle={styles.input}
                                inputStyle={styles.textInput}
                                inputContainerStyle={{borderBottomWidth:0}}
                                placeholderTextColor='darkgrey'
                                overflow="hidden"
                                secureTextEntry={true}
                                placeholder='New Password'
                                value={newPwd}
                                onChangeText={val=>setNewPwd(val)}
                                onSubmitEditing={()=>rePwdRef.focus()}
                            />
                            <Input
                                ref= {ref=>rePwdRef=ref}
                                containerStyle={styles.input}
                                inputStyle={styles.textInput}
                                inputContainerStyle={{borderBottomWidth:0}}
                                placeholderTextColor='darkgrey'
                                overflow="hidden"
                                secureTextEntry={true}
                                placeholder='Confirm Password'
                                value={rePwd}
                                onChangeText={val=>setRePwd(val)}
                                onSubmitEditing={onSubmit}
                            />
                        </View>
                    </View>
                    <View style={{ width: Constants.WINDOW_WIDTH, elevation: 15, marginTop: -20, alignItems:'center', justifyContent:'center'}}>
                    {
                        isLoading ? <BallIndicator  color={Constants.purpleColor} size={40}/> : 
                        <TouchableOpacity style = {styles.submitButton} onPress={onSubmit}>
                            <Text style = {styles.submitButtonText}> Change Password </Text>
                        </TouchableOpacity>
                    }
                        
                    </View>
                </View>
            </ScrollView>            
            <HeaderBar 
                title="Change Password" 
                onLeftButton = {()=>{navigation.toggleDrawer();}}
                onRightButton={()=>{ navigation.navigate('user_detail') }}
                />
        </KeyboardAvoidingView>
        </SafeAreaView>
        </>
    )
}


const styles = StyleSheet.create({

    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
        // borderColor:'red',
        // borderWidth:1,
    },
    mainContainer: {
        // height: screenHeight,
        width: screenWidth,
        borderRadius: 25,
        
        backgroundColor: '#fff',
        zIndex: 0,
        shadowColor: "#444",
        shadowOffset: {
            width: 0,
            height: 15,
        },
        shadowOpacity: 0.3,
        shadowRadius: 30.00,
        paddingBottom:40,
        elevation: 14,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#555',
        borderRadius: 35,
        width: '80%',
        marginTop: 15,
    },
    textInput: {
        paddingHorizontal:10,
        textAlign: 'left',
        color: '#555',
        width: '100%',
    },

    TopText: {
        color: '#6733bb',
        fontSize: 20,
        fontWeight : 'bold',
        textAlign: 'center',
        marginTop: 10,
    },

    chooseSelectButton: {
        backgroundColor: '#6733bb',
        height: 45,
        width: '35%',
        borderRadius: 45,
    },
    chooseUnselectButton: {
        backgroundColor: '#fff',
        height: 45,
        width: '35%',
        borderRadius: 45,
    },
    chooseSelectText:{
        padding: 10,
        fontSize: 17,
        color: '#fff',
        textAlign: 'center'
    },
    chooseUnselectText:{
        padding: 10,
        fontSize: 17,
        color: '#6733bb',
        textAlign: 'center'
    },

    submitButton: {
        backgroundColor: '#6733bb',
        height: 55,
        paddingHorizontal:20,        
        borderRadius: 15,
        shadowColor: "#666",
        shadowOffset: {
            width: 0,
            height: 20,
        },
        shadowOpacity: 0.5,
        shadowRadius: 25.00,
        elevation: 20,
        zIndex: 1,
    },
    submitButtonText:{
        padding: 15,
        fontSize: 17,
        color: '#fff',
        textAlign: 'center'
    },
    socialSignup:{
        flexDirection: 'row',
        marginTop: '5%',
        height: '15%',
        width: '90%',
        marginLeft: '5%'
    },
    line:{
        marginTop: '3%',
        width:'5%',
        borderBottomColor: '#6733bb',
        borderBottomWidth: 5,
    }
})