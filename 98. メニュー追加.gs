function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [
    {
      name : "キャラ情報インポート",
      functionName : "importChara"
    }
  ];
  sheet.addMenu("スクリプト実行", entries);
};
