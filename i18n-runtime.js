(function(global){
  'use strict';
  const languages=['fr','en','es','ar','ru','zh-Hans'];
  function normalize(value){if(languages.includes(value))return value;if(/^zh(?:-|$)/i.test(value||''))return 'zh-Hans';const short=String(value||'').split('-')[0];return languages.includes(short)?short:'fr';}
  function text(language,key,values={}){const table=global.SAKO_I18N[normalize(language)];const value=table[key]??global.SAKO_I18N.fr[key]??key;return value.replace(/\{(\w+)\}/g,(whole,name)=>values[name]===undefined?whole:String(values[name]));}
  function app(language,base){
    const code=normalize(language);
    const native=base.locales[code];
    const screenshots=native||base.locales.fr;
    const presentation=native||base.webTexts[code];
    if(!presentation)throw Error('Missing app presentation: '+code+'/'+base.id);
    return {...base,...presentation,screens:screenshots.screens,screenshotLanguage:native?code:'fr',interfaceLocalized:!!native};
  }
  global.SakoLocale={languages,normalize,text,app};
})(window);
