function importChara() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('List');
  var sheetData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var topMargin = 2;
  var listUrl = 'https://xn--odkm0eg.gamewith.jp/article/show/148127';
//  var listHtml = UrlFetchApp.fetch(listUrl).getContentText('UTF-8')
  var charaNames = [];
  
  for(var i = topMargin + 1; i <= sheetData.length; i++){
    if(getData(i, 2) == ""){
      charaNames.push([getData(i, 1), i]);
    }
  }
  
  charaNames.forEach(function(value){
//    var sectionHtml = getTags(listHtml, 'section', '<section class="w-idb-element.*?' + value[0] + '.*?">', '');
    if(true/*sectionHtml[0]*/){
//      
//      //複数マッチするとき
//      if(sectionHtml.length > 1){
//        var nameSelectText = '該当する番号を入力してください\\n';
//        sectionHtml.forEach(function(value, index){
//          var selectIndex = index + 1
//          nameSelectText += selectIndex + ". " + value.match(/<\/noscript>.*?<\/a>/)[0].replace(/<\/noscript>|<\/a>/g, '') + '\\n';
//        });
//        
//        while(true){
//          var nameNum = Browser.inputBox('複数の候補がありました',nameSelectText,Browser.Buttons.OK_CANCEL);
//          if(nameNum == 'cancel'){
//            return;
//          }else if(nameNum > 0 && nameNum <= sectionHtml.length){
//            sectionHtml = [sectionHtml[Math.ceil(nameNum) - 1]];
//            break;
//          }else{
//            Browser.msgBox('正しい値を入力してください',Browser.Buttons.OK)
//          }
//        }
//        
//      }
      
      
      
      
//      var detailPath = sectionHtml[0].match(/\/article\/show\/[0-9]*/);
    var detailPath = ['/article/show/19461']; //開発用データ
      
      if(detailPath[0]){
        var detailUrl = detailPath[0].replace('/article/show/','https://パワプロ.gamewith.jp/article/show/');
        var detailHtml = UrlFetchApp.fetch(detailUrl).getContentText('UTF-8');
        
        var eveOrder = getChildTags(detailHtml, [['div', '<div class="pwpr_status_table">', '', 0], ['tr', '<tr>', '']])[2];
        Logger.log(eveOrder);
      }else{
        Browser.msgBox('"' + value[0] + '"のページが見つかりません。',Browser.Buttons.OK);
      }
    }else{
//      Browser.msgBox('"' + value[0] + '"が見つかりません。',Browser.Buttons.OK);
    }
    
    
    
  });
  
  
  
  function getData(y,x){
    return sheetData[y-1][x-1];
  }
  
  function getDirect(y,x){
    var range = sheet.getRange(y, x);
    return range.getValue();
  }
  
  function setData(y,x,data){
    sheetData[y - 1][x - 1] = data;
  }
  
  function setDirect(y,x,data){
    var range = sheet.getRange(y, x);
    range.setValue(data);
  }
}


//tagType:'div'とか, tagReg:開始タグの正規表現, elementReg:中に含まれる要素の正規表現
function getTags(xml,tagType,tagReg,elementReg){
  var indexStartTag;
  var xmls = [];
  tagReg = new RegExp(tagReg);
  elementReg = new RegExp(elementReg);
  
  for (var i = 0;true;i++){
    indexStartTag = xml.search(tagReg);
    if(indexStartTag !== -1){
      xml = xml.substring(indexStartTag + xml.match(tagReg)[0].length);
      var copyXml = xml;
      var index = 0;
      var endTagNum = 0; //開始タグに対する終了タグの数。これが1になったら親要素の終了タグとみなす
      var reg = new RegExp('<(/)?' + tagType);
      
      while(endTagNum < 1){
        index += copyXml.search(reg) + 1;
        if(copyXml.match(reg)[0] == '<' + tagType){
          endTagNum --;
        }else{
          endTagNum ++;
        }
        copyXml = xml.substring(index)
      }
      
      if(xml.substring(0,index - 1).search(elementReg) !== -1){
        xmls.push(xml.substring(0,(index - 1)));
      }
      xml = xml.substring((index - 1) + (tagType.length + 3));
    }else{
      break;
    }
  }
  return xmls;
}

function getChildTags(xml,array){ //array = [[tagType,tagReg,elementReg,num],[tagType,tagReg,elementReg]]
  array.forEach(function(value,index){
    xml = getTags(xml,value[0],value[1],value[2]);
    if(index !== array.length - 1){
      xml = xml[value[3]];
    }
  });
  return xml;
}