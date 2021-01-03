import {
    Dimensions,
    Alert,
    Platform, StatusBar
} from 'react-native';


const X_WIDTH = 375;
const X_HEIGHT = 812;
const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

const { height, width } = Dimensions.get('window');

export const isIPhoneX = () => Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS
    ? width === X_WIDTH && height === X_HEIGHT || width === XSMAX_WIDTH && height === XSMAX_HEIGHT
    : false;

export const StatusBarHeight = Platform.select({
    ios: isIPhoneX() ? 40 : 20,
    android: StatusBar.currentHeight,
    default: 0
})

export function isIOS(){
    return Platform.OS == 'ios' ? true : false;
}



const Constants = {
    WINDOW_WIDTH :  Dimensions.get('window').width,
    WINDOW_HEIGHT : Dimensions.get('window').height,
    CELL_WIDTH : ( Dimensions.get('window').width - 50 ) / 3 ,

    default_car : require("../../assets/default_car_avatar.png"),

    ImageUriPrefix : "https://pictostorage.s3.amazonaws.com/",

    GoogleApiKey : "AIzaSyBYWssWxa3wRKMeazm2maDJnGNF0RRf0o8",
    
    Months : ['Jan', 'Feb','Mar','Apr', 'May','Jun','Jul','Org','Sep','Oct','Nov','Dec'],
    Days : ['Sun', 'Mon','Tue','Wed','Thu','Fri','Sat'],

    ucfirst: (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    lcfirst: (string) => {
        return string.charAt(0).toLowerCase() + string.slice(1);
    },

    emptyString: (str) => {
        if (str != null) {
            str.replace(' ', '');
        }
        return str == "" || str == null;
    },

    numberToFix2 : (val)=>{        
        let number = parseFloat(val);
        if(!number){
            return null;
        }
        return number.toFixed(2)    
    },
    
    getDateStr:(date)=>{

        console.log('getDateStr function: ', typeof date, date);
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        let hour = date.getHours();
        let mins = date.getMinutes();
        if(month < 10){
            month = '0'+month
        }
        if(day < 10){
            day = '0'+day
        }
        if(hour < 10){
            hour = '0'+hour
        }
        if(mins < 10){
            mins = '0'+mins
        }
        // console.log('getDateStr function result: ', typeof date, date);
        return year+'-'+month+'-'+day;
    },
    
    getTimeStr:(date)=>{
        let year = date.getFullYear();
        let month = date.getMonth()+1;
        let day = date.getDate();
        let hour = date.getHours();
        let mins = date.getMinutes();

        if(month < 10){
            month = '0'+month
        }
        if(day < 10){
            day = '0'+day
        }
        if(hour < 10){
            hour = '0'+hour
        }
        if(mins < 10){
            mins = '0'+mins
        }

        return hour+':'+mins+':00';
    },

     shortString : (value, len =30)=>{
        try{
            if( value.length > len){
                let res =  value.substr(0,len) + ' ...'
                return res
            }
            return value
    
        }catch( ex ){
            
            return null
        }        
    },

    getUserRoles : (index = null)=>{
        if( !global.curUser ){
            return null
        }
        
        let roles = global.curUser.roles
        if ( roles && roles.length > 0){
            
            return index == null ? roles : roles[index];
        }
        return null;
    },

    isCustomer : ()=>{
        let role = Constants.getUserRoles(0);
        if( role ){
            return role.slug == 'customer'
        }else{
            return null
        }
    
    },
    isDriver:()=>{
        let role = Constants.getUserRoles(0);
        if( role ){
            return role.slug == 'driver'
        }else{
            return null
        }
    },

    getInitRoute:(showAlert)=>{
          /*** 
         *  driver logic at first:
         *   TODO : 
         *    0. Car profile check : it is needed to get approve from admin to register driver profile.
         *    1. Approve check, if not, say it is needed to wait until approved , and only can browse ride list, 
         *          not available for billing, payment, purchase subscription, bid , accept ride.
         *    2. Billing Check : to purchase subscription.
         *    3. Payment check : to get money from ride directly.
         *    4. Subscription check : Expire or not
         * ** */
        let initRoute = "Home";
        if( Constants.isDriver ()) {
            if(!global.curUser.car){
                if(showAlert)
                    alert('No Car Profile', 'Please submit car profile and wait approving from Rydedeal.')
                initRoute = "Setting";
                
            }else{
                if( !global.curUser.approved_at ){
                    if( showAlert )
                        alert('Not Approved', 'Your driver account is not approved yet, please wait until approved, If you want to change some information, please check setting.')
                    initRoute = "Setting"
                }else{
        
                    if( !global.curUser.paymentMethods){
                        initRoute = "BillingMethod"
                        if(showAlert)
                            alert('No BillingMethod', 'Please add billing method and set default method to purchase subscription.')
                    }else if( !global.curUser.defaultPaymentMethod){
                        initRoute = "BillingMethod"
                        if(showAlert)
                            alert('No Default Billing Method', 'Please set or add default billing method to purchase subscription.')
                    }else if (!global.curUser.payment_verified){
                        initRoute = "PaymentVerification"
                        if(showAlert)
                            alert('No Payment Verified', 'Please verify your payment method to get money from ride directly.')
                    }else if( !global.curUser.is_subscription_ended){
                        if( global.curUser.is_subscription_ended === true){
                            initRoute = "Setting"
                            if(showAlert)
                                alert('Expired Subscription', 'Subscription has been expired.')
                        }else if( global.curUser.is_subscription_ended === false){
                            initRoute = "driver_ride_browse"    
                        }else{
                            initRoute = "Setting"
                            if(showAlert)
                                alert('No Subscription', 'Please purchase subscription to accept ride.')
                        }                        
                                                
                    }else{
                        initRoute = "driver_ride_browse"
                    }
                    
                }
                
            }        

            
        }else{
            initRoute = "Home";
        }
        return initRoute;
        
    },

    curUserCity : ()=>{
        return global.curUser && global.curUser && global.curUser.cities && global.curUser.cities.length > 0 ? global.curUser.cities[0] : null
    },
    
    curUserCityUnit : ()=>{
        let city = Constants.curUserCity()
        if( !city ){
            return 'km';
        }else{
            if( city.country_code == 'us'){
                return 'mi'
            }
        }
        return 'km';    
    },
    
    
    DefaultAvatar : require('../../assets/avatar2.jpg'),
    
    distance(lat1, lon1, lat2, lon2, unit = 'K') {
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles (default)                         :::
//:::                  'K' is kilometers                                      :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at https://www.geodatasource.com                         :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: https://www.geodatasource.com                       :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1/180;
            var radlat2 = Math.PI * lat2/180;
            var theta = lon1-lon2;
            var radtheta = Math.PI * theta/180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180/Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit=="K") { dist = dist * 1.609344 }
            if (unit=="N") { dist = dist * 0.8684 }
            let res = 0;
            try{
                res =dist.toFixed(2);
            }catch(e){
                console.log('Exception in Constants.js line 245:' , e)
                res = 0;
            }
            return res;
        }
    },

    convKmToMiles : (km)=>{
        try{
            let miles = km / 1.6;
            return miles.toFixed(2)
        }catch(e){
            console.log('Execption in convKmToMiles:', e);
            return 0;
        }

    },

    getDateTimeStr: (dateTimeObj, showSeconds = false)=>{
        // console.log('getDateTimeStr in function params: ', dateTimeObj)
        let h = dateTimeObj.getHours();
        let m = dateTimeObj.getMinutes();
        let s = dateTimeObj.getSeconds();
        h = h < 10 ? '0'+h : h;
        m = m < 10 ? '0' + m : m;
        s = s < 10 ? '0' + s : s;

        if( showSeconds == true ){
            return Constants.getDateStr(dateTimeObj) + ' ' + h + ':' + m + ':' + s;
        }else{
            return Constants.getDateStr(dateTimeObj) + ' ' + h + ':' + m ;
        }
    },

    

    style:{
        defaultShadow:{
            elevation: 5,                
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.2,
        }
    },
    
    
    orange: "#E98123",
    placeholderColor: '#fff8',
    fbColor: '#4267B2',
    googleColor: '#dd4b39',
    menuInactiveColor: '#4D4D4D',
    backWhite: '#E7F6FB',
    white: '#FFFFFF',
    lightBlue: '#64C7D1',
    green: '#007225', // 119F3B
    
    grayColor: '#a9a9a9',
    redColor: '#ff4444',
    blueColor: '#5B4EFE',
    purpleColor:'#6733BB',
    opacityPurpleColor:'#6733BBBB',
    opacityBlack:'#00000099',
    transparent : '#FFFFFF00',
    LocationTaskName : 'location_back',
    
    yellow:'#F5B024',

    



}

export default Constants;
