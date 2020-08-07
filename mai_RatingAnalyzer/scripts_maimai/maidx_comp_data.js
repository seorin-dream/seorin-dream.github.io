javascript:
(function()
{
const mainet_dom = 'https://maimaidx-eng.com/maimai-mobile/';
let dxlist=[], titlelist=[], r_dxlist=[], r_titlelist=[];
let newest_ver = 14;

var comp_plate_list=[
	"舞舞舞", "舞神", "舞将", "舞極", "覇者",
	"真舞舞", "真神", "真極",
	"超舞舞", "超神", "超将", "超極", "檄舞舞", "檄神", "檄将", "檄極",
	"橙舞舞", "橙神", "橙将", "橙極", "暁舞舞", "暁神", "暁将", "暁極",
	"桃舞舞", "桃神", "桃将", "桃極", "櫻舞舞", "櫻神", "櫻将", "櫻極",
	"紫舞舞", "紫神", "紫将", "紫極", "菫舞舞", "菫神", "菫将", "菫極",
	"白舞舞", "白神", "白将", "白極", "雪舞舞", "雪神", "雪将", "雪極",
	"輝舞舞", "輝神", "輝将", "輝極", "熊舞舞", "熊神", "熊将", "熊極",
];
	
const verstr_list = ['ジングル','真','超','檄','橙','暁','桃','櫻','紫','菫','白','雪','輝','熊','DX+']


let music_ver_count=[1, 89, 59, 53, 32, 41, 39, 39, 48, 45, 55, 55, 63, 97]; //最新は計算で
let remas_music_count=[in_lv.filter((x)=>x.dx==0 && x.lv[4]!=0).length];	// Remas譜面数

const get_page_failure = ( url )=>
{
	alert('通信に失敗した模様。\n再度試してみてください。');
	window.location.href=mainet_dom + url ;
}

// addrのページをgetしてくる
const get_page_callback = (addr, post)=>
{
	return new Promise((resolve, reject)=>
	{
		const time = performance.now();
		const xhr = new XMLHttpRequest();
		xhr.open((post=='')?'get':'post', addr);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.responseType = 'document';
 		xhr.overrideMimeType('text/html');
		xhr.send(post);
		xhr.onload = function()
		{
			console.log(addr, post, performance.now()-time);
			resolve(this.response);
		}
		xhr.onerror = function()
		{
			get_page_failure('home');
		}
	});
}

const get_player_id_callback = (addr_str) =>
{
	return get_page_callback(addr_str, "")
	.then((page)=>{
		return new Promise((resolve)=>
		{
			resolve(page.querySelector('.name_block').innerText.trim());	//名前
		});
	})

}
const get_your_id_callback = () =>
{
	let addr = mainet_dom + 'playerData/';
	return get_player_id_callback(addr)
	.catch(()=>{ get_page_failure('home/'); })
}

const get_frd_id_callback = (frd_id) =>
{
	const addr = mainet_dom + 'friend/friendDetail/?idx=' + frd_id;
	console.log(addr);
	return get_player_id_callback(addr)
	.catch(()=>{ get_page_failure('friend/'); })
}

const get_music_lamp_data = (md) =>
{
	let lamp=0; // (0x1000000:FDX, 0x10000:AP, 0x100:FC) | rank
	let rank=0; // lower A:0, A:1, AA:2, AAA:3, S:4, S+:5, SS:6, SS+:7, SSS:8, SSS+:9
	const tmp =Array.prototype.map.call(md, (x)=>x.getAttribute('src').slice(49,-4));
	for(let i=0; i<tmp.length; i++)
	{
		switch(tmp[i])
		{
			case "fsdp":	// full sync dx+ 
				lamp |= 0x11000100 ; break;
			case "fsd":	// full sync dx
				lamp |= 0x01000100 ; break;
			case "app":
				lamp |= 0x00111100; break;
			case "ap":
				lamp |= 0x00010100; break;
			case "fcp":
				lamp |= 0x00001100; break;
			case "fc":
				lamp |= 0x00000100; break;
			case "sssp": rank=17; break; // SSS+ (100.5%)
			case "sss": rank=15; break; // SSS  (100.0%)
			case "ssp": rank=14; break;
			case "ss": rank=12; break;
			case "sp": rank=10; break;
			case "s": rank=8; break;
			case "aaa": rank=6; break;
			case "aa": rank=4; break;
			case "a": rank=2; break;
			default:
				break;
		}
	}
	return lamp | rank;
}

const get_musiclist_callback = (diffnum) =>
{
	const addr = mainet_dom + 'ranking/search/?genre=99&scoreType=2&rankingType=99&diff=' + diffnum
	return get_page_callback(addr, "")
	.then((page)=>{
		return new Promise((resolve)=>
		{
			let dxlist=[], tlist=[];
			page.querySelectorAll('.music_kind_icon')
				.forEach((x)=>dxlist.push((x.getAttribute('src').slice(44,-4)=='dx')?1:0));
			page.querySelectorAll('.music_name_block').forEach((x)=>tlist.push(x.innerText));

			resolve([dxlist, tlist]);
		})
	})
	.catch(()=>{
		alert('データの取得に失敗した模様。再度ためしてみてください。');
	})	
}

const get_comp_data_callback = (diffnum, dxlist, tlist) =>
{
	const addr = mainet_dom + 'record/musicGenre/search/?genre=99&diff=' + diffnum
	return get_page_callback(addr, "")
	.then((page)=>{
		return new Promise((resolve)=>
		{
			let dlist=[];
			if(dxlist.length==0)
				page.querySelectorAll('div.w_450 > img:not(.f_l):not(.f_r):not(.pointer)')
					.forEach((x)=>dxlist.push((x.getAttribute('src').slice(44,-4)=='dx')?1:0));
			if(tlist.length==0)
				page.querySelectorAll('div.music_name_block').forEach((x)=>tlist.push(x.innerText));

			page.querySelectorAll('div.w_450')
				.forEach((x)=>{dlist.push(get_music_lamp_data(x.querySelectorAll('img.h_30')))});
			resolve(dlist);
		})
	})
	.catch(()=>{
		alert('データの取得に失敗した模様。再度ためしてみてください。');
	})	
}

const get_maimai_complete_data_callback = () =>
{
	const addr = mainet_dom + 'home/congratulations/';
	const idx = [[27, 41, 55, 69, 83, 97], [19, 33, 47, 61, 75, 89], [24, 38, 52, 66, 80, 94],
		     [15, 29, 43, 57, 71, 85], [14, 28, 42, 56, 70, 84]]

	const subfunc = (str) => { let count = str.split('/'); return count[1]-count[0]; }

	return get_page_callback(addr, "")
	.then((page)=>{
		return new Promise((resolve)=>
		{
			resolve(idx.map((x)=>(x.map((n)=>subfunc(page.querySelectorAll('.musiccount_counter_block')[n].innerText)))));
		});
	});	
}


const frd_get_playerdata_callback = (diffnum, frnd_id, dxlist, tlist) =>
{
	const addr = mainet_dom + 'friend/friendGenreVs/battleStart/?scoreType=2&genre=99&diff=' + diffnum + '&idx=' + frnd_id;
	return get_page_callback(addr, '')
	.then((page)=>{
		return new Promise((resolve)=>
		{
			let dlist=[];
			if(dxlist.length==0)
				page.querySelectorAll('.music_kind_icon')
					.forEach((x)=>dxlist.push((x.getAttribute('src').slice(44,-4)=='dx')?1:0));
			if(tlist.length==0)
				page.querySelectorAll('.music_name_block').forEach((x)=>tlist.push(x.innerText));

			page.querySelectorAll('div.w_450')
				.forEach((x)=>{dlist.push(get_music_lamp_data(x.querySelectorAll('img.h_30.f_r')))});
			resolve(dlist);
		})
	})
	.catch(()=>{
		alert('データの取得に失敗した模様。再度ためしてみてください。');
	})
}

const check_got_data = (ba, ad, ex, ma, re, dxl, tl, r_dxl, r_tl) =>
{
	let ml_length = in_lv.length;	// 曲総数（stdとdxは別カウント）
	let re_ml_length = in_lv.filter((md)=>md.lv[4]!=0).length;	// 白譜面総数
	
	return 	(dxl.length < ml_length)?false
		:(tl.length < ml_length)?false
		:(r_dxl.length < re_ml_length)?false
		:(r_tl.length < re_ml_length)?false
		:(ba.length < ml_length)?false
		:(ad.length < ml_length)?false
		:(ex.length < ml_length)?false
		:(ma.length < ml_length)?false
		:(re.length < re_ml_length)?false
		:true;
}

const get_compplate_data_callback = (dlist) =>
{
	const addr = mainet_dom + 'collection/nameplate/';
	return get_page_callback(addr, "")
	.then((page)=>{
		return new Promise((resolve)=>
		{			
			let clct_list=[];
			let platelist = Array.prototype.slice.call(
				page.querySelectorAll('div.see_through_block.p_r.m_t_10.p_10.f_0'));
			platelist.shift();
			
			let platenamelist = platelist.map((x)=>x.querySelector('div.p_5.f_14.break').innerText.trim());
			var lnum = dlist.map((x)=>platenamelist.indexOf(x));
			lnum.push(-1);
			lnum=Array.from(new Set(lnum)).sort((a,b)=> a-b);
			lnum.shift();	// lnumの先頭(-1になるはず)を削除
			lnum.forEach((n)=>clct_list.push(
				{name:platenamelist[n],addr:platelist[n].querySelector('img.w_396.m_r_10').getAttribute('src')}))
			resolve(clct_list);
		})
	})
	.catch(()=>{
		alert('データの取得に失敗した模様。再度ためしてみてください。');
	})
}


function lampnum2lampcount(lampnum)
{
	return ('00000000' + lampnum.toString(16)).slice(-8)	//必ず8文字化
		.match(/.{2}/g)	//2文字ずつ切り出し
		.map((x)=>parseInt(x,16))	//16->10進数化
}

const data2analysis_callback = (dlist, tlist, r_dlist, r_tlist, ba_data, ad_data, ex_data, ma_data, re_data) =>
{
	const sub = (lampdata) =>	// FDX|AP|FC|rank => FDX|AP|SSS|FC に変更
		{return (lampdata & 0x01010000) | ((lampdata & 0x1) << 8) | ((lampdata & 0x0100) >> 8); }
	
	return new Promise((resolve) =>
	{
		music_ver_count.push(dlist.length - in_lv.filter((x)=>x.v<newest_ver).length);	//現行バージョンの曲数
		remas_music_count.push(r_dlist.filter((x)=>x==1).length);	//でらっくす譜面のReMas総数	

		let ba_list=music_ver_count.map((x)=>x*0x01010101);
		let ad_list=music_ver_count.map((x)=>x*0x01010101);
		let ex_list=music_ver_count.map((x)=>x*0x01010101);
		let ma_list=music_ver_count.map((x)=>x*0x01010101);
		let re_list=remas_music_count.map((x)=>x*0x01010101);
		
		let compdata=new Array(15).fill(0).map((_)=>[]);
		let re_compdata=new Array(2).fill(0).map((_)=>[]);
		const stdmusiccount = music_ver_count.slice(0,13).reduce((a,b)=>a+b);		
		let stdclearcount = new Array(4).fill(stdmusiccount)
		stdclearcount.push(remas_music_count[0]);
		let stdcompdata=[];
		
		const dxmusiccount = music_ver_count.slice(13).reduce((a,b)=>a+b);		
		let dxclearcount = new Array(4).fill(dxmusiccount)
		dxclearcount.push(remas_music_count[1]);
		let dxcompdata=[];

		
		while(tlist[0] != undefined)
		{
			let ver, tmpmd = in_lv[0], tmpname = tlist[0];
			if(tmpmd.n == tmpname && tmpmd.dx == dlist[0])
			{
				tmpname = (tmpmd.nn!=undefined)?tmpmd.nn:tmpmd.n
				ver = tmpmd.v;
				in_lv.shift();
			}
			else
			{
				ver = newest_ver;
			}
		
			tlist.shift(); dlist.shift();
			
			ba_list[ver] -= sub(ba_data[0]);
			stdclearcount[0] -= ((ba_data[0]&0xFF)>0 && ver < 13)?1:0;
			dxclearcount[0] -= ((ba_data[0]&0xFF)>0 && ver >= 13)?1:0;
			ad_list[ver] -= sub(ad_data[0]);
			stdclearcount[1] -= ((ad_data[0]&0xFF)>0 && ver < 13)?1:0;
			dxclearcount[1] -= ((ad_data[0]&0xFF)>0 && ver >= 13)?1:0;
			ex_list[ver] -= sub(ex_data[0]);
			stdclearcount[2] -= ((ex_data[0]&0xFF)>0 && ver < 13)?1:0;
			dxclearcount[2] -= ((ex_data[0]&0xFF)>0 && ver >= 13)?1:0;
			ma_list[ver] -= sub(ma_data[0]);
			stdclearcount[3] -= ((ma_data[0]&0xFF)>0 && ver < 13)?1:0;
			dxclearcount[3] -= ((ma_data[0]&0xFF)>0 && ver >= 13)?1:0;
			compdata[ver].push([
				tmpname, ba_data.shift(), ad_data.shift(), ex_data.shift(), ma_data.shift()
			]);
			
			if(tmpmd.dx == r_dlist[0] && tmpmd.n == r_tlist[0])
			{
				re_list[tmpmd.dx] -= sub(re_data[0]);
				stdclearcount[4] -= ((re_data[0]&0xFF)>0 && ver < 13)?1:0;
				dxclearcount[4] -= ((re_data[0]&0xFF)>0 && ver >= 13)?1:0;
				re_compdata[tmpmd.dx].push([tmpname, re_data.shift()]);
				r_dlist.shift(); r_tlist.shift();
			}

		}
		
		let ba_stddata = ba_list.slice(0,13).map(lampnum2lampcount).reduce((a,b)=>[a[0]+b[0], a[1]+b[1],a[2]+b[2], a[3]+b[3]]);
		let ad_stddata = ad_list.slice(0,13).map(lampnum2lampcount).reduce((a,b)=>[a[0]+b[0], a[1]+b[1],a[2]+b[2], a[3]+b[3]]);
		let ex_stddata = ex_list.slice(0,13).map(lampnum2lampcount).reduce((a,b)=>[a[0]+b[0], a[1]+b[1],a[2]+b[2], a[3]+b[3]]);
		let ma_stddata = ma_list.slice(0,13).map(lampnum2lampcount).reduce((a,b)=>[a[0]+b[0], a[1]+b[1],a[2]+b[2], a[3]+b[3]]);
		let re_stddata = lampnum2lampcount(re_list[0]);
		for(let n=0; n<4; n++)
		{
			stdcompdata.push([ba_stddata.shift(), ad_stddata.shift(), ex_stddata.shift(), ma_stddata.shift(), re_stddata.shift()]);
		}
		stdcompdata.push(stdclearcount);
		
		let ba_dxdata = ba_list.slice(13).map(lampnum2lampcount).reduce((a,b)=>[a[0]+b[0], a[1]+b[1],a[2]+b[2], a[3]+b[3]]);
		let ad_dxdata = ad_list.slice(13).map(lampnum2lampcount).reduce((a,b)=>[a[0]+b[0], a[1]+b[1],a[2]+b[2], a[3]+b[3]]);
		let ex_dxdata = ex_list.slice(13).map(lampnum2lampcount).reduce((a,b)=>[a[0]+b[0], a[1]+b[1],a[2]+b[2], a[3]+b[3]]);
		let ma_dxdata = ma_list.slice(13).map(lampnum2lampcount).reduce((a,b)=>[a[0]+b[0], a[1]+b[1],a[2]+b[2], a[3]+b[3]]);
		let re_dxdata = lampnum2lampcount(re_list[1]);
		for(let n=0; n<4; n++)
		{
			dxcompdata.push([ba_dxdata.shift(), ad_dxdata.shift(), ex_dxdata.shift(), ma_dxdata.shift(), re_dxdata.shift()]);
		}
		dxcompdata.push(dxclearcount);
		
		resolve([ba_list, ad_list, ex_list, ma_list, re_list, compdata, re_compdata, stdcompdata, dxcompdata]);
	});
}
	
const get_justnow = () =>
{
	var today = new Date();
	var data_str = today.getFullYear() + "/" + (today.getMonth()+1) + "/" + today.getDate() + " ";
	data_str += (("0"+today.getHours()).slice(-2)) + ":" + (("0"+today.getMinutes()).slice(-2)) + ":" + (("0"+today.getSeconds()).slice(-2));
	return data_str;
}
	
const print_result_sub_print_header = (title) =>
{
	var rslt_str ="";
	rslt_str += "<head>\n";
	rslt_str += "<title>" + title + " | 新・CYCLES FUNの寝言</title>\n";
    	rslt_str += "<link rel='stylesheet' media='all' type='text/css' href='https://sgimera.github.io/mai_RatingAnalyzer/css/maidx_rating.css'>\n";
 	rslt_str += "<link rel='stylesheet' media='all' type='text/css' href='https://sgimera.github.io/mai_RatingAnalyzer/css/display.css'>\n";
 	rslt_str += "<link rel='stylesheet' media='all' type='text/css' href='https://sgimera.github.io/mai_RatingAnalyzer/css/result.css'>\n";
 	rslt_str += '<style type="text/css"> body{background-color:#51bcf3;} th{font-size:x-small;} td{font-size:x-small;} table {border-collapse: collapse;} .minwidth400{min-width:400px;}</style>\n';
	rslt_str += '<script src="https://sgimera.github.io/mai_RatingAnalyzer/scripts_maimai/maidx_comp_sub.js"></script>\n';
 	rslt_str += "</head>\n";
	
	return rslt_str;
}
	
const print_result_sub_print_title = (str) =>
{
	let rslt_str="";
	rslt_str += "<h2 align=center>新・CYCLES FUNの寝言<br>Comp Plate制覇状況解析</h2>\n";
	
	rslt_str += "<p align=center>Programmed by <a href='https://twitter.com/sgimera'>@sgimera</a></p><hr>\n";

	return rslt_str;
}

const print_lamp2str_comp = (lamp, classname)=>	
{
	const rankname = ['　', '　', 'A', '　', 'AA', '　', 'AAA', '　', 'S', '　', 'S+', '　', 'SS', '　', 'SS+', 'SSS', '　', 'SSS+'];
	const ranknum = lamp & 0x1F
	
	let str = '';
	str += '<td class=' + classname + '>';
	str += ((lamp & 0x11000000) == 0x11000000)?'<b>舞</b>':((lamp & 0x01000000) != 0)?'舞':'　';
	str += '</td>';
	
	if((lamp & 0x00110000) == 0x00110000)
		str += '<td colspan=2 class=' + classname + '><b>神</b></td>';
	else if((lamp & 0x00010000) != 0)
		str += '<td colspan=2 class=' + classname + '>神</td>';
	else
	{
		str += '<td class=' + classname + '>';
		str += ((lamp & 0x00000011) == 0x00000011)?'<b>将</b>':((lamp & 0x00000001) != 0)?'将':'　';
		str += '</td>';
		str += '<td class=' + classname + '>';
		str += ((lamp & 0x00001100) == 0x00001100)?'<b>極</b>':((lamp & 0x00001100) != 0)?'極':'　';
		str += '</td>';
	}
	
	str += '<td class=' + classname + '>' + rankname[ranknum] + '</td>';
	return str;
}

const print_maimai_complete_plate = (clist, maidata, class_ver, plt_data, easy_off) =>
{
//	const plt_data=['舞舞舞', '舞神', '舞将', '舞極', '覇者'];
	let diffname=['easy', 'basic', 'advanced', 'expert', 'master', 'remaster'];
	if(easy_off==true) diffname.shift(); //easyを消しておく
	const platename_list = clist.map((x)=>x.name);

	let str ='';

	for(let i=0; i<5; ++i)
	{
		str += '<tr class=' + class_ver + ' align=center >'
		
		let idx = platename_list.indexOf(plt_data[i]);
		let countlist = maidata.shift();
		if(countlist.reduce((a,b)=>a+b, 0) == 0)
		{
			let dispdata =
			    (idx >= 0)?('<img src="' + clist[idx].addr + '">'):('<b>' + plt_data[i] + '</b>');
			if(easy_off==true)
				str += "<td colspan=6>" + dispdata + "</td>"
			else
				str += "<td colspan=7>" + dispdata + "</td>"
		}
		else
		{
			str += '<th>' + plt_data[i] + '</th>';
			for(let n=0; n<diffname.length; n++)
				str += '<td class=mai_' + diffname[n] + '>' + countlist[n] +"</td>";
		}
		str += '</tr>\n';
	}
	str += '<tr class=' + class_ver + ' align=center ><th colspan=' + (easy_off?'6':'7') + '></th></tr>'
	
	return str;
}

const put_buttons = () =>
{
	let retstr = ''
 	let verstrlist_length = verstr_list.length;
	const std_music_count = music_ver_count.slice(0,13).reduce((a,b)=>a+b, 0);
	const dx_music_count = music_ver_count.slice(13).reduce((a,b)=>a+b, 0);
	const vername = ['blue', 'blue', 'green', 'green', 'orange', 'orange', 'pink', 'pink',
			 'murasaki', 'murasaki', 'milk', 'milk', 'finale', 'dx', 'dx'];
	
	const sub = (verstr, vernum, class_ver) =>
		{return '<button class=' + class_ver + ' type=button onclick=comptable_show("' + vernum + '")>' + verstr + '</button>'}

	retstr += '<center>\n'
	retstr += '<h3>バージョン毎の制覇状況</h3><p>確認したいバージョンのボタンを押してください。</p>\n'

	retstr += '<form>';
	let tmpstr = std_music_count + '+' + remas_music_count[0] + ', ' + dx_music_count + '+' + remas_music_count[1];
	retstr += sub('maimai 制覇<br>633+76=>' + tmpstr, '.maicomp_cur', 'mai_rainbow');
	retstr += sub('Comp Plate<br>制覇状況まとめ', '.compcount', 'mai_ver_dx');
	retstr += '<br>\n';
	for(let n=1; n<13; n++)	//スタンダード譜面 真から輝まで
	{
		retstr += sub(verstr_list[n] + '<br>' + music_ver_count[n], '.version' + ('0'+ n).slice(-2), 'mai_ver_' + vername[n]);
	}
	retstr += sub('STD Re<br>' + remas_music_count[0], '.re_version00', 'mai_remaster'); //スタンダード Re:Mas
	retstr += '<br>\n'	
	for(let n=13; n<verstrlist_length; n++)	//でらっくす譜面
	{
		retstr += sub(verstr_list[n]  + '<br>' + music_ver_count[n], '.version' + ('0'+ n).slice(-2), 'mai_ver_' + vername[n]);
	}
	retstr += sub('DX Re<br>' + remas_music_count[1], '.re_version01', 'mai_remaster'); //でらっくす Re:Mas
	retstr += '</form>\n';
	retstr += '</center>\n';
	return retstr;
}

const print_musicdata_comp = (ver, class_ver, vernum, mdata, ba, ad, ex, ma, clist) =>
{
	let rslt_str = '';
	let tmp_mdata=[];
	const ba_disp=lampnum2lampcount(ba);
	const ad_disp=lampnum2lampcount(ad);
	const ex_disp=lampnum2lampcount(ex);
	const ma_disp=lampnum2lampcount(ma);

	const plt_data=['舞舞', '神', '将', '極'];
	const cp_list=clist.map(function(x){return x.name;});
	let idx;

	rslt_str += '<tbody class="compcount version' + ('0'+vernum ).slice(-2) + '  ' + class_ver +'" border=1 align=center style="display:none;">\n';
	
	if(ver != 'ジングル')	//ジングルは集計しない
	{
		for(let i=0; i<4; ++i)
		{
			rslt_str += '<tr>';
			idx = cp_list.indexOf(ver + plt_data[i]);
			if( ba_disp[i]+ad_disp[i]+ex_disp[i]+ma_disp[i] == 0 )
			{
				rslt_str += "<th colspan=17>";
				if(idx >=0)
					rslt_str += "<img src='"+ clist[idx].addr + "'>"
				else
					rslt_str += (ver=="真" && i==2)?'(真将)':(ver + plt_data[i]);
				rslt_str += "</th>"
			}
			else
			{
				rslt_str += '<th>' + ((ver=="真" && i==2)?'(真将)':(ver + plt_data[i])) + '</th>';
				rslt_str += "<td colspan=4 class=mai_basic>" + ba_disp[i] +"</td>";
				rslt_str += "<td colspan=4 class=mai_advanced>" + ad_disp[i] +"</td>";
				rslt_str += "<td colspan=4 class=mai_expert>" + ex_disp[i] +"</td>";
				rslt_str += "<td colspan=4 class=mai_master>" + ma_disp[i] +"</td>";
			}
			rslt_str += '</tr>\n';
		}	
	}
	rslt_str += '<tr><th colspan=17></th></tr>';	//空白行
	rslt_str += '</tbody>\n';
	rslt_str += '<tbody class="complist version' + ('0'+vernum ).slice(-2) + '  ' + class_ver +'" border=1 align=center style="display:none;">\n';

	while(mdata[0]!=undefined)
	{
		tmp_mdata=mdata.shift();
		rslt_str += '<tr class=' + class_ver + '><td>' + tmp_mdata[0] + '</td>';
		rslt_str += print_lamp2str_comp(tmp_mdata[1], 'mai_basic');
		rslt_str += print_lamp2str_comp(tmp_mdata[2], 'mai_advanced');
		rslt_str += print_lamp2str_comp(tmp_mdata[3], 'mai_expert');
		rslt_str += print_lamp2str_comp(tmp_mdata[4], 'mai_master');
		rslt_str += '</tr>\n';
	}

	rslt_str += '</tbody>\n';
	
	return rslt_str;
}

const print_musicdata_comp_remas = (class_ver, vernum, mdata, re) =>
{
	let rslt_str = '';
	let tmp_mdata=[];
	const re_disp=lampnum2lampcount(re);

	const plt_data=['舞舞', '神', '将', '極'];

	rslt_str += '<table class="complist re_version' + ('0'+vernum ).slice(-2) + '" border=1 align=center style="display:none;">\n';
	rslt_str += '<tbody class=' + class_ver + '>\n';
	for(let i=0; i<4; ++i)
	{
		rslt_str += '<tr><th>' + plt_data[i] + '</th><td colspan=4 class=mai_remaster>' + re_disp[i] + '</td></tr>\n';
	}
	while(mdata[0]!=undefined)
	{
		tmp_mdata=mdata.shift();
		rslt_str += '<tr><td>' + tmp_mdata[0] + '</td>' + print_lamp2str_comp(tmp_mdata[1], 'mai_remaster') + '</tr>\n';
	}

	rslt_str += '</tbody>\n';
	rslt_str += '</table>\n';
	
	return rslt_str;
}

const print_result = (ba, ad, ex, ma, re, name, plate, musicdata, re_musicdata, maicompdata, stdcompdata, dxcompdata, starttime, friendmode) =>
{
	const plt_data=['舞', '神', '将', '極'];
	let rslt_str="";

	rslt_str += "<html>";
	rslt_str += print_result_sub_print_header(name +"のComp Plate制覇状況解析");
	
	rslt_str += "<body>";
	
	const data_str = get_justnow();
	
	rslt_str += "<p align=right><a href='" + mainet_dom;
	rslt_str += (friendmode)?("friend/'>maidx.net フレンド一覧に戻る"):("home/'>maidx.net HOMEに戻る");
	rslt_str += "</a></p>";
	rslt_str += print_result_sub_print_title("");
	
	rslt_str += "<h2 align=center>" + name + "</h2>";
	rslt_str += '<p align=center>舞:FDX(+)、神:AP(+)、将:SSS(+)、極:FC(+)</p>';

	rslt_str += put_buttons();
	if(maicompdata.length != 0)
	{
		rslt_str += '<table class="minwidth400 maicomp_f complist' +'" border=1 align=center style="">';
		rslt_str += print_maimai_complete_plate(plate, maicompdata, 'mai_ver_finale', ['舞舞舞', '舞神', '舞将', '舞極', '覇者'], false);
		rslt_str += '</table>';
	}

	rslt_str += '<table class="minwidth400 maicomp_cur complist compcount' +'" border=1 align=center style="">';
	rslt_str += print_maimai_complete_plate(plate, stdcompdata, 'mai_ver_dx', ['舞舞舞', '舞神', '舞将', '舞極', '覇者'], true);
	rslt_str += print_maimai_complete_plate(plate, dxcompdata, 'mai_ver_dx', ['DX舞舞', 'DX舞神', 'DX舞将', 'DX舞極', 'DX覇者'], true);
	rslt_str += '</table>';
	
	rslt_str += '<table border=1 align=center class=minwidth400>';
	rslt_str += print_musicdata_comp('ジングル', 'mai_ver_blue', 0, musicdata[0], ba[0], ad[0], ex[0], ma[0], plate);
	rslt_str += print_musicdata_comp('真', 'mai_ver_blue', 1, musicdata[1], ba[1], ad[1], ex[1], ma[1], plate);
	rslt_str += print_musicdata_comp('超', 'mai_ver_green', 2, musicdata[2], ba[2], ad[2], ex[2], ma[2], plate);
	rslt_str += print_musicdata_comp('檄', 'mai_ver_green', 3, musicdata[3], ba[3], ad[3], ex[3], ma[3], plate);
	rslt_str += print_musicdata_comp('橙', 'mai_ver_orange', 4, musicdata[4], ba[4], ad[4], ex[4], ma[4], plate);
	rslt_str += print_musicdata_comp('暁', 'mai_ver_orange', 5, musicdata[5], ba[5], ad[5], ex[5], ma[5], plate);
	rslt_str += print_musicdata_comp('桃', 'mai_ver_pink', 6, musicdata[6], ba[6], ad[6], ex[6], ma[6], plate);
	rslt_str += print_musicdata_comp('櫻', 'mai_ver_pink', 7, musicdata[7], ba[7], ad[7], ex[7], ma[7], plate);
	rslt_str += print_musicdata_comp('紫', 'mai_ver_murasaki', 8, musicdata[8], ba[8], ad[8], ex[8], ma[8], plate);
	rslt_str += print_musicdata_comp('菫', 'mai_ver_murasaki', 9, musicdata[9], ba[9], ad[9], ex[9], ma[9], plate);
	rslt_str += print_musicdata_comp('白', 'mai_ver_milk', 10, musicdata[10], ba[10], ad[10], ex[10], ma[10], plate);
	rslt_str += print_musicdata_comp('雪', 'mai_ver_milk', 11, musicdata[11], ba[11], ad[11], ex[11], ma[11], plate);
	rslt_str += print_musicdata_comp('輝', 'mai_ver_finale', 12, musicdata[12], ba[12], ad[12], ex[12], ma[12], plate);
	rslt_str += print_musicdata_comp('熊', 'mai_ver_dx', 13, musicdata[13], ba[13], ad[13], ex[13], ma[13], plate);
	rslt_str += print_musicdata_comp('DX+', 'mai_ver_dx', 14, musicdata[14], ba[14], ad[14], ex[14], ma[14], plate);
	rslt_str += '</table>';
	
	rslt_str += print_musicdata_comp_remas('mai_ver_finale', 0, re_musicdata[0], re[0]);
	rslt_str += print_musicdata_comp_remas('mai_ver_dx', 1, re_musicdata[1], re[1]);

 	rslt_str += "</body>";
	rslt_str += "</html>";
	rslt_str += '<p align=right>処理時間 :' + (performance.now() - starttime).toFixed(0) + 'ms</p>'
	
	datalist=null;
	document.open();
	document.write(rslt_str);
	rslt_str=null;
	document.close();

}


/* ココからメイン */

const start = performance.now();

if(location.href.slice(0,46) == mainet_dom+"friend/" && location.href.length > 46) // 일판은 dx.jp로 끝나는데 국제판은 dx-eng.com으로 끝남. 41에서 46으로 조정.
{
	let frdid = new URLSearchParams(document.location.search).get('idx');
	Promise.all([
		frd_get_playerdata_callback(0, frdid, dxlist, titlelist),
		frd_get_playerdata_callback(1, frdid, ["noneed"], ["noneed"]),
		frd_get_playerdata_callback(2, frdid, ["noneed"], ["noneed"]),
		frd_get_playerdata_callback(3, frdid, ["noneed"], ["noneed"]),
		frd_get_playerdata_callback(4, frdid, r_dxlist, r_titlelist),
	])
	.then((x)=>{
		if(!check_got_data(x[0], x[1], x[2], x[3], x[4], dxlist, titlelist, r_dxlist, r_titlelist))
		{
			return get_page_failure('friend/');
		}			
		return Promise.all([
			data2analysis_callback(dxlist, titlelist, r_dxlist, r_titlelist, x[0], x[1], x[2], x[3], x[4]),
			get_frd_id_callback(frdid)
		])
	})
	.then((x)=>{
		print_result(x[0][0], x[0][1], x[0][2], x[0][3], x[0][4], x[1], [], x[0][5], x[0][6], [], x[0][7], x[0][8], start, true);
	})
}
else
{	//個人モード
	Promise.all([
		get_comp_data_callback(0, dxlist, titlelist),
		get_comp_data_callback(1, ["noneed"], ["noneed"]),
		get_comp_data_callback(2, ["noneed"], ["noneed"]),
		get_comp_data_callback(3, ["noneed"], ["noneed"]),
		get_comp_data_callback(4, r_dxlist, r_titlelist),
	])
	.then((x)=>{
		if(!check_got_data(x[0], x[1], x[2], x[3], x[4], dxlist, titlelist, r_dxlist, r_titlelist))
		{
			return get_page_failure('home/');
		}			
		return Promise.all([
			data2analysis_callback(dxlist, titlelist, r_dxlist, r_titlelist, x[0], x[1], x[2], x[3], x[4]),
			get_your_id_callback(),
			get_compplate_data_callback(comp_plate_list),
			get_maimai_complete_data_callback()
		])
	})
	
	.then((x)=>{
		print_result(x[0][0], x[0][1], x[0][2], x[0][3], x[0][4], x[1], x[2], x[0][5], x[0][6], x[3], x[0][7], x[0][8], start, false);

	})
}
})(); void(0);
