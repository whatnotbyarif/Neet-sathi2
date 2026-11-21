(function(){
var C=window.NEET_CONFIG||{},KEYS=['neet_saathi_chats','neet_saathi_mistakes','neet_saathi_tests','neet_saathi_practice','neet_saathi_plan','neet_saathi_plan_set'];
if(!C.url||!C.key||/PASTE/.test(C.url+C.key)||!window.supabase)return;
var html=document.documentElement;html.style.visibility='hidden';
var show=function(){html.style.visibility=''};setTimeout(show,6000);
var sb=supabase.createClient(C.url,C.key),uid=null,orig=Storage.prototype.setItem,timers={};
Storage.prototype.setItem=function(k,v){orig.call(this,k,v);if(uid&&this===localStorage&&KEYS.indexOf(k)>-1)push(k,v)};
function push(k,v){clearTimeout(timers[k]);timers[k]=setTimeout(function(){var val;try{val=JSON.parse(v)}catch(e){return}sb.from('user_data').upsert({user_id:uid,key:k,value:val,updated_at:new Date().toISOString()}).then(function(){},function(){})},600)}
async function hydrate(){
var force=false;
if(localStorage.getItem('ns_uid')!==uid){KEYS.forEach(function(k){if(localStorage.getItem(k)!==null){localStorage.removeItem(k);force=true}});orig.call(localStorage,'ns_uid',uid)}
var r=await sb.from('user_data').select('key,value').eq('user_id',uid);if(r.error){show();return}
var remote={},changed=force;r.data.forEach(function(x){remote[x.key]=x.value});
KEYS.forEach(function(k){var loc=localStorage.getItem(k);if(k in remote){var rs=JSON.stringify(remote[k]);if(loc!==rs){orig.call(localStorage,k,rs);changed=true}}else if(loc){push(k,loc)}});
if(changed&&!sessionStorage.getItem('ns_h')){sessionStorage.setItem('ns_h','1');location.reload();return}
sessionStorage.removeItem('ns_h');show()}
sb.auth.getSession().then(function(r){var s=r.data&&r.data.session;
if(!s){location.replace('login.html?next='+encodeURIComponent(location.pathname.split('/').pop()||'dashboard.html'));return}
uid=s.user.id;
document.addEventListener('DOMContentLoaded',function(){var a=document.querySelector('.login');if(a)a.textContent=(s.user.user_metadata&&s.user.user_metadata.name)||'Account'});
hydrate()}).catch(show);
})();
