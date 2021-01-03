

// const localhostURL = 'http://gamecolozeum.com:8000/'; 

import moment from "moment";

const serverURL = 'https://rydedeal.com/';
const hostURL = serverURL;

const futch = (url, opts={}, onProgress) => {
    console.log(url, opts)
    return new Promise( (res, rej)=>{
        var xhr = new XMLHttpRequest();
        xhr.open(opts.method || 'get', url);
        for (var k in opts.headers||{})
            xhr.setRequestHeader(k, opts.headers[k]);
        xhr.onload = e => res(e.target);
        xhr.onerror = rej;
        if (xhr.upload && onProgress)
            xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
        xhr.send(opts.body);
    });
}


const requestCall = (subUrl, method, body, headers, callBack, isFullUrl=false, isResponseJson = true)=>{

    let reqParams = {
        method:method,
    }
    if(headers !== null){
        reqParams.headers = headers
    }
    if(body !== null){
        reqParams.body = JSON.stringify(body) 
    }
    let fullUrl = isFullUrl ? subUrl : hostURL + subUrl;
    console.log(fullUrl)
    console.log('reqParams:', reqParams)
    if ( isResponseJson == false ){
        fetch(fullUrl).then(function(response) {
            console.log('response:', response)
            return response.text().then((text)=>{
                console.log('text:', text)
              callBack( text, null)
            });
          });
    }else{

        fetch(fullUrl, reqParams)
        .then(function(response) {
            console.log('response:', response)
            
            return response.json()
            
            
        }).then(function(data) {
            console.log(data)
            // if ( isResponseJson == true ){
                callBack(data, null)
            // }
            
        }).catch(function (err) {
            console.log('err', err)
            callBack(null, err)
        }).then(function(){
            console.log('final callback')
        });
    }
    


}

function BearerHeader(token){
    const header = {
        Authorization: 'Bearer ' + token
    }    
    return header
}




const formDataCall = (subUrl, method, body, headers, callBack, isFullLink = false )=>{
    let link = isFullLink ? subUrl : hostURL + subUrl
    futch(link, {
        method: method,
        body: body,
        headers:headers
    }, (progressEvent) => {
        const progress = progressEvent.loaded / progressEvent.total;
        console.log(progress);

    }).then(function (resJson){
        console.log('Here is response from server!>>>>>|||>>|:>');
       
        try{
            let res = JSON.parse(resJson.response)
            console.log('after parsing: ',res)
            callBack(res, null);
         }catch(exception){
             console.log(exception);
             callBack(null, exception);
         }

    }, (err) => {

        console.log('parsing err ',err)
        callBack(null, err);
        }
    );
}

