const comptable_show = (verstr) =>
{
  document.querySelectorAll('.complist').forEach((x)=>x.style.display = 'none');
  document.querySelectorAll('.compcount').forEach((x)=>x.style.display = 'none');
  if(verstr == '.version00' || verstr == '.version01')
  {
    document.querySelectorAll('.version00').forEach((x)=>x.style.display='');
    document.querySelectorAll('.version01').forEach((x)=>x.style.display='');
  }
  else if(verstr == '.maicomp_f' || verstr == '.maicomp_cur')
  {
    if(document.querySelector('.maicomp_f') != undefined)
      document.querySelectorAll('.maicomp_f').forEach((x)=>x.style.display='');
    document.querySelectorAll('.maicomp_cur').forEach((x)=>x.style.display='');
  }
  else
    document.querySelectorAll(verstr).forEach((x)=>x.style.display='');
  return;
}
