import React from 'react';
import {StyleSheet, Text, View, Dimensions, ScrollView, Modal, TouchableOpacity} from 'react-native';
import {ThemeProvider, Image, Button} from 'react-native-elements';
import {BallIndicator} from "react-native-indicators";
import PropTypes from 'prop-types';
import Constants from '../utils/Constants';


const PagerIndicator = ({containerStyle, itemWidth, titleStyle, titleList = [],  onTapItem, tabIndex = 0}) =>{
    
    // let [ selIndex, setSelIndex ] = React.useState(tabIndex);
    
    const onTapItemPress = (index, title)=>{
        // setSelIndex( index )
        if( onTapItem ){
            onTapItem(index, title)
        }
    }
    
    return (
      <View style={{...containerStyle, width:'100%', flexDirection:'row', justifyContent:'flex-start', height:45, paddingHorizontal:20,}}>
        {
            titleList.map((title, index)=>{
                
                if( index == titleList.length -1 ){
                
                }else{
                
                }
                return <TouchableOpacity 
                            key={index}
                            style={{
                                width: itemWidth, 
                                height:'100%', 
                                paddingHorizontal:15, 
                                alignItems:'center' , 
                                justifyContent:'center' ,
                                borderBottomWidth: tabIndex == index ? 1 : 0,
                                borderBottomColor : Constants.purpleColor
                            }} 
                            onPress = {()=>{onTapItemPress(index, title)}}>
                            
                            <Text style={[titleStyle, { fontSize:15, fontWeight: tabIndex === index ? 'bold' : 'normal', color: tabIndex === index ? Constants.purpleColor : Constants.opacityPurpleColor }]}>{title}</Text>
                        </TouchableOpacity>  
            })
        }
        
      </View>
    );
}

PagerIndicator.propTypes = {
    isPageLoader:PropTypes.bool
};

PagerIndicator.defaultProps={
    isPageLoader:false,
}

export default PagerIndicator;
