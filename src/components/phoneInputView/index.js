import React, { Component, useState,  useEffect,  useRef } from 'react';
import PropTypes from 'prop-types';
import {
  AppRegistry,
  StyleSheet,
  Image,
  TextInput,
  Text,
  TouchableWithoutFeedback,
  View,
  TouchableOpacity
} from 'react-native';

import Flags from './resources/flags'
import PhoneNumber from './phoneNumber'
import styles from './styles';
import CountryPicker from './countryPicker'

export default PhoneInputView = (props)=>{
    
    
    // constructor(props, context){
    //     super(props, context)

    //     this.onChangePhoneNumber = this.onChangePhoneNumber.bind(this)
    //     this.onPressFlag = this.onPressFlag.bind(this)
    //     this.selectCountry = this.selectCountry.bind(this)
    //     this.getFlag = this.getFlag.bind(this)
        
        let iso2Init = props.initialCountry || 'us'
        let countryData = PhoneNumber.getCountryDataByCode(iso2Init)
        
        const [ iso2, setIso2 ] = useState(iso2Init)
        const [ formattedNumber, setFormattedNumber ] = useState(countryData?`+${countryData.dialCode}`:'')
        const [ value, setValue ] = useState(props.value)
        const [ pickerVisible , setPickerVisible ] = useState(false)
        useEffect(() => {
            if( props.value != value){
                setValue(props.value)
                updateFlagAndFormatNumber(props.value)
            }
            
            return () => {}
        }, [props.value])
        // this.state = {
        //     iso2,
        //     formattedNumber: countryData?`+${countryData.dialCode}`:'',
        //     value: null
        // }
    // }
    
    // componentWillReceiveProps(nextProps){
    //     if(nextProps.value != this.state.value){
    //         this.setState({value: nextProps.value})
    //         this.updateFlagAndFormatNumber(nextProps.value)
    //     }
    // }

    // componentWillMount(){
    //     if(this.props.value)
    //         this.updateFlagAndFormatNumber(this.props.value)
    // }
    // let pickerRef = useRef()
    let inputPhoneRef = useRef()
    
    const possiblyEliminateZeroAfterCountryCode = (number)=> {
        const dialCode = PhoneNumber.getDialCode(number);
        return number.startsWith(dialCode + '0')
          ? dialCode + number.substr(dialCode.length + 1)
          : number;
    }
    
    const updateFlagAndFormatNumber = (number, actionAfterSetState = null) => {
        let iso2init = props.initialCountry || 'us'
        let phoneNumber = number
        if(number){
            if(phoneNumber[0] != '+')
                phoneNumber = `+${phoneNumber}`
            phoneNumber = possiblyEliminateZeroAfterCountryCode(phoneNumber);
            iso2init = PhoneNumber.getCountryCodeOfNumber(phoneNumber)
        }
        setIso2(iso2init)
        setFormattedNumber( phoneNumber )
        
        // this.setState({iso2, formattedNumber: phoneNumber}, actionAfterSetState)
    }
    
    const onChangePhoneNumber = (number) => {
        
        let actionAfterSetState = props.onChangePhoneNumber?() => {props.onChangePhoneNumber(number)}:null
        if( props.onChangePhoneNumber ){
            props.onChangePhoneNumber(number);
        }

        updateFlagAndFormatNumber(number, actionAfterSetState)
    }
    
    const isValidNumber = ()=>{
        return PhoneNumber.isValidNumber(formattedNumber, iso2)
    }
    
    const getNumberType = () => {
        return PhoneNumber.getNumberType(formattedNumber, iso2)
    }
    
    const getValue = ()=>{
        return formattedNumber
    }
    
    const getDialCode = () => {
        return PhoneNumber.getDialCode(formattedNumber);
    }
    
    const getFlag = (iso2)=>{
        return Flags.get(iso2)
    }
    
    const getAllCountries = () => {
        return PhoneNumber.getAllCountries()
    }

    const getPickerData = ()=>{
        return PhoneNumber.getAllCountries().map((country,index) => {return {
            key: index,
            image: Flags.get(country.iso2),
            label: country.name,
            dialCode: `+${country.dialCode}`,
            iso2: country.iso2
        }})
    }
    
    const selectCountry = (iso2Param) => {
        setPickerVisible(false)
        if(iso2 != iso2Param){
            let countryData = PhoneNumber.getCountryDataByCode(iso2Param)
            if(countryData){
                setIso2(iso2Param)
                setFormattedNumber(`+${countryData.dialCode}`)
                if( props.onSelectCountry ){
                    props.onSelectCountry(iso2Param)
                }                
            }
        }
    }

    const onTapPickerCancel = ()=>{
        setPickerVisible(false)
    }

    const onPressFlag = ()=>{
        if(props.onPressFlag){
            props.onPressFlag()
        }
        else{
            // console.log(iso2, 'pickerRef.current: ', pickerRef.current)
            // if(iso2 )
            //     pickerRef.selectCountry(iso2)
            
            // if( pickerRef.current ){
                // pickerRef.current.show()
                setPickerVisible(true)
                
            // }            
        }
    }
    
    const focus = ()=>{
        if(inputPhoneRef.current)
	        inputPhoneRef.current.focus()
    }
    
    
        const TextComponent = props.textComponent || TextInput;
        return (
            <View style={[styles.container, props.style]}>
                <TouchableOpacity onPress={onPressFlag}>
                    <Image source={Flags.get(iso2)}
                        style={[styles.flag, props.flagStyle]}
                        onPress={onPressFlag}
                    />
                </TouchableOpacity>
                <View style={{flex:1, marginLeft:props.offset || 10}}>
					<TextComponent
						ref={inputPhoneRef}
						autoCorrect={false}
                        style={[styles.text, props.textStyle]}
                        onChangeText={(text) => onChangePhoneNumber(text)}
                        keyboardType='phone-pad'
                        underlineColorAndroid='rgba(0,0,0,0)'
                        value={formattedNumber}
                        {...props.textProps}
                    />
                </View>
                
                <CountryPicker
                    // ref={pickerRef}
                    selectedCountry={iso2}
                    modalVisible={pickerVisible}
                    onSubmit={selectCountry}
                    onTapCancel={onTapPickerCancel}
                    buttonColor={props.pickerButtonColor}
                    buttonTextStyle={props.pickerButtonTextStyle}
                    itemStyle={props.itemStyle}
                    cancelText={props.cancelText}
                    cancelTextStyle={props.cancelTextStyle}
                    confirmText={props.confirmText}
                    confirmTextStyle={props.confirmTextStyle}
                    pickerBackgroundColor={props.pickerBackgroundColor}
                    itemStyle={props.pickerItemStyle}
                />
            </View>
        )
    
}
// export default class PhoneInputView extends Component {
    
