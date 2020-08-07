function lv2s_100(lv)
{
	const inner_lv=Math.abs(lv);
	const tmp = Math.round(100*inner_lv);
	const disp_lv=Math.floor(inner_lv);
	switch(disp_lv)
	{
		case 15:
		case 14:
		case 13:
		case 12:
			return tmp*3/2-600;
		case 7:
			return tmp/2 + 400;
		default:
			return tmp;
	}
}

function lv2ss_100(lv)
{
	const inner_lv=Math.abs(lv);
	const tmp = Math.round(100*inner_lv);
	const disp_lv=Math.floor(inner_lv);
	switch(disp_lv)
	{
		case 15:
		case 14:
		case 13:
		case 12:
			return tmp*2-1100;
		case 11:
			return tmp+100;
		case 10:
			return 650+tmp/2;
		case 9:
		case 8:
			return 150+tmp;
		case 7:
		default:
			return 550+tmp/2;
	}
}



function mra_rate_XtoY(basis, max, gap, n)
{
	return basis+(max-basis)*n/gap
}

function achi2oldrate_100(achi, lv)	//achiは百分率ではなく小数。99%なら0.99
{
	let temp = 0;
	const rate_ss = lv2ss_100(lv);
	const rate_s = lv2s_100(lv);
	const lv100 = Math.round(100*Math.abs(lv));
	temp =  (achi >= 1005000)?(mra_rate_XtoY(rate_ss+100, rate_ss+200,   5000, achi-1005000)):
		(achi >= 1000000)?(mra_rate_XtoY(rate_ss,     rate_ss+75,    5000, achi-1000000)):
		(achi >=  970000)?(mra_rate_XtoY(rate_s,      rate_ss-25,   30000, achi- 970000)):
		(lv100 < 900)?0:	// Lv9未満のS落ちは0とする。暫定。
		(achi >=  940000)?(mra_rate_XtoY(lv100-150,   rate_s-100,   30000, achi- 940000)):
		(achi >=  900000)?(mra_rate_XtoY(lv100-200,   lv100-150,    40000, achi- 900000)):
		(achi >=  800000)?(mra_rate_XtoY(lv100-300,   lv100-200,   100000, achi- 800000)):
		(achi >=  600000)?(mra_rate_XtoY(lv100*0.4,   lv100-300,   200000, achi- 600000)):
		(achi >=  400000)?(mra_rate_XtoY(lv100*0.2,   lv100*0.4,   200000, achi- 400000)):
		(achi >=  200000)?(mra_rate_XtoY(lv100*0.1,   lv100*0.2,   200000, achi- 200000)):
		(achi >=  100000)?(mra_rate_XtoY(0,           lv100*0.1,   100000, achi- 100000)):0;
	return Math.floor(temp);
}

function achi2rating_dx(lv, achi)	//lvは10倍、achiは%を1000倍で入力
{
	const rate =
	(achi >= 1005000)?15:
	(achi >= 1000000)?14:
	(achi >=  999900)?13.5:
	(achi >=  995000)?13:
	(achi >=  990000)?12:
	(achi >=  980000)?11:
	(achi >=  970000)?10:
	(achi >=  940000)?9.4:
	(achi >=  900000)?9:
	(achi >=  800000)?8:
	(achi >=  750000)?7.5:
	(achi >=  700000)?7:
	(achi >=  600000)?6:
	(achi >=  500000)?5:
	(achi >=  400000)?4:
	(achi >=  300000)?3:
	(achi >=  200000)?2:
	(achi >=  100000)?1:0
	
	const tmp = Math.min(achi, 1005000)*lv*rate;
	const tmpmod = tmp % 10000000;
	return (tmp - tmpmod)/10000000;	//戻りのRatingは整数値
}

