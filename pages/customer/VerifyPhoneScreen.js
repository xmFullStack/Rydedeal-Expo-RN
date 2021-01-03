import React, { Component } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    AsyncStorage,
    ScrollView
} from 'react-native'
import { Input } from 'react-native-elements';

import PhoneInputView from '../../src/components/phoneInputView'
import RestAPI from '../../src/utils/RestAPI';
import Constants from '../../src/utils/Constants';

import { NavigationContext } from '@react-navigation/native'
import ZStatusBar from '../../src/components/ZStatusBar';
import { BallIndicator } from 'react-native-indicators';
import { Entypo , AntDesign} from '@expo/vector-icons';

let screenHeight = Dimensions.get('screen').height * 0.5;
let screenWidth = Dimensions.get('screen').width * 0.85;

const VerifyPhoneScreen = ({route , navigation})=>{

    return <VerifyPhoneScreenClass navigation={navigation} params={route.params} />
}

class VerifyPhoneScreenClass extends Component {
    
    state = {
        valid: "",
        type: "",
        value: "",
        code:'',
        isLoading : false ,
        isPhoneInputMode : true ,
        phone : global.curUser.phone_number
    };

    // phone = React.createRef(null)

    componentDidMount() {
        // this.updateInfo = this.updateInfo.bind(this);

        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);

    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow() {

    }
    
    _keyboardDidHide() {

    }

