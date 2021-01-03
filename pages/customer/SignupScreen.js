import React, { useState, useRef, useEffect } from 'react'
import {  
    View, 
    Text, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    ScrollView, 
    StyleSheet,  
    Dimensions, 
    AsyncStorage, 
    Animated, 
    Easing,     
} from 'react-native'
import { Input } from 'react-native-elements';
import CheckBox from 'react-native-check-box'
import {  SimpleLineIcons, MaterialCommunityIcons, FontAwesome, MaterialIcons } from '@expo/vector-icons';

import {  useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import Constants from '../../src/utils/Constants';
import Utils from '../../src/utils/Utils';
import RNPickerSelect from "react-native-picker-select";
import { BallIndicator } from 'react-native-indicators';
import HeaderBar from '../../src/components/HeaderBar';

import PhoneInputView from '../../src/components/phoneInputView'
import RestAPI from '../../src/utils/RestAPI';

import { SafeAreaView } from 'react-native-safe-area-context';
import ZStatusBar from '../../src/components/ZStatusBar';

let screenWidth = Dimensions.get('window').width * 0.9;

const PrevNextButtonViewer = ({curStep, onPrev, onSignUp,  onNext })=>{
        
    return  <View style={{flexDirection:'row', width:'100%', justifyContent:'space-around', paddingHorizontal:10, marginTop:10}}>
    {
        curStep == 1 ? null :
        <TouchableOpacity style={styles.prevButton} onPress={onPrev}>
            <FontAwesome name="angle-left" size={20} color={Constants.purpleColor}/>
            <Text style={styles.prevButtonText}>Prev</Text>
        </TouchableOpacity>
    }
        
        <TouchableOpacity 
            style={styles.nextButton} 
            onPress={()=>{
                if( curStep == 6 ){
                    onSignUp();
                }else{
                    onNext()
                }                                
            }}>
            <Text style={styles.nextButtonText}> {
                curStep == 6 ? 'Submit' : 'Next'
            }</Text>
            {
                curStep == 6 ? null :
                <FontAwesome name="angle-right" size={20} color={Constants.white}/>
            }                                
        </TouchableOpacity>
    </View> 
}

const SignupScreen  = ({ })=>{
    
    
    const navigation = useNavigation();
    const route = useRoute();
    const isSocialSignup = ()=>{
        return route.params?.isSocialSignup ? true : false;
    }

    let first_name = global.socialData ? global.socialData.fname : '';
    let last_name = global.socialData ? global.socialData.lname : '';
    let init_email = global.socialData ? global.socialData.email : '';
    
    let initPwd =  isSocialSignup() ? Utils.genRandPwd() :  ''

    let init_username = first_name && last_name ? first_name + ' ' + last_name : ''
    console.log('social data', JSON.stringify(global.socialData))
    console.log('first name: ', first_name, ' last_name:', last_name, ' init_email:', init_email)
    let [ isCustomer , setIsCustomer ] = useState(true)
    let [ isLoading , setIsLoading ] = useState(false)
    let [ fname, setFName ] = useState(first_name)
    let [ lname, setLName ] = useState(last_name)
    let [ username, setUserName ] = useState(init_username)
    let [ phone, setPhone ] =useState()
    let [ email, setEmail ] = useState(init_email)
    let [ password, setPassword ] = useState( initPwd)
    let [ confirmPassword, setConfirmPassword ] = useState(initPwd)
    let [ selCityId , setSelCityId ] =useState();
    let [ cities, setCities ] = useState([])
    let [ isChecked , setIsChecked ] = useState(false)
    let [ pressed, setPressed ] = useState(false)
    
    let [ step, setStep ] = useState(1)
    let scrollRef = useRef();
    // let [ colorCustomer, setOpacityCustomer ] = useState(new Animated.Value(150));
    // let [ colorDriver, setOpacityDriver ] = useState( new Animated.Value(0) );
    
    let colorCustomer =  new Animated.Value(150)
    let colorDriver =  new Animated.Value(0)

    let customerBgColor = colorCustomer.interpolate({
        inputRange : [0, 150],
        outputRange: [ 'rgba(0,0,0,0)', 'rgba(103,51,187, 255)']
    })
    
    let driverBgColor = colorDriver.interpolate({
        inputRange : [0, 150],
        outputRange: [ 'rgba(0,0,0,0)', 'rgba(103,51,187, 255)']
    })
    
    React.useEffect(() => {
        
        Animated.parallel([
            Animated.timing(
                // Animate value over time
                colorCustomer, // The value to drive
                {
                  toValue: isCustomer ? 150 : 0,
                  easing: Easing.ease,
                  duration: 350,
                }
            ),
            Animated.timing(
                // Animate value over time
                colorDriver, // The value to drive
                {
                  toValue: isCustomer ? 0 : 150,
                  easing: Easing.ease,
                  duration: 350,
                }
            ),
        ]).start(()=>{
            // this.setState({ isShownMainView : false, upButtonShow: true })            
        })

        return () => {}
    }, [isCustomer])

    let fNameRef = useRef();
    let lNameRef = useRef();
    let userNameRef = useRef();
    // let phoneRef = useRef();
    let emailRef = useRef();
    let pwdRef = useRef();
    let rePwdRef = useRef();

    useFocusEffect(React.useCallback(()=>{
        getBasicData();
        return ()=>{
            global.socialData = null;
        }
    }, []))

    const onLogin = ()=>{        
        navigation.navigate('login')
    }
    
    const getBasicData = ()=>{
        setIsLoading(true)
        RestAPI.getCities().then(res=>{
            if( res.success == 1){
                let cityList = res.data.map(item=>{
                    return {label: item.name, value: item.id}
                })                
                setCities(cityList)
                
            }else{
                failed('Oops', res.msg)
            }
        }).catch(err=>{
            failed('Oops', err.message)
        }).finally(()=>{
            setIsLoading(false)
        })
    
    }
    
    const stepCheck = ()=>{
        if( step == totalPage() ){
            return true;
        }
        setStep( step + 1 )
        return false
    }

    const scrollToPage = curStep =>{
        if( scrollRef.current ){
            scrollRef.current.scrollTo({x: (curStep-1) * Constants.WINDOW_WIDTH, y: 0, animated: true})
        }
    }
    const onPrev = ()=>{
        if( step > 1 ){
            setStep(step - 1)
            scrollToPage(step - 1)
        }
    }

    
    
    const validateStep = (curStep)=>{
    
        if( curStep == 1 ){
            console.log(phone)
            if( !phone || phone && phone.trim() == '' || phone.length < 8 ){
                warn('Validation Error', 'Enter correct phone number.');
                return false;
            }
        }else if(curStep == 2){
            console.log('social data', global.socialData)
            if( !email || email && !email.trim() ){
                console.log('email', email)
                warn('Validation Error', 'Email field is empty.');
                return false;
            }
        }else if(curStep == 3){
            if( !fname || fname && fname.trim() == '' ){
                warn('Validation Error', 'First name field is empty.');
                return false;
            }
            if( !lname || lname && lname.trim() == '' ){
                warn('Validation Error', 'Last name field is empty.');
                return false;
            }
            if( !username || username && username.trim() == '' ){
                warn('Validation Error', 'User name field is empty.');
                return false;
            }
        }else if(curStep == 4){
            if( !confirmPassword || confirmPassword != password || confirmPassword && confirmPassword.trim() == '' ){
            
                setPassword('')
                setConfirmPassword('')
                warn('Validation Error', 'Password is not correct please type password again.');
                return false;
            }
        }else if(curStep == 5){
            
            if( !selCityId ){
                warn('Validation Error', 'Please select city.');
                return false;
            }
        }else if(curStep == 6){
            if( !isChecked ){
                warn('Validation Error', 'Please accept Terms and Privacy Policy.');
                return false;
            }            
            
        }
        
        return true;
    }
    
    const totalPage = ()=>{
        return isSocialSignup() ? 5 : 6;
    }
    
    const onNext = ()=>{
        
        if( !validateStep(step)){
            return;
        }
        
        
        if( step < totalPage() ){
            setStep( step + 1 )
            scrollToPage(step + 1)
        }
    }
    
    const onSignUp = ()=>{
        
        if( !stepCheck() ){
            return
        }
        
        if( isChecked == false ){
            warn('Validation Error', 'Please accept Terms and Privacy Policy.');
            return 
        }
        if( confirmPassword != password || confirmPassword.trim() == '' ){
            
            setPassword('')
            setConfirmPassword('')
            warn('Validation Error', 'Password is not correct please type password again.');
            return 
        }
        if( !fname.trim() ){
            warn('Validation Error', 'First name field is empty.');
            return 
        }
        if( !lname.trim() ){
            warn('Validation Error', 'Last name field is empty.');
            return 
        }
        if( !username.trim() ){
            warn('Validation Error', 'User name field is empty.');
            return 
        }
        if( !phone || phone.trim() == '' || phone.length < 8 ){
            warn('Validation Error', 'Phone number is not correct.');
            return 
        }
        if( !email.trim() ){
            warn('Validation Error', 'Email field is empty.');
            return 
        }
        if( !selCityId ){
            warn('Validation Error', 'Please select city.');
            return 
        }

        let role = isCustomer ? 'customer' :'driver'
        showPageLoader(true)
        setIsLoading(true)
        
        
        RestAPI.register(username, fname, lname, email, password, phone, selCityId, role, isSocialSignup()  ).then(async(res)=>{
            if( res.success == 1){
                global.curUser = res.data
                let serializeData = JSON.stringify(global.curUser);
                console.log('serializeData', serializeData)
                await AsyncStorage.setItem('cur_user', serializeData)

                if ( !global.curUser.phone_verified_at ){
                    navigation.navigate('verify_phone')
                    return 
                }
                
                if(!global.curUser.email_verified_at ){
                    navigation.navigate('verify_email');
                    return 
                }
            
                if( Constants.isDriver() && !global.curUser.car ){
                    Constants.getInitRoute(false);
                    navigation.navigate('car_profile');
                    return 
                }
        
                Constants.getInitRoute(false);
                navigation.navigate('Main')
                
            }else{
                failed('Oops', 'Failed to register because ' + Constants.lcfirst(res.msg) )
            }
        }).catch(err=>{
            console.log(err)
            failed('Oops', 'Somethings went wrong, please try again.')
        }).finally(()=>{
            showPageLoader(false)
            setIsLoading(false)
        })
    }
    
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;    
    
     return (
        <>
        <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
        <SafeAreaView style={{flex:1}}>
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: '#f5f5f5'}}
                keyboardVerticalOffset={keyboardVerticalOffset}
                behavior="padding"
            >
             <View style = {styles.login_text}>
                <Text style = {styles.footerText}>Already have an account ? </Text>
                <TouchableOpacity onPress={onLogin}>
                    <Text style = {styles.footerLoginText}>Login</Text>
                </TouchableOpacity>
            </View>
      
            <View style={{width:Constants.WINDOW_WIDTH, height:400, }}>
                
                <ScrollView 
                    keyboardShouldPersistTaps="always"
                    ref={scrollRef}
                    style = {styles.container} 
                    horizontal={true} 
                    showsHorizontalScrollIndicator={false} 
                    pagingEnabled={true} 
                    scrollEnabled={false}
                    contentContainerStyle = {{ 
                        height:300,                         
                    }}>
                    
                    <View style={styles.pageSection} >
                        <View style={styles.sectionContainer}>
                            <View style={{ 
                                height: 40, 
                                alignItems: 'center', 
                                width: '90%', 
                                borderBottomWidth: 1, 
                                borderColor: '#ccc', 
                                borderRadius: 10, 
                            }}>                                
                                <PhoneInputView         
                                    // ref={phoneRef}                                                                                     
                                    onChangePhoneNumber={val=>{                                        
                                        setPhone(val)                                        
                                    }}                           
                                    textProps = {{placeholder: 'Phone Number'}}
                                    textStyle = {{fontSize: 20, height: 40, width: '90%'}}
                                    flagStyle = {{width:30, height: 20, borderWidth: 0.5, borderRadius: 2, borderColor: '#999', marginLeft: 15}}
                                />        
                            </View>  
                        </View>
                        <PrevNextButtonViewer curStep={1} onPrev={onPrev} onNext={onNext} onSignUp={onSignUp}/>   
                    </View>
                    
                    <View style={styles.pageSection} >
                        <View style={styles.sectionContainer}>
                            <Input
                                containerStyle={styles.input}
                                inputStyle={styles.textInput}
                                inputContainerStyle={styles.inputContainer}
                                placeholderTextColor='darkgrey'
                                overflow="hidden"
                                placeholder='Email Address'
                                leftIcon={ <MaterialCommunityIcons name="email" size={16} style={{paddingRight:20}} color="#444" /> }
                                value={email}                                
                                keyboardType={"email-address"}                                
                                onChangeText={val=>{setEmail(val);}}
                            />
                            
                        </View>
                        <PrevNextButtonViewer curStep={2} onPrev={onPrev} onNext={onNext} onSignUp={onSignUp}/> 
                    </View>
                    <View style={styles.pageSection} >
                        <View style={styles.sectionContainer}>
                            <Input
                                containerStyle={styles.input}
                                inputStyle={styles.textInput}
                                inputContainerStyle={styles.inputContainer}
                                placeholderTextColor='darkgrey'
                                overflow="hidden"
                                placeholder='First Name'
                                leftIcon={ <FontAwesome name="newspaper-o" size={16} style={{paddingRight:20}} color="#444" /> }
                                ref={ref => fNameRef = ref}
                                onSubmitEditing={()=>lNameRef.focus()}
                                value={fname}
                                onChangeText={val=>{let tmp = val; setFName(tmp);}}
                            />
                            <Input
                                containerStyle={styles.input}
                                inputStyle={styles.textInput}
                                inputContainerStyle={styles.inputContainer}
                                placeholderTextColor='darkgrey'
                                overflow="hidden"
                                placeholder='Last Name'
                                leftIcon={ <FontAwesome name="newspaper-o" size={16} style={{paddingRight:20}} color="#444" /> }
                                value={lname}
                                ref={ref=>lNameRef=ref}
                                onSubmitEditing={()=>userNameRef.focus()}
                                
                                onChangeText={val=>{let tmp = val; setLName(tmp);}}
                            />
                            <Input
                                containerStyle={styles.input}
                                inputStyle={styles.textInput}
                                inputContainerStyle={styles.inputContainer}
                                placeholderTextColor='darkgrey'
                                overflow="hidden"
                                placeholder='Username'
                                leftIcon={ <SimpleLineIcons name="user" size={16} style={{paddingRight:20}} color="#444" /> }
                                keyboardType={"default"}
                                ref={ref=>userNameRef=ref}
                                value={username}                                
                                onChangeText={val=>{let tmp = val; setUserName(tmp);}}
                            />
                        
                        </View>
                        <PrevNextButtonViewer curStep={3} onPrev={onPrev} onNext={onNext} onSignUp={onSignUp}/> 
                    </View>

                    {
                        isSocialSignup() ? null :
                        <View style={styles.pageSection} >
                            <View style={styles.sectionContainer}>
                                <Input
                                    containerStyle={styles.input}
                                    inputStyle={styles.textInput}
                                    inputContainerStyle={styles.inputContainer}
                                    placeholderTextColor='darkgrey'
                                    overflow="hidden"
                                    secureTextEntry={true}
                                    placeholder='Password'
                                    leftIcon={ <MaterialCommunityIcons name="key-variant" size={16} style={{paddingRight:20}} color="#444" /> }
                                    ref={ref=>pwdRef=ref}
                                    
                                    onSubmitEditing={()=>rePwdRef.focus()}
                                    onChangeText={val=>{let tmp = val; setPassword(tmp);}}
                                />
                                <Input
                                    containerStyle={styles.input}
                                    inputStyle={styles.textInput}
                                    inputContainerStyle={styles.inputContainer}
                                    placeholderTextColor='darkgrey'
                                    overflow="hidden"
                                    secureTextEntry={true}
                                    placeholder='Confirm Password'
                                    leftIcon={ <MaterialCommunityIcons name="key-variant" size={16} style={{paddingRight:20}} color="#444" /> }
                                    ref={ref=>rePwdRef=ref}
                                    
                                    onChangeText={val=>{let tmp = val; setConfirmPassword(tmp);}}
                                />
                                
                            </View>
                            <PrevNextButtonViewer curStep={4} onPrev={onPrev} onNext={onNext} onSignUp={onSignUp}/> 
                        </View>

                    }
                    
                    <View style={styles.pageSection} >
                        <View style={styles.sectionContainer}>

                            <View
                                style={{                                
                                    height: 50,                                
                                    borderBottomColor:'#EEE',
                                    borderBottomWidth:1,
                                    flexDirection:'row',                                        
                                    alignItems:'center',                                                                
                                }}
                            >
                                <MaterialCommunityIcons  name="city" size={20} color={'#444'} style={{marginLeft:5,}}/>
                                <RNPickerSelect
                                    placeholder={{
                                        label: 'Select City',
                                        value: null,
                                    }}
                                    value={selCityId}
                                    onValueChange={(value) => {setSelCityId(value)}}
                                    useNativeAndroidPickerStyle={false}
                                    style={{...pickerSelectStyles}}
                                    items={cities}
                                    Icon={() => {
                                        return (
                                            <View
                                                style={pickerSelectStyles.icon}
                                            />
                                        );
                                    }}
                                />
                            </View>
                            
                        </View>
                        <PrevNextButtonViewer curStep={5} onPrev={onPrev} onNext={onNext} onSignUp={onSignUp}/> 
                    </View>

                    <View style={styles.pageSection} >
                        <View style={styles.sectionContainer}>

                            <View style={{ alignItems:'stretch', marginHorizontal:20, }}>
                                
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={() => {
                                        setIsCustomer(!isCustomer)
                                    }}
                                    style={ isCustomer
                                            ? { ... styles.chooseSelectButton }
                                            : { ... styles.chooseUnselectButton}
                                    }
                                >
                                    <Animated.View style={{flex:1,  borderRadius:15, backgroundColor: customerBgColor}}>
                                        <Text
                                            style={
                                                isCustomer
                                                    ? styles.chooseSelectText
                                                    : styles.chooseUnselectText
                                            }
                                        >
                                            I am a Ryder
                                        </Text>
                                    </Animated.View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={2}
                                    style={
                                        isCustomer
                                            ? {...styles.chooseUnselectButton}
                                            : {...styles.chooseSelectButton}
                                    }
                                    onPress={()=>{
                                        setIsCustomer(!isCustomer)
                                    }}
                                    onHideUnderlay={() => {
                                        setPressed(false)
                                    }}
                                    onShowUnderlay={() => {
                                        setPressed(true)
                                    }}
                                >
                                <Animated.View style={{flex:1,  borderRadius:15, backgroundColor: driverBgColor}}>
                                    <Text
                                        style={
                                            isCustomer
                                                ? styles.chooseUnselectText
                                                : styles.chooseSelectText
                                        }
                                    >
                                        I am a Driver
                                    </Text>
                                </Animated.View>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style = {styles.socialSignup}
                                    onPress={()=>{
                                        navigation.navigate('web_page', {link:'https://rydedeal.com/mobile/policy', title:'Privacy & Policy'})
                                        setIsChecked(!isChecked)                            
                                    }}
                                >
                                    <CheckBox
                                        style={{flex: 1, padding: 10}}
                                        checkBoxColor = '#6733bb'
                                        onClick={()=>{
                                            setIsChecked(!isChecked)                                   
                                        }}
                                        isChecked={isChecked}
                                    />
                                    <Text style={{marginTop: 10, width: '85%'}}>I agree to Terms and services, Privacy, policy and content Privacy</Text>
                                </TouchableOpacity>
                            </View>
                            
                        </View>
                        <PrevNextButtonViewer curStep={6} onPrev={onPrev} onNext={onNext} onSignUp={onSignUp}/> 
                    </View>                
                
                </ScrollView>
                
            </View>
           
            
        </KeyboardAvoidingView>
        </SafeAreaView>
        </>
    )

}

