import React, { Component, useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    SafeAreaView,
    Alert, KeyboardAvoidingView, ScrollView
} from 'react-native'

import { AirbnbRating } from 'react-native-ratings';
import HeaderBar from '../../src/components/HeaderBar';
import CheckBox from 'react-native-check-box'
import { NavigationContext, useFocusEffect ,useRoute, useNavigation } from '@react-navigation/native'
import Constants, {StatusBarHeight} from '../../src/utils/Constants';
import { SimpleLineIcons, Entypo } from '@expo/vector-icons';
import RestAPI from '../../src/utils/RestAPI';
import {Input} from 'react-native-elements';
// import {SafeAreaView} from "react-native-safe-area-context";
import {showMessage} from "react-native-flash-message";
import {PushMessageType} from "../../src/navigation/AppContainer";
import ZStatusBar from '../../src/components/ZStatusBar';
import { BallIndicator } from 'react-native-indicators';


let screenHeight = Dimensions.get('screen').height * 0.45;
let screenWidth = Dimensions.get('screen').width * 0.85;

const DismissKeyboardHOC = (Comp) => {
    return ({ children, ...props }) => (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <Comp {...props}>
                {children}
            </Comp>
        </TouchableWithoutFeedback>
    );
};

const Review = ()=>{
    const navigation = useNavigation();
    const route = useRoute();

    // let bid = route.params.bid;
    let ride = route.params.ride;
    
    let [ isLoading , setIsLoading ] = useState(false)
    let [ item, setItem ] = useState( route.params.ride)
    let [ bid , setBid ] = useState(route.params.bid)
    let [ onTime , setOnTime ] = useState(true)
    let [ onBudget, setOnBudget ] = useState(true)
    let [ desc, setDesc ] = useState()
    let [ rating, setRating ] = useState(5)
    
    
    useFocusEffect(React.useCallback(()=>{
        
        setOnTime(true)
        setOnBudget(true)
        setDesc('')
        setRating(5);
        setItem(route.params.ride)
        setBid(route.params.bid)

        return ()=>{}
    }, []))

    const validate = ()=>{
        // if( desc.length <= 10 ){
        //     warn('Validation', 'Please input comments at least more than 10 characters.')
        //     return false
        // }
        return true        
    }
    
    const onSubmit = ()=>{
        
        if(!validate()){
            return 
        }
        
        let data = {
            customer_id:ride.owner.id,
            bid_id:bid.id,
            on_time:onTime ? 1 : 0,
            on_budget:onBudget ? 1: 0,
            comments:desc,
            rating:rating,
        }
        
        setIsLoading(true)
        if(Constants.isDriver()){
            RestAPI.storeReviewToCustomer(data).then(res=>{
                if( res.success == 1){
                    showMessage({
                        message: 'Thanks for your review',
                        description: 'You have left review for customer.',
                        type: PushMessageType.success,
                        // backgroundColor: msgData.msgBGColor, // background color
                        // color: msgData.msgTextColor, // text color
                        icon: PushMessageType.success,
                        duration:4000,
                        onPress: () => {},
                    });
                    navigation.navigate('driver_manage_home');
                }else{
                    failed('Oops', res.msg)
                }
            }).catch(err=>{
                console.log(err)
                
                failed('Oops', 'Somethings wrong. please try again.')
            }).finally(()=>{
                setIsLoading(false)
            })
        }
        if(Constants.isCustomer()){
            RestAPI.storeReviewToDriver(data).then(res=>{
                if( res.success == 1){
                    showMessage({
                        message: 'Thanks for your review',
                        description: 'You have left review for driver.',
                        type: PushMessageType.success,
                        // backgroundColor: msgData.msgBGColor, // background color
                        // color: msgData.msgTextColor, // text color
                        icon: PushMessageType.success,
                        duration:4000,
                        onPress: () => {},
                    });
                    navigation.goBack();
                    navigation.navigate('ride_detail', {item_id: ride.id});
                }else{
                    failed('Oops', res.msg)
                }
            }).catch(err=>{
                console.log(err)
                failed('Oops', 'Somethings wrong. please try again.' )
            }).finally(()=>{
                setIsLoading(false)
            })
        }
        

    }

    const ratingCompleted = (val)=>{
        console.log("Rating is: " + val)
        setRating(val)
    }



    const DismissKeyboardView = DismissKeyboardHOC(View)

    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

    return (
        <>
        <SafeAreaView style={{flex:0, backgroundColor : '#f5f5f5'}}/>
            <SafeAreaView style={{flex:1, backgroundColor: '#f5f5f5'}}>
            {/* <ZStatusBar/> */}
            <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
                <KeyboardAvoidingView
                    style={{ flex: 1}}
                    keyboardVerticalOffset={keyboardVerticalOffset}
                    behavior="padding"
                    enabled>
                    <ScrollView keyboardShouldPersistTaps="always" style={{flex:1}} contentContainerStyle={{padding:10, justifyContent:'center', alignItems:'center'}}>
                        <View style={styles.mainView}>

                            <View style={styles.mainContainer}>
                                <View style={styles.textView}>
                                    <Text style={styles.titleText}>
                                        How Was Your Experience ?
                                    </Text>
                                    {/*<Text>*/}
                                    {/*    {JSON.stringify(item)}*/}
                                    {/*</Text>*/}
                                    {/*<Text>*/}
                                    {/*    {JSON.stringify(bid)}*/}
                                    {/*</Text>*/}
                                    <View style={styles.middleText}>
                                        <AirbnbRating
                                            defaultRating = {rating}
                                            showRating = {false}
                                            onFinishRating={ratingCompleted}
                                        />
                                    </View>
                                </View>
                                {
                                    Constants.isCustomer() ?<>
                                        <View style = {{flexDirection:'row', justifyContent:'flex-start'}}>
                                            <CheckBox
                                                style={{ padding: 10}}
                                                checkBoxColor = '#6733bb'
                                                onClick={()=>{
                                                    setOnTime(!onTime)
                                                }}
                                                isChecked={onTime}
                                            />
                                            <TouchableOpacity style={{marginTop: 10}} onPress={()=>setOnTime(!onTime)}>
                                                <Text >Has it been finished on time?</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style = {{flexDirection:'row',justifyContent:'flex-start'}}>
                                            <CheckBox
                                                style={{ paddingHorizontal:10, paddingTop:5}}
                                                checkBoxColor = '#6733bb'
                                                onClick={()=>{ setOnBudget(!onBudget) }}
                                                isChecked={onBudget}
                                            />
                                            <TouchableOpacity style={{marginTop: 5}} onPress={()=>setOnBudget(!onBudget)}>
                                            <Text >Has it been paid on budget?</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>: null
                                }

                                <View style={styles.bodyView}>
                                    <View style={styles.descView}>
                                        <Text style={{width:'100%', color:'#999', fontSize:14}} >#{ride.slugId}</Text>
                                        <Input
                                            containerStyle={styles.inputHolder}
                                            inputStyle={styles.textInputCenter}
                                            inputContainerStyle={{borderBottomWidth:0, borderRadius:2, borderColor:'red', width:'100%', }}
                                            placeholderTextColor='darkgrey'
                                            placeholder='Comments...'
                                            overflow="hidden"
                                            multiline={true}
                                            value={desc}
                                            onChangeText={val=>{setDesc( val )}}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.btnContainer}>
                            {
                                isLoading ? <BallIndicator color={Constants.purpleColor} size={45}/> :
                                <TouchableOpacity style = {styles.submitButton} onPress={onSubmit}>
                                    <Text style = {styles.submitButtonText}> Leave Review </Text>
                                </TouchableOpacity>
                            }
                                
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

            <HeaderBar 
                title="Leave Review" 
                leftIcon={<Entypo name="chevron-thin-left" size={25} color={Constants.purpleColor}/>}
                onLeftButton = {()=>{
                    if( Constants.isCustomer()){
                        navigation.goBack();
                        navigation.navigate('ride_detail', {item_id: item.id});
                    }else{
                        navigation.navigate('driver_manage_home');
                    }

                }}
                isShowRight={false}
                onRightButton={()=>{  }}                    
            />
            </SafeAreaView>
        </>
    )
    
}

