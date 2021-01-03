import React, {  useState,  useRef } from 'react'
import { 
    View, 
    Text, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    ScrollView, 
    TextInput, 
    StyleSheet,      
    Dimensions ,
    Animated,
    Easing,

} from 'react-native'
import { Input} from 'react-native-elements';
import {   FontAwesome, AntDesign } from '@expo/vector-icons';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Constants from '../../src/utils/Constants';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { DownButton } from '../../pages/customer/MapAccept';

import RestAPI from '../utils/RestAPI';
import { BallIndicator } from 'react-native-indicators';
import { onFrameDidUpdate } from 'expo/build/AR';
let screenHeight = Dimensions.get('window').height;
let screenWidth = Dimensions.get('window').width;

export default EnterBidView = ({ride, currency, priceMin, onUpdated, onCanceled, onDescriptionFocus, isLoading=false, isShow = false, onSubmit = null, onClosed = null, isbid = false})=>{
    
    const animBottom = new Animated.Value(-Constants.WINDOW_HEIGHT);
    let [bottomOfMainContainer, setBottomOfMainContainer ] = useState(animBottom)
    let [isShowView , setIsShowView] = useState(isShow)    
    let [ price, setPrice ] = useState(ride.isBid == true ? ride.bid.price : priceMin);
    let [desc, setDesc ] = useState( ride.isBid==true ? ride.bid.description : '' );
    
    let animViewRef = useRef();
    let priceRef = useRef();
    let descRef = useRef();

    useFocusEffect(React.useCallback(()=>{
        setBottomOfMainContainer(animBottom)
        showMainView();
        
        return ()=>{}
    }, []))
    
    const showMainView = ()=>{
        
        Animated.parallel([
            Animated.timing(
                // Animate value over time
                bottomOfMainContainer, // The value to drive
                {
                  toValue: 0, // Animate to final value of 1
                  easing: Easing.ease,
                  duration: 500,
                }
            ),
          
        ]).start(()=>{
            setIsShowView(true)
            
        })

    }
    const hideMainView = ()=>{
        
        Animated.parallel([
            Animated.timing(
                // Animate value over time
                bottomOfMainContainer, // The value to drive
                {
                  toValue: -Constants.WINDOW_HEIGHT,
                  easing: Easing.ease,
                  duration: 500,
                }
            ),
         
        ]).start(()=>{
            setIsShowView(false)
            if( onClosed ){
                onClosed();
            }
            
        })
    
    }
    
    const toggleMainView = ()=>{
        
        if ( isShowView ){
            hideMainView();
        }else {
            showMainView();
        }
    }


    if( !isShowView ){
        return null
    }
    return <>
    <Animated.View 
        ref={animViewRef}
        style={{            
            // position:'absolute',
            marginBottom:bottomOfMainContainer,
            // left:0,right:0,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',           
            width: screenWidth,
        }}

    >
        
        <DownButton isShow={true} onPress={hideMainView} containerStyle={{ marginBottom:5,}}/>
        
        <View style={{
             paddingBottom:10,
             paddingTop:10,
             flexDirection: 'column',
             justifyContent: 'flex-end',
             alignItems: 'center',           
             width: screenWidth,
             borderTopLeftRadius: 40,
             borderTopRightRadius: 40,
             backgroundColor: '#6733bb',
        }}>
            <View style={styles.mainBody}>
                <View style={styles.budget}>
                    <Text style={{fontSize: 20, color: 'green', fontWeight: 'bold'}}>{currency}{priceMin}</Text>
                </View>
                <View style={styles.inputLocation}>
                    
                    <View style={styles.inputFromTo}>
                        <Text style={{fontSize: 12, color: '#777', marginLeft:10,}}>Price ({currency})</Text>                        
                        <Input
                            containerStyle={styles.input}
                            inputStyle={styles.textInput}
                            inputContainerStyle={{borderBottomWidth:0.8, borderColor: '#dfdfdf', width:'100%'}}
                            placeholderTextColor='darkgrey'
                            keyboardType={"decimal-pad"}
                            overflow="hidden"
                            placeholder='Your Price'
                            leftIcon={ <FontAwesome name="money" size={16} style={{paddingRight:20, marginLeft:-10}} color="#444" /> }
                            value={price}
                            ref={ref => priceRef = ref}
                            disabled={ride && ride.completed_at ? true : false}
                            onSubmitEditing={()=>descRef.focus()}
                            onChangeText={price=>{
                                if( ride && ride.completed_at ) return
                                setPrice(price)
                            }}
                        />
                        <Text style={{fontSize: 12, color: '#777', marginTop: 20, marginLeft:10,}}>Description</Text>
                                           
                        <Input
                            containerStyle={styles.inputDescription}
                            inputStyle={{...styles.textInput, textAlign:'left', textAlignVertical:'top', }}
                            inputContainerStyle={{ borderBottomWidth:0.8, borderColor: '#dfdfdf', height:60,paddingTop:5, }}
                            placeholderTextColor='darkgrey'                            
                            overflow="hidden"
                            placeholder='Description ( less than 250 characters)'                            
                            value={desc}
                            ref={ref => descRef = ref}
                            onFocus={()=>{
                                if( onDescriptionFocus ){
                                    onDescriptionFocus();
                                }
                            }}
                            onSubmitEditing={()=>{}}
                            disabled={ride && ride.completed_at ? true : false}
                            onChangeText={desc=> {
                                if( ride && ride.completed_at ) return
                                setDesc(desc)
                            }}
                            multiline={true}              
                            maxLength={250}              
                        />

                        
                    </View>

                </View>
             
            </View>            

            {
                isLoading ? <BallIndicator color={Constants.white} size={30}/> :
                <>
                {
                    ride && ride.isBid ?
                    <UpdateCancelButton price={price} description={desc} ride={ride} bidId={ride.bid.id} onUpdated={onUpdated} onCanceled={onCanceled} />
                        :
                    <View style={styles.buttonView}>                
                        <TouchableOpacity style = {styles.submitButton} onPress={()=>{ if( onSubmit ) onSubmit(price, desc) }}>
                            <Text style = {styles.submitButtonText}> Submit Offer </Text>
                        </TouchableOpacity>
                    </View>
                }
                </>
            }
            
            
        </View>
            
        </Animated.View>
       
        
    </>
}




