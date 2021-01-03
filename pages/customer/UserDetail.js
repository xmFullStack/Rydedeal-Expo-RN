import React, { Component, useState } from 'react'
import { ImageBackground, Image, Button, StatusBar, View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, TextInput, StyleSheet, TouchableHighlight, Dimensions, Alert } from 'react-native'
import { Input, Avatar } from 'react-native-elements';
import CheckBox from 'react-native-check-box'
import { Ionicons, Entypo, SimpleLineIcons, MaterialCommunityIcons, FontAwesome, MaterialIcons, Octicons, Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Constants from '../../src/utils/Constants';
import HeaderBar from '../../src/components/HeaderBar';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import ImagePickerModal from '../../src/components/ImagePickerModal';
import RestAPI from '../../src/utils/RestAPI';
import { setAdvertiserIDCollectionEnabledAsync } from 'expo-facebook';
import { BallIndicator } from 'react-native-indicators';
import { useFocusEffect } from '@react-navigation/native';
import RNPickerSelect from "react-native-picker-select";
import { SafeAreaView } from 'react-native-safe-area-context';
import ZStatusBar from '../../src/components/ZStatusBar';

let screenHeight = Dimensions.get('window').height * 0.8 - 20;
let screenWidth = Dimensions.get('window').width * 0.9;

export  const GetAvatar = ()=>{
    if( global.curUser && global.curUser.profile && global.curUser.profile.avatar ){
        return {uri:global.curUser.profile.avatar}
    }
    return require('../../assets/avatar2.jpg')
}

export const GetUserName = ()=>{
    if( global.curUser ){
        return Constants.ucfirst(global.curUser.first_name) + ' ' + global.curUser.last_name
    }
    return 'Unknown'    
}

export const GetUserCity = ()=>{
    if( global.curUser && global.curUser.cities && global.curUser.cities.length > 0 ){
        return global.curUser.cities[0]
    }
    return null    
}

export const IsUserInUS = ()=>{
    let city = GetUserCity();
    if( !city ){
        return false
    }
    
    return (city.country_code.toLowerCase() == 'us')
}

const UserDetail = ({route, navigation})=>{

    let [ isChecked , setIsChecked ] = useState(false)
    let [ fname , setFname ] = useState(global.curUser.first_name)
    let [ lname , setLname ] = useState( global.curUser.last_name)
    let [ userName , setUserName ] = useState( global.curUser.name)
    let [ email, setEmail ] = useState( global.curUser.email )
    let [ phone, setPhone ] = useState( global.curUser.phone_number )
    let [ isShowImagePicker, setIsShowImagePicker ] = useState(false)
    let [ isLoading , setIsLoading ] = useState ( false )
    let [ avatar , setAvatar ] = useState( GetAvatar() )
    let userCity = GetUserCity();
    let [ selCityId , setSelCity ] = useState(userCity ? userCity.id : null)
    let [ cities, setCities ] = useState([])
     
    
    let fnameRef = null;
    let lnameRef = null;
    let phoneRef = null;
    let emailRef = null;

    
    useFocusEffect( React.useCallback(()=>{
        global.currentScreen = 'user_detail'
        if( fnameRef ){
            fnameRef.focus();
        }
        getBasicData();
        return ()=>{}
    }, []))

    const onTapAvatar = async()=>{
        let cameraPermission = await ImagePicker.getCameraPermissionsAsync();
        if( !cameraPermission.granted ){
            let res = await Permissions.askAsync(Permissions.CAMERA)
            if( !res.granted ){
                warn('Oops', 'You don\'t allow camera permissoin, please allow it.')
                return 
            }
        }
        
        let cameraRollPermission = await ImagePicker.getCameraRollPermissionsAsync();
        if( !cameraRollPermission.granted ){
            let res = await Permissions.askAsync(Permissions.CAMERA_ROLL)
            if( !res.granted){
                warn('Oops','You don\'t allow camera roll permissoin, please allow it.')
                return 
            }
        }

        setIsShowImagePicker(true)
        
    }

    const onTakePhoto = async ()=>{
        
        const { status } = await Permissions.askAsync(Permissions.CAMERA)
        if (status === 'granted') {
            const result = await ImagePicker.launchCameraAsync({allowsEditing:true})

            if (!result.cancelled) {
                setAvatar({uri:  result.uri})           
            }
        }        
        setIsShowImagePicker(false)
    }


    const onTakeFromLibrary = async ()=>{
        
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL)
        if (status === 'granted') {
            const result = await ImagePicker.launchImageLibraryAsync({allowsEditing:true})
            if (!result.cancelled) {
                setAvatar({uri:  result.uri})
            }
        }        
        setIsShowImagePicker(false)
    }

    const getBasicData = ()=>{
        setIsLoading( true )
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
            setIsLoading( false )
        })
    }

    const onSubmit = ()=>{
        if( !isChecked ){
            alert('Terms & Conditions', 'Please check terms and conditions.')
            return 
        }
        
        
        setIsLoading(true)

        RestAPI.updateProfile(fname, lname, email, phone, avatar, selCityId).then(res=>{
            if( res.success == 1){  
                let msg = 'Profile updated successfully.'
                let isPhoneChanged = res.data.phoneVerifyRequired
                if( res.data.phoneVerifyRequired == true ){
                    
                    msg += ' Required phone verify. '
                }
                if( res.data.emailVerifyRequired == true ){

                    msg += ( res.data.phoneVerifyRequired ?  ' and email verify.' : ' Required email verify.' )
                }
                let token = global.curUser.token
                global.curUser = res.data.user
                global.curUser.token = token
                
                alertOk('Success', msg, ()=>{
                    if( res.data.phoneVerifyRequired == true || res.data.emailVerifyRequired == true){
                        navigation.popToTop();
                    }
                })
            }else{
                failed('Oops', 'Failed to update profile. Because ' + res.msg)
            }
        }).catch(err=>{
            console.log(err)
            failed('Oops', 'Some errors are occured.please try again after a moment. please try again.')
        }).finally(()=>{
            setIsLoading(false)
        })
    }
    


    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

    return (
        <>        
        <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>    
        {/* <SafeAreaView style={{flex:0, backgroundColor: Constants.purpleColor}}/>     */}
        <SafeAreaView style={{flex:1}}>
        
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: '#f5f5f5', alignItems:'center'}}
            keyboardVerticalOffset={keyboardVerticalOffset}
            behavior="padding" enabled>
            <View style={{
                marginTop:-230,
                width : Constants.WINDOW_WIDTH * 2,
                height: 400,
                backgroundColor: Constants.purpleColor,
                borderBottomLeftRadius:Constants.WINDOW_WIDTH * 2  ,
                borderBottomRightRadius: Constants.WINDOW_WIDTH * 2,
                justifyContent:'flex-end',
                paddingBottom:100
            
            }}>
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={styles.TopText}>Profile Details</Text>                    
                </View>
               
            </View>
            <View style={{
                width: 100, 
                alignItems:'center', 
                marginTop:-60,                
                paddingBottom:15,
                borderRadius:45,
            }}>
                <TouchableOpacity 
                    onPress={onTapAvatar}
                >   
                    <Avatar
                        rounded
                        containerStyle={{
                             borderRadius:45,
                             elevation:10,                             
                        }}
                        // style={{borderColor:Constants.purpleColor}}                                
                        source={avatar}
                        size={100}
                        showEditButton={true}
                        editButton={{
                            name:'camera', 
                            type:'entypo', 
                            size:20, 
                            color:Constants.purpleColor, 
                            containerStyle:{
                                marginTop:-5,
                                marginLeft:-5,
                                width:30,
                                height:30,
                                padding:2,
                                backgroundColor:'#fff',
                                borderColor:Constants.purpleColor,
                                borderRadius:15,
                                borderWidth:2

                            }
                        }}
                    />
                    

                </TouchableOpacity>
            </View>
            
            <ScrollView keyboardShouldPersistTaps="always" style = {styles.container} contentContainerStyle = {{ alignItems: 'center', paddingTop:5 }}>
                <View style={styles.mainContainer}>

                    <View style={{marginBottom:20, marginTop:20}}>

                        <Input
                            containerStyle={styles.input}
                            inputStyle={styles.textInput}
                            inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#dfdfdf'}}
                            placeholderTextColor='darkgrey'
                            overflow="hidden"
                            placeholder='First Name'
                            ref={ref=>fnameRef = ref}
                            onSubmitEditing={()=>lnameRef.focus()}
                            value={fname}
                            onChangeText={val=>setFname(val)}
                            leftIcon={ <FontAwesome name="newspaper-o" size={16} style={{paddingRight:20}} color="#444" /> }
                        />
                        <Input
                            containerStyle={styles.input}
                            inputStyle={styles.textInput}
                            inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#dfdfdf'}}
                            placeholderTextColor='darkgrey'
                            overflow="hidden"
                            placeholder='Last Name'
                            ref={ref=>lnameRef= ref}
                            onSubmitEditing={()=>phoneRef.focus()}
                            value={lname}
                            onChangeText={val=>setLname(val)}
                            leftIcon={ <FontAwesome name="newspaper-o" size={16} style={{paddingRight:20}} color="#444" /> }
                        />

                        <Input
                            containerStyle={styles.input}
                            inputStyle={styles.textInput}
                            inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#dfdfdf'}}
                            placeholderTextColor='darkgrey'
                            overflow="hidden"
                            placeholder='Phone Number'
                            ref={ref=>phoneRef = ref}
                            onSubmitEditing={()=>emailRef.focus()}
                            value={phone}
                            onChangeText={val=>setPhone(val)}
                            leftIcon={ <MaterialIcons name="phone-android" size={16} style={{paddingRight:22}} color="#444" /> }
                        />
                        <Input
                            containerStyle={styles.input}
                            inputStyle={styles.textInput}
                            inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#dfdfdf'}}
                            placeholderTextColor='darkgrey'
                            overflow="hidden"
                            placeholder='Email Address'
                            ref={ref=>emailRef=ref}
                            value={email}
                            onChangeText={val=>setEmail(val)}
                            leftIcon={ <MaterialCommunityIcons name="email" size={16} style={{paddingRight:20}} color="#444" /> }
                        />

                        <View
                            style={{
                                width:'80%',
                                height: '16.5%',
                                marginLeft:'10%',
                                borderBottomColor:'#EEE',
                                borderBottomWidth:1,
                                flexDirection:'row',
                                alignItems:'center',
                                paddingLeft:6,
                                // alignContent:'stretch'
                            }}
                        >
                            <MaterialCommunityIcons  name="city" size={20} color={'#444'}/>
                            <RNPickerSelect
                                placeholder={{
                                    label: 'Select City',
                                    value: null,
                                }}
                                onValueChange={(value) => setSelCity(value) }
                                useNativeAndroidPickerStyle={false}
                                style={{...pickerSelectStyles}}
                                items={cities}
                                value={selCityId}
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
                    <View style = {styles.socialSignup}>
                        <CheckBox
                            style={{flex: 1, padding: 10}}
                            checkBoxColor = '#6733bb'
                            onClick={()=>{
                                setIsChecked(!isChecked)
                            }}
                            isChecked={isChecked}
                        />
                        <TouchableOpacity style={{marginTop: 10, width: '85%'}} 
                            onPress={()=>{
                                setIsChecked(!isChecked)
                                navigation.navigate('web_page', {link:'https://rydedeal.com/mobile/policy', title:'Privacy & Policy'})
                            }}>
                            <Text >I agree to Terms and services, Privacy, policy and content Privacy</Text>
                        </TouchableOpacity>

                    </View>
                </View>
                <View style={{ width: '90%', elevation: 1, marginTop: -30, paddingBottom:10,}}>
                {
                    isLoading ? <BallIndicator color={Constants.purpleColor} size={45}/>:
                    <TouchableOpacity style = {styles.submitButton} onPress={onSubmit}>
                        <Text style = {styles.submitButtonText}> Submit </Text>
                    </TouchableOpacity>
                }
                
            </View>
            </ScrollView>
            <ImagePickerModal 
                isShow={isShowImagePicker} 
                onCancel={()=>setIsShowImagePicker(false)} 
                onTakePhoto={onTakePhoto} 
                onLibrary={onTakeFromLibrary}/>
            <HeaderBar 
                title="" 
                rightIcon={<Text style={{color:'#fff', fontSize:15}}>{Constants.getUserRoles(0).name}</Text>}
                onLeftButton = {()=>{navigation.toggleDrawer();}}
                onRightButton={()=>{}}
                isShowRight={true}                    
                backgroundColor={'#fff0'}
                leftIconColor = {'#fff'}
            />
            
        </KeyboardAvoidingView>
        
        </SafeAreaView>
        </>
    )
}

