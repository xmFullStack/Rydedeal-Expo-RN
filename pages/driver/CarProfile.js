import React, {Component, useReducer, useState, useEffect} from 'react'
import {
    Alert,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    AsyncStorage,
    ImageBackground, ScrollView, KeyboardAvoidingView, Platform,
    Image,
} from 'react-native'
import {Avatar, Input} from 'react-native-elements';
import {SimpleLineIcons, AntDesign, createIconSetFromFontello} from "@expo/vector-icons";
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import RNPickerSelect from "react-native-picker-select";
import RestAPI from '../../src/utils/RestAPI';
import Constants from '../../src/utils/Constants';
import ImagePickerModal from '../../src/components/ImagePickerModal';
import {GetAvatar, GetUserCity, IsUserInUS} from '../customer/UserDetail';

import HeaderBar from '../../src/components/HeaderBar';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import {SafeAreaView} from "react-native-safe-area-context";
import {ResErrCodes} from "../../src/utils/DefaultCodes";
import ZStatusBar from '../../src/components/ZStatusBar';
import {PulseIndicator, BallIndicator} from 'react-native-indicators';

let screenHeight = Dimensions.get('screen').height;
let screenWidth = Dimensions.get('screen').width;

let defaultImage = require('../../assets/default.jpg')

const CarProfile = ({}) => {

    const navigation = useNavigation();
    const route = useRoute();

    let [isLoading, setIsLoading] = useState(false)
    let [avatar, setAvatar] = useState(GetAvatar())
    let [isShowImagePicker, setIsShowImagePicker] = useState(false)

    let [name, setName] = useState(global.curUser.car ? global.curUser.car.name : '')
    let [license_number, setLicenseNumber] = useState(global.curUser.car ? global.curUser.car.license_number : '')
    let [year_of_model, setYearOfModel] = useState(global.curUser.car ? global.curUser.car.year_of_model : '')
    let [bio, setBio] = useState(global.curUser.profile ? global.curUser.profile.bio : '')

    let initCarImg = global.curUser && global.curUser.car && global.curUser.car.photo ? {uri: global.curUser.car.photo} : defaultImage;
    let initLicenseImage = global.curUser && global.curUser.car && global.curUser.car.license_image ? {uri: global.curUser.car.license_image} : defaultImage;
    let initPlateImg = global.curUser && global.curUser.car && global.curUser.car.car_number_plate ? {uri: global.curUser.car.car_number_plate} : defaultImage;


    let [licenseImgSource, setLicenseImgSource] = useState(initLicenseImage);
    let [carNumberImgSource, setCarNumberImgSource] = useState(initPlateImg);
    let [carImgSource, setCarImgSource] = useState(initCarImg);
    let [rideTypeValue, setRideTypeValue] = useState(global.curUser?.car?.ride_type_id)
    let [curSelectedType, setCurSelectedType] = useState(0)

    let [subscriptionPlan, setSubscriptionPlan] = useState(null)
    let [cityPlan, setCityPlan] = useState(null)
    let [rideTypeList, setRideTypeList] = useState([])

    let initSSN = '';
    if (IsUserInUS()) {
        initSSN = global.curUser && global.curUser.car ? global.curUser.car.ssn : null;
    }
    let [ssn, setSSN] = useState(initSSN);
    let [isShowPlan, setIsShowPlan] = useState(false)
    let [isSubscriptionChecking, setIsSubscriptionChecking] = useState(false)

    useFocusEffect(React.useCallback(() => {
        global.currentScreen = "Setting"

        getSubscription();
        getRideTypeList();
        return () => {
        }
    }, []))

    const getRydeTypeList = (typeList) => {
        let types = []
        if (typeList && typeList.length > 0) {
            types = typeList.map(item => {
                return {label: item.title + ' ( Max: ' + item.seats + ' seats )', value: item.id, seats: item.seats}
            })
        }
        return types;
    }


    let [rydeTypes, setRydeTypes] = useState([])

    useEffect(() => {
        setRydeTypes(getRydeTypeList(rideTypeList))
    }, [rideTypeList])

    const getRideTypeList = () => {
        RestAPI.allRideTypes().then(res => {
            if (res.success == 1) {
                setRideTypeList(res.data)
                if (rideTypeValue == null && res.data?.length > 0) {
                    setRideTypeValue(res.data[0].id)
                }
            } else {
                warn('Oops!', 'Failed to get car types, please try again after reload app.')
            }
        }).catch(err => {
            failed('Oops', 'Failed to get car types, please try again after reload app.' + JSON.stringify(err))
        }).finally(() => {
        })
    }
    const getSubscription = () => {

        // if(!global.curUser.approved_at){
        //     return 
        // }

        setIsLoading(true)
        RestAPI.getSubscription().then(res => {
            console.log('Subscription result:', res)
            if (res.success == 1) {

                setSubscriptionPlan(res.data.cur_plan);
                setCityPlan(res.data.city_plan.subscription_plan)
                if (res.data.cur_plan.is_expired == 1 && global.curUser.approved_at) {
                    setIsShowPlan(true)
                }
            } else {
                console.log('getsubscription', res.err_code + ' - ' + JSON.stringify(res.data.subscription_plan))
                if (res.err_code == ResErrCodes.NO_SUBSCRIPTION) {
                    setSubscriptionPlan(null);
                    if (global.curUser.approved_at) {
                        setIsShowPlan(true)
                    }
                    setCityPlan(res.data.subscription_plan)
                } else {
                    failed('Oops', res.msg)
                }
            }
        }).catch(err => {
            console.log(err);
            failed('Oops', 'Somethings went wrong while fetch subscription plan. please try again.')
        }).finally(() => {
            setIsLoading(false)
        })

    }

    const onTapAvatar = async () => {
        let cameraPermission = await ImagePicker.getCameraPermissionsAsync();
        if (!cameraPermission.granted) {
            let res = await Permissions.askAsync(Permissions.CAMERA)
            if (!res.granted) {
                failed('Oops', 'You don\'t allow camera permissoin, please allow it.')
                return
            }
        }

        let cameraRollPermission = await ImagePicker.getCameraRollPermissionsAsync();
        if (!cameraRollPermission.granted) {
            let res = await Permissions.askAsync(Permissions.CAMERA_ROLL)
            if (!res.granted) {
                failed('Oops', 'You don\'t allow camera roll permissoin, please allow it.')
                return
            }
        }
        setCurSelectedType(0);

        setIsShowImagePicker(true)

    }

    const setCurrentImageSource = (type, result) => {
        if (type == 0) {
            setAvatar({uri: result.uri})
        }
        if (type == 1) {
            setLicenseImgSource({uri: result.uri})
        }
        if (type == 2) {
            setCarNumberImgSource({uri: result.uri})
        }
        if (type == 3) {
            setCarImgSource({uri: result.uri})
        }

    }

    const onTapImages = async (imgType) => {
        let cameraPermission = await ImagePicker.getCameraPermissionsAsync();
        if (!cameraPermission.granted) {
            let res = await Permissions.askAsync(Permissions.CAMERA)
            if (!res.granted) {
                warn('Oops', 'You don\'t allow camera permission, please allow it.')
                return
            }
        }

        let cameraRollPermission = await ImagePicker.getCameraRollPermissionsAsync();
        if (!cameraRollPermission.granted) {
            let res = await Permissions.askAsync(Permissions.CAMERA_ROLL)
            if (!res.granted) {
                warn('Oops', 'You don\'t allow camera roll permissoin, please allow it.')
                return
            }
        }

        setCurSelectedType(imgType);

        setIsShowImagePicker(true)

    }

    const onTakePhoto = async () => {

        const {status} = await Permissions.askAsync(Permissions.CAMERA)
        if (status === 'granted') {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            })
            if (!result.cancelled) {
                setCurrentImageSource(curSelectedType, result)
            } else {
                // failed('Oops', 'Canceled photo camera.')
            }
        } else {
            failed('Permission Limit', 'Camera permission is not allowed, please try to allow.')
        }
        setIsShowImagePicker(false)
    }

    const onTakeFromLibrary = async () => {
        // 
        const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL)
        if (status === 'granted') {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            })
            if (!result.cancelled) {
                // setAvatar({uri:  result.uri})
                setCurrentImageSource(curSelectedType, result)
            } else {
                // failed('Canceled', 'Canceled library.')
            }
        } else {
            failed('Permission Limit', 'Photo library permission is not allowed.')
        }
        setIsShowImagePicker(false)
    }


    const validate = () => {
        if (!license_number) {
            warn('Validation Error', 'Please input license number.')
            return false
        }
        if (!name) {
            warn('Validation Error', 'Please input name of car.')
            return false
        }

        if (!year_of_model) {
            warn('Validation Error', 'Please input Year of model.')
            return false
        }
        if (!bio) {
            warn('Validation Error', 'Please input bio.')
            return false
        }
        if (!carImgSource) {
            warn('Validation Error', 'Please take car image.')
            return false
        }
        if (!licenseImgSource) {
            warn('Validation Error', 'Please take license image.')
            return false
        }
        if (!carNumberImgSource) {
            warn('Validation Error', 'Please take photo of number plate.')
            return false
        }
        if (IsUserInUS() && !ssn) {
            warn('Validation Error', 'Please input SSN.')
            return false
        }
        return true

    }

    const onSubmit = () => {

        if (!validate()) {
            return
        }

        let data = {
            ride_type_id: rideTypeValue,
            license_number: license_number,
            car_name: name,
            year_of_model: year_of_model,
            bio: bio,
            photo: {
                uri: carImgSource.uri,
                type: 'image/jpeg',
                name: 'carImage'
            },
            license_image: {
                uri: licenseImgSource.uri,
                type: 'image/jpeg',
                name: 'licenseImage'
            },
            car_number_plate: {
                uri: carNumberImgSource.uri,
                type: 'image/jpeg',
                name: 'numberplateImage'
            },
        }

        if (IsUserInUS()) {
            data.ssn = ssn
        }

        showPageLoader(true)
        setIsLoading(true)
        RestAPI.updateCarProfile(data).then(res => {
            if (res.success == 1) {
                let token = global.curUser.token;
                global.curUser = res.data;
                global.curUser.token = token

                alertOk('Success', 'Profile got submitted and waiting for approvals', () => {
                    navigation.navigate('Main')
                })
            } else {
                failed('Oops', res.msg)
            }
        }).catch(err => {
            console.log(err)

            failed('Oops', 'Somethings wrong. please try again.')
        }).finally(() => {
            showPageLoader(false)
            setIsLoading(false)
        })
    }


    const onTapPlanItem = (item) => {
        if (!global.curUser.approved_at) {
            alert('No Approved', ' Your driver account is not approved yet, please wait...')
            return
        }

        if (item.plan == 'monthly') {

            setIsLoading(true);
            RestAPI.chargeForMonth().then(res => {
                if (res.success == 1) {
                    getSubscription()
                    alert('Success', res.msg)
                } else {
                    failed('Oops', res.msg)
                }
            }).catch(err => {
                console.log(err)
                failed('Oops', 'Somethings went wrong. please try again.')
            }).finally(() => {
                setIsLoading(false)
            })

        } else if (item.plan == 'trial') {

            setIsLoading(true);
            RestAPI.chargeForTrial().then(res => {
                if (res.success == 1) {
                    getSubscription()
                    alert('Success', res.msg)
                } else {
                    failed('Oops', res.msg)
                }
            }).catch(err => {
                console.log(err)
                failed('Oops', 'Somethings went wrong. Please try again.')
            }).finally(() => {
                setIsLoading(false);
            })
        }

    }

    const gotoSubscriptionPage = () => {
        if (global.curUser.approved_at) {
            setIsShowPlan(!isShowPlan)
        } else {
            // TODO approve checking
            setIsSubscriptionChecking(true)
            RestAPI.checkToken(global.expoPushToken, global.UUID).then(async (res) => {

                global.curUser = res.data
                await AsyncStorage.setItem('cur_user', JSON.stringify(global.curUser))
                if (global.curUser.approved_at) {
                    setIsShowPlan(!isShowPlan)
                } else {
                    alert('No Approved', 'Your account has not been approved yet. After approved, you can try to register billing method and purchase subscription. Please wait...')
                }

            }).catch(err => {
                console.log(err)
                failed('Oops', 'Somethings went wrong. Please try again.')

            }).finally(() => {
                setIsSubscriptionChecking(false)
            })
        }

    }

    // let plan = subscriptionPlan ? subscriptionPlan.plan : 'No Subscription';
    let plan = isShowPlan ? 'Setting' : 'Subscription';
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;
    return (
        <View style={{flex: 1}}>
            <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
            {/* <SafeAreaView style={{flex:0, backgroundColor: Constants.purpleColor}}/> */}
            <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f5'}}>

                <KeyboardAvoidingView
                    style={{flex: 1, alignItems: 'center'}}
                    keyboardVerticalOffset={keyboardVerticalOffset}
                    behavior="padding"
                    enabled
                >
                    <View style={{
                        marginTop: -230,
                        width: Constants.WINDOW_WIDTH * 2,
                        height: 400,
                        backgroundColor: Constants.purpleColor,
                        borderBottomLeftRadius: Constants.WINDOW_WIDTH * 2,
                        borderBottomRightRadius: Constants.WINDOW_WIDTH * 2,
                        justifyContent: 'flex-end',
                        alignSelf: 'center',
                        paddingBottom: 100
                    }}>
                    </View>
                    <View style={{
                        width: 100,
                        alignItems: 'center',
                        marginTop: -60,
                        paddingBottom: 15,
                        borderRadius: 45,
                    }}>
                        {/* <TouchableOpacity  onPress={onTapAvatar} >  */}
                        <Avatar
                            rounded
                            containerStyle={{
                                borderRadius: 65,
                                borderColor: '#f5f5f5',
                                borderWidth: 4,
                                elevation: 10,
                            }}
                            source={avatar}
                            showEditButton={false}
                            // editButton={{
                            //     name:'camera',
                            //     type:'entypo',
                            //     size:20,
                            //     color:Constants.purpleColor,
                            //     containerStyle:{
                            //         marginTop:-10,
                            //         marginLeft:-10,
                            //         width:30,
                            //         height:30,
                            //         padding:2,
                            //         backgroundColor:'#fff',
                            //         borderColor:Constants.purpleColor,
                            //         borderRadius:15,
                            //         borderWidth:2
                            //     }
                            // }}
                            size={130}
                        />
                        {/* </TouchableOpacity> */}
                    </View>
                    <ScrollView keyboardShouldPersistTaps="always" style={styles.container}
                                contentContainerStyle={{alignItems: 'center',}}>


                        <View style={styles.mainBoard}>
                            {
                                isShowPlan && isLoading ? <BallIndicator color={Constants.purpleColor} size={45}/> :
                                    <SubscriptionPlanView
                                        isShow={isShowPlan}
                                        curPlan={subscriptionPlan}
                                        cityPlan={cityPlan}
                                        onTapPlanItem={(item) => {
                                            onTapPlanItem(item)
                                        }}/>
                            }


                            {
                                !isShowPlan && <>
                                    <View style={styles.inforField}>
                                        <View style={{flexDirection: 'row', alignItems: 'center', width: '90%',}}>
                                            <RNPickerSelect
                                                placeholder={{}}
                                                value={parseInt(rideTypeValue)}
                                                onValueChange={(value) => setRideTypeValue(value)}
                                                useNativeAndroidPickerStyle={false}
                                                style={{...pickerSelectStyles}}
                                                items={rydeTypes}
                                                Icon={() => {
                                                    return (
                                                        <View
                                                            style={pickerSelectStyles.icon}
                                                        />
                                                    );
                                                }}
                                            />
                                        </View>

                                        <Input
                                            containerStyle={styles.input}
                                            inputStyle={styles.textInput}
                                            inputContainerStyle={{borderBottomWidth: 0.8, borderColor: '#ddd',}}
                                            placeholderTextColor='darkgrey'
                                            placeholder='Licence Number'
                                            value={license_number}
                                            onChangeText={val => setLicenseNumber(val)}
                                        />
                                        <Input
                                            containerStyle={styles.input}
                                            inputStyle={styles.textInput}
                                            inputContainerStyle={{borderBottomWidth: 0.8, borderColor: '#ddd',}}
                                            placeholderTextColor='darkgrey'
                                            placeholder='Car Name'
                                            value={name}
                                            onChangeText={value => setName(value)}
                                        />
                                        <Input
                                            containerStyle={styles.input}
                                            inputStyle={styles.textInput}
                                            inputContainerStyle={{borderBottomWidth: 0.8, borderColor: '#ddd',}}
                                            placeholderTextColor='darkgrey'
                                            placeholder='Year Of Model'
                                            value={year_of_model}
                                            onChangeText={val => setYearOfModel(val)}
                                        />
                                        {
                                            IsUserInUS() ?
                                                <Input
                                                    containerStyle={styles.input}
                                                    inputStyle={styles.textInput}
                                                    inputContainerStyle={{borderBottomWidth: 0.8, borderColor: '#ddd',}}
                                                    placeholderTextColor='darkgrey'
                                                    placeholder='SSN'
                                                    value={ssn}
                                                    onChangeText={val => setSSN(val)}
                                                /> :
                                                null
                                        }

                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'stretch',
                                                marginVertical: 10,
                                            }}
                                        >
                                            <TouchableOpacity style={styles.img3Row} onPress={() => onTapImages(1)}>
                                                <Image
                                                    style={styles.img3one}
                                                    source={licenseImgSource}
                                                />
                                                <View style={styles.img3TextBack}>
                                                    <Text style={{
                                                        fontSize: 12,
                                                        color: Constants.backWhite
                                                    }}>License</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.img3Row} onPress={() => onTapImages(2)}>
                                                <Image
                                                    style={styles.img3one}
                                                    source={carNumberImgSource}
                                                />
                                                <View style={styles.img3TextBack}>
                                                    <Text style={{fontSize: 12, color: Constants.backWhite}}>Car
                                                        Number</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.img3Row} onPress={() => onTapImages(3)}>
                                                <Image
                                                    style={styles.img3one}
                                                    source={carImgSource}
                                                />
                                                <View style={styles.img3TextBack}>
                                                    <Text style={{fontSize: 12, color: Constants.backWhite}}>Car</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        <Input
                                            containerStyle={styles.inputDescription}
                                            inputStyle={styles.textInputDescription}
                                            inputContainerStyle={{
                                                borderBottomWidth: 0.8,
                                                borderBottomColor: '#ddd',
                                                height: 100,
                                            }}
                                            placeholderTextColor='darkgrey'
                                            placeholder='Introduce Yourself'
                                            multiline={true}
                                            value={bio}
                                            onChangeText={val => setBio(val)}
                                        />

                                    </View>

                                    <View style={styles.buttonField}>
                                        {
                                            isLoading && false ?
                                                <BallIndicator color={Constants.purpleColor} size={45}/> :
                                                <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                                                    <Text style={styles.submitButtonText}> Submit </Text>
                                                </TouchableOpacity>
                                        }

                                    </View>
                                </>
                            }

                        </View>

                    </ScrollView>


                    <ImagePickerModal
                        isShow={isShowImagePicker}
                        onCancel={() => setIsShowImagePicker(false)}
                        onTakePhoto={onTakePhoto}
                        onLibrary={onTakeFromLibrary}/>

                    <HeaderBar
                        title="Driver Setting"
                        titleColor={Constants.backWhite}
                        rightIcon={
                            isSubscriptionChecking ?
                                <BallIndicator color={Constants.white} size={20}/>
                                :
                                <Text style={{color: '#fff', fontSize: 15, paddingTop: 4}}>{plan}</Text>
                        }
                        onLeftButton={() => {
                            navigation.toggleDrawer();
                        }}
                        onRightButton={() => {
                            gotoSubscriptionPage()
                        }}
                        isShowRight={true}
                        backgroundColor={'#fff0'}
                        leftIconColor={'#fff'}
                    />
                </KeyboardAvoidingView>

            </SafeAreaView>

        </View>
    )

}

