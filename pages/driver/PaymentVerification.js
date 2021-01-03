import React, {Component, useState, useRef, useEffect} from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Alert,
    ImageBackground, ScrollView, KeyboardAvoidingView, NativeMethodsMixin,
} from 'react-native'
import {Avatar, Input} from 'react-native-elements';
import {SimpleLineIcons, AntDesign, EvilIcons} from "@expo/vector-icons";
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import HeaderBar from '../../src/components/HeaderBar';
import {BallIndicator}  from 'react-native-indicators';
import DatePicker from 'react-native-datepicker';
import Constants from '../../src/utils/Constants';
import RestAPI from '../../src/utils/RestAPI';

import RNPickerSelect from "react-native-picker-select";
import { SafeAreaView } from 'react-native-safe-area-context';
import {EmptyHolder} from "../customer/RideDetail";
import ZStatusBar from '../../src/components/ZStatusBar';


let screenHeight = Dimensions.get('screen').height;
let screenWidth = Dimensions.get('screen').width;


export const CardNumber4Input = ({onSubmitLast, cardNumber, onChangeNumber, setRef})=>{
        
    
    let number = cardNumber.replace(' ', '')
    number = number.replace('-', '')
    
    let init1 = '';
    let init2 = '';
    let init3 = '';
    let init4 = '';
    if( number.length == 16){
        init1 = number.substr(0,4)
        init2 = number.substr(4,4)
        init3 = number.substr(8,4)
        init4 = number.substr(12,4)
    }
    
    
    let ref1 = useRef();
    let ref2 = useRef();
    let ref3 = useRef();
    let ref4 = useRef();
    
    let [val1, setVal1] = useState(init1);
    let [val2, setVal2] = useState(init2);
    let [val3, setVal3] = useState(init3);
    let [val4, setVal4] = useState(init4);

    useEffect(()=>{
        if( onChangeNumber ){
            onChangeNumber(val1, val2, val3, val4)
        }
    }, [val1, val2, val3, val4])
    
    const onChangeInput= (value, nRef, setFunc)=>{
        
        
        if( value.length == 4){
            setFunc(value)

            if( nRef ){                
                nRef.focus();
            }else{
                onSubmitLast()
            }            
            return 
        }else if(value.length > 4){
            if( nRef ){                
                nRef.focus();
            }else{
                onSubmitLast()
            }            
            return 
        }
        setFunc(value)
    }
    
    
    return <View style={{ flexDirection:'row', width:'100%', justifyContent:'space-between', alignItems:'center' , paddingHorizontal:0}}>
        <Input
            ref={ref=>{
                ref1=ref
                if(setRef){
                    setRef(ref)
                }
            }}
            containerStyle={{flex:1}}
            inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd'}}
            placeholderTextColor='darkgrey'
            placeholder='####'
            keyboardType={"decimal-pad"}
            value={val1}
            onChangeText={val=>onChangeInput(val, ref2, setVal1)}
            onSubmitEditing={()=>ref2.focus()}
        />
        <Text>-</Text>
        <Input
            ref={ref=>ref2=ref}
            containerStyle={{flex:1}}
            inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd'}}
            placeholderTextColor='darkgrey'
            placeholder='####'
            keyboardType={"decimal-pad"}
            value={val2}
            onChangeText={val=>onChangeInput(val, ref3, setVal2)}
            onSubmitEditing={()=>ref3.focus()}
        />
        <Text>-</Text>
        <Input
            ref={ref=>ref3=ref}
            containerStyle={{flex:1}}
            // inputStyle={styles.textInput}
            inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd'}}
            placeholderTextColor='darkgrey'
            placeholder='####'
            keyboardType={"decimal-pad"}
            value={val3}
            onChangeText={val=>onChangeInput(val, ref4, setVal3)}
            onSubmitEditing={()=>ref4.focus()}/>
        <Text>-</Text>
        <Input
            ref={ref=>ref4=ref}
            containerStyle={{flex:1}}
            // inputStyle={styles.textInput}
            inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd'}}
            placeholderTextColor='darkgrey'
            placeholder='####'
            keyboardType={"decimal-pad"}
            value={val4}
            onChangeText={val=>onChangeInput(val, null, setVal4)}
            onSubmitEditing={()=>onSubmitLast()}
        />
    </View>
}