    onReloadApp = ()=>{
        const navigation = this.props.navigation
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
  

    // checkNextNav(){
    //     const navigation = this.props.navigation
   
    
    //         if( !global.curUser.phone_verified_at ){
    //            navigation.navigate('verify_phone');
    //            return 
    //         }
    //         if(!global.curUser.email_verified_at ){
    //            navigation.navigate('verify_email');
    //            return 
    //         }
           
    //         if( Constants.isDriver() && !global.curUser.car ){
    //            Constants.getInitRoute(true);
    //            navigation.navigate('Main');
    //            return 
    //         }
              
    //          Constants.getInitRoute(true);
    //          navigation.navigate('Main');
          
    // }
    

    onVerifyPhone = ()=>{
        const navigation = this.props.navigation
        
        if ( this.state.isPhoneInputMode ){
            // let phoneNumber = this.phone.getValue();
            let phoneNumber = this.state.phone;
            if( !phoneNumber ){
                failed('Oops', 'You have not registered phone number , please try signup again.')
                return 
            }
            showPageLoader(true)
            this.setState({ isLoading : true, phone : phoneNumber })
            RestAPI.sendVerifyPhone(phoneNumber).then( res =>{
                if( res.success == 1 ){
                    this.setState({ isPhoneInputMode : false })
                    alert('Verify', res.data)
                    
                }else{
                    error('Oops', 'Failed to send code to this phone number. please check your phone number and try again.')
                }
                
            }).catch( err=>{
                failed('Oops', 'Failed to send code, please try again after a moment.')
            }).finally(()=>{
                showPageLoader(false)
                this.setState({isLoading : false })
            })
        }else{
            showPageLoader(true)
            this.setState({ isLoading : true })
            RestAPI.verifySMSCode( this.state.phone,  this.state.code).then( async(res) =>{
                showPageLoader(false)
                if( res.success == 1 ){
                    this.onReloadApp();
                    // global.curUser = res.data;
                    // let serial = JSON.stringify(global.curUser)
                    // await AsyncStorage.setItem('cur_user', serial)
                    // console.log('curUser:', serial)
                    // this.checkNextNav();
                    // navigation.popToTop();
                
                }else{
                    failed('Oops', 'Invalid code, please try again.')
                    this.setState({ isPhoneInputMode : true })
                }
                
            }).catch( err=>{
                showPageLoader(false)
                failed('Oops', 'Failed to send code, please try again after a moment.' + JSON.stringify(err))
            }).finally(()=>{
                
                this.setState({isLoading : false })
            })
        }

        
    }

    onTapAnotherAccount = async()=>{
        const navigation = this.props.navigation
        await AsyncStorage.removeItem('cur_user');
        navigation.popToTop();
        navigation.navigate('Splash')
    }
    
    render() {
        const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

        // let phoneNumber = global.curUser ? global.curUser.phone_number : ''
        const { isPhoneInputMode } = this.state

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
                {/* <DismissKeyboardView> */}

                
                    <View style={styles.mainView}>
                        <View style={styles.topBarView}>
                        </View>
                        <View style={styles.mainContainer}>
                            <View style={styles.textView}>
                                <Text style={styles.titleText}>
                                    We are glad to see you again!
                                </Text>
                                <Text style={styles.middleText}>
                                    Thanks for registering with our platform.{"\n"} We
                                    will call you to verify your phone.{"\n"}{"\n"}
                                    Provide the code below. {"\n"}(Phone number should follow {"\n"}global format. ex: +1xxx..)
                                </Text>
                                <View style={styles.line} />
                            </View>
                            <View style={styles.bodyView}>
                            {
                                isPhoneInputMode ? 
                                <TouchableOpacity style={{position:'absolute', top : 5, right:10, flexDirection:'row', alignItems:'center', height:40}} onPress={()=>this.setState({isPhoneInputMode : !isPhoneInputMode})}>
                                    <Text style={{color: Constants.purpleColor , fontSize: 13}}> I got the code.</Text><AntDesign name="arrowright" size={18} color={Constants.purpleColor}/>
                                </TouchableOpacity> 
                                 : 
                                <TouchableOpacity style={{position:'absolute', top : 5, left:10, flexDirection:'row', alignItems:'center', height:40}} onPress={()=>this.setState({isPhoneInputMode : !isPhoneInputMode})}>
                                    <AntDesign name="arrowleft" size={18} color={Constants.purpleColor}/><Text style={{color: Constants.purpleColor , fontSize: 13}}> Try with other </Text>
                                </TouchableOpacity> 
                            }
                            
                                <View style={{ height:40, justifyContent: 'center', width: '85%', borderWidth: 1, borderColor: '#555', borderRadius: 20, }}>
                                

                                    {
                                        isPhoneInputMode ? 
                                        // <Text
                                        //     style={{
                                        //         fontSize:20, 
                                        //         width:'100%',
                                        //         textAlign:'center'
                                        //     }}
                                        // >
                                        //     { phoneNumber } 
                                        // </Text>
                                        
                                        <PhoneInputView
                                            // ref={ref => {
                                            //     this.phone = ref;
                                            // }}                                            
                                            value={this.state.phone}
                                            onChangePhoneNumber={phone=>{
                                                this.setState({phone: phone})
                                            }}
                                            textProps = {{placeholder: 'Phone Number'}}
                                            textStyle = {{fontSize: 20, height: 40, width: '90%'}}
                                            flagStyle = {{width:30, height: 20, borderWidth: 0.5, borderRadius: 3, borderColor: '#999', marginLeft: 15}}
                                        /> 
                                        :
                                        <Input
                                            // containerStyle={styles.input}
                                            inputStyle={styles.textInput}
                                            inputContainerStyle={{borderWidth:0}}
                                            // placeholderTextColor='white'
                                            overflow="hidden"
                                            placeholder='Verify Code'
                                            keyboardType="decimal-pad"                       
                                            value = {this.state.code}
                                            onChangeText={code=>this.setState({code})}                                            
                                            // leftIcon={ <SimpleLineIcons name="user" size={18} style={{paddingRight:20}} color="white" /> }
                                        />
                                    }
                                    
                                </View>
                            </View>
                        </View>
                        <View style={{ width: '90%', elevation: 15, marginTop: -30, alignItems:'center'}}>                            
                            <TouchableOpacity style = {styles.submitButton} onPress={()=>this.onVerifyPhone()}>
                                <Text style = {styles.submitButtonText}> {isPhoneInputMode ? 'Send Code' : 'Confirm'}  </Text>
                            </TouchableOpacity>                            
                        </View>
                    </View>
                    
                    <View 
                        style={{
                            position:'absolute',
                            width:'100%',
                            bottom:10,
                            height:40,
                            alignItems:'center'
                        }}>
                        <TouchableOpacity onPress={()=>{ this.onTapAnotherAccount() }}>
                            <Text style={{color:Constants.purpleColor, fontSize:14}}>Login or signup with another account.</Text>
                        </TouchableOpacity>
                    </View>
                {/* </DismissKeyboardView> */}
            </ImageBackground>
            </ScrollView>
            </KeyboardAvoidingView>
            </>
        )
    }
}
export default VerifyPhoneScreen

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
        marginTop: 25,
        height: screenHeight * 0.45,
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
        textAlign: 'center',
        color: '#555',
        width: '100%',
    },
    submitButton: {
        backgroundColor: '#6733bb',
        height: 50,
        width: '60%',        
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
    line:{
        marginTop: 50,
        width:'7%',
        borderBottomColor: 'white',
        borderBottomWidth: 4,
    }
})