export default CarProfile


export const SubscriptionPlanView = ({isShow = false, curPlan, cityPlan, onTapPlanItem}) => {

    if (isShow == false) {
        return null;
    }

    let description = 'You have not purchased any subscription yet, Please purchase trial or monthly plan and get money from rides.';
    let isTrialPossible = true;
    if (curPlan) {
        isTrialPossible = false;
        if (curPlan.is_expired == 1) {
            description = "Your " + curPlan.plan + ' plan was already expired at \n ' + curPlan.local_ends_at + '. \n please purchase new subscription.'
        } else {
            description = "Your " + curPlan.plan + ' plan will be expired at  \n' + curPlan.local_ends_at + '. '
        }
    }

    let planList = [];

    if (cityPlan) {
        let monthly_amount = (cityPlan.monthly_amount / 100).toFixed(2)
        let trial_amount = (cityPlan.trial_amount / 100).toFixed(2)
        planList.push({
            plan_id: cityPlan.id,
            amount: cityPlan.monthly_amount,
            plan: 'monthly',
            title: 'Monthly ' + cityPlan.currency + ' ' + monthly_amount,
            bgColor: Constants.purpleColor,
            textColor: Constants.white
        })
        if (isTrialPossible) {
            planList.push({
                plan_id: cityPlan.id,
                amount: cityPlan.trial_amount,
                plan: 'trial',
                title: 'Trial ( 1st month only ) \n' + cityPlan.currency + ' ' + trial_amount,
                bgColor: Constants.white,
                textColor: Constants.purpleColor
            })
        }
    }

    const onTapPlan = (item) => {
        if (onTapPlanItem) {
            onTapPlanItem(item)
        }
    }


    return <View style={styles.inforField}>
        <View style={{padding: 20, alignItems: 'center'}}>
            <Text style={{
                textAlign: 'center',
                color: Constants.purpleColor,
                fontSize: 15,
                fontWeight: 'bold'
            }}>{description}</Text>
        </View>
        <View style={{padding: 10, alignItems: 'stretch', width: '90%'}}>

            {
                planList.map((item, index) => {
                    return <TouchableOpacity
                        style={{
                            margin: 10,
                            padding: 10,
                            height: 60,
                            elevation: 10,
                            backgroundColor: item.bgColor,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 15,
                        }}
                        onPress={() => {
                            onTapPlan(item)
                        }}>
                        <Text style={{
                            fontSize: 15,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: item.textColor
                        }}> {item.title} </Text>
                    </TouchableOpacity>
                })
            }
        </View>
    </View>
}


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
        marginBottom: 10

    },
    img3TextBack: {
        backgroundColor: '#3335',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 0, left: 0, right: 0, height: 25,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,

    },
    img3one: {
        borderColor: '#aaa', borderWidth: 1, borderRadius: 10, width: '100%', height: '100%',
    },
    img3Row: {
        flexWrap: 'wrap',
        width: '26%',
        aspectRatio: 1,
        marginHorizontal: 3,
        borderColor: '#aaa', borderWidth: 1, borderRadius: 10

    },
    imageCover: {
        flex: 1,
    },
    mainBoard: {
        width: screenWidth,
        marginTop: 0,
        paddingVertical: 20,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',

    },
    avatarField: {
        width: '100%',
        position: 'absolute',
        marginTop: 100,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    inforField: {
        // marginTop: screenHeight * 0.35,
        paddingTop: 20,
        paddingBottom: 40,
        width: screenWidth * 0.85,
        // height: screenHeight * 0.55,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 30,
        borderColor: '#ddd',
        borderWidth: 2
    },
    buttonField: {
        marginTop: -30,
        width: screenWidth * 0.8,
        height: 50,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',

    },
    submitButton: {
        backgroundColor: '#6733bb',
        height: 50,
        width: '60%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
    },
    submitButtonText: {
        padding: 15,
        fontSize: 17,
        color: '#fff',
    },
    input: {
        width: '90%',
        height: 50
    },
    inputDescription: {
        width: '90%',
        height: 100,

    },
    textInput: {
        color: '#555',
        width: '100%',
        fontSize: 15,
    },
    textInputDescription: {
        padding: 10,
        color: '#555',
        // width: '100%',
        height: 100,
        fontSize: 15,
        textAlign: 'left',
        textAlignVertical: 'top',

    },
})

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        textAlign: 'center',
        // width: '100%',
        paddingLeft: 10,
        height: 40,
        fontSize: 17,
        borderColor: 'transparent',
        borderRadius: 10,
        backgroundColor: 'white',
        color: 'black',
        paddingRight: 10, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        textAlign: 'center',
        // width: '100%',
        paddingLeft: 10,
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
        right: 0,
    },
});