export default function PaymentVerification ({}){
    const route = useRoute();
    const navigation = useNavigation();
    
    let [ isLoading, setIsLoading ] = useState(false)
    
    let [cityList , setCityList ] = useState([])
    
    let [ firstName, setFirstName ] = useState(global.curUser.first_name)
    let [ lastName, setLastName ] = useState(global.curUser.last_name);
    let [ email , setEmail ] = useState(global.curUser.email);
    let [ phone, setPhone ] = useState(global.curUser.phone_number);
    let [ dob, setDob ] = useState('1990-01-01');
    let [ city, setCity ] = useState();
    let [ state, setState ] = useState();
    let [ address, setAddress ] = useState();
    let [ cardName, setCardName ] = useState();
    let [ cardNumber, setCardNumber ] = useState();
    let [ cardYear, setCardYear ] = useState();
    let [ cardMonth, setCardMonth ] = useState();
    let [ cardCVC, setCardCVC ] = useState();
    let [countryCode , setCountryCode] = useState()
    let [ ssn, setSSN ] = useState()
    let [ postal_code , setPostalCode] = useState()
    let [ isInputMode , setIsInputMode] = useState(false)
    let [ verifyStatus, setVerifyStatus ] = useState()
    let [ verifyResult,setVerifyResult] = useState()

    let fNameRef = useRef();
    let lNameRef = useRef();
    let emailRef = useRef();
    let ssnRef = useRef();
    let phoneRef = useRef();
    let dobRef = useRef();
    let cityRef = useRef();
    let stateRef = useRef();
    let addrRef = useRef();
    let cardNameRef = useRef();
    let cardMMRef = useRef();
    let cardYYRef = useRef();
    let cardCVCRef = useRef();
    let cardNumberRef = useRef();
    let postalCodeRef = useRef();

    useFocusEffect(React.useCallback(()=>{
        loadBasicData()
        global.currentScreen = 'PaymentVerification';
        return ()=>{}
    }, []))
    
    const loadBasicData = ()=>{
        setIsLoading( true )
        RestAPI.getPostBasicData().then(res=>{
            if( res.success == 1){
                let list = res.data.city_list.map(item=>{
                    return {
                        label: item.name,
                        value: item
                    }
                })
                setCityList(list)            
            
            }else{
                alert('Oops', res.msg)
            }
        }).catch(err=>{
            console.log(err)
            failed('Oops', 'Somethings wrong. Please try again.')
        }).finally(()=>{
            // setIsLoading(false)
            checkVerify()
        })
    }
    
    
    const onChangeInput = (val, nextRef, setFunc = null, maxLen = 0)=>{
        if ( maxLen > 0 ){
            if( val.length == maxLen ){
                setFunc(val)
                if( nextRef ){
                    nextRef.focus();
                }
                
            }else if( val.length > maxLen){
                if( nextRef ){
                    nextRef.focus();
                }
            }else{
                setFunc(val)
            }
            
            return         
        }
        if( setFunc ){
            setFunc(val)
        }        
    }
    
    const validation = ()=>{
        if( !firstName ){
            warn('Validtion', 'Please input first name.')
            return false
        }
        if( !lastName ){
            warn('Validtion', 'Please input last name.')
            return false
        }
        if( !email ){
            warn('Validtion', 'Please input email.')
            return false
        }
        if( !phone ){
            warn('Validation', 'Please input phone number.'); return false;         
        }
        if( !city ){
            warn('Validation', 'Please input city.'); return false;         
        }
        if( !state ){
            warn('Validation', 'Please input state.'); return false;         
        }
        if( !address ){
            warn('Validation', 'Please input address.'); return false;         
        }
        if( !cardName ){
            warn('Validation', 'Please input card holder name.'); return false;         
        }
        if( !cardYear ){
            warn('Validation', 'Please input card expiration year.'); return false;         
        }
        if( !cardMonth ){
            warn('Validation', 'Please input card expiration month.'); return false;         
        }
        if( !cardCVC ){
            warn('Validation', 'Please input card cvc.'); return false;         
        }
    
        return true;
    }
    
    const onSubmit = ()=>{
        
        if(!validation()){
            return ;        
        }
        if( isLoading ){
            return;
        }
            
        let data =  {
            email: email,
            first_name: firstName,
            last_name: lastName,
            dob_year: dob.substr(0,4),
            dob_month: dob.substr(5,2),
            dob_day: dob.substr(-2),
            phone_number: phone,            
            // id_number: cardNumber,
            card_name: cardName,
            card_number: cardNumber,
            card_exp_month: cardMonth,
            card_exp_year: cardYear,
            card_cvc: cardCVC,
            address_line1: address,
            address_line2:'',
            postal_code:postal_code,
            city: city,
            state: state,
            country_code: countryCode
        }
        if(countryCode == 'US'){
            data.id_number = ssn;
        }

        setIsLoading(true)
        RestAPI.paymentVerify(data).then(res=>{
            if( res.success == 1){
                setIsInputMode(false);
                alert('Success', 'Your payment information is submitted. It is in pending, please check after a moment.')
                setTimeout(()=>{
                    checkVerify();
                }, 1000)
            }else{
                failed('Oops', res.msg)
            }
        }).catch(err=>{
            console.log(err)
            failed('Oops', 'Somethings wrong. please try again. ')
        }).finally(()=>{
            setIsLoading(false)
            
        })
    
    }

    const checkVerify = ()=>{

        setIsLoading(true)
        RestAPI.checkPaymentVerify().then(res=>{
            
            if( res.success == 1 ){

                if( res.data ){
                    
                    let status = res.data.status;
                    setVerifyResult(res.data)
                    setVerifyStatus(status)
                    if( status == 'active' ){
                        global.curUser.payment_verified = true
                        alert('Success', 'Your payment is verified, you would be paid from your service directly.');
                    }else{
                        global.curUser.payment_verified = false
                        warn(status ? status.toUpperCase() : 'Oops', 'Payment verification is in '+status+', please check details.');
                    }
                }else{
                    console.log(res)
                    failed('Oops', 'Somethings went wrong, please check again.');
                }
            }else{

                warn('Oops',res.msg);
            }

        }).catch(err=>{

        }).finally(()=>{
            setIsLoading(false)
        })

    }

    const onCitySelect = (item)=>{
        if( !item ){
            setCity(null)
            setState(null)
            setCountryCode(null)
            return;
        }
        setCity( item.name )
        setState(item.state_name.toUpperCase())
        setCountryCode(item.country_code.toUpperCase())

        addrRef.focus()
    }

    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;


    return (
        <>
        
        <SafeAreaView style={{flex:1}}>
        {/* <ZStatusBar/> */}
        <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
            <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#f5f5f5'}} keyboardVerticalOffset={keyboardVerticalOffset} behavior="padding" enabled>
            {
                   !isLoading ? (isInputMode ?
                   <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle = {{ alignItems: 'center'}}>
                       <View style={styles.mainBoard}>

                           <View style={styles.inforField}>
                               {/* <View style={styles.line}></View> */}
                               <View style={styles.divideField}>
                                   <Input
                                       ref={ref=>fNameRef=ref}
                                       containerStyle={styles.inputDivide}
                                       inputStyle={styles.textInput}
                                       inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd',}}
                                       placeholderTextColor='darkgrey'
                                       placeholder='First Name'
                                       value={firstName}
                                       onChangeText = {val=> onChangeInput(val, lNameRef, setFirstName) }
                                       onSubmitEditing={()=>lNameRef.focus()}
                                   />
                                   <Input
                                       ref={ref=>lNameRef=ref}
                                       containerStyle={styles.inputDivide}
                                       inputStyle={styles.textInput}
                                       inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd',}}
                                       placeholderTextColor='darkgrey'
                                       placeholder='Last Name'
                                       value={lastName}
                                       onChangeText={val=>onChangeInput(val, emailRef, setLastName)}
                                       onSubmitEditing={()=>emailRef.focus()}
                                   />
                               </View>
                               <Input
                                   ref={ref=>emailRef=ref}
                                   containerStyle={styles.input}
                                   inputStyle={styles.textInput}
                                   inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd',}}
                                   placeholderTextColor='darkgrey'
                                   placeholder='Email Address'
                                   keyboardType={"email-address"}
                                   value={email}
                                   onChangeText={val=>onChangeInput(val, phoneRef, setEmail)}
                                   onSubmitEditing={()=>phoneRef.focus()}
                               />
                               <Input
                                   ref={ref=>phoneRef=ref}
                                   containerStyle={styles.input}
                                   inputStyle={styles.textInput}
                                   inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd',}}
                                   placeholderTextColor='darkgrey'
                                   placeholder='Phone Number'
                                   keyboardType={"decimal-pad"}
                                   value={phone}
                                   onChangeText={val=>onChangeInput(val, addrRef, setPhone)}
                                   onSubmitEditing={()=>addrRef.focus()}
                               />

                               <DatePicker
                                   ref={ref=>dobRef=ref}
                                   style={{width:'100%', backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 5}}
                                   date={dob}
                                   mode="date"
                                   androidMode ='spinner'
                                   placeholder="Birthday"
                                   format="YYYY-MM-DD"
                                   minDate="1920-01-01"
                                   maxDate="2100-01-01"
                                   confirmBtnText="Confirm"
                                   cancelBtnText="Cancel"
                                   customStyles={{
                                       dateIcon: {
                                           position: 'absolute',
                                           left: 0,
                                           top: 4,
                                           marginLeft: 0
                                       },
                                       dateInput: {
                                           backgroundColor: 'white',
                                           borderRadius: 10,
                                           marginLeft: 0,
                                           borderColor:'#0000',
                                           borderBottomWidth:1,
                                           borderBottomColor:'#eee',
                                           alignItems:'flex-start',
                                           paddingLeft:40,
                                       }
                                   }}
                                   onDateChange={(date) => {setDob( date )}}
                               />
                               <View style={styles.divideField}>
                                   <RNPickerSelect
                                       ref={ref=>cityRef=ref}
                                       placeholder={{
                                           label: 'Select City',
                                           value: null,
                                       }}
                                       onValueChange={(value) => onCitySelect(value)}
                                       useNativeAndroidPickerStyle={false}
                                       style={{...pickerSelectStyles}}
                                       items={cityList}
                                       Icon={() => {
                                           return (
                                               <View
                                                   style={pickerSelectStyles.icon}
                                               />
                                           );
                                       }}
                                   />
                                   <Input
                                       ref={ref=>stateRef=ref}
                                       containerStyle={{width:'30%'}}
                                       inputStyle={styles.textInput}
                                       inputContainerStyle={{flex:1, borderBottomWidth:0.8, borderColor: '#ddd',}}
                                       placeholderTextColor='darkgrey'
                                       placeholder='State'
                                       value={state}
                                       // onChangeText={val=>onChangeInput(val, addrRef, setState) }
                                       onSubmitEditing={()=>addrRef.focus()}
                                   />
                               </View>
                               <Input
                                   ref={ref=>addrRef=ref}
                                   containerStyle={styles.input}
                                   inputStyle={styles.textInput}
                                   inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd',}}
                                   placeholderTextColor='darkgrey'
                                   placeholder='Address'
                                   value={address}
                                   onChangeText={val=>onChangeInput(val, cardNameRef, setAddress)}
                                   onSubmitEditing={()=> {
                                       // if(countryCode == 'US'){
                                       //     ssnRef.focus();
                                       // }else{
                                       //     cardNameRef.focus();
                                       // }
                                       postalCodeRef.focus()
                                   } }
                               />
                               <Input
                                   ref={ref=>postalCodeRef=ref}
                                   containerStyle={styles.input}
                                   inputStyle={styles.textInput}
                                   inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd',}}
                                   placeholderTextColor='darkgrey'
                                   placeholder='ZIP Code/Postal Code'
                                   value={postal_code}
                                   onChangeText={val=>onChangeInput(val, cardNameRef, setPostalCode)}
                                   onSubmitEditing={()=> {
                                       if(countryCode == 'US'){
                                           ssnRef.focus();
                                       }else{
                                           cardNameRef.focus();
                                       }

                                   } }
                               />
                               {
                                   countryCode == 'US' ?
                                       <Input
                                           ref={ref=>ssnRef=ref}
                                           containerStyle={styles.input}
                                           inputStyle={styles.textInput}
                                           inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd',}}
                                           placeholderTextColor='darkgrey'
                                           placeholder='SSN'
                                           value={ssn}
                                           onChangeText={val=>onChangeInput(val, cardNameRef, setSSN, 9)}
                                           onSubmitEditing={()=>cardNameRef.focus()}
                                       /> : null
                               }

                               <Input
                                   ref={ref=>cardNameRef=ref}
                                   containerStyle={styles.input}
                                   inputStyle={styles.textInput}
                                   inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd',}}
                                   placeholderTextColor='darkgrey'
                                   placeholder='Card Holder Name'
                                   value={cardName}
                                   onChangeText={val=>onChangeInput(val, cardNumberRef, setCardName)}
                                   onSubmitEditing={()=>cardNumberRef.focus()}
                               />

                               <CardNumber4Input
                                   setRef={ref=>cardNumberRef = ref}
                                   cardNumber={''}
                                   onChangeNumber={(val1, val2,val3,val4)=>{
                                       console.log(val1, val2, val3, val4)
                                       setCardNumber(val1.toString()+val2.toString()+val3.toString()+val4.toString())
                                   }}
                                   onSubmitLast={()=>cardMMRef.focus()}/>

                               <View style={styles.divideField}>
                                   <View style={{
                                       flexDirection:'row',
                                       justifyContent:'center',
                                       alignItems:'center',
                                       width:'50%',
                                   }}>
                                       <Input
                                           ref={ref=>cardMMRef=ref}
                                           containerStyle={styles.inputDivide}
                                           inputStyle={{...styles.textInput,  textAlign:'center'}}
                                           inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd',}}
                                           placeholderTextColor='darkgrey'
                                           keyboardType={"decimal-pad"}
                                           placeholder='MM'
                                           value={cardMonth}
                                           onChangeText={val=>onChangeInput(val, cardYYRef, setCardMonth, 2) }
                                           onSubmitEditing={()=>cardYYRef.focus()}
                                       />
                                       <Text>/</Text>
                                       <Input
                                           ref={ref=>cardYYRef=ref}
                                           containerStyle={styles.inputDivide}
                                           inputStyle={{...styles.textInput,  textAlign:'center'}}
                                           inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd',}}
                                           placeholderTextColor='darkgrey'
                                           keyboardType={"decimal-pad"}
                                           placeholder='YYYY'
                                           value={cardYear}
                                           onChangeText={val=>onChangeInput(val, cardCVCRef, setCardYear, 4)}
                                           onSubmitEditing={()=> cardCVCRef.focus()}
                                       />
                                   </View>

                                   <Input
                                       ref={ref=>cardCVCRef=ref}
                                       containerStyle={styles.inputDivide}
                                       inputStyle={{...styles.textInput,  textAlign:'center'}}
                                       inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#ddd',}}
                                       placeholderTextColor='darkgrey'
                                       placeholder='CVV'
                                       keyboardType={"decimal-pad"}
                                       value={cardCVC}
                                       onChangeText={val=>onChangeInput(val, null, setCardCVC, 3)}

                                   />
                               </View>

                               <TouchableOpacity
                                   onPress={()=>{setIsInputMode(false)}}
                                   style={{position:'absolute', top:12, right:12,}}>
                                   <EvilIcons color={Constants.purpleColor} name={'close'} size={30}/>
                               </TouchableOpacity>
                           </View>
                           <View style={styles.buttonField}>
                               <TouchableOpacity style = {styles.submitButton} onPress={onSubmit}>
                                   <Text style = {styles.submitButtonText}> Submit </Text>
                               </TouchableOpacity>
                           </View>
                       </View>
                   </ScrollView> :
                   <PaymentVerifyResult
                       verifyResult={verifyResult}
                       onRefresh={checkVerify}
                       onTapEnterMethod={()=>{
                           setIsInputMode(true)
                       }}
                   />) :
                   <BallIndicator color={Constants.purpleColor} size={45}/>
            }

                <HeaderBar
                    title="Payment Verfication"
                    onLeftButton = {()=>{navigation.toggleDrawer();}}
                    onRightButton={()=>{ navigation.navigate('user_detail') }}
                />
                
            </KeyboardAvoidingView>
        </SafeAreaView>
        </>
    )

}