//     constructor(props, context){
//         super(props, context)

//         this.onChangePhoneNumber = this.onChangePhoneNumber.bind(this)
//         this.onPressFlag = this.onPressFlag.bind(this)
//         this.selectCountry = this.selectCountry.bind(this)
//         this.getFlag = this.getFlag.bind(this)

//         var iso2 = this.props.initialCountry || 'us'
//         var countryData = PhoneNumber.getCountryDataByCode(iso2)
//         this.state = {
//             iso2,
//             formattedNumber: countryData?`+${countryData.dialCode}`:'',
//             value: null
//         }
//     }

//     componentWillReceiveProps(nextProps){
//         if(nextProps.value != this.state.value){
//             this.setState({value: nextProps.value})
//             this.updateFlagAndFormatNumber(nextProps.value)
//         }
//     }

//     componentWillMount(){
//         if(this.props.value)
//             this.updateFlagAndFormatNumber(this.props.value)
//     }

//     possiblyEliminateZeroAfterCountryCode(number) {
//         const dialCode = PhoneNumber.getDialCode(number);
//         return number.startsWith(dialCode + '0')
//           ? dialCode + number.substr(dialCode.length + 1)
//           : number;
//     }

//     updateFlagAndFormatNumber(number, actionAfterSetState = null){
//         var iso2 = this.props.initialCountry || 'us'
//         var phoneNumber = number
//         if(number){
//             if(phoneNumber[0] != '+')
//                 phoneNumber = `+${phoneNumber}`
//             phoneNumber = this.possiblyEliminateZeroAfterCountryCode(phoneNumber);
//             iso2 = PhoneNumber.getCountryCodeOfNumber(phoneNumber)
//         }
//         this.setState({iso2, formattedNumber: phoneNumber}, actionAfterSetState)
//     }

