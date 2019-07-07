function importChara() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('List');
  var sheetData = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
  var topMargin = 2;
  var charaNameCol = 1;
  var eveOrderCol = 2;
  var specialtyCol = 3;
  var gSkillCol = 4;
  var pSkillCol = 5;
  var fSkillCol = 6;
  var comboCol = 7;
  var listUrl = 'https://xn--odkm0eg.gamewith.jp/article/show/148127';
  var listHtml = UrlFetchApp.fetch(listUrl).getContentText('UTF-8')
  var charaNames = [];
  
  for(var i = topMargin + 1; i <= sheetData.length; i++){
    if(getData(i, 2) == ""){
      charaNames.push([getData(i, 1), i]);
    }
  }
  
  charaNames.forEach(function(value){
    var sectionHtmls = getTags(listHtml, 'section', '<section class="w-idb-element.{1,100}' + value[0] + '.*?">', '');
    if(sectionHtmls[0]){
      
      //複数マッチするとき
      if(sectionHtmls.length > 1){
        var nameSelectText = '該当する番号を入力してください\\n';
        sectionHtmls.forEach(function(value, index){
          var selectIndex = index + 1
          nameSelectText += selectIndex + ". " + value.match(/<\/noscript>.*?<\/a>/)[0].replace(/<\/noscript>|<\/a>/g, '') + '\\n';
        });
        
        while(true){
          var nameNum = Browser.inputBox('複数の候補がありました',nameSelectText,Browser.Buttons.OK_CANCEL);
          if(nameNum == 'cancel'){
            return;
          }else if(nameNum > 0 && nameNum <= sectionHtmls.length){
            sectionHtmls = [sectionHtmls[Math.ceil(nameNum) - 1]];
            break;
          }else{
            Browser.msgBox('正しい値を入力してください',Browser.Buttons.OK)
          }
        }
        
      }
      
      
      
      
      var detailPath = sectionHtmls[0].match(/\/article\/show\/[0-9]*/);
//      var detailPath = ['/article/show/19461']; //開発用データ
      
      if(detailPath[0]){
        var detailUrl = detailPath[0].replace('/article/show/','https://パワプロ.gamewith.jp/article/show/');
        var detailHtml = UrlFetchApp.fetch(detailUrl).getContentText('UTF-8');
        
        
        //名前
        var charaName = getTags(detailHtml, 'h3', '', '基本情報')[0].replace(/の基本情報/, '');
        setData(value[1], charaNameCol, charaName);
        
        
        //基本情報テーブル
        var baseInfo = getChildTags(detailHtml, [['div', '<div class="pwpr_status_table">', '', 0], ['tr', '', '']]);
        
        
        //得意練習
        var specialty = getTags(baseInfo[0], 'td', '', '')[0].replace('&', '\n');
        setData(value[1], specialtyCol, specialty);
        
        
        //イベ順
        var eveOrder = getTags(baseInfo[2], 'span', '', '')[0];
        setData(value[1], eveOrderCol, eveOrder);
        
        
        //金特
        var gSkill = ''
        var gSkillHtmls = baseInfo[3].match(/<a.*?確定\)/g);
        
        gSkillHtmls.forEach(function(value, index, array){
          gSkill += value.replace(/<a.*?>|<\/a>/g, '');
          if(index < array.length - 1){
            gSkill += '\n';
          }
        });
        setData(value[1], gSkillCol, gSkill);
        
        
        //コンボ
        var combo = ''
        var comboHtmls = baseInfo[6].match(/<\/noscript>.*?<\/a>/g);
        
        comboHtmls.forEach(function(value, index, array){
          combo += value.replace(/<\/.*?>/g, '');
          if(index < array.length - 1){
            combo += '\n';
          }
        });
        setData(value[1], comboCol, combo);
        
        
        //投手コツ
        var pSkill = ''
        var pSkillHtmls = getTags(baseInfo[7].match(/.*<hr/)[0], 'a', '', '');
        
        if(pSkillHtmls[0]){
          pSkillHtmls.forEach(function(value, index, array){
            pSkill += value.replace(/<\/.*?>/g, '');
            if(index < array.length - 1){
              pSkill += '\n';
            }
          });
        }else{
          pSkill = 'なし';
        }
        setData(value[1], pSkillCol, pSkill);
        
        
        //野手コツ
        var fSkill = '';
        var fSkillHtmls = getTags(baseInfo[7].match(/<hr.*/)[0], 'a', '', '');
        
        if(fSkillHtmls[0]){
          fSkillHtmls.forEach(function(value, index, array){
            fSkill += value.replace(/<\/.*?>/g, '');
            if(index < array.length - 1){
              fSkill += '\n';
            }
          });
        }else{
          fSkill = 'なし';
        }
        setData(value[1], fSkillCol, fSkill);
        
        //入力 
        sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).setValues(sheetData);
        
      }else{
        Browser.msgBox('"' + value[0] + '"のページが見つかりません。',Browser.Buttons.OK);
        return;
      }
    }else{
      Browser.msgBox('"' + value[0] + '"が見つかりません。',Browser.Buttons.OK);
      return;
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
  if(tagReg){
    tagReg = new RegExp(tagReg);
  }else{
    tagReg = new RegExp('<' + tagType + '.*?>'); 
  }
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