const RestAPI = {

    fullUrl:(url)=>{
        return hostURL + url;
    },

    geoCodingFromLocationIQ(lat, lon){

        let myTokenInLocationIq = '79796c87ec4f44'; // from zyxm gmail account https://my.locationiq.com/

        let url = 'https://us1.locationiq.com/v1/reverse.php?key='+myTokenInLocationIq+'&lat='+lat+'&lon='+lon+'&format=json';

        return new Promise( ( resolve, reject)=>{
            fetch(url)
            .then(function(res) {    
                try{
                    let json = res.json();                    
                    return json;
                }catch (e) {
                    reject( e )
                }
            })
            .then(function(resJson) {
                resolve( resJson )        
            }, error=>{
                reject( error )
            })
        })
        
    },

    geoGoogleReverse(place_id, GoogleApiKey){

        let url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${place_id}&key=${GoogleApiKey}`;

        return new Promise( ( resolve, reject)=>{
            fetch(url)
            .then(function(res) {    
                try{
                    let json = res.json();                    
                    return json;
                }catch (e) {                    
                    reject( e )
                }    
            })
            .then(function(resJson) {
                resolve( resJson )        
            }, error=>{
                reject( error )
            })
        })
    },

    forgotPwd:(email)=>{

        let data = new FormData();
        data.append('email', email);
        return new Promise((resolve, reject)=>{
            formDataCall( 'api/forgotPwd', 'post', data, null, (res, err)=>{
                if ( err ){
                    reject( err )
                }else{
                    resolve( res )
                }
            })
        })
    },

    login(email, password){
      
        let data  = new FormData();
        data.append('email', email)
        data.append('password', password)
        
        if( global.expoPushToken && global.UUID ){
            
            data.append('token', global.expoPushToken )
            data.append('uuid', global.UUID)
        }   
        
        
        console.log(data)
        return new Promise( (resolve, reject)=>{

            formDataCall( 'api/login', 'post', data, null, (res, err)=>{
                if ( err ){
                    reject( err )
                }else{
                    resolve( res )
                }
            })           
        })        

    },
    checkToken(pushToken, UUID){
        
        
        let data = null;
        if( pushToken && UUID ){

            data = new FormData();
            data.append('token', pushToken)
            data.append('uuid', UUID)

        }else{

        }

        return new Promise( (resolve, reject)=>{
            if( !global.curUser || !global.curUser.token ){
                reject('Empty Token');
                return 
            }
            formDataCall( 'api/checkToken', 'post', data, BearerHeader(global.curUser.token), (res, err)=>{
                
                if ( err ){
                    reject( err )
                }else{
                    resolve( res )
                }
            })           
        })        

    },

    register : (username, fName, lName, email, password, phoneNumber, selCityId, user_role_slug = "customer", isSocialSignup = false)=>{
   
        let data  = new FormData();
        data.append('name', username)
        data.append('email', email)
        data.append('password', password)
        data.append('first_name', fName)
        data.append('last_name', lName)
        data.append('phone_number', phoneNumber)
        data.append('user_role_slug', user_role_slug)
        data.append('city', selCityId)
        data.append('isSocialSignup', isSocialSignup == true ? 1 : 0)
        
        
        if( global.expoPushToken && global.UUID ){
            data.append('token', global.expoPushToken )
            data.append('uuid', global.UUID)
        }
        

        console.log(data)
        return new Promise( (resolve, reject)=>{

            formDataCall( 'api/register', 'post', data, null, (res, err)=>{
                if ( err ){
                    reject( err )
                }else{
                    resolve( res )
                }
            })           
        })  
    },

    getFBAvatarLink : (fbUserId)=>{
        return "http://graph.facebook.com/"+fbUserId+"/picture?type=large"
    },

    getFBProfile : (token)=>{
        let link = "https://graph.facebook.com/me?fields=id,name,email&access_token="+token;

        return new Promise( (resolve, reject)=>{
            requestCall( link, 'get', null, null, (res, err)=>{
                if(err){
                    reject( err ) 
                }else{
                    let id = res.id
                    let avatar = RestAPI.getFBAvatarLink( id )    
                    resolve( { ...res, avatar:avatar } )
                }
            }, true)
        })        
    },

    sendVerifyPhone : (phoneNumber)=>{
        
        const header = {
            Authorization: 'Bearer ' + global.curUser.token
        }
        let data  = new FormData();
        data.append('phone_number', phoneNumber)

        return new Promise( (resolve, reject)=>{

            formDataCall( 'api/sendSMS', 'post', data, header, (res, err)=>{
                if ( err ){
                    reject( err )
                }else{
                    resolve( res )
                }
            })           
        })  
    },
    verifySMSCode : (phoneNumber, code)=>{
        
        const header = {
            Authorization: 'Bearer ' + global.curUser.token
        }

        let data  = new FormData();
        data.append('phone_number', phoneNumber)
        data.append('code', code)
        return new Promise( (resolve, reject)=>{
            formDataCall( 'api/verifyPhoneSMSCode', 'post', data, header, (res, err)=>{
                if ( err ){
                    reject( err )
                }else{
                    resolve( res )
                }
            })           
        })  
    },

    getPostBasicData : ()=>{
        const header = {
            Authorization: 'Bearer ' + global.curUser.token
        }

        
        return new Promise( (resolve, reject)=>{
            formDataCall( 'api/getPostBasicData', 'get', null, header, (res, err)=>{
                if ( err ){
                    reject( err )
                }else{
                    resolve( res )
                }
            })           
        })  
    },
    getCities : ()=>{
        return new Promise( (resolve, reject)=>{
            formDataCall( 'api/cities', 'post', null, null, (res, err)=>{
                if ( err ){
                    reject( err )
                }else{
                    resolve( res )
                }
            })           
        })  
    },
    postRide : ({dateTime, time_to, seatCount, description, from, to, rideType, price, currency, isScheduled=0, distance, distance_unit, duration })=>{
        
        const header = {
            Authorization: 'Bearer ' + global.curUser.token
        }
      
        let data  = new FormData();
        data.append('ride_type', rideType)
        data.append('seats', seatCount)      
        data.append('salary_min', price)      
        data.append('currency', currency)      
        data.append('address_from', from.name)      
        data.append('location_from_lat', from.lat)      
        data.append('location_from_lng', from.lng)      
        data.append('address_to', to.name)      
        data.append('location_to_lat', to.lat)      
        data.append('location_to_lng', to.lng)      
        data.append('time_from', dateTime)
        data.append('time_to', time_to)
        data.append('description', description)
        data.append('is_scheduled', isScheduled)
        data.append('distance', distance)
        data.append('distance_unit', distance_unit)
        data.append('duration', duration)

        return new Promise( (resolve, reject)=>{
            formDataCall( 'api/post_ride', 'post', data, header, (res, err)=>{
                if ( err ){
                    reject( err )
                }else{
                    resolve( res )
                }
            })           
        })  
    },
    
    updateRide : (props)=>{
        const {
        id, 
        dateTime, 
        time_to, 
        seats, 
        description, 
        address_from, 
        location_from_lat, 
        location_from_lng, 
        address_to, 
        location_to_lat , 
        location_to_lng, 
        ride_type, 
        salary_min,
        distance, 
        distance_unit,
        duration

        } = props;

        const header = BearerHeader(global.curUser.token)
        let time_from = dateTime

        let data  = new FormData();

        Object.keys(props).forEach((key, index)=>{
            data.append(key, props[key])
        });

        data.append('time_from', time_from);

        return new Promise( (resolve, reject)=>{
            formDataCall( 'api/updateRide', 'post', data, header, (res, err)=>{
                if ( err ){
                    reject( err )
                }else{
                    resolve( res )
                }
            })           
        })  
    },



    getRideList : (page, is_completed, lat = null, lng = null, city = null)=>{
        
        const header = {
            Authorization: 'Bearer ' + global.curUser.token
        }
        
        let data = null;
        if( lat && lng ){
            data = new FormData();
            data.append('lat', lat);
            data.append('lng', lng);
        }
        if( city ){
            if( data == null ) data = new FormData();
            data.append('city', city)
        }

        if( is_completed !== null ){
            if( data == null ) data = new FormData();
            data.append('is_completed', is_completed)
        }
        
        return new Promise( (resolve, reject)=>{
            
            if( page > 1){
                formDataCall( 'api/rideList?page=' + page, 'post', data, header, (res, err)=>{
                    if ( err ){
                        reject( err )
                    }else{                    
                        resolve( res )
                    }
                }) 
            }else{
                formDataCall( 'api/rideList', 'post', data, header, (res, err)=>{
                    if ( err ){
                        reject( err )
                    }else{                    
                        resolve( res )
                    }
                }) 
            }
                      
        })  
    },
    showRide : (itemId)=>{
        const header = {
            Authorization: 'Bearer ' + global.curUser.token
        }

        let data = new FormData();
        data.append('id', itemId)
        return new Promise( (resolve, reject)=>{
        
            formDataCall( 'api/showRide', 'post', data, header, (res, err)=>{
                if ( err ){
                    reject( err )
                }else{                    
                    resolve( res )
                }
            }) 
                       
        })  
    },
    changePwd:(newPwd, email, oldPwd)=>{

        const header = {
            Authorization: 'Bearer ' + global.curUser.token
        }

        let data = new FormData();
        data.append('email', email)
        data.append('newpwd', newPwd)
        data.append('oldpwd', oldPwd)

        return new Promise(( resolve, reject )=>{
            formDataCall( 'api/changepassword', 'post', data, header, (res, err)=>{
                if ( err ){
                    reject( err )
                }else{                    
                    resolve( res )
                }
            }) 
        })
    },

    getBillingMethods : ()=>{
        const header = {
            Authorization: 'Bearer ' + global.curUser.token
        }
        return new Promise(( resolve, reject )=>{
            formDataCall( 'api/getBillingMethods', 'post', null, header, (res, err)=>{
                if ( err ){
                    reject( err )
                }else{                    
                    resolve( res )
                }
            }) 
        })
    },
    addPaymentCard : (params)=>{
        let data = new FormData();
        Object.keys(params).forEach(key=>{
            data.append(key, params[key])
        })
        return new Promise(( resolve, reject )=>{
            formDataCall( 'api/createPaymentMethod', 'post', data, BearerHeader(global.curUser.token), (res, err)=>{
                if ( err ){
                    reject( err )
                }else{                    
                    resolve( res )
                }
            }) 
        })
    },
    removePayment:(pmId)=>{
        let data = new FormData();
        data.append('pm_id', pmId)
        return new Promise(( resolve, reject )=>{
            formDataCall( 'api/removePaymentMethod', 'post', data, BearerHeader(global.curUser.token), (res, err)=>{
                if ( err ){
                    reject( err )
                }else{                    
                    resolve( res )
                }
            }) 
        })
    },
    setDefaultPayment:(pmId)=>{
        let data = new FormData();
        data.append('pm_id', pmId)
        return new Promise(( resolve, reject )=>{
            formDataCall( 'api/setAsDefaultMethod', 'post', data, BearerHeader(global.curUser.token), (res, err)=>{
                if ( err ){
                    reject( err )
                }else{                    
                    resolve( res )
                }
            }) 
        })
    },

    updateProfile: (first_name, last_name, email, phone_number, avatarSource, cityId) => {
        
        const data = new FormData();        
        
        data.append('first_name', first_name);
        data.append('last_name', last_name);
        data.append('phone_number', phone_number);
        data.append('email', email);
        data.append('city', cityId);
        
        if ( avatarSource != null && avatarSource.uri ) {
            data.append('avatar', {
                uri: avatarSource.uri,
                type: 'image/jpeg',
                name: 'avatar'
            });
        }

        return new Promise(( resolve, reject )=>{
            formDataCall( 'api/updateGenProfile', 'post', data, BearerHeader(global.curUser.token), (res, err)=>{
                if ( err ){
                    reject( err )
                }else{                    
                    resolve( res )
                }
            }) 
        })
    },
    getTransactionList: ()=>{

        return new Promise(( resolve, reject )=>{
            formDataCall( 'api/getTransactionList', 'post', null, BearerHeader(global.curUser.token), (res, err)=>{
                if ( err ){
                    reject( err )
                }else{                    
                    resolve( res )
                }
            }) 
        })
    },
    logout:(token)=>{
        return new Promise(( resolve, reject )=>{
            formDataCall( 'api/logout', 'post', null, BearerHeader(token), (res, err)=>{
                if ( err ){
                    reject( err )
                }else{                    
                    resolve( res )
                }
            }) 
        })
    },
    sendEmailVerify : ()=>{
        return new Promise(( resolve, reject )=>{
            formDataCall( 'api/sendEmailVerify', 'post', null, BearerHeader(global.curUser.token), (res, err)=>{
                if ( err ){
                    reject( err )
                }else{                    
                    resolve( res )
                }
            }) 
        })
    },

    correctEmail:(email)=>{
        let data = new FormData();
        data.append('email', email)
        return new Promise(( resolve, reject )=>{
            formDataCall( 'api/correctEmail', 'post', data, BearerHeader(global.curUser.token), (res, err)=>{
                if ( err ){
                    reject( err )
                }else{                    
                    resolve( res )
                }
            }) 
        })
    },

    liveDriverLocation : (userId)=>{
        let data = new FormData();
        data.append('user_id', userId)
        return new Promise(( resolve, reject )=>{
            formDataCall( 'api/liveDriverLocation', 'post', data, BearerHeader(global.curUser.token), (res, err)=>{
                if ( err ){
                    reject( err )
                }else{
                    resolve( res )
                }
            })
        })
    },


    storeAddress:(data)=>{
        if( !data ){
            return new Promise((resolve, reject)=>{
                reject('data is null');
            })
        }

        let body = new FormData();
        
        Object.keys(data).forEach(key=>{
            body.append(key, data[key])
        })
        
        return new Promise((resolve, reject)=>{
            formDataCall('api/storeAddress', 'post', body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })

    },
    storeBid : (data)=>{
        if( !data ){
            return new Promise((resolve, reject)=>{
                reject('data is null');
            })
        }
        
        let body = new FormData();
        
        Object.keys(data).forEach(key=>{
            body.append(key, data[key])
        })
        
        return new Promise((resolve, reject)=>{
            formDataCall('api/storeBid', 'post', body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
        
    },

    acceptFromDriver : (ride_id)=>{
        let body = new FormData();
        body.append('ride_id', ride_id)
        return new Promise((resolve, reject)=>{
            formDataCall('api/acceptFromDriver', 'post', body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })

    },

    acceptFromCustomer:(bid_id)=>{
        let body = new FormData();
        body.append('bid_id', bid_id)
        return new Promise((resolve, reject)=>{
            formDataCall('api/acceptFromCustomer', 'post', body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    getDriverRides:( page=1, is_completed = null)=>{
        

        let data = null;
        if( is_completed !== null ){
            data = new FormData();
            data.append('is_completed', is_completed)
        }
        return new Promise((resolve, reject)=>{
            formDataCall('api/manageRidesForDriver?page=' + page, 'post', data, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })

    },

    paymentVerify : (data)=>{
        
        if( !data ){
            return new Promise((resolve, reject)=>{
                reject('data is null');
            })
        }
        
        let body = new FormData();
        
        Object.keys(data).forEach(key=>{
            body.append(key, data[key])
        })
        
        return new Promise((resolve, reject)=>{
            formDataCall('api/paymentVerify', 'post', body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    checkPaymentVerify : ()=>{
        return new Promise((resolve, reject)=>{
            formDataCall('api/checkPaymentVerify', 'post', null, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },


    updateCarProfile : (data)=>{
        if( !data ){
            return new Promise((resolve, reject)=>{
                reject('data is null');
            })
        }

        let body = new FormData();
        
        Object.keys(data).forEach(key=>{
            body.append(key, data[key])
        })

        return new Promise((resolve, reject)=>{
            formDataCall('api/updateCarProfile', 'post', body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },
    storeReviewToCustomer:(data)=>{
        if( !data ){
            return new Promise((resolve, reject)=>{
                reject('data is null');
            })
        }

        let body = new FormData();
        
        Object.keys(data).forEach(key=>{
            body.append(key, data[key])
        })

        return new Promise((resolve, reject)=>{
            formDataCall('api/storeReviewToCustomer', 'post', body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    storeReviewToDriver:(data)=>{
        if( !data ){
            return new Promise((resolve, reject)=>{
                reject('data is null');
            })
        }

        let body = new FormData();
        
        Object.keys(data).forEach(key=>{
            body.append(key, data[key])
        })

        return new Promise((resolve, reject)=>{
            formDataCall('api/storeReviewToDriver', 'post', body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },
    getNotifications:(page = 1)=>{
        let header = BearerHeader(global.curUser.token)
        
        return new Promise((resolve, reject)=>{
            formDataCall('api/getNotifications?page='+ page, 'post', null, header, (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    markAsRead:(id)=>{
        let body = new FormData();
        body.append('id', id)
        

        return new Promise((resolve, reject)=>{
            formDataCall('api/markAsRead', 'post', body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    social_auth:(email, push_token, uuid)=>{
        let body = new FormData();
        body.append('email', email)
        body.append('push_token', push_token)
        body.append('uuid', uuid)
        
        return new Promise((resolve, reject)=>{
            formDataCall('api/social_auth', 'post', body, null, (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    getFeeData:()=>{
        return new Promise((resolve, reject)=>{
            formDataCall('api/getFeeData', 'post', null, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    cancelRideByCustomer : (ride_id)=>{
    
        let body = new FormData();
        body.append('ride_id', ride_id);

        return new Promise((resolve, reject)=>{
            formDataCall('api/cancelRideByCustomer', 'post' , body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    cancelBidByDriver:(bid_id)=>{
        let body = new FormData();
        body.append('bid_id', bid_id);

        return new Promise((resolve, reject)=>{
            formDataCall('api/cancelBidByDriver', 'post' , body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    cancelBidByCustomer : (bid_id)=>{

        let body = new FormData();
        body.append('bid_id', bid_id);

        return new Promise((resolve, reject)=>{
            formDataCall('api/cancelBidByCustomer', 'post' , body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },


    updateBid : (props)=>{

        let body = new FormData();

        Object.keys(props).forEach(key=>{
            body.append(key, props[key])
        })

        return new Promise((resolve, reject)=>{
            formDataCall('api/updateBid', 'post' , body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    goPickRyder : (ride_id) => {
        let body = new FormData();
        body.append('ride_id', ride_id)

        return new Promise((resolve, reject)=>{
            formDataCall('api/pickRide', 'post' , body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    beginRide:(ride_id)=>{
        let body = new FormData();
        body.append('ride_id', ride_id)

        return new Promise((resolve, reject)=>{
            formDataCall('api/beginRide', 'post' , body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    completeRide:(ride_id)=>{
        let body = new FormData();
        body.append('id', ride_id)

        return new Promise((resolve, reject)=>{
            formDataCall('api/completeRide', 'post' , body, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    getCountAllNotifications : ()=>{

        return new Promise((resolve, reject)=>{
            formDataCall('api/getCountAllNotifications', 'post' , null, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })

    },

    getSubscription : ()=>{
        let data = new FormData();
        let now = moment().format('YYYY-MM-DD HH:mm:ss')
        data.append('local_date', now);

        return new Promise((resolve, reject)=>{
            formDataCall('api/getSubscription', 'post' , data, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    chargeForTrial : ()=>{
        let data = new FormData();
        let now = moment().format('YYYY-MM-DD HH:mm:ss');
        data.append('local_today', now);

        return new Promise((resolve, reject)=>{
            formDataCall('api/chargeForTrial', 'post' , data, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })
    },

    chargeForMonth : ()=>{

        let data = new FormData();
        let now = moment().format('YYYY-MM-DD HH:mm:ss');
        data.append('local_today', now);

        return new Promise((resolve, reject)=>{
            formDataCall('api/chargeForMonth', 'post' , data, BearerHeader(global.curUser.token), (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })

    },

    allRideTypes: ()=>{

        return new Promise((resolve, reject)=>{
            formDataCall('api/allRideTypes', 'post' , null, null, (res, err)=>{
                if( err ){
                    reject(err);
                }else{
                    resolve(res);
                }
            })
        })

    },


}

export default RestAPI;