function achi2rating_dxplus(lv, achi)	//lvは10倍、achiは%を1000倍で入力
{
	const rate =
	(achi >= 1005000)?14:	//SSS+
	(achi >= 1000000)?13.5:	//SSS
	(achi >=  995000)?13.2:	//SS+
	(achi >=  990000)?13:	//SS
	(achi >=  980000)?12.7:	//S+
	(achi >=  970000)?12.5:	//S
	(achi >=  940000)?10.5:	//AAA
	(achi >=  900000)?9.5:	//AA
	(achi >=  800000)?8.5:	//A
	(achi >=  750000)?7.5:	//BBB
	(achi >=  700000)?7:	//BB
	(achi >=  600000)?6:	//B
	(achi >=  500000)?5:	//C
	(achi >=  400000)?4:	//D
	(achi >=  300000)?3:	//D
	(achi >=  200000)?2:	//D
	(achi >=  100000)?1:	//D
	0;
	
	const tmp = Math.min(achi, 1005000)*lv*rate;
	const tmpmod = tmp % 10000000;
	return (tmp - tmpmod)/10000000;	//戻りのRatingは整数値
}

function get_overlevel(start_lv, rate, achi)
{
	let tmplv = Math.round(start_lv*10);
	while(rate >= (achi2rating_dxplus(++tmplv, achi)));
	tmplv /= 10;
	tmplv = (tmplv < 5)?(Math.ceil(tmplv)):tmplv;
	return tmplv;	      
}

function get_overlevel_list (rate, lvlist)
{
	let tmplv=0;
	tmplv = get_overlevel(tmplv, rate, 1005000);
	lvlist.push(tmplv);
	tmplv = get_overlevel(tmplv-1, rate, 1000000);
	lvlist.push(tmplv);
	tmplv = get_overlevel(tmplv-1, rate, 995000);
	lvlist.push(tmplv);
	tmplv = get_overlevel(tmplv-1, rate, 990000);
	lvlist.push(tmplv);
	tmplv = get_overlevel(tmplv-1, rate, 980000);
	lvlist.push(tmplv);
	tmplv = get_overlevel(tmplv-1, rate, 970000);
	lvlist.push(tmplv);
	return;
}

function get_over_achivement_for_rate_sub (lv, rate, maxachi, minachi)
{
	let tmplv = Math.round(Math.abs(lv*10));
	let tmpmaxachi = maxachi+1;	// unreachable
	let tmpminachi = minachi-1;
	let tmpachi=0, n=0;

	if(achi2rating_dxplus(tmplv, tmpmaxachi) <= rate)	//SSS+で越せない
		return tmpmaxachi;
	if(achi2rating_dxplus(tmplv, minachi) >= rate)	//Aで越せる
		return minachi;
	
	while(tmpmaxachi - tmpminachi >= 2 && n++<20)
	{
		tmpachi = Math.floor((tmpmaxachi + tmpminachi)/2);
		
		if(achi2rating_dxplus(tmplv, tmpachi) <= rate)
			tmpminachi = tmpachi;
		else
			tmpmaxachi = tmpachi;
	}
	return tmpmaxachi;
}

function get_over_achivement_for_rate (lv, rate)
{
	return get_over_achivement_for_rate_sub(lv, rate, 1010000, 800000)
}



function achi2lv_dx(achi, rating, expect_min, expect_max, ver)
{
	let lv_min, lv_max;
	let calc_func = ver==='dxplus'?achi2rating_dxplus:achi2rating_dx;
	for(lv_min=expect_min; calc_func(lv_min, achi)< rating; lv_min++);
	for(lv_max=lv_min; calc_func(lv_max, achi) == rating; lv_max++);
	lv_max = Math.min(expect_max, lv_max-1);
	return [lv_min, lv_max];
}

function reset_lv_dx()
{
	for(let n=0; n<4; n++)
	{
		id_lv[n].innerHTML = ''
	}
	return;
}

function calc_lv_dx(fumenlist, achilist, ratinglist, lvlist, ver)  // lvlist:output　	正しければ0が返る。
{
	let bestlist = new Array(4).fill([0,0,10,159]);

	reset_lv_dx();
	for(let n=0; n<4; n++)
	{
		const fumenid=fumenlist[n];
		if(fumenid < 0) break;
		if(achilist[n] < 100000 || 1010000 < achilist[n])
		{
			lvlist.push('達成率Error'); return -1;
		}
		const prev_all_rating = bestlist.map((x)=>{return x[1]}).reduce((a,b)=>a+b);
		if(!(ratinglist[n] >= prev_all_rating))
		{
			lvlist.push('Rating Error'); return -1;
		}
		const max_achi=Math.max(achilist[n], bestlist[fumenid][0]);
		const max_rating=
		      ratinglist[n]-prev_all_rating+bestlist[fumenid][1];
		const exp_lv = achi2lv_dx(max_achi, max_rating, bestlist[fumenid][2], bestlist[fumenid][3], ver);
		bestlist[fumenid] = [max_achi, max_rating, exp_lv[0], exp_lv[1]];
		lvlist.push(exp_lv);
	}
	
	return 0;
}

