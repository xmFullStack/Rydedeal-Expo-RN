import React, { Component } from 'react'
import { 
    View, 
    Text, 
    TouchableOpacity, 
    TouchableWithoutFeedback,
    TouchableHighlight, 
    KeyboardAvoidingView, 
    SafeAreaView, 
    SectionList, 
    ScrollView, 
    StyleSheet, 
    Dimensions ,
    Image,
    Alert,
    Modal
} from 'react-native'
import { NavigationContext,useRoute, useNavigation } from '@react-navigation/native'
import HeaderBar from '../../src/components/HeaderBar';

import RestAPI from '../../src/utils/RestAPI';
import Constants, { StatusBarHeight, isIOS } from '../../src/utils/Constants';

import {ItemManage} from './Manage';
import {ItemCandidate} from './Candidate'
import RideMapModal from './RideMapModal';
import { Octicons, MaterialCommunityIcons , FontAwesome } from '@expo/vector-icons';
import {BallIndicator, PulseIndicator} from "react-native-indicators";
import ZStatusBar from '../../src/components/ZStatusBar';



let windowHeight = Dimensions.get('screen').height;
let windowWidth = Dimensions.get('screen').width;


export const MoreMenu = ({ isShow=false, labels=[], onPressItem, onPressBack})=>{
   
    if( !isShow ){
        return null;
    }
    
    return (
        <Modal
            transparent={true}
            visible={isShow}> 
            <View style={{flex:1,}}>
                <TouchableOpacity activeOpacity={1} onPress={onPressBack} style={{flex:1,}}>
                    <View style={{padding:5, position:'absolute', top:40, right:10, zIndex:99999}}>
                        <View style={{backgroundColor:'white', elevation:10, borderRadius:15, paddingVertical:10, paddingHorizontal:20}}>
                            {
                                labels.map((label, index)=>(
                                    <TouchableOpacity 
                                        key={index}
                                        style={{ paddingVertical:5,}}
                                        onPress={()=>{ 
                                            if( onPressItem ){
                                                onPressItem(label)
                                            } 
                                        }}>
                                        <Text style={{color: Constants.purpleColor, fontSize:17,}} >{label}</Text>
                                    </TouchableOpacity>
                                
                                ))
                            }            
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
    </Modal>
    )
}

export default function  RideDetail(props){
    const route = useRoute();
    const navigation = useNavigation();

    const {item_id, onCancelRide} = route.params
    
    return <RideDetailPage navigation={navigation} route={route} itemId = {item_id} onCancelRide={onCancelRide}/>
}

export function EmptyHolder ({ placeholder, isLoading=false, isShow = true, onPressRefresh = null }){
    if(!isShow){
        return null
    }
    return (
        <View style={{
            width:'100%',
            height:'90%',
            justifyContent:'center',
            alignItems:'center'
        }}>
        
            
            {
                isLoading ?
                    <View style={{height:40, marginTop:5}}>
                        <BallIndicator  color={Constants.purpleColor} size={30} />
                    </View>
                    :
                    <>
                        <MaterialCommunityIcons name="credit-card-off" size={80} color={Constants.grayColor}/>
                        <Text style={{color:'#aaa', fontSize:15, width:'60%', textAlign:'center'}}>
                            {placeholder}
                        </Text>
                        <TouchableOpacity
                            style={{borderRadius:10, borderColor:Constants.purpleColor, marginTop:5, borderWidth:1 , paddingHorizontal:10, paddingVertical:5,}}
                            onPress={ onPressRefresh }>
                            <Text style={{color: Constants.purpleColor, fontSize:15}} >Refresh</Text>
                        </TouchableOpacity>
                    </>
            }

        
        </View>
    )
}

class RideDetailPage extends Component {

    static contextType = NavigationContext;
    
    state = {
        // itemId : this.props.itemId,
        isLoading: false,
        item : null,
        bidList: [],
        isShowMapModal: false,
        bids:null,
        fees:null,
        isShowMoreMenu: false,
        isCancellingBid : false,
        cancellingBidId : null
    }
    
    
    componentDidMount(){
        const navigation = this.context
        this._unsubscribe = navigation.addListener('focus', () => {
            
            this.loadData();
        });
        
    }
    componentWillUnmount(){
        this._unsubscribe();    
    }