const UpdateCancelButton = props=>{

    const navigation = useNavigation();
    const route = useRoute();

    const { price, description, ride, bidId, onUpdated, onCanceled } = props;
    let [isLoading, setIsLoading] = useState(false);


    const onCancelBid = ()=>{
        if( !bidId){
            return
        }
        confirm('Cancel Bid', 'Are you sure cancel bid from this request?', ()=>{
            setIsLoading(true )
            RestAPI.cancelBidByDriver(bidId).then(res=>{
                if(res.success == 1){
                    if( onCanceled ){
                        onCanceled();
                    }
                    navigation.goBack();
                }else{
                    failed('Oops', res.msg)
                }
            }).catch(err=>{
                console.log(err)
                failed('Oops', 'Somethings wrong while cancel bid. please try again.');
            }).finally(()=>{
                setIsLoading(false)
            })
        }, ()=>{

        })



    }
    const onUpdateBid =()=>{
        if( !ride ){
            return
        }

        confirm('Update', 'Are you sure to update your bid?' , ()=>{
            
            setIsLoading(true );
            
            RestAPI.updateBid({bid_id: bidId, description: description, price: price}).then(res=>{
                if(res.success == 1){
                    if( onUpdated ){
                        onUpdated();
                    }
                    alert('Success', 'Bid is updated.')
                    navigation.goBack();
                    
                }else{
                    failed('Oops', res.msg)
                }
            }).catch(err=>{
                console.log(err)
                failed('Oops', 'Somethings wrong. whilte updating bid, please try again.')
            }).finally(()=>{
                setIsLoading(false)
            })
        }, ()=>{

        })

    }
    
    return <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center', paddingVertical:5}}>
        {
            isLoading ? <BallIndicator size={30} color={'white'} /> :
            <>
                {
                    ride.isAccepted || ride.others_accepted ? null:
                    <TouchableOpacity style={{width: 150, alignItems:'center', borderRadius:10, backgroundColor:'white', marginRight:20, paddingVertical:10,}} onPress={onUpdateBid}>
                        <Text style={{color:Constants.purpleColor, fontSize:17}}>Update</Text>
                    </TouchableOpacity>
                }
                {
                    ride.completed_at ? null :
                    <TouchableOpacity style={{width: 150, alignItems:'center', borderRadius:10, backgroundColor:Constants.googleColor, paddingVertical:10,}} onPress={onCancelBid}>
                        <Text style={{color:'white', fontSize:17}}>Cancel Bid</Text>
                    </TouchableOpacity>
                }
                
            </>
        }
        
    
    </View>

}

const styles = StyleSheet.create({

    imageCover: {
        flex: 1,
        resizeMode: 'cover'
    },
    container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: screenHeight,
        width: screenWidth,
    },
    input: {
        width: '100%',
        height: 30,
        marginTop: -5,
        marginLeft: 0,
    },
    inputDescription: {
        width: '100%',
        
        marginTop: 0,
        marginLeft: 0,
    },
    textInput: {
        color: '#333',
        width: '100%',
        fontSize: 14,
    },
    mainBody:{
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'white',
        // height: '70%',
        width: '90%',
        borderRadius: 30,
        paddingBottom:10,
        marginBottom:5,
    },
    budget:{
        width: '100%',
        justifyContent: 'flex-end',
        alignItems:'flex-end',
        marginBottom: 5,
        paddingRight: 30,
        paddingTop: 5,
    },
    inputLocation:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        // borderColor:'red', borderWidth:2,
        // height: '50%'
    },
    inputIcon:{
        marginTop: 15,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '15%',
        // height: '100%'
    },
    inputFromTo:{
        marginTop: 0,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        alignContent:'stretch',
        width: '90%',
        paddingBottom:5,
        
        // height: '90%'
    },
    driver:{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems:'center',
        paddingLeft:25,
        width: '100%',
        height: 55,
    },
    driverInfor:{
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        width: '45%',
        height: '100%',
    },

    buttonView:{
        marginBottom: 0,
        height: '20%',
        width: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'row',
    },
    submitButton: {
        backgroundColor: 'white',
        height: 40,
        width: '100%',
        borderRadius: 10,
        justifyContent:'center',
        alignItems: 'center',
        marginHorizontal:10,
    },
    submitButtonText:{
        fontSize: 15,
        fontWeight: 'bold',
        color: '#444',
        textAlign: 'center'
    },
})