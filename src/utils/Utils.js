import Constants from "./Constants";
import moment from "moment";

const Utils = {

    shuffle : ( arr ) => { 
        let endIndex = arr.length - 1
        let res = arr.map(x=>x);
        
        for( let i = 0 ; i <= endIndex; i+=2 ){

            const newIndex = Math.round( Math.random() * endIndex ) 
            let temp = res[ i ]
            res[ i ] = res[ newIndex ]
            res[ newIndex ] = temp
        }
        return res;        
    },
    getBase64Png : (src) => {
        return 'data:image/png;base64,'+src
    } ,
    

    getLocaleTime : ()=>{
        let date = new Date();
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    },
    toLocalDateTime : (timestamp)=>{
        let date = new Date(timestamp)
        // let date = Date.parse();
        let res = date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
        console.log('Type of date parsed', typeof(date) , date.toLocaleTimeString() )
        return res;
    },

    CheckTimeDiff : (dateTime1, dateTime2, unit = 'seconds')=>{
        let dt1 = Constants.getDateStr(dateTime1) + ' ' + Constants.getTimeStr(dateTime1);
        let moment1 = moment(dt1, 'YYYY-MM-DD HH:mm:ss');

        let dt2 = Constants.getDateStr(dateTime2) + ' ' + Constants.getTimeStr(dateTime2);
        let moment2 = moment(dt2, 'YYYY-MM-DD HH:mm:ss');

        let diff =  moment2.diff(moment1, unit);
        console.log(dateTime1, dateTime2, ' **** DIFF', diff)
        return diff;
    },

    timeStrAdded : (timeFullStr, valueAdded, unit='minutes')=>{
        let mObj = moment(timeFullStr, 'YYYY-MM-DD HH:mm:ss').add(valueAdded, unit);
        return mObj.format('YYYY-MM-DD HH:mm:00');
    },

    timeDateFullStr:(time_str)=>{
        try{
            return moment(time_str, 'YYYY-MM-DD HH:mm:ss', true).format('HH:mm,  D MMM YYYY')
        }catch (e) {
            return time_str;
        }
    },

    getPricingPlan : (lat, lng, pricingPlans, rideTypeId = null)=>{ 
        /***  TODO: throwable  throw err object is pure string for error message **/

        /************ / {
        //     "id": 2,
        //     "ride_type_id": "2",
        //     "city_id": "1",
        //     "surcharge": "500",
        //     "per_unit": "110",
        //     "unit": "km",
        //     "currency": "USD",
        //     "created_at": "2020-05-28 17:07:17",
        //     "updated_at": "2020-05-28 17:07:17",
        //     "deleted_at": null,
        //     "city": {
        //         "id": 1,
        //         "name": "San Francisco",
        //         "address": "San Francisco, CA, USA",
        //         "location": {
        //             "type": "Point",
        //             "coordinates": [
        //                 -122.4194154999999994970494299195706844329833984375,
        //                 37.7749294999999989386196830309927463531494140625
        //             ]
        //         },
        //         "radius_km": "100",
        //         "zip_code": null,
        //         "background_image": "https://rocmail1.com/storage/photos/1/featured-city-01.jpg",
        //         "country_code": "us",
        //         "state_name": "CA",
        //         "created_at": "2020-02-22 15:33:26",
        //         "updated_at": "2020-04-07 16:17:15",
        //         "deleted_at": null
        //     },
        //     "ride_type": {
        //         "id": 2,
        //         "title": "Economy",
        //         "slug": "economy",
        //         "description": "Economy Car",
        //         "level": "2",
        //         "seats": "4",
        //         "created_at": "2020-02-22 15:24:33",
        //         "updated_at": "2020-02-22 15:24:33",
        //         "deleted_at": null
        //     }
        ******* }, **/
        if( lat == null || lng == null ){
            throw "location is not picked"            
        }
        if( !pricingPlans || pricingPlans.length <= 0  ){
            throw "pricing plans are empty."            
        }
        if( rideTypeId == null || rideTypeId <= 0  ){
            throw 'ride type is not defined.'
        }

        let validPlans = [];
        console.log('getPricingPlan > pricingPlans : ', pricingPlans);
        pricingPlans.forEach(plan=>{
            let city = plan.city;
            if( city == null ){
                console.log('getPricingPlan > city is null, to next loop')
                return;
            }
            if ( plan.ride_type_id != rideTypeId ){
                console.log('getPricingPlan > ridetype id is not same . to next loop.')
                return;
            }
            let distance = Constants.distance(lat, lng, city.location.coordinates[1], city.location.coordinates[0]);
            console.log('getPricingPlan > distance from city to begin location : ', distance, ' -> service radius_km : ', city.radius_km);
            if( distance <= parseFloat(city.radius_km)){
                
                plan.distance = distance;
                console.log('getPricingPlan > this is valid plan:', plan)
                validPlans.push( plan )
            }
        })

        if( validPlans.length == 0 ){
            throw "our service is unable from picked location .";
        }else{
            validPlans.sort((a,b)=>(a.distance - b.distance))
            return validPlans[0];
        }

    },

    calcPrice : (pricePlan, distance, rideTypeId)=>{
        
        let price = parseInt(pricePlan.surcharge) + distance * parseInt( pricePlan.per_unit )  + parseInt( pricePlan.maintenance );
        
        price = (price / 100).toFixed(2);
        let obj  = {
            value : parseFloat(price),
            string : price,
            currency : pricePlan.currency,
            surcharge : pricePlan.surcharge,
            per_unit : pricePlan.per_unit,
            maintenance : pricePlan.maintenance,
            distance: distance
        }
        console.log('calc price result :', obj)
        return obj
    },

    genRandPwd : ()=>{        
        return Math.random().toString(36).slice(-8);
    }




}

export default Utils;