    loadData = ()=>{
        if( this.state.isLoading ){
            return ;
        }
        const navigation = this.context
        this.setState({ isLoading : true })
        RestAPI.showRide(this.props.itemId).then(res=>{
            if( res.success == 1){
                let bids = res.data.bids
                this.setState({
                    item : res.data.ride,
                    bids: bids,
                    fees:res.data.fee,
                    bidList :[{ title: 'Candidates', key: 0, data: bids}] ,
                })
            }else{
                failed('Oops', res.msg)
                navigation.goBack();
            }
        }).catch(err=>{
            console.log(err)
            failed('Oops', 'Somethings wrong while fetching ride details.')
            navigation.goBack();
        }).finally(()=>{
            this.setState({ isLoading : false })
        })
    }
    
    showModal = ()=>{
        console.log('From Ridedetail page >>>>>>>>>>>>>>>>>>>>>', this.state.bids)
        
        this.setState({isShowMapModal : true })
    }

    gotoLeaveReview = (itemBidObj)=>{
        const navigation = this.context
        navigation.navigate('root_review', {ride:this.state.item,  bid : itemBidObj})
    }

    onAcceptDriver = (bidObj)=>{
        let bidId = bidObj.id;
        
        if( bidId > 0 ){
            this.setState({ isLoading : true })
            RestAPI.acceptFromCustomer(bidId).then(res=>{
                if( res.success == 1){
                    alert('Accepted!', 'Please contact with driver to confirm your request.')
                    this.loadData();
                }else{
                    failed('Oops', res.msg)
                }
            }).catch(err=>{
                console.log(err)
                failed('Oops','Somethings wrong. Please try again.' )
            }).finally(()=>{
                this.setState({ isLoading : false})
            })
        }

    }

    onCancelBidByCustomer = (bid_id)=>{
        this.setState({ isCancellingBid:  true , cancellingBidId : bid_id })
        RestAPI.cancelBidByCustomer(bid_id).then(res=>{
            if( res.success == 1){
                this.loadData()
            }else{
                failed('Oops', res.msg)
            }
        }).catch(err=>{
            console.log(err)
            failed('Oops','Somethings wrong. Please try again.' )
        }).finally(()=>{
            this.setState({ isCancellingBid: false})
        })
    }

    cancelRide = (itemId)=>{
        const navigation = this.context
        confirm('Cancel Ride', 'Are you sure to cancel remove ride?' , ()=>{
            /// yes
        
            this.setState({ isLoading : true })
            RestAPI.cancelRideByCustomer(itemId).then(res=>{
                if( res.success == 1){

                    if( this.props.onCancelRide ){
                        this.props.onCancelRide(itemId)
                    }
                    navigation.goBack();
                
                }else{
                    failed('Oops',res.msg)
                }
            }).catch(err=>{
                failed('Oops', 'Failed to cancel ride. ' + JSON.stringify(err))
            }).finally(()=>{
                this.setState({ isLoading : false })
            })
            
        
        }, ()=>{})
        
    
    }

