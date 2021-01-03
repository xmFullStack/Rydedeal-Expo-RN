import React, {useState} from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    ScrollView,
    StatusBar
} from 'react-native'
import {Input} from 'react-native-elements';

import RestAPI from '../../src/utils/RestAPI';
import Constants from '../../src/utils/Constants';
import {SafeAreaView} from 'react-native-safe-area-context';

import {SimpleLineIcons, Entypo} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native'
import ZStatusBar from '../../src/components/ZStatusBar';
import {BallIndicator} from 'react-native-indicators';

let screenHeight = Dimensions.get('screen').height * 0.5;
let screenWidth = Dimensions.get('screen').width * 0.85;

export default function ForgotPassword({}) {

    const navigation = useNavigation();

    let [isLoading, setIsLoading] = useState(false)
    let [email, setEmail] = useState('')


    const onSend = () => {
        if (!email) {
            warn('Oops', "Please enter your account email.");
            return
        }

        setIsLoading(true)
        RestAPI.forgotPwd(email).then(res => {
            if (res.success == 1) {
                alert('Email Sent', 'We have sent reset password link to ' + email + ', please check your inbox. ')
                navigation.goBack();
            } else {
                failed('Oops', 'Failed to send email. ' + res.msg)
            }
        }).catch(err => {
            console.log(err)
            failed('Oops', 'Some errors are occurred. please try again.')
        }).finally(() => {
            setIsLoading(false)
        })
    }


    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;

    return (
        // <SafeAreaView style={{flex:1, }}>
        <>
            {/* <ZStatusBar/>   */}
            <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
            <KeyboardAvoidingView
                style={{flex: 1, backgroundColor: '#f5f5f5'}}
                keyboardVerticalOffset={keyboardVerticalOffset}
                behavior="padding"
            >
                <ScrollView
                    keyboardShouldPersistTaps="always"
                    style={{
                        flex: 1,
                    }}
                    contentContainerStyle={{
                        width: '100%',
                        height: Constants.WINDOW_HEIGHT - 28
                    }}
                >
                    <ImageBackground
                        source={require('../../assets/background.jpg')}
                        blurRadius={0}
                        style={styles.imageCover}
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
                                        Please enter your account email and tap send button.
                                        You will receive reset password link with email if your account email is
                                        correct.
                                    </Text>
                                    <View style={styles.line}/>
                                </View>
                                <View style={styles.bodyView}>
                                    <Input
                                        containerStyle={styles.input}
                                        inputStyle={styles.textInput}
                                        inputContainerStyle={{borderBottomWidth: 0}}
                                        placeholderTextColor='white'
                                        overflow="hidden"
                                        placeholder='Email'
                                        keyboardType="email-address"
                                        value={email}
                                        onChangeText={email => setEmail(email)}
                                        leftIcon={<SimpleLineIcons name="envelope" size={20}
                                                                   style={{paddingRight: 10, marginLeft: -12}}
                                                                   color="gray"/>}
                                    />
                                    {
                                        isLoading ? <BallIndicator color={Constants.purpleColor} size={45}/> :
                                            <TouchableOpacity
                                                style={styles.submitButton}
                                                onPress={onSend}
                                            >
                                                <Text style={styles.submitButtonText}> Send </Text>
                                            </TouchableOpacity>
                                    }

                                </View>
                            </View>

                        </View>

                    </ImageBackground>
                </ScrollView>
                <TouchableOpacity style={{position: 'absolute', top: Platform.OS == 'ios' ? 50 : 15, left: 10,}}
                                  onPress={() => {
                                      navigation.goBack();
                                  }}>
                    <Entypo name={"chevron-thin-left"} size={22} color={'white'}/>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </>
        // </SafeAreaView> 
    )

}

const styles = StyleSheet.create({

    imageCover: {
        // flex: 1,
        marginTop: 0,
        height: '100%',
        width: '100%',
    },
    mainView: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    topBarView: {
        height: Dimensions.get('window').height * 0.15
    },
    mainContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: screenHeight,
        width: screenWidth,
    },
    textView: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: screenHeight * 0.5
    },
    titleText: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        color: 'white',
        width: '90%'
    },
    middleText: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16,
        color: 'white',
        width: '100%'
    },
    bodyView: {
        paddingVertical: 30,
        marginTop: 25,

        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
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
        fontSize: 15
    },
    submitButton: {
        backgroundColor: '#6733bb',
        height: 45,
        width: '80%',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
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
    submitButtonText: {
        padding: 15,
        fontSize: 17,
        color: '#fff',
        textAlign: 'center'
    },
    submitButtonText1: {

        paddingBottom: 5,
        paddingTop: 10,

        fontSize: 17,
        color: Constants.purpleColor,
        textAlign: 'center'
    },
    submitButtonText2: {

        paddingBottom: 5,
        paddingTop: 10,

        fontSize: 12,
        color: Constants.purpleColor,
        textAlign: 'center'
    },
    line: {
        marginTop: 50,
        width: '7%',
        borderBottomColor: 'white',
        borderBottomWidth: 4,
    }
})