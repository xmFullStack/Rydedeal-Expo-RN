import React, {Component} from 'react'
import {
    ImageBackground,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    AsyncStorage,
    Alert,
    ScrollView
} from 'react-native'
import {Input} from 'react-native-elements';
import {SimpleLineIcons, FontAwesome, AntDesign} from '@expo/vector-icons';

import {NavigationContext} from '@react-navigation/native'


import Constants from '../../src/utils/Constants';
import * as Facebook from 'expo-facebook';
import RestAPI from '../../src/utils/RestAPI';
import * as GoogleSignIn from 'expo-google-sign-in';
import ZStatusBar from '../../src/components/ZStatusBar';
import {BallIndicator} from 'react-native-indicators';

const appJson = require('../../app.json')
const FB_APP_ID = '203737747626817';

class LoginScreen extends Component {
    static contextType = NavigationContext;

    state = {
        isLoading: false,
        isFBLoading: false,
        isGoogleLoading: false,
        email: '',
        password: '',
    }

    autoLogin = () => {

        Alert.alert('AutoLogin', 'What test account login you want?', [
            {
                text: 'No',
                style: 'cancel',
                onPress: () => {
                }
            },
            {
                text: 'Driver',
                style: 'default',
                onPress: () => {
                    this.setState({email: 'zhengyunxm@gmail.com', password: '12345678'}, () => {
                        this.onLogin();
                    })
                }
            },
            {
                text: 'Customer',
                style: 'default',
                onPress: () => {
                    this.setState({email: 'xiaomingming12345678@gmail.com', password: '12345678'}, () => {
                        this.onLogin();
                    })
                }
            }
        ])
    }

