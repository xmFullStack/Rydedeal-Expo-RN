import React, { Component, useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    Alert,
    AsyncStorage,
    ScrollView
} from 'react-native'
import { Input } from 'react-native-elements';

import RestAPI from '../../src/utils/RestAPI';
import Constants from '../../src/utils/Constants';
import { BallIndicator } from 'react-native-indicators';
import {  MaterialCommunityIcons } from '@expo/vector-icons';
import {  useNavigation, useRoute } from '@react-navigation/native'
import ZStatusBar from '../../src/components/ZStatusBar';

let screenHeight = Dimensions.get('screen').height * 0.5;
let screenWidth = Dimensions.get('screen').width * 0.85;


const EmailVerifyView = ({ onResend, onCorrectEmail })=>{
    const navigation = useNavigation();
    
    const onReloadApp = ()=>{
        
        // navigation.popToTop();
        // alert('token, uuid', global.expoPushToken + ', ' + global.UUID)
        
        showPageLoader(true)
        RestAPI.checkToken(global.expoPushToken, global.UUID).then(async(res) =>{
            showPageLoader(false)
            global.curUser = res.data
            await AsyncStorage.setItem('cur_user', JSON.stringify(global.curUser))
    
            if( !global.curUser.phone_verified_at ){
               console.log('go to verify_phone')
               alert('Verify Phone', 'Your email is not verified yet, please try.')
               navigation.navigate('verify_phone');
               return 
            }
            if(!global.curUser.email_verified_at ){
                console.log('go to verify_email')
                alert('Verify Email', 'Your email is not verified yet, please try.')
               navigation.navigate('verify_email');
               return 
            }
           
            if( Constants.isDriver() && !global.curUser.car ){
                console.log('go to Main')
               Constants.getInitRoute(true);
               navigation.navigate('Main');
               return 
            }
            console.log('go to Main as else case: ')
             Constants.getInitRoute(true);
             navigation.navigate('Main');
            
          }).catch(err=>{
            
            showPageLoader(false)
            console.log('err while call check token api.', err)
            navigation.navigate('login');
          })

    }
  
        
    return <>
        <View style={{ width: '80%', elevation: 15, marginTop: 15}}>
            
            <TouchableOpacity style = {styles.submitButton} onPress={onReloadApp}>
                <Text style = {styles.submitButtonText}> I have verified Email </Text>
            </TouchableOpacity>
        </View>
        <View style={{ width: 160, justifyContent:'flex-end', marginTop:20, }}>  
            <TouchableOpacity 
                style = {{
                    
                    borderBottomColor:Constants.purpleColor,
                    borderBottomWidth:1,                                        
                }} 
                onPress={onResend}
            >
                <Text style = {styles.submitButtonText1}>Resend verify email.</Text>
            </TouchableOpacity>
        </View>
        

        <View style={{ width: 200, justifyContent:'flex-end', marginTop:20, }}>  
            <TouchableOpacity onPress={onCorrectEmail}>
                <Text style = {styles.submitButtonText2}>Sorry, I have entered incorrect email.</Text>
            </TouchableOpacity>
        </View>
    </>
}

const EmailCorrectView = ({onSendEmailCorrectRequest, goBack})=>{
    
    let [ email, setEmail ] = useState(global.curUser.email )
    
    
    return <>

    <Input
        containerStyle={styles.input}
        inputStyle={styles.textInput}
        inputContainerStyle={{borderBottomWidth:0}}
        placeholderTextColor='white'
        overflow="hidden"
        placeholder='Email'
        keyboardType="email-address"                       
        value = {email}
        onChangeText={email=>{setEmail(email)}}
        onSubmitEditing={()=>{onSendEmailCorrectRequest(email)}}        
        leftIcon={ <MaterialCommunityIcons name="email-outline" size={18} style={{paddingRight:10}} color={"#555"} /> }
    /> 
    <View style={{ width: '80%', elevation: 15, marginTop: 15}}>
        
        <TouchableOpacity style = {styles.submitButton} onPress={()=>{onSendEmailCorrectRequest(email)}}>
            <Text style = {styles.submitButtonText}> Correct Email </Text>
        </TouchableOpacity>
    </View>

    <View style={{ width: 160, justifyContent:'flex-end', marginTop:20, }}>  
            <TouchableOpacity 
                style = {{
                    
                    borderBottomColor:Constants.purpleColor,
                    borderBottomWidth:1,                                        
                }} 
                onPress={goBack}
            >
            <Text style = {styles.submitButtonText1}> Go Back </Text>
        </TouchableOpacity>
    </View>
    
    </>
}