    render() {
        const navigation = this.context
 
        return (
            <>
            {/* <ZStatusBar/> */}
            <ZStatusBar backgroundColor={Constants.purpleColor} barStyle={'light-content'}/>
            <View style = {styles.container}>
                <View style={styles.mainContainer}>
                    {
                        this.state.isLoading ? null :
                        <ItemManage item={this.state.item} onPressItem={itemObj=>{this.showModal();}}/>
                    }
                    
                    
                    <EmptyHolder 
                        placeholder="No Candidates."
                        isLoading={this.state.isLoading}
                        isShow={this.state.isLoading || this.state.bidList.length <= 0 || this.state.bidList[0].data.length <= 0}
                        onPressRefresh={()=>this.loadData()}
                    />
                    { 
                        this.state.isLoading ? null :
                        <View style={{marginTop:15, marginBottom:10, width:'100%', paddingHorizontal:20,}}>
                            <Text style={{fontSize:15, fontWeight:'bold', color:Constants.purpleColor}}>
                                Drivers
                            </Text>
                        </View>
                        
                    }
                    
                       
                    <SectionList
                        style={{width:Constants.WINDOW_WIDTH, height:Constants.WINDOW_HEIGHT}}
                        // contentContainerStyle={{paddingBottom:30, borderWidth:2, borderColor:'red'}}
                        renderSectionHeader={({ section: { title } }) => {}}
                        renderItem={({ item, index, section }) =>
                            <ItemCandidate 
                                ride={this.state.item}
                                currency={this.state.item.currency}                            
                                itemBid={item} 
                                index={index} 
                                section={section}
                                isCancellingBid = {this.state.cancellingBidId == item.id && this.state.isCancellingBid}
                                onPressCancelBidFromCustomer={bidId=>{this.onCancelBidByCustomer(bidId)}}
                                onAcceptDriver={(bidObj)=>{ this.onAcceptDriver(bidObj) }}
                                onPressReview={(itemObj)=>{this.gotoLeaveReview(itemObj) }}/>}
                        sections={this.state.bidList}
                        keyExtractor={(item, index) => index + '-' + item.id}
                        onRefresh={() => {
                            this.loadData()
                        }}
                        refreshing={this.state.isLoading}
                        onEndReached={(offset) => {

                        }}
                    />
                    
                    
                </View>
                <HeaderBar 
                    title="Ride Details" 
                    // isBackLeft={true}
                    rightIcon={<MaterialCommunityIcons  name="dots-vertical" size={28} color={Constants.purpleColor}/>}
                    onLeftButton = {()=>{navigation.toggleDrawer();}}
                    onRightButton={()=>{ 
                        this.setState({ isShowMoreMenu: !this.state.isShowMoreMenu })
                        // this.cancelRide(this.props.itemId) 
                    }}
                />
                
                <RideMapModal
                    item={this.state.item} bidList={this.state.bids} isShowModal={this.state.isShowMapModal} onCloseModal={()=>{this.setState({isShowMapModal: false })}}/>
                <MoreMenu 
                    isShow={this.state.isShowMoreMenu} 
                    labels={ this.state.item && this.state.item.accepted_at ? ['Remove'] : ['Edit', 'Remove']}
                    onPressBack={()=>{ this.setState({ isShowMoreMenu: false})}}
                    onPressItem={label=>{
                        if( label == 'Edit'){
                            if( this.state.item.completed_at ){
                                alert('Completed Ride', 'This Ride was completed already.');
                            }else if(this.state.item.began_at){
                                alert('Began Ride', 'This Ride was began already.');
                            }
                            else{
                                navigation.navigate('update_ride', { isUpdate : true, ride: this.state.item})
                            }

                        }else if(label=='Remove'){
                            if( this.state.item.completed_at ){
                                alert('Completed Ride', 'This Ride was completed already.');
                            }else if(this.state.item.began_at){
                                alert('Began Ride', 'This Ride was began already.');
                            }else{
                                this.cancelRide(this.props.itemId)
                            }

                        }
                        this.setState({ isShowMoreMenu: false })
                    }}/>
                
                
            </View>
            </>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        paddingTop: 75,
        marginTop: isIOS() ? StatusBarHeight : 0,
        height: windowHeight,
        width: windowWidth,
    },
    mainContainer: {
        height: Constants.WINDOW_HEIGHT - 80,
        width: Constants.WINDOW_WIDTH,
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
        alignItems: 'center',
    },
    itemBody:{
        marginTop: 10,
        height: 180,
        width: windowWidth*0.9,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        borderWidth: 0.7,
        borderColor: '#ddd',
    },
    itemBody1:{
        marginTop: 10,
        height: 180,
        width: windowWidth*0.9,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6733bb',
        borderRadius: 20,
        borderWidth: 0.7,
        borderColor: '#ddd',
    },
    itemLeft:{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft:20,
        paddingRight:10
    },
    itemRight:{
        position:'absolute',
        top : 10,
        right:10,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    }


})