    componentDidMount() {
        const navigation = this.context;
        this._unsubscribe = navigation.addListener('focus', () => {
            // this.autoLogin();
        });
        this.googleInitAsync();
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    googleInitAsync = async () => {

        await GoogleSignIn.initAsync({clientId: "275372917947-ms6um8baail2dj6io3qk33qp2md047np.apps.googleusercontent.com"});
        this._googleSyncUserWithStateAsync();
    };

    _googleSyncUserWithStateAsync = async () => {
        const user = await GoogleSignIn.signInSilentlyAsync();
        console.log('google syncuserwithstate', user)
        this.setState({user});
    };

    gooleSignOutAsync = async () => {
        await GoogleSignIn.signOutAsync();
        console.log('google signout async')
        this.setState({user: null});
    };

    googleSignInAsync = async () => {
        try {
            await GoogleSignIn.askForPlayServicesAsync();
            const result = await GoogleSignIn.signInAsync();
            console.log('google signin async:', result)


            if (result.type == 'success') {
                this.socialLogin(result.user.email, result.user.firstName, result.user.lastName)
            } else {
                failed("Oops", 'Some issues with Google login , you can try to login directly.')
            }

        } catch (ex) {
            console.log('google signin async failed:', ex)
            failed('Oops', 'Some things went wrong please try again.' + ex.message);
        }
    };

    onPressGoogleLogin = () => {
        if (this.state.user) {
            this.gooleSignOutAsync();
        } else {
            this.googleSignInAsync();
        }
    };

    onFblogIn = async () => {

        try {
            await Facebook.initializeAsync(FB_APP_ID)
        } catch (ex) {

        }

        this.setState({isFBLoading: true})
        Facebook.logInWithReadPermissionsAsync({
            permissions: ['public_profile', 'email'],
        }).then(result => {

            if (result.type == 'cancel') {
                this.setState({isFBLoading: false})
                return
            }
            RestAPI.getFBProfile(result.token).then(fbProfile => {

                let names = fbProfile.name.split(' ')
                let fName = '';
                let lName = '';
                if (names.length > 1) {
                    fName = names[0];
                    lName = names[1];
                } else {
                    fName = names[0]
                }

                this.socialLogin(fbProfile.email, fName, lName)

            }).catch(fberr => {

                failed('Oops', 'Failed to get Facebook profile. ' + JSON.stringify(fberr))

            }).finally(() => {
                this.setState({isFBLoading: false})
            })

        }).catch(err => {
            this.setState({isFBLoading: false}, () => {
                failed('Oops', 'Failed err :  ' + JSON.stringify(err))
            })
        })
    }

    socialLogin = (email, fname, lname) => {
        if (!global.expoPushToken || !global.UUID) {
            failed('Oops, Reload Required.', 'Some data is not enough to use app, please reload app again.')
            return
        }

        this.setState({isLoading: true})
        RestAPI.social_auth(email, global.expoPushToken, global.UUID).then(async (res) => {
            if (res.success == 1) {
                await this.onStepAfterLogin(res.data)
            } else {
                alertOk('Social Signup', 'You can signup with your social account. Please fill required fields.', () => {
                    this.onRegister(email, fname, lname, true);
                })
            }
        }).catch(err => {
            this.setState({isLoading: false}, () => {
                failed('Oops', 'Somethings wrong while check email exist.')
            })
        }).finally(() => {
            this.setState({isLoading: false})
        })
    }

    onStepAfterLogin = async (userData) => {
        const navigation = this.context;
        global.curUser = userData
        await AsyncStorage.setItem('cur_user', JSON.stringify(userData))

        if (!global.curUser.phone_verified_at) {
            navigation.navigate('verify_phone')
            return
        }

        if (!global.curUser.email_verified_at) {
            navigation.navigate('verify_email');
            return
        }

        if (Constants.isDriver() && !global.curUser.car) {
            Constants.getInitRoute(true);
            navigation.navigate('Main');
            return
        }
        Constants.getInitRoute(true);
        navigation.navigate('Main')
    }

    onTapPrivacyTerms = () => {

        const navigation = this.context;
        navigation.navigate('web_page', {link: 'https://rydedeal.com/mobile/policy', title: 'Privacy & Policy'})

    }


    onLogin = () => {

        this.setState({isLoading: true})
        showPageLoader(true)
        RestAPI.login(this.state.email, this.state.password).then(async (res) => {
            console.log('login res ;', res)
            if (res.success == 1) {
                await this.onStepAfterLogin(res.data)
            } else {
                failed('Oops!', 'Failed to login because ' + res.msg)
            }
        }).catch(err => {
            console.log(err)
            failed('Oops', 'Somethings wrong. please try again ')
        }).finally(() => {
            showPageLoader(false)
            this.setState({isLoading: false})
        })
    }

    onRegister = (email, fname, lname, isSocial) => {
        const navigation = this.context;
        if (email && (fname || lname)) {
            global.socialData = {email: email, fname: fname, lname: lname, isSocialSignup: isSocial}
        } else {

        }

        navigation.navigate('signup', {email: email, fname: fname, lname: lname, isSocialSignup: isSocial})
    }


    render() {
        const navigation = this.context;
        const emailRef = React.createRef();
        const passwordRef = React.createRef();

        return (
            <>
                {/* <ZStatusBar backgroundColor={'black'} barStyle={'light-content'}/> */}
                <ImageBackground source={require('../../assets/signup.jpg')} blurRadius={2} style={styles.imageCover}>

                    <ScrollView keyboardShouldPersistTaps="always"
                                contentContainerStyle={{paddingBottom: 40, backgroundColor: '#2222'}}>

                        <View style={styles.container}>

                            <Text style={styles.titleText}> Join Now! </Text>

                            <Input
                                containerStyle={styles.input}
                                inputStyle={styles.textInput}
                                inputContainerStyle={{borderBottomWidth: 0}}
                                placeholderTextColor='white'
                                overflow="hidden"
                                placeholder='Email'
                                keyboardType="email-address"
                                value={this.state.email}
                                onChangeText={email => this.setState({email})}
                                onSubmitEditing={() => {
                                    passwordRef.current.focus()
                                }}
                                ref={emailRef}
                                leftIcon={
                                    <SimpleLineIcons name="user" size={18} style={{paddingRight: 20}} color="white"/>
                                }
                            />
                            <Input
                                containerStyle={styles.input}
                                inputStyle={styles.textInput}
                                inputContainerStyle={{borderBottomWidth: 0}}
                                placeholderTextColor='white'
                                overflow="hidden"
                                secureTextEntry={true}
                                placeholder='Password'
                                ref={passwordRef}
                                onChangeText={password => this.setState({password})}
                                value={this.state.password}
                                onSubmitEditing={() => {
                                    this.onLogin();
                                }}
                                leftIcon={<SimpleLineIcons name="eye" size={18} style={{paddingRight: 20}}
                                                           color="white"/>}
                            />

                            <TouchableOpacity onPress={this.onTapPrivacyTerms}>
                                <Text style={styles.privacyTopText}>By Clicking Enter You Agree our</Text>
                                <Text style={styles.privacyUnderText}>Terms and conditions and Privacy policy</Text>
                            </TouchableOpacity>

                            {
                                this.state.isLoading && false ?
                                    <View style={{width: '100%', height: 45, marginVertical: 10, alignItems: 'center'}}>
                                        <BallIndicator color={Constants.white} size={45}/>
                                    </View> :
                                    <TouchableOpacity
                                        style={styles.submitButton}
                                        onPress={this.onLogin}
                                    >
                                        <Text style={styles.submitButtonText}> Login </Text>
                                    </TouchableOpacity>
                            }

                            <Text style={styles.signWithText}> Or </Text>
                            <Text style={styles.signWithText}> SignUp With </Text>

                            <View style={styles.socialSignup}>
                                <TouchableOpacity onPress={this.onFblogIn}>
                                    {/* <Image source={require('../../assets/facebook.jpg')} style = {styles.facebookSignup}/> */}
                                    <View style={styles.facebookSignup}>
                                        {
                                            this.state.isFBLoading ?
                                                <BallIndicator color={Constants.white} size={25}/>
                                                :
                                                <>
                                                    <FontAwesome name="facebook-f" size={26} color={'white'}/>
                                                    <Text style={{
                                                        color: 'white',
                                                        fontSize: 15,
                                                        marginLeft: 10
                                                    }}>Facebook</Text>
                                                </>
                                        }

                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.onPressGoogleLogin}>
                                    {/* <Image source={require('../../assets/google.jpg')} style = {styles.googleSignup}/> */}
                                    <View style={styles.googleSignup}>
                                        <AntDesign name="googleplus" size={30} color={'white'}/>
                                        <Text style={{color: 'white', fontSize: 15, marginLeft: 10}}>Google</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View
                                style={{
                                    marginTop: '3%',
                                    width: '30%',
                                    borderBottomColor: 'white',
                                    borderBottomWidth: 5,
                                }}
                            />
                            <View style={styles.login_text}>
                                <Text style={styles.footerText}>Have you not account yet? </Text>
                                <TouchableOpacity
                                    onPress={this.onRegister}
                                >
                                    <Text style={styles.footerLoginText}>Signup</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={{marginTop: 10}} onPress={() => {
                                navigation.navigate('ForgotPassword')
                            }}>
                                <Text style={{color: Constants.fbColor}}>I forgot password.</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                    <View style={{position: 'absolute', bottom: 10, left: 15}}><Text
                        style={{color: 'white', fontSize: 11}}>Version:{appJson.expo.ios.buildNumber}</Text></View>

                </ImageBackground>

            </>
        )

    }
}