function expect_lv_dx(ver)	//正しければ0が返る。
{
	let calc_lvlist=[], retval=0;
	retval = calc_lv_dx(
		Array.prototype.map.call(document.querySelectorAll('#id_fumen'),(x)=>{return Number(x.value)}),
		Array.prototype.map.call(document.querySelectorAll('#id_achi'),
					 (x)=>{return Number(Number(x.value).toFixed(4).replace(/\./, ''));}),
		Array.prototype.map.call(document.querySelectorAll('#id_rating'), (x)=>{return Number(x.value)}),
		calc_lvlist,
		ver);
	
	for(let i=0; i<calc_lvlist.length; ++i)
	{
		const lv_min = (calc_lvlist[i][0]/10).toFixed(1);
		const lv_max = (calc_lvlist[i][1]/10).toFixed(1);
		if(lv_max < lv_min)
		{
			id_lv[i].innerHTML = 'Rating Error';
			retval = -1;
			break;
		}
		else
		{
			id_lv[i].innerHTML = (lv_max > lv_min)?(lv_min + '--' + lv_max):lv_min;
		}
	}
	return retval;
}

function make_tweet_str_dx(fumenlist, achilist, ratinglist, lvlist)
{
	const scoreid=['A', 'B', 'C', 'D'];
	let strs = new Array(4).fill('');
	let bestlist = new Array(4).fill([0,0]);
	let lvstr = new Array(4).fill('')
	let tmpnum=0;
	let str=''
	
	for(let n=0; n<4; n++)
	{
		const fumenid=fumenlist[n];
		if(fumenid < 0) break;
		const prev_all_rating = bestlist.map((x)=>{return x[1]}).reduce((a,b)=>a+b);
		if(bestlist[fumenid][0] > achilist[n])
			continue;	//達成率が元より低いデータは無視
		lvstr[fumenid] = lvlist[n];
		const max_achi=Math.max(achilist[n], bestlist[fumenid][0]);
		const max_rating=
		      ratinglist[n]-prev_all_rating+bestlist[fumenid][1];
		bestlist[fumenid]=[max_achi, max_rating];
		tmpnum = max_achi % 10000;
		strs[fumenid] += (max_achi - tmpnum)/10000 + '\.' + ('000'+tmpnum).slice(-4) + '%20' + max_rating + '%0D%0A';
	}
	
	for(let n=0; n<4; n++)
	{
		if(strs[n] != '')
			str += '%E8%AD%9C%E9%9D%A2' + scoreid[n] + '%20' + lvstr[n] + '%0D%0A' + strs[n];
	}
	return str;
}

function tweet_lv_dx(ver)
{
	let str='hashtags=maiDXlv&text=';
	
	if(expect_lv_dx(ver)==0)	// 再計算結果OKの場合のみツイート
	{
		str += make_tweet_str_dx(
			Array.prototype.map.call(document.querySelectorAll('#id_fumen'),(x)=>{return Number(x.value)}),
			Array.prototype.map.call(document.querySelectorAll('#id_achi'),
					 (x)=>{return Number(Number(x.value).toFixed(4).replace(/\./, ''));}),
			Array.prototype.map.call(document.querySelectorAll('#id_rating'), (x)=>{return Number(x.value)}),
			Array.prototype.map.call(document.querySelectorAll('#id_lv'),(x)=>{return x.innerHTML})
			);
		open("https://twitter.com/intent/tweet?" + str, "_blank" );
	}
	else
	{
		alert('エラーあるのでツイートできません。')
	}
	return;
}
	
