const config = require("./config.js")

const api = {
	consultation : {
		findTouristByPhone: `${config.host}/consultation/findTouristByPhone`,
		saveWxAppAuthorize:`${config.host}/consultation/saveWxAppAuthorize`,
		submitOrder: `${config.host}/consultation/submitOrder`
	},
	destination : {		
		findAllCity: `${config.host}/common/json/cityList.json`
	},
	member:{
		loginByMobile:`${config.host}/member/loginByMobile`,
		loginByCode:`${config.host}/member/loginByCode`,
		getSessionKey:`${config.host}/member/getSessionKeyByToken`
	},
	common:{
		getCityByLocation : `${config.host}/cityLocation/getCityByLocation`
	},
	decoration:{
		getBTripHomeDecoration : `${config.host}/decoration/getBTripHomeDecoration`
	}
}
module.exports = api