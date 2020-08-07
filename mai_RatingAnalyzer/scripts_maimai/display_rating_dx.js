javascript:
(function ()
{

const inlv_length=in_lv.length;	//内部Lv.データの大きさ
	
const Score = (td) =>
{
	if(td == undefined)
		return 0
	return Number(td.innerText.replace(/\%|\.|,/g, ''));
}

const data2lv = (name, dxstr, diff, lvstr) =>
{
	const diffstr=['basic', 'advanced', 'expert', 'master', 'remaster'];
	const dx = (dxstr == "dx")?1:0;
	
	for(let n=0; n<inlv_length; ++n)
	{
		let tmpinlv=in_lv[n];
		if(tmpinlv.dx != dx || tmpinlv.n != name)
			continue;	//違う
		let tmplv = tmpinlv.lv[diffstr.indexOf(diff)];
		let abslv = Math.abs(tmplv);
		if(lvstr.slice(-1)=='+')
		{
			let lvnum=Number(lvstr.slice(0,-1));
			if( !(lvnum+0.7 <= abslv && abslv < lvnum+1))
				continue;
		}
		else
		{
			let lvnum = Number(lvstr);
			if( !(lvnum <= abslv && abslv < lvnum+0.7))
				continue;
		}
		return tmplv;

	}
	return 0;	//リストにない
}

const make_new_resultdata = (rd)=>
{
	let lv = data2lv(rd.querySelector('div.music_name_block').innerText,
			 rd.querySelector('img.music_kind_icon.f_r').getAttribute('src').slice(44,-4),
			 rd.querySelector('img.h_20.f_l').getAttribute('src').slice(43,-4),
			 rd.querySelector('div.music_lv_block').innerText);
	let roops = 0, lv4calc=0;
	if(lv > 0)
	{
		rd.querySelector('div.music_lv_block').innerText = lv.toFixed(1);
		roops = 1;
		lv4calc = Math.round(lv*10);
	}
	else	//新規追加のデータなし、もしくは未検証
	{
		let lvstr = rd.querySelector('div.music_lv_block').innerText;
		roops = (lvstr.slice(-1)=='+')?3:7;
		if(lv < 0)
		{
			rd.querySelector('div.music_lv_block').innerText = '(' + (Math.abs(lv).toFixed(1)) + ')';
		}
		lv4calc = Number((lvstr.slice(-1)=='+')?lvstr.replace(/\+/, '7'):lvstr+'0');
	}
	
	let scoreblock = rd.querySelector('div.music_score_block');
	const achi = Number(scoreblock.innerText.replace(/\.|%/g, ''));

	scoreblock.classList.remove('w_120');

	let tmp_max=0;
	for(let i=0; i<roops; ++i)
	{
		let calc_rate = achi2rating_dxplus(lv4calc+i, achi);
		let addelm = scoreblock.cloneNode(true);
		addelm.innerText = calc_rate;
		addelm.classList.add('rate_box');
		scoreblock.parentNode.insertBefore(addelm, rd.querySelectorAll('div.clearfix')[1]);
	}
}

const rdlist_split = (rdlist, newlist, oldlist) =>
{
	let tmp_rd;
	rdlist.shift();	// 先頭は不要データ（RATING対象曲（新曲））
	while(rdlist.length > 0)	//RATING対象曲（新曲）の取り込み
	{
		tmp_rd = rdlist.shift();
		if(tmp_rd.getAttribute('class').split(' ').some((x)=>x==='screw_block')	) //RATING対象曲（ベスト）の文字列
			break;
		else
			newlist.push(tmp_rd);
	}
	while(rdlist.length > 0)	//RATING対象曲（ベスト）の取り込み
	{
		tmp_rd = rdlist.shift();
		if(tmp_rd.getAttribute('class').split(' ').some((x)=>x==='screw_block')	)　//RATING候補曲（新曲）の文字列
			break;
		else
			oldlist.push(tmp_rd);
	}
	while(rdlist.length > 0)	//RATING候補曲（新曲）の取り込み
	{
		tmp_rd = rdlist.shift();
		if(tmp_rd.getAttribute('class').split(' ').some((x)=>x==='screw_block')	) //RATING候補曲（ベスト）の文字列
			break;
		else
			newlist.push(tmp_rd);
	}
	while(rdlist.length > 0)	//RATING候補曲（ベスト）の取り込み
	{
		tmp_rd = rdlist.shift();
		if(tmp_rd.getAttribute('class').split(' ').some((x)=>x==='screw_block')	)
			break;
		else
			oldlist.push(tmp_rd);
	}
	return;
}


const remove_needless_values = (rd) =>
{
	let max_rating = 300, min_rating = 0, basis_achi=1010000;
	let reuse_rdlist=[];
	
	while(rd.length>0)
	{
		let tmp_rd = rd.shift();
		let tmp_achi = Score(tmp_rd.querySelector('.music_score_block'));
		let rdboxlist = Array.prototype.slice.call(tmp_rd.querySelectorAll('.rate_box'));
		max_rating = (tmp_achi > basis_achi)?max_rating-1:max_rating;	//達成率が上がる -> rating値は低い
		
		while(rdboxlist[0] != undefined)
		{
			let rdbox = rdboxlist.shift();
			if(Number(rdbox.innerText) > max_rating)
			{
				rdbox.innerText='';
				rdbox.classList.remove('rate_box');
			}
		}

		rdboxlist = Array.prototype.slice.call(tmp_rd.querySelectorAll('.rate_box'));	//有効な値のみ取得
		max_rating = Math.min(max_rating, Score(rdboxlist[rdboxlist.length-1]));	//最大値算出
		basis_achi = tmp_achi;	//基準達成率変更
		reuse_rdlist.push(tmp_rd);
	}

	while(reuse_rdlist.length>0)
	{
		let tmp_rd = reuse_rdlist.pop();
		let tmp_achi = Score(tmp_rd.querySelector('.music_score_block'));
		let rdboxlist = Array.prototype.slice.call(tmp_rd.querySelectorAll('.rate_box'));
		
		min_rating = (tmp_achi < basis_achi)?min_rating+1:min_rating;	//達成率が下がる -> rating値は高い
		
		while(rdboxlist[0] != undefined)
		{
			let rdbox = rdboxlist.shift();
			if(Number(rdbox.innerText) < min_rating)
			{
				rdbox.innerText='';
				rdbox.classList.remove('rate_box');
			}
		}

		rdboxlist = Array.prototype.slice.call(tmp_rd.querySelectorAll('.rate_box'));	//有効な値のみ取得
		min_rating = Math.max(min_rating, Score(rdboxlist[0]));	//最小値更新
		basis_achi = tmp_achi;	//基準達成率変更
	}

	return;	
}



const make_lvlist_str = (lvlist) =>
{
	let retstr = [];
	let rankstr = ['SSS+', 'SSS', 'SS+', 'SS', 'S+', 'S'];
	for(let i=0; i<6; i++)
	{
		if(Number(lvlist[i]) > 15.0)
			break;
		retstr.push(rankstr[i] + ':' + (lvlist[i].toFixed(1)));
	}
	return retstr.join(', ');
}

if(document.querySelectorAll('.rate_box').length ==0)
{
	let rdlist = Array.prototype.slice.call(document.querySelectorAll('div.w_450.m_15.p_3.f_0'));
	while(rdlist[0] != undefined)
	{
		make_new_resultdata(rdlist.shift());
	}

	rdlist = Array.prototype.slice.call(document.querySelectorAll('div.m_15:not(.see_through_block):not(.f_13)'));	//再度取得
	let rdlist_new=[], rdlist_old=[];
	rdlist_split(rdlist, rdlist_new, rdlist_old);

	remove_needless_values(rdlist_new);
	remove_needless_values(rdlist_old);
	
	rdlist_new=[], rdlist_old=[];
	rdlist = Array.prototype.slice.call(document.querySelectorAll('div.m_15:not(.see_through_block):not(.f_13)'));	//再度取得

	rdlist_split(rdlist, rdlist_new, rdlist_old);
	
	let blist_current = Array.prototype.map.call(rdlist_new, (x)=>Number(x.querySelector('.rate_box').innerText)).slice(0,15);
	const b_current = blist_current.reduce((x,y)=>x+y, 0);	// 現行verのB枠の合計
	const b_current_bottom = blist_current.pop();	// 現行verのB枠最低値
	
	let blist_oldver = Array.prototype.map.call(rdlist_old, (x)=>Number(x.querySelector('.rate_box').innerText)).slice(0,25);
	const b_oldver = blist_oldver.reduce((x,y)=>x+y, 0);	// 過去verのB枠合計
	const b_oldver_bottom = blist_oldver.pop();	// 過去verのB枠最低値
	
	let murating = Number(document.querySelectorAll('div.col2 div.f_r')[1].innerText);	//表示楽曲Rating
	document.querySelectorAll('div.screw_block')[0].innerText += " 合計:" + b_current;
	document.querySelectorAll('div.screw_block')[1].innerText += " 合計:" + b_oldver;
	document.querySelectorAll('div.col2 div.f_r')[1].innerText += '(不足 : ' + (murating-b_current-b_oldver) + ')';
	let current_lvlist = [], oldver_lvlist=[];
	get_overlevel_list (b_current_bottom, current_lvlist);
	get_overlevel_list (b_oldver_bottom, oldver_lvlist);
	document.querySelectorAll('div.screw_block')[2].innerHTML += '<br>' + make_lvlist_str(current_lvlist);
	document.querySelectorAll('div.screw_block')[3].innerHTML += '<br>' + make_lvlist_str(oldver_lvlist);
}	
else
	alert('実行済み');

})(); void(0);