export default UserDetail

const styles = StyleSheet.create({
    
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
        marginBottom:10

    },
    mainContainer: {
        flex: 1,
        // height:Constants.WINDOW_HEIGHT * 0.6,        
        // height: screenHeight,
        paddingTop:0,
        paddingBottom:60,
        width: screenWidth,
        borderRadius: 25,
        backgroundColor: '#fff',
        zIndex: 0,
        elevation: 1
    },
    input: {
        width: '90%',
        marginLeft: '5%',
        height: 50,
        padding: 5,
    },
    textInput: {
        color: '#555',
        width: '100%',
    },

    TopText: {
        color: '#fff',
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
        width: '60%',
        marginLeft: '20%',
        borderRadius: 15,
        elevation:10,
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
        // height: '15%',
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


const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        marginLeft:18,        
        textAlign: 'left',
        width: Constants.WINDOW_WIDTH * 0.7,
        height: 40,
        fontSize: 17,
        borderColor: 'transparent',
        borderRadius: 10,
        backgroundColor: 'white',
        color: 'black',
        paddingRight: 10, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        marginLeft:18,        
        textAlign: 'left',
        width: Constants.WINDOW_WIDTH * 0.7,
        height: 40,
        fontSize: 17,
        borderColor: '#555',
        borderRadius: 10,
        backgroundColor: 'white',
        color: 'black',
        paddingRight: 10, // to ensure the text is never behind the icon
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