import React, { useState } from 'react';
import {StyleSheet, Text, View, Dimensions, ScrollView, Modal, TouchableOpacity} from 'react-native';
import {ThemeProvider, Image, Button} from 'react-native-elements';
import {BallIndicator} from "react-native-indicators";
import PropTypes from 'prop-types';
import Constants from '../utils/Constants';

const WINDOW_WIDTH = Dimensions.get('window').width;

const ImagePickerModal = ({isShow, onTakePhoto, onLibrary, onCancel}) =>{

    return (
        <Modal            
            animationType="fade"
            transparent={true}
            visible={isShow}>
            <View style={{ flex: 1, backgroundColor:'#2229', justifyContent:'center', alignItems:'center'}}>
                <View style={{backgroundColor:'white', width:'80%', paddingVertical:20, paddingHorizontal:30,}}>
                    <Text style={{fontSize:20, fontWeight:'bold', color:Constants.purpleColor , marginBottom:25,}} >Select a Photo</Text>
                    <TouchableOpacity onPress={onTakePhoto}>
                        <Text style={{fontSize:18, marginBottom:20,}}> Take Photo ... </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onLibrary}>
                        <Text style={{fontSize:18, marginBottom:25}}> Choose From Library ... </Text>
                    </TouchableOpacity>
                    <View style={{width:'100%', alignItems:'flex-end'}}>
                        <TouchableOpacity  onPress={onCancel} >
                            <Text style={{fontSize:16, color:'green'}}> Cancel </Text>
                        </TouchableOpacity>
                    </View>                    
                </View>
            </View>
        </Modal>
    );
}

ImagePickerModal.propTypes = {
    isShow:PropTypes.bool,
    onTakePhoto : PropTypes.func,
    onLibrary : PropTypes.func,
    onCancel : PropTypes.func
};

ImagePickerModal.defaultProps={
    isShow:false,

}

export default ImagePickerModal;
