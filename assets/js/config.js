var isProd = false; //是否生产环境
const testApi = 'https://wxapiuat.gzl.cn';
const prodApi = 'https://wxapi.gzl.cn';
const host = isProd ? prodApi : testApi;
const imghost = isProd ? prodApi : testApi;
const chnlType = 'WechatApp'; //渠道
const OKresult = 'ok';
const cacheKey = isProd ? "product" : "test"; //所有的缓存的key都要加上这个前缀
const successCode = '200';
const appId="wx75ad958aa105686b";//APPID
const signKey = "gzl_wxAppApiSignKey01";
const app_version= "1.3.10";
const cacheVersion = cacheKey + "_" + app_version;
const tempIdList = {
	statusChange : 'l2rii-zOZB7WP3pclEbd1ktZmKyyy9kId7ALoawiHKM' //出票状态变更提醒模板
}
const config = {
  host: host,
  imghost: imghost,
  signKey: signKey,
  chnlType: chnlType,
  OKresult: OKresult,
  cacheVersion: cacheVersion,
  successCode: successCode,
  app_version:app_version,
  tempIdList:tempIdList,
  appId:appId
}

module.exports = config