export default Review;

const styles = StyleSheet.create({
    descView:{ 
        marginTop:15, 
        paddingBottom:35, 
        height:Constants.WINDOW_HEIGHT*0.2, 
        alignItems:'center', 
        justifyContent: 'center', 
        width: '90%'
    },
    inputHolder: {
        // height: 40,
        backgroundColor:'white',
        borderRadius: 10,
        width: '100%',
        height:'100%',

    },
    textInputCenter: {
        color: '#555',
        width: '100%',
        fontSize: 13,
        textAlign: 'left',

    },

    mainView:{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent:'center',
        width: '100%',
        paddingTop:20,
        paddingBottom: 20,
        height: Constants.WINDOW_HEIGHT - StatusBarHeight,
        backgroundColor: '#f5f5f5',
    },

    mainContainer:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        // height:screenHeight,
        width:Constants.WINDOW_WIDTH *  0.9,
        padding:0,
        // marginTop:-100,
    },
    textView:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',

        borderColor:'#666',

    },
    titleText:{
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        color: '#333',
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
        marginTop: 20,
        // height: screenHeight * 0.5,
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor:'#ccc',
        borderWidth:1,

    },
    reviewText:{
        height: '100%',
        width: '100%',
        color: '#555',
        // borderColor:'red', borderWidth:1,
        textAlignVertical:'top',                
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#6733bb',
        height: 50,
        width: '100%',
        borderRadius: 10,
        zIndex: 1,
    },
    btnContainer :{ 
        width: '50%',
        alignItems:'center', 
        marginTop: -30, 
        backgroundColor:Constants.purpleColor,        
        borderRadius:15,
        elevation: 20, 
        
    },
    submitButtonText:{
        padding: 13,
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',

    },
})