export default LoginScreen

const styles = StyleSheet.create({
    imageCover: {
        flex: 1,
        resizeMode: 'cover',

    },
    container: {
        justifyContent: 'center',

        alignItems: 'center',
        // paddingTop: '40%',
        height: Constants.WINDOW_HEIGHT,
    },
    input: {
        borderStyle: 'solid',
        overflow: 'hidden',
        borderColor: 'lightgrey',
        borderRadius: 30,
        width: '80%',
        // marginLeft: '5%',
        marginTop: 5,
        marginBottom: 10,
        padding: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    textInput: {
        color: 'white',
        width: '100%',
    },
    titleText: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10
    },
    privacyTopText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 10,
    },
    privacyUnderText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 5,
        textDecorationLine: 'underline'
    },
    footerText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center'
    },
    footerLoginText: {
        color: '#fff',
        fontSize: 20,
        textAlign: 'center',
        textDecorationLine: 'underline'
    },
    signWithText: {
        marginTop: 5,
        color: '#fff',
        fontSize: 13,
        textAlign: 'center'
    },
    usernameInput: {
        flexDirection: 'row',
    },
    submitButton: {
        backgroundColor: '#fff',
        height: 50,
        marginTop: 13,
        marginBottom: 5,
        width: '65%',
        borderRadius: 30,
    },
    submitButtonText: {
        padding: 15,
        fontSize: 17,
        fontWeight: 'bold',
        color: '#555',
        textAlign: 'center'
    },
    socialSignup: {
        marginTop: '5%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    facebookSignup: {
        height: 46,
        width: Constants.WINDOW_WIDTH * 0.4 - 12,
        borderRadius: 30,
        marginRight: 10,
        backgroundColor: Constants.fbColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

    },
    googleSignup: {
        height: 46,
        width: Constants.WINDOW_WIDTH * 0.4 - 12,
        borderRadius: 30,
        marginRight: 10,
        flexDirection: 'row',
        backgroundColor: Constants.googleColor,
        alignItems: 'center',
        justifyContent: 'center',
    },
    login_text: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

})