export default VerifyEmailScreen = ({})=>{
    
    const navigation = useNavigation();
    const route = useRoute();
    
    let [ isLoading , setIsLoading ] = useState( false )
    let [ isCorrectEmail , setIsCorrectEmail ] = useState( false )
    const onReloadApp = ()=>{
        navigation.popToTop();
    }
    
    const onResend = ()=>{
        showPageLoader(true)
        setIsLoading( true )
        RestAPI.sendEmailVerify().then(res=>{
            if( res.success == 1){
                alert('Verify Email', 'We have sent verification email to ' + res.data.email + ', please check your inbox. ')
            }else{
                failed('Oops' , 'Failed to send email. ' + res.msg)
            }
        }).catch(err=>{
            console.log(err)
            failed('Oops','Some errors are occured. Please try again.')
        }).finally(()=>{
            showPageLoader(false)
            setIsLoading( false )
        })
    }
        
    const onCorrectEmail = ()=>{
        setIsCorrectEmail( true )
    }
    const correctEmail = (email)=>{
        if( email == global.curUser.email ){
            warn('Oops', 'You have entered same email with current.')
            return 
        }
        showPageLoader(true)
        setIsLoading( true )
        RestAPI.correctEmail(email).then(res=>{
            if( res.success == 1){
                alert('Corrected Email', 'We have corrected and sent verification email to ' + res.data.email + ', please check your inbox. ')
                setIsCorrectEmail( false )
            }else{
                failed('Oops' , 'Failed to correct email. ' + res.msg)
            }
        }).catch(err=>{
            console.log(err)
            failed('Oops','Some errors are occured. please try again.')
        }).finally(()=>{
            showPageLoader(false)
            setIsLoading( false )
        })
    }
    
    const onTapAnotherAccount = async()=>{
        const navigation = this.props.navigation
        await AsyncStorage.removeItem('cur_user');
        navigation.popToTop();
        navigation.navigate('Splash')
    }

    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

    return (
        <>
        <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#f5f5f5'}}
            keyboardVerticalOffset={keyboardVerticalOffset}
            behavior="padding"
        >
        <ScrollView
            keyboardShouldPersistTaps="always"
            style={{
                flex : 1,
            }}
            contentContainerStyle={{
                width:'100%',
                height:Constants.WINDOW_HEIGHT - 28
            }}
        >
            <ImageBackground  
                source={require('../../assets/background.jpg')} 
                blurRadius={0} 
                style = {styles.imageCover}
                resizeMode="cover"
            >


            
                <View style={styles.mainView}>
                    <View style={styles.topBarView}>
                    </View>
                    <View style={styles.mainContainer}>
                        <View style={styles.textView}>
                            <Text style={styles.titleText}>
                                We are glad to see you again!
                            </Text>
                            <Text style={styles.middleText}>
                                Thanks for registering with our platform. {"\n"}
                                We have sent veirfy link to your email account. {"\n"}
                                Please confirm with link, if you have not received, please resend request.{"\n"}{"\n"}
                                <Text style={{textAlign:'justify', fontSize:15}}>
                                    ( Sometimes confirm email can be processed as spam, please check it also if you have not found inbox, and click pure link instead button. )
                                </Text>
                            </Text>                            
                        </View>
                        <View style={styles.bodyView}>

                            { 
                                isLoading && false ? <BallIndicator color={Constants.purpleColor} size={45}/>:
                                (isCorrectEmail ? 
                                <EmailCorrectView 
                                    onSendEmailCorrectRequest={(email)=>{
                                        correctEmail(email)
                                    }} 
                                    goBack={()=>{
                                        setIsCorrectEmail( false  )
                                    }} 
                                /> :                                
                                <EmailVerifyView onResend = {onResend} onCorrectEmail={onCorrectEmail}/>)                                
                            }
                        
                           
                        </View>
                        
                    </View>
                  
                </View>

                <View 
                    style={{
                        position:'absolute',
                        bottom:10,
                        width:'100%',
                        height:40,
                        alignItems:'center'
                    }}>
                    <TouchableOpacity onPress={()=>{ onTapAnotherAccount() }}>
                        <Text style={{color:Constants.purpleColor, fontSize:14}}>Login or signup with another account.</Text>
                    </TouchableOpacity>
                </View>

        </ImageBackground>
        </ScrollView>
        </KeyboardAvoidingView>
        </>
    )
  
   
}

const styles = StyleSheet.create({

    imageCover: {
        // flex: 1,
        height:'100%',
        width: '100%',        
    },
    mainView:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    topBarView:{
        height: Dimensions.get('window').height * 0.15
    },
    mainContainer:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height:screenHeight,
        width:screenWidth,
    },
    textView:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: screenHeight * 0.5
    },
    titleText:{
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        color: 'white',
        width: '90%'
    },
    middleText:{
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
        color:'white',
        width:'100%'
    },
    bodyView:{
        paddingVertical:30,
        marginTop: 25,
        
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    input: {
        height: 45,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#555',
        borderRadius: 35,
        width: '80%',
    
    },
    textInput: {
        textAlign: 'left',
        color: '#555',
        width: '100%',
    },
    submitButton: {
        backgroundColor: '#6733bb',
        height: 55,
        
        // marginLeft: '20%',
        borderRadius: 50,
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
    submitButtonText1:{
        
        paddingBottom:5,
        paddingTop:10,

        fontSize: 17,
        color: Constants.purpleColor,
        textAlign: 'center'
    },
    submitButtonText2:{
        
        paddingBottom:5,
        paddingTop:10,
        
        fontSize: 12,
        color: Constants.purpleColor,
        textAlign: 'center'
    },
    line:{
        marginTop: 50,
        width:'7%',
        borderBottomColor: 'white',
        borderBottomWidth: 4,
    }
})