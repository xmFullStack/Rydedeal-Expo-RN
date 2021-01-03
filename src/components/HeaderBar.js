
import React, { useState, useEffect } from 'react';
import { Text, View, Dimensions,  TouchableOpacity} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    SimpleLineIcons,
    EvilIcons,
    Entypo
} from '@expo/vector-icons';

import { Avatar } from 'react-native-elements';
import { GetAvatar } from '../../pages/customer/UserDetail';
import Constants from '../utils/Constants';

const  HeaderBar = ({title, onLeftButton, leftIcon, rightIcon, onRightButton, backgroundColor, leftIconColor, titleColor = Constants.purpleColor, isBackLeft = false, isShowRight = true, isShowLeft=true , isTransparent = false})=>{
    
    const backButton =  <Entypo name="chevron-thin-left" size={25} color={Constants.purpleColor}/>
    
    let [liveData, setLiveData] = useState('live data init value.');
    let [counter , setCounter]  = useState(0)
    useEffect(()=>{
        setCounter(counter + 1)        
    }, [liveData])
    global.setTestLiveData = setLiveData.bind(this)
    
    
    return (
        <View 
            style={{
                flexDirection: 'row',                
                width: Dimensions.get('screen').width, 
                // borderColor:'red',
                // borderWidth:2,
                height: 55,
                justifyContent: 'flex-start', 
                alignItems: 'center',
                position:'absolute',
                top:0,
                left:0,
                right:0,
                zIndex:909009
            }}
        >
             <LinearGradient
                style={{
                    flex:1, 
                    paddingTop:10,
                    paddingBottom:10,
                    flexDirection: 'row',                 
                    width: '100%',                     
                    height: '100%',
                    justifyContent: 'flex-start', 
                    alignItems: 'center',
                    paddingHorizontal: 10,
                }}
                colors={ backgroundColor ? [backgroundColor , backgroundColor] : ['#FFFF', '#FFFA', '#FFF1']}
                
            >
                {
                    isShowLeft ? 

                    <TouchableOpacity 
                        onPress={onLeftButton} 
                        style={{
                            // height: '100%', 

                            alignItems: 'center', 
                        }}
                    >
                        {
                            leftIcon != null ? 
                            leftIcon : (
                                isBackLeft ? backButton :    
                                <EvilIcons name="navicon" size={35}  color={ leftIconColor ? leftIconColor : '#6733bb'} />
                            )
                            
                        }                    
                    </TouchableOpacity> : null
                
                }
            <View 
                style={{
                    height: '100%', 
                    // flex:1,
                    width: '100%', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    marginLeft:-10,
                    // borderColor:'red',
                    // borderWidth:2,
                    }}
                >
                <Text   
                    style={{
                        fontSize: 20, 
                        paddingTop: 0, 
                        paddingRight: 50, 
                        fontWeight: 'bold', 
                        color: titleColor
                    }}
                >
                    {title}
                </Text>
                {/* <Text> {counter}=>:{liveData}</Text> */}
            </View>

            {
                isShowRight ? 
                <TouchableOpacity 
                    onPress={onRightButton} 
                    style={{
                        alignItems: 'center', 
                        position: 'absolute',
                        top:15,
                        right:15,
                    }}
                >
    
                    {
                        rightIcon != null ? 
                        rightIcon : 
                        <Avatar
                            containerStyle={{borderColor:Constants.purpleColor, borderWidth:2, marginTop:-5}}
                            rounded
                            source={GetAvatar()}                            
                            size={35}
                        />
                        // <SimpleLineIcons name="user" size={23}  color='#6733bb' />
                    }                    
                </TouchableOpacity> : null
    
            }
            </LinearGradient>
         </View>
    )
}

export default HeaderBar;