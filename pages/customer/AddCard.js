import React, {Component, useState, useRef} from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    StatusBar
} from 'react-native'
import {Input, Card} from 'react-native-elements';
import RNPickerSelect from 'react-native-picker-select';
import {useRoute, useNavigation, useFocusEffect} from '@react-navigation/native';
import HeaderBar from '../../src/components/HeaderBar';
import Constants, {StatusBarHeight, isIOS} from '../../src/utils/Constants';
import RestAPI from '../../src/utils/RestAPI';

import ZStatusBar from '../../src/components/ZStatusBar';
import {BallIndicator} from 'react-native-indicators';


let screenHeight = Dimensions.get('screen').height * 0.3;
let screenWidth = Dimensions.get('screen').width * 0.85;


export default AddCard = ({}) => {

    const route = useRoute();
    const navigation = useNavigation();

    let [isLoading, setIsLoading] = useState(false)
    let [num1, setNum1] = useState('')
    let [num2, setNum2] = useState('')
    let [num3, setNum3] = useState('')
    let [num4, setNum4] = useState('')

    let [holderName, setHolderName] = useState('')
    let [month, setMonth] = useState('')
    let [year, setYear] = useState()
    let [cvv, setCvv] = useState('')

    let num1Ref = useRef(null)
    let num2Ref = useRef(null)
    let num3Ref = useRef(null)
    let num4Ref = useRef(null)

    let holderNameRef = useRef(null)
    let cvvRef = useRef(null)

    const Months = Constants.Months.map((item, index) => {
        let val = index + 1
        let label = val < 10 ? '0' + val : val.toString()
        return {label: label, value: label}
    })

    let Years = []
    let curYear = new Date().getFullYear();
    for (let i = curYear; i < curYear + 10; i++) {
        let label = i.toString().substr(2, 2)
        Years.push({label: label, value: i.toString()})
    }

    useFocusEffect(React.useCallback(() => {
        if (num1Ref) {
            num1Ref.focus()
        }
        return () => {
        }
    }, []))

    const onChangeNum = (val, setFun, nextRef, setNextVal) => {
        if (val.length <= 4) {
            setFun(val)
            if (val.length == 4) {
                if (setNextVal) {
                    setNextVal('')
                }
                nextRef.focus()
            }
        } else {
            if (setNextVal) {
                setNextVal('')
            }
            nextRef.focus()
        }
    }

    const onChangeCVV = (val) => {
        if (val.length <= 3) {
            setCvv(val)
        }
    }


    const onSubmit = () => {
        if (!year || !month) {
            warn('Please select card expiration.', 'Oops')

            return
        }
        if (!num1 || !num2 || !num3 || !num4) {
            warn('Oops', 'Please input card number')
            return
        }
        if (!holderName) {
            warn('Oops', 'Please input holder name')
            return
        }
        if (!cvv) {
            warn('Oops', 'Please input CVV.')
            return
        }

        setIsLoading(true)
        let card_number = num1 + num2 + num3 + num4

        RestAPI.addPaymentCard({card_number: card_number, exp_month: month, exp_year: year, cvc: cvv}).then(res => {
            if (res.success == 1) {
                global.curUser.paymentMethods = res.methods
                global.curUser.defaultPaymentMethod = res.new
                navigation.goBack();
            } else {
                failed('Oops', 'Failed to add new card. ' + res.msg)
            }
        }).catch(err => {
            failed('Oops', 'Some errors are occured while adding new card. try again after a moment.')
        }).finally(() => {
            setIsLoading(false)
        })
    }
    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;
    return (
        <View style={{flex: 1, marginTop: isIOS() ? StatusBarHeight : 0}}>
            {/* <ZStatusBar/>     */}
            <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
            <KeyboardAvoidingView
                style={{flex: 1, paddingTop: Platform.OS == 'ios' ? StatusBarHeight : 0}}
                keyboardVerticalOffset={keyboardVerticalOffset}
                behavior="padding"
                enabled>
                <ScrollView
                    keyboardShouldPersistTaps={"always"}
                    style={{
                        // borderWidth:2, borderColor:'green',
                        flex: 1
                    }} contentContainerStyle={{padding: 0}}>
                    <View style={styles.mainView}>

                        <View style={styles.bodyView}>
                            <View style={styles.titleView}>
                                <Text style={{fontSize: 20, fontWeight: 'bold', color: '#666'}}>Enter Card
                                    Details</Text>
                                <View style={styles.line}></View>
                            </View>
                            <View style={styles.categoryView}>
                                <View style={styles.cardNumberView}>
                                    <Text style={{paddingLeft: 15, paddingBottom: 5}}>CARD NUMBER</Text>
                                    <View style={styles.cardNumberViewInner}>
                                        <Input
                                            containerStyle={styles.input}
                                            inputStyle={styles.textInput}
                                            inputContainerStyle={{borderBottomWidth: 0}}
                                            placeholderTextColor='darkgrey'
                                            overflow="hidden"
                                            keyboardType={'decimal-pad'}
                                            ref={ref => num1Ref = ref}
                                            value={num1}
                                            onChangeText={val => onChangeNum(val, setNum1, num2Ref, setNum2)}

                                        />
                                        <Input
                                            containerStyle={styles.input}
                                            inputStyle={styles.textInput}
                                            inputContainerStyle={{borderBottomWidth: 0}}
                                            placeholderTextColor='darkgrey'
                                            keyboardType={'decimal-pad'}
                                            overflow="hidden"
                                            ref={ref => num2Ref = ref}
                                            value={num2}
                                            onChangeText={val => onChangeNum(val, setNum2, num3Ref, setNum3)}
                                        />
                                        <Input
                                            containerStyle={styles.input}
                                            inputStyle={styles.textInput}
                                            inputContainerStyle={{borderBottomWidth: 0}}
                                            placeholderTextColor='darkgrey'
                                            keyboardType={'decimal-pad'}
                                            overflow="hidden"
                                            ref={ref => num3Ref = ref}
                                            value={num3}
                                            onChangeText={val => onChangeNum(val, setNum3, num4Ref, setNum4)}
                                        />
                                        <Input
                                            containerStyle={styles.input}
                                            inputStyle={styles.textInput}
                                            inputContainerStyle={{borderBottomWidth: 0}}
                                            placeholderTextColor='darkgrey'
                                            keyboardType={'decimal-pad'}
                                            overflow="hidden"
                                            ref={ref => num4Ref = ref}
                                            value={num4}
                                            onChangeText={val => onChangeNum(val, setNum4, holderNameRef)}
                                        />
                                    </View>
                                </View>
                                <View style={styles.cardHoldersView}>
                                    <Text style={{paddingLeft: 15, paddingBottom: 5}}>CARD HOLDERS NAME</Text>
                                    <Input
                                        containerStyle={styles.inputHolder}
                                        inputStyle={styles.textInput}
                                        inputContainerStyle={{borderBottomWidth: 0}}
                                        placeholderTextColor='darkgrey'
                                        overflow="hidden"
                                        ref={ref => holderNameRef = ref}
                                        value={holderName}
                                        onChangeText={val => {
                                            setHolderName(val)
                                        }}
                                        onSubmitEditing={() => cvvRef.focus()}
                                    />
                                </View>
                                <View style={styles.cardExp}>
                                    <View style={styles.cardExpView}>
                                        <Text style={{paddingLeft: 15, paddingBottom: 5}}>CARD EXPIRATION</Text>
                                        <View style={styles.cardExpViewInner}>

                                            <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'flex-start',
                                                alignItems: 'center',
                                                width: '100%'
                                            }}>

                                                <RNPickerSelect
                                                    placeholder={{
                                                        label: 'Month',
                                                        value: null,
                                                    }}
                                                    onValueChange={(value) => setMonth(value)}
                                                    useNativeAndroidPickerStyle={false}
                                                    style={{...pickerSelectStyles}}
                                                    items={Months}
                                                    Icon={() => {
                                                        return (
                                                            <View
                                                                style={pickerSelectStyles.icon}
                                                            />
                                                        );
                                                    }}
                                                />
                                                <Text style={{marginLeft: 5, marginRight: 5, fontSize: 22}}>/</Text>
                                                <RNPickerSelect
                                                    placeholder={{
                                                        label: 'Year',
                                                        value: null,
                                                    }}
                                                    onValueChange={(value) => setYear(value)}
                                                    useNativeAndroidPickerStyle={false}
                                                    style={pickerSelectStyles}
                                                    items={Years}
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
                                    </View>
                                    <View style={styles.cardExpViewRight}>
                                        <Text style={{paddingRight: '50%', paddingBottom: 5}}>CVV</Text>
                                        <Input
                                            containerStyle={styles.inputCardExp}
                                            inputStyle={styles.textInput}
                                            inputContainerStyle={{borderBottomWidth: 0}}
                                            placeholderTextColor='darkgrey'
                                            overflow="hidden"
                                            keyboardType={'decimal-pad'}
                                            ref={ref => cvvRef = ref}
                                            value={cvv}
                                            onChangeText={val => onChangeCVV(val)}
                                            onSubmitEditing={() => onSubmit()}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={{
                                width: 300,
                                height: 50,
                                marginTop: 20,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {
                                    isLoading ? <BallIndicator color={Constants.purpleColor} size={45}/> :
                                        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                                            <Text style={styles.submitButtonText}> Submit </Text>
                                        </TouchableOpacity>
                                }

                            </View>
                        </View>


                    </View>
                </ScrollView>

            </KeyboardAvoidingView>
            <HeaderBar
                title="Add Payment Method"
                onLeftButton={() => {
                    navigation.toggleDrawer();
                }}
                isShowRight={false}
                onRightButton={() => {
                }}
            />
        </View>
    )


}

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        // paddingTop:60,
        justifyContent: 'center',
        alignItems: 'center',
        height: Constants.WINDOW_HEIGHT,
        width: Constants.WINDOW_WIDTH,
        backgroundColor: '#f5f5f5',
        // marginTop: StatusBarHeight
        // borderColor:'blue',borderWidth:2,
    },

    bodyView: {
        // borderColor:'red',borderWidth:2,        
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    titleView: {
        height: '10%',
        width: screenWidth,
        marginBottom: 40,
    },
    categoryView: {
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'stretch',
        width: screenWidth,
        height: screenHeight,
    },
    line: {
        marginTop: '3%',
        width: '10%',
        borderBottomColor: '#6733bb',
        borderBottomWidth: 2,
    },

    cardNumberView: {
        marginTop: 20,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        height: '33%',
        width: '100%',
    },
    cardNumberViewInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    cardHoldersView: {
        marginTop: 40,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: '33%',
        width: '100%',
    },
    cardExp: {
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        width: '100%',
        height: '33%',
    },
    cardExpView: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '65%',
        height: '100%'
    },

    cardExpViewInner: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    cardExpViewRight: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: '35%',
        height: '100%'
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#555',
        borderRadius: 10,
        width: '21%',
    },
    inputHolder: {
        height: 40,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#555',
        borderRadius: 10,
        width: '100%',
    },
    inputCardExp: {
        height: 40,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#555',
        borderRadius: 10,
        width: '80%',
    },
    textInput: {
        textAlign: 'center',
        color: '#555',
        width: '100%',
    },
    submitButton: {
        backgroundColor: '#6733bb',
        height: 55,
        marginLeft: -15,
        width: '60%',
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
    submitButtonText: {
        padding: 15,
        fontSize: 17,
        color: '#fff',
        textAlign: 'center'
    },
});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        textAlign: 'center',
        width: 80,
        height: 40,
        fontSize: 17,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#555',
        borderRadius: 10,
        color: 'black',

        paddingRight: 0, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        textAlign: 'center',
        // marginLeft: -10,
        width: 80,
        height: 40,
        fontSize: 17,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#555',
        borderRadius: 10,
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
        right: 10,
    },
});