import React, {Component} from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    ScrollView
} from 'react-native'
import {Avatar, Input} from 'react-native-elements';
import {SimpleLineIcons, AntDesign} from "@expo/vector-icons";
import {useNavigation, useRoute} from '@react-navigation/native';
import ZStatusBar from '../../src/components/ZStatusBar';

let screenHeight = Dimensions.get('screen').height;
let screenWidth = Dimensions.get('screen').width;

export default function DriverProfile({}) {

    const navigation = useNavigation();
    const route = useRoute();

    const keyboardVerticalOffset = Platform.OS === 'ios' ? 0 : 0;
    return (
        <>
            {/* <ZStatusBar/> */}
            <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
            <KeyboardAvoidingView style={{flex: 1, backgroundColor: '#f5f5f5'}} behavior="padding" enabled>

                <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{alignItems: 'center'}}>
                    <ImageBackground source={require('../../assets/backgroundAccoutnDetails.jpg')} blurRadius={0}
                                     style={styles.imageCover}>
                        <View style={styles.mainBoard}>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: 'white',
                                position: 'absolute',
                                marginTop: 100
                            }}>Profile Details</Text>
                            <View style={styles.avatarField}>
                                <Avatar
                                    rounded
                                    source={{
                                        uri:
                                            'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
                                    }}
                                    size={130}
                                />
                            </View>
                            <View style={styles.inforField}>
                                <Input
                                    containerStyle={styles.input}
                                    inputStyle={styles.textInput}
                                    inputContainerStyle={{borderBottomWidth: 0.8, borderColor: '#ddd',}}
                                    placeholderTextColor='darkgrey'
                                    placeholder='Username'
                                />
                                <Input
                                    containerStyle={styles.input}
                                    inputStyle={styles.textInput}
                                    inputContainerStyle={{borderBottomWidth: 0.8, borderColor: '#ddd',}}
                                    placeholderTextColor='darkgrey'
                                    placeholder='Email Address'
                                />
                                <Input
                                    containerStyle={styles.input}
                                    inputStyle={styles.textInput}
                                    inputContainerStyle={{borderBottomWidth: 0.8, borderColor: '#ddd',}}
                                    placeholderTextColor='darkgrey'
                                    placeholder='First Name'
                                />
                                <Input
                                    containerStyle={styles.input}
                                    inputStyle={styles.textInput}
                                    inputContainerStyle={{borderBottomWidth: 0.8, borderColor: '#ddd',}}
                                    placeholderTextColor='darkgrey'
                                    placeholder='Last Name'
                                />
                                <Input
                                    containerStyle={styles.input}
                                    inputStyle={styles.textInput}
                                    inputContainerStyle={{borderBottomWidth: 0.8, borderColor: '#ddd',}}
                                    placeholderTextColor='darkgrey'
                                    placeholder='Phone Number'
                                />
                                <Input
                                    containerStyle={styles.input}
                                    inputStyle={styles.textInput}
                                    inputContainerStyle={{borderBottomWidth: 0.8, borderColor: '#ddd',}}
                                    placeholderTextColor='darkgrey'
                                    placeholder='Submit'
                                />
                            </View>
                            <View style={styles.buttonField}>
                                <TouchableOpacity style={styles.submitButton}>
                                    <Text style={styles.submitButtonText}> Submit </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    )
}


const styles = StyleSheet.create({

    imageCover: {
        flex: 1,
    },
    mainBoard: {
        width: screenWidth,
        height: screenHeight,
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    avatarField: {
        width: '100%',
        position: 'absolute',
        marginTop: 150,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    inforField: {
        marginTop: screenHeight * 0.35,
        width: screenWidth * 0.85,
        height: screenHeight * 0.5,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 30,
    },
    buttonField: {
        marginTop: -30,
        width: screenWidth * 0.8,
        height: screenHeight * 0.15,
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
        alignItems: 'center'
    },
    submitButtonText: {
        padding: 15,
        fontSize: 17,
        color: '#fff',
    },
    input: {
        width: '90%',
        height: '15%',

    },
    textInput: {
        textAlign: 'center',
        color: '#555',
        width: '100%',
        fontSize: 15,
    },
})