function PaymentVerifyResult ({verifyResult, onRefresh, onTapEnterMethod}){

    const Description = ()=>{
        return <View style={{padding:20}}>
            <Text style={{fontSize:15}}>
                Payment verify will take a few minutes, please check after a moment.
            </Text>
        </View>;
    }

    if( verifyResult && verifyResult.stripe_account && verifyResult.stripe_account.external_accounts
        && verifyResult.stripe_account.external_accounts.data  && verifyResult.stripe_account.external_accounts.data.length > 0 ){
        
        let data  = verifyResult.stripe_account.external_accounts.data[0]

        return <View style={{ flex:1, marginHorizontal:30, marginTop:80, alignItems:'stretch', justifyContent:'center' }}>

            <Description/>

            <View style={{
                borderRadius:15,
                height:50,
                paddingHorizontal:15,
                backgroundColor:'white',
                flexDirection:'row',
                justifyContent:'space-between',
                alignItems:'center',
                borderColor:verifyResult.status == 'active' ? Constants.green : Constants.googleColor,
                borderWidth:1,
            }}>
                <Text style={{color:verifyResult.status == 'active' ? Constants.grayColor : Constants.googleColor, marginRight:20, fontSize:17}}> Payment Card </Text>
                <Text style={{color: Constants.purpleColor, fontSize:18}}>**** **** **** {data.last4}</Text>
            </View>
            <View style={{marginBottom:5, alignItems:'flex-start', marginTop:10}}>
                <Text style={{color: verifyResult.status == 'active' ? Constants.green : Constants.googleColor}}> {verifyResult.status ? verifyResult.status.toUpperCase() : ''}</Text>
            </View>

                {
                    verifyResult.requirements && verifyResult.requirements.errors ?
                        verifyResult.requirements.errors.map((error, index)=>{
                            if( index > 0 && verifyResult.requirements.errors[index-1].code == error.code){
                                return null;
                            }
                            return <Text style={{paddingVertical:5, paddingHorizontal:10}}>{error.reason}</Text>
                        })
                    :null
                }
                <View style={{alignItems:'stretch', flexDirection:'row', justifyContent:'center', marginTop:40, paddingBottom:10,}}>
                    <TouchableOpacity
                        style={{ 
                            width:'40%', 
                            height:45,                            
                            alignItems:'center', 
                            justifyContent:'center' , 
                            backgroundColor: 'white', 
                            marginRight:20, 
                            borderRadius:13 , 
                            borderColor: Constants.grayColor,
                            borderWidth:1,
                            
                        }}
                        onPress={()=>{
                            if(onRefresh){
                                onRefresh();
                            }
                        }}>
                        <Text style={{color : Constants.purpleColor, fontSize:15}} > Refresh </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ 
                            width:'40%', 
                            height:45, 
                            alignItems:'center', 
                            justifyContent:'center' , 
                            backgroundColor: Constants.purpleColor, 
                            borderRadius:13 , 
                            borderRadius:13 , 
                            borderColor: Constants.grayColor,                            
                        }}
                        onPress={()=>{
                            if(onTapEnterMethod){
                                onTapEnterMethod();
                            }
                        }}>
                        <Text style={{color : 'white', fontSize:15}} > New Method </Text>
                    </TouchableOpacity>
                </View>

        </View>

    }else{
        // not verified any card.

        let msg = 'No Payment Method';
        if( verifyResult && !verifyResult.stripe_account ){
            msg = 'Please submit payment method.'
        }

        return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            {/* <Description/> */}
            <EmptyHolder isLoading={false} placeholder={msg} isShow={true} onPressRefresh={()=>{
                if(onRefresh){
                    onRefresh();
                }
            }}/>
            <TouchableOpacity
                style={{
                    // paddingHorizontal:20, 
                    // paddingVertical:10, 
                    alignItems:'center',
                    justifyContent:'center',
                    backgroundColor: Constants.purpleColor, 
                    borderRadius:25, 
                    position:'absolute',
                    bottom:20, 
                    right:20,
                    width:50, 
                    height:50 , 
                    elevation:6}}
                onPress={()=>{
                    if(onTapEnterMethod){
                        onTapEnterMethod();
                    }
                }}>
                <AntDesign name="plus" color={Constants.white} size={30}/>
                
                {/* <Text style={{color : Constants.purpleColor, fontSize:15}} > Submit New Method </Text> */}
            </TouchableOpacity>
        </View>
    }


}