export default  SignupScreen;

const styles = StyleSheet.create({
    
    pageSection :{
        width : Constants.WINDOW_WIDTH, 
        height : 300, 
        alignItems:'center', 
        paddingTop:30,
    },
    sectionContainer:{
        width : '90%', 
        borderRadius:20, 
        backgroundColor: Constants.white, 
        paddingVertical:20, 
        paddingHorizontal:20,
        alignItems:'stretch',
    },
    container: {        
        height:300,
        paddingVertical:5,
        marginTop : 0,
    },   
    input: {       
        height: 45,
        marginVertical:5,
    },
    inputContainer:{
        borderBottomWidth:1, 
        borderColor: '#ddd',                
    },
    textInput: {
        color: '#555',
        width: '100%',
    },
    
    chooseSelectButton: {
        
        height: 45,
        marginBottom:10,        
        borderRadius: 15,
    },
    chooseUnselectButton: {        
        borderColor: Constants.purpleColor,
        borderWidth:1,
        marginBottom:10,
        height: 45,        
        borderRadius: 15,
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
    
    prevButton: {
        flexDirection:'row',
        backgroundColor: Constants.white,
        height: 45,        
        width:'40%',
        justifyContent:'center',
        alignItems:'center',
        borderRadius: 15,
        elevation: 10,
        borderColor: Constants.purpleColor,
    
    },
    nextButton: {
        flexDirection:'row',
        backgroundColor: '#6733bb',
        height: 45,        
        width:'40%',
        justifyContent:'center',
        alignItems:'center',
        borderRadius: 15,
        elevation: 10,
    },
    nextButtonText : {
        color : Constants.white,
        fontSize:17,
        marginRight:20,
        marginLeft:20
    },
    prevButtonText : {
        color : Constants.purpleColor,
        fontSize:17,
        marginLeft:20,
        marginRight:20,
    },
    
    submitButtonText:{
        padding: 15,
        fontSize: 17,
        color: '#fff',
        textAlign: 'center'
    },
    socialSignup:{
        flexDirection: 'row',
        marginTop: 5,        
        justifyContent:'flex-start',
        // marginHorizontal: '5%'
    },
    footerText: {
        color: '#6733bb',
        fontSize: 16,
        textAlign: 'center'
    },
    footerLoginText: {

        color: '#6733bb',
        fontSize: 18,
        textAlign: 'center',
        textDecorationLine: 'underline'
    },
    login_text:{
        marginTop: 25,
        marginBottom:10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
})


const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        
        textAlign: 'left',
        width: Constants.WINDOW_WIDTH * 0.75,
        height: 40,
        fontSize: 17,
        borderColor: 'transparent',
        borderRadius: 10,
        backgroundColor: 'white',
        color: 'black',
        paddingHorizontal: 10, // to ensure the text is never behind the icon
    },
    inputAndroid: {
            
        textAlign: 'left',
        width: Constants.WINDOW_WIDTH * 0.75,
        height: 40,
        fontSize: 17,
        borderColor: '#555',
        borderRadius: 10,
        backgroundColor: 'white',
        color: 'black',
        paddingHorizontal: 10, // to ensure the text is never behind the icon
    },
    icon: {
        position: 'absolute',
        backgroundColor: 'transparent',
        borderTopWidth: 7,
        borderTopColor: '#00000099',
        borderRightWidth: 5,
        borderRightColor: 'transparent',
        borderLeftWidth: 5,
        borderLeftColor: 'transparent',
        width: 0,
        height: 0,
        top: 17,
        right: 15,
    },
});