import React, { Component , useState, useEffect, useRef, useCallback} from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Picker,
  Dimensions,
} from 'react-native'
import PropTypes from 'prop-types';

import Country from './country'
import styles from './styles'
const PickerItem = Picker.Item

const propTypes = {
  buttonColor: PropTypes.string,
  labels: PropTypes.array,
  confirmText : PropTypes.string,
  cancelText : PropTypes.string,
  itemStyle: PropTypes.object,
  onSubmit: PropTypes.func,
}

export default CountryPicker = (props)=>{
  
  const [ buttonColor, setButtonColor ] = useState(props.buttonColor || '#007AFF');
  const [ modalVisible, setModalVisible ] = useState( false )
  const [ selectedCountry, setSelectedCountry ] = useState( props.selectedCountry || Country.getAll()[0] )

  // let onPressCancel = onPressCancel.bind(this);
  // let onPressSubmit = onPressSubmit.bind(this);
  // let onValueChange = onValueChange.bind(this);
  
  useEffect(()=>{
    setSelectedCountry(selectedCountry)
  }, [props.selectedCountry])

  useEffect(()=>{
    setModalVisible(props.modalVisible)
  }, [props.modalVisible])
  
  const selectCountry = (country)=>{
    setSelectedCountry(country)
  }
  
  const onPressCancel = ()=>{
    setModalVisible(false)
    if( props.onTapCancel){
      props.onTapCancel();
    }
  }

  const onPressSubmit = ()=>{
    if (props.onSubmit) {
      props.onSubmit(selectedCountry)
    }
    setModalVisible(false)    
  }

  const onValueChange = (country)=>{
    setSelectedCountry(country)    
  }
  
  const show = ()=>{
    setModalVisible(true)    
  }
  
  const renderItem = (country, index)=>{
    return (
      <PickerItem
        key={country.iso2}
        value={country.iso2}
        label={country.name}
      />
    )
  }

  
  const itemStyle = props.itemStyle || {}
  return (
    <Modal
      animationType={'slide'}
      transparent
      visible={modalVisible}
      onRequestClose={() => {console.log("Country picker has been closed.")}}
    >
      <View style={styles.basicContainer}>
        <View style={[styles.modalContainer, {backgroundColor: props.pickerBackgroundColor || 'white'}]}>
          <View style={styles.buttonView}>
            <TouchableOpacity onPress={onPressCancel}>
              <Text style={[{ color: buttonColor }, props.buttonTextStyle]}>
                {props.cancelText || 'Cancel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onPressSubmit}>
              <Text style={[{ color: buttonColor }, props.buttonTextStyle]}>
                {props.confirmText || 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.mainBox}>
            <Picker
              // ref={'picker'}
              style={styles.bottomPicker}
              selectedValue={selectedCountry}
              onValueChange={(country) => onValueChange(country)}
              itemStyle={itemStyle}
              mode="dialog"
            >
              {Country.getAll().map((country, index) => renderItem(country, index))}
            </Picker>
          </View>

        </View>
      </View>
    </Modal>
  )

}

// export default class CountryPicker extends Component {
//   constructor(props) {
//     super(props)

//     this.state = {
//       buttonColor: this.props.buttonColor || '#007AFF',
//       modalVisible: false,
//       selectedCountry: this.props.selectedCountry || Country.getAll()[0],
//     }

//     this.onPressCancel = this.onPressCancel.bind(this)
//     this.onPressSubmit = this.onPressSubmit.bind(this)
//     this.onValueChange = this.onValueChange.bind(this)
//   }

//   componentWillReceiveProps(nextProps) {
//     this.setState({
//       selectedCountry: nextProps.selectedCountry
//     })
//   }

//   componentWillUpdate(){

//   }

//   selectCountry(selectedCountry){
//     this.setState({
//       selectedCountry
//     })
//   }

//   onPressCancel() {
//     this.setState({
//       modalVisible: false,
//     })
//   }

//   onPressSubmit() {
//     if (this.props.onSubmit) {
//       this.props.onSubmit(this.state.selectedCountry)
//     }

//     this.setState({
//       modalVisible: false,
//     })
//   }

//   onValueChange(selectedCountry) {
//     this.setState({
//       selectedCountry
//     })
//   }

//   show() {
//     this.setState({
//       modalVisible: true,
//     })
//   }

//   renderItem(country, index) {
//     return (
//       <PickerItem
//         key={country.iso2}
//         value={country.iso2}
//         label={country.name}
//       />
//     )
//   }

//   render() {
//     const { buttonColor } = this.state
//     const itemStyle = this.props.itemStyle || {}
//     return (
//       <Modal
//         animationType={'slide'}
//         transparent
//         visible={this.state.modalVisible}
//         onRequestClose={() => {console.log("Country picker has been closed.")}}
//       >
//         <View style={styles.basicContainer}>
//           <View style={[styles.modalContainer, {backgroundColor: this.props.pickerBackgroundColor || 'white'}]}>
//             <View style={styles.buttonView}>
//               <TouchableOpacity onPress={this.onPressCancel}>
//                 <Text style={[{ color: buttonColor }, this.props.buttonTextStyle]}>
//                   {this.props.cancelText || 'Cancel'}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity onPress={this.onPressSubmit}>
//                 <Text style={[{ color: buttonColor }, this.props.buttonTextStyle]}>
//                   {this.props.confirmText || 'Confirm'}
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.mainBox}>
//               <Picker
//                 ref={'picker'}
//                 style={styles.bottomPicker}
//                 selectedValue={this.state.selectedCountry}
//                 onValueChange={(country) => this.onValueChange(country)}
//                 itemStyle={itemStyle}
//                 mode="dialog"
//               >
//                 {Country.getAll().map((country, index) => this.renderItem(country, index))}
//               </Picker>
//             </View>

//           </View>
//         </View>
//       </Modal>
//     )
//   }
// }

CountryPicker.propTypes = propTypes