const styles = StyleSheet.create({

    imageCover: {
        flex: 1,
    },
    mainBoard:{
        width: screenWidth,
        height: screenHeight,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inforField:{
        marginTop: 0,
        width: screenWidth * 0.85,        
        paddingVertical:30,
        paddingHorizontal:20,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        backgroundColor: '#fff',
        borderRadius: 30,
        borderColor:'#ddd',
        borderWidth:2,
        borderTopWidth:3,
        borderTopColor : Constants.purpleColor
    },
    buttonField:{
        marginTop: -25,
        width: screenWidth * 0.8,
        height: 50,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        zIndex:1000,
    
    },
    submitButton: {
        backgroundColor: '#6733bb',
        height: 50,
        width: '60%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation:15,
        zIndex:100,
    },
    submitButtonText:{
        padding: 15,
        fontSize: 17,
        color: '#fff',
    },
    divideField:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // width: '100%',
        height: 50,        
    },
    input: {
        // width: '90%',
        height: 50,
        marginVertical:0,
    },
    inputDivide:{
        
        width: '49%',
        // height: '100%',
        // borderWidth:2,
        // borderColor:'red'
    },
    textInput: {
        color: '#555',
        width: '100%',
        fontSize: 15,
    },
    line:{
        width:'40%',
        borderBottomColor: '#6733bb',
        borderBottomWidth: 4,
        position:'absolute',
        top:5,
    },
})



const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        textAlign: 'left',
        width:  Constants.WINDOW_WIDTH * 0.5,
        height: 50,
        fontSize: 15,
        borderColor: '#ddd',
        borderBottomWidth:1,
        borderRadius: 10,
        backgroundColor: 'white',
        color: 'black',
        paddingRight: 20, // to ensure the text is never behind the icon
        paddingLeft:5,
    },
    inputAndroid: {
        
        textAlign: 'left',
        width:  Constants.WINDOW_WIDTH * 0.5,
        height: 50,
        fontSize: 15,
        borderColor: '#ddd',
        borderBottomWidth:1,
        borderRadius: 10,
        backgroundColor: 'white',
        color: 'black',
        paddingRight: 20, // to ensure the text is never behind the icon
        paddingLeft:5,
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