//     onChangePhoneNumber(number){
//         var actionAfterSetState = this.props.onChangePhoneNumber?() => {this.props.onChangePhoneNumber(number)}:null
//         this.updateFlagAndFormatNumber(number, actionAfterSetState)
//     }

//     isValidNumber(){
//         return PhoneNumber.isValidNumber(this.state.formattedNumber, this.state.iso2)
//     }

//     getNumberType(){
//         return PhoneNumber.getNumberType(this.state.formattedNumber, this.state.iso2)
//     }

//     getValue(){
//         return this.state.formattedNumber
//     }

//     getDialCode() {
//         return PhoneNumber.getDialCode(this.state.formattedNumber);
//     }

//     getFlag(iso2){
//         return Flags.get(iso2)
//     }

//     getAllCountries(){
//         return PhoneNumber.getAllCountries()
//     }

//     getPickerData(){
//         return PhoneNumber.getAllCountries().map((country,index) => {return {
//             key: index,
//             image: Flags.get(country.iso2),
//             label: country.name,
//             dialCode: `+${country.dialCode}`,
//             iso2: country.iso2
//         }})
//     }

//     selectCountry(iso2){
//         if(this.state.iso2 != iso2){
//             var countryData = PhoneNumber.getCountryDataByCode(iso2)
//             if(countryData){
//                 this.setState({
//                     iso2,
//                     formattedNumber: `+${countryData.dialCode}`
//                 }, ()=>{
//                     if(this.props.onSelectCountry)
//                         this.props.onSelectCountry(iso2)
//                 })
//             }
//         }
//     }

//     onPressFlag(){
//         if(this.props.onPressFlag)
//             this.props.onPressFlag()
//         else{
//             if(this.state.iso2)
//                 this.refs.picker.selectCountry(this.state.iso2)
//             this.refs.picker.show()
//         }
//     }

//     focus(){
// 	    this.refs.inputPhone.focus()
//     }

//     render(){
//         const TextComponent = this.props.textComponent || TextInput;
//         return (
//             <View style={[styles.container, this.props.style]}>
//                 <TouchableWithoutFeedback onPress={this.onPressFlag}>
//                     <Image source={Flags.get(this.state.iso2)}
//                         style={[styles.flag, this.props.flagStyle]}
//                         onPress={this.onPressFlag}
//                     />
//                 </TouchableWithoutFeedback>
//                 <View style={{flex:1, marginLeft:this.props.offset || 10}}>
// 					<TextComponent
// 						ref='inputPhone'
// 						autoCorrect={false}
//                         style={[styles.text, this.props.textStyle]}
//                         onChangeText={(text) => this.onChangePhoneNumber(text)}
//                         keyboardType='phone-pad'
//                         underlineColorAndroid='rgba(0,0,0,0)'
//                         value={this.state.formattedNumber}
//                         {...this.props.textProps}
//                     />
//                 </View>

//                 <CountryPicker
//                     ref={'picker'}
//                     selectedCountry={this.state.iso2}
//                     onSubmit={this.selectCountry}
//                     buttonColor={this.props.pickerButtonColor}
//                     buttonTextStyle={this.props.pickerButtonTextStyle}
//                     itemStyle={this.props.itemStyle}
//                     cancelText={this.props.cancelText}
//                     cancelTextStyle={this.props.cancelTextStyle}
//                     confirmText={this.props.confirmText}
//                     confirmTextStyle={this.props.confirmTextStyle}
//                     pickerBackgroundColor={this.props.pickerBackgroundColor}
//                     itemStyle={this.props.pickerItemStyle}
//                 />
//             </View>
//         )
//     }
// }

PhoneInputView.propTypes = {
  textComponent: PropTypes.func,
  initialCountry: PropTypes.string,
  onChangePhoneNumber: PropTypes.func,
  value: PropTypes.string,
  style: PropTypes.object,
  flagStyle: PropTypes.object,
  textStyle: PropTypes.object,
  offset: PropTypes.number,
  textProps: PropTypes.object,
  onSelectCountry: PropTypes.func,
  pickerButtonColor: PropTypes.string,
  pickerBackgroundColor: PropTypes.string,
  pickerItemStyle: PropTypes.object,
  cancelText: PropTypes.string,
  cancelTextStyle: PropTypes.object,
  confirmText: PropTypes.string,
  confirmTextTextStyle: PropTypes.object,
}
