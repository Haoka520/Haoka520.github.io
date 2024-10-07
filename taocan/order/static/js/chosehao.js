$(document).ready(function () {
  $('#closePopup').click(function () {
    $('#popupContainer').fadeOut();
  });

  $(document).click(function (event) {
    var target = $(event.target);
    if (!target.closest('#popupContent').length && !target.is('#openPopup')) {
      $('#popupContainer').fadeOut();
    }
  });
});
var shop_number;
var pid = $('#pid').val();
var data;
function funnumber(value, provice) {
  page = 1;
  shop_number = value;
  var province = provice;
  var provinceString = province.toString();
  var straddress = provinceString.split(' ');
  var address_province = straddress[0];
  var address_city = straddress[1];
  var searvalue = $('#xhsear').val();
  data = {
    goodsCode: shop_number,
    province: address_province,
    city: address_city,
    pid: pid,
    haoapi: haoapi,
    page: page,
    searvalue: searvalue
  };
  sendAjaxRequest();
}
// 取号
function sendAjaxRequest() {
  $('#phoneContainer').html('<style>.spinner { border: 4px solid rgba(0, 0, 0, 0.1); border-left-color: #333; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }</style><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;"><p>获取中...</p><div class="spinner"></div></div>');
  $.ajax({
    url: 'Gethao.php',
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function (data) {
      var phoneNumbers = data;
      var phoneContainer = $('#phoneContainer');
      phoneContainer.empty();
      var phoneRow = $('<div>').addClass('phoneRow');
      if (phoneNumbers.length === 0) {
        var phoneContainer = document.getElementById("phoneContainer");
        var pTag = document.createElement("p");
        pTag.textContent = "暂未查询到号码，请稍后试试";
        phoneContainer.appendChild(pTag);
      } else {
        for (var i = 0; i < phoneNumbers.length; i++) {
          // 确保 phoneNumbers[i] 是字符串类型
          var phoneItemText = String(phoneNumbers[i]);

          // 创建一个包含电话号码文本的 div 元素
          var phoneItem = $('<div>').addClass('phoneItem').text(phoneItemText);

          // 使用正则表达式替换电话号码中的特定模式
          let phoneText = phoneItemText.replace(/(\d)\1{1,}/g, '<span style="color:#ff7800;font-weight:500;">$&</span>');
          phoneText = phoneText.replace(/(?:(?:0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)){3,}|(?:9(?=8)|8(?=7)|7(?=6)|6(?=5)|5(?=4)|4(?=3)|3(?=2)|2(?=1)|1(?=0)){2,})\d/g, '<span style="color:green;font-weight:500;">$&</span>');
          phoneText = phoneText.replace(/(\d)\1{1,}(\d)\2{1,}/g, '<span style="color:red;font-weight:500;">$&</span>');

          // 将带有样式的电话号码设置为 phoneItem 的 HTML 内容
          phoneItem.html(phoneText);

          // 将 phoneItem 添加到 phoneRow 中
          phoneRow.append(phoneItem);

          // 每两个电话号码后，将 phoneRow 添加到 phoneContainer 中，并重置 phoneRow
          if ((i + 1) % 2 === 0) {
            phoneContainer.append(phoneRow);
            phoneRow = $('<div>').addClass('phoneRow');
          }
        }
        if (phoneNumbers.length % 2 !== 0) {
          phoneContainer.append(phoneRow);
        }
      }
    },
    error: function () {
      console.log('无法获取JSON数据');
    },
  });
}
// 搜号
$('.xhbtn').click(function () {
  const searvalue = $('#xhsear').val();
  searAjaxRequest(searvalue);
  page++;
});

// 搜号
function searAjaxRequest(searvalue) {
  $('#phoneContainer').html('<style>.spinner { border: 4px solid rgba(0, 0, 0, 0.1); border-left-color: #333; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }</style><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;"><p>搜索中...</p><div class="spinner"></div></div>');
  data.searvalue = searvalue;
  $.ajax({
    url: 'Gethao.php',
    type: 'POST',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function (data) {
      var resphoneNumbers = data;
      if (resphoneNumbers != null) {
        var phoneNumbers = resphoneNumbers.filter(item => item.toString().includes(searvalue));
      }
      else {
        var phoneNumbers = [];
      }
      var phoneContainer = $('#phoneContainer');
      phoneContainer.empty();
      if (phoneNumbers.length === 0) {
        var phoneContainer = document.getElementById("phoneContainer");
        var pTag = document.createElement("p");
        pTag.textContent = "暂未查询到号码，请继续搜索试试";
        phoneContainer.appendChild(pTag);
      } else {
        var phoneRow = $('<div>').addClass('phoneRow');
        for (var i = 0; i < phoneNumbers.length; i++) {
          var phoneItem = $('<div>').addClass('phoneItem').text(phoneNumbers[i]);
          phoneRow.append(phoneItem);
          if ((i + 1) % 2 === 0) {
            phoneContainer.append(phoneRow);
            phoneRow = $('<div>').addClass('phoneRow');
          }
        }
        if (phoneNumbers.length % 2 !== 0) {
          phoneContainer.append(phoneRow);
        }
      }
    },
    error: function () {
      console.log('无法获取JSON数据');
    },
  });
}
// 换号
$('#hpButton').click(function () {
  sendAjaxRequest();
  page++;

});
// 点击选号
var senumber = '';
$(document).ready(function () {
  $('#phoneContainer').on('click', '.phoneItem', function () {
    $('.phoneItem.selected').removeClass('selected').css('background-color', 'initial').css('color', 'initial');
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
      $('#csButton').prop('disabled', true).css('opacity', 0.5);
    } else {
      // 否则将 .selected 类添加到当前被点击的元素
      $(this).addClass('selected').css('background-color', '#4262f4').css('color', '#fff');
      $('#csButton').prop('disabled', false).css('opacity', 1);
    }
    senumber = $(this).text();
  });
});

// 选号后赋值
$(document).ready(function () {
  $('#csButton').click(function () {
    $("input[name='order_number']").val(senumber);
    $('#popupContainer').fadeOut();
  });
});