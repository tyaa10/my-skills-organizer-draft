//
// Sidebar
//
// var uiSidebar = document.querySelector('.sidebar')
// var uiSidebarBtn = document.querySelector('.sidebar-open-button .button-burger')

/* var uiSidebarVisiblityListener = function (event) { // eslint-disable-line no-unused-vars
  // If user clicks inside the element, do nothing
  if (event.target.closest('.sidebar')) { return }
  // If user clicks outside the element, hide it!
  uiSidebar.classList.remove('full')
  uiSidebar.style = 'left: -240px'
} */
// Функция переключения видимости боковой панели
function toggleSidebar () {
  document.querySelector('.sidebar').classList.toggle('active')
  document.querySelector('.sidebar').classList.toggle('full')
  if (document.querySelector('.sidebar').classList.contains('active')) {
    document.querySelector('.sidebar').style = 'left: 0'
  } else {
    document.querySelector('.sidebar').style = 'left: -320px'
  }
}
// Функция отображения боковой панели
function showSidebar () {
  document.querySelector('.sidebar').classList.add('active')
  document.querySelector('.sidebar').classList.add('full')
  document.querySelector('.sidebar').style = 'left: 0'
}
// Функция отображения правой боковой панели
function showRightSidebar () {
  document.querySelector('.right-sidebar').classList.add('active')
  document.querySelector('.right-sidebar').classList.add('full')
  document.querySelector('.right-sidebar').style = 'right: 0'
}
// Функция скрытия боковой панели
function hideSidebar () {
  document.querySelector('.sidebar').classList.remove('active')
  document.querySelector('.sidebar').classList.remove('full')
  document.querySelector('.sidebar').style = 'left: -320px'
}
// Функция скрытия правой боковой панели
function hideRightSidebar () {
  document.querySelector('.right-sidebar').classList.remove('active')
  document.querySelector('.right-sidebar').classList.remove('full')
  document.querySelector('.right-sidebar').style = 'right: -290px'
}

//
// Navbar
//
var uiNavbarListMobile = document.querySelector('.navbar-list__wrapper')
var uiNavbarMenuMobileBtn = document.querySelector('.navbar-content .button-burger')
// Если присутствует кнопка мобильного меню -
// активировать кнопку и список пунктов
if (uiNavbarMenuMobileBtn) {
  uiNavbarMenuMobileBtn.addEventListener('click', function () {
    this.classList.toggle('active')
    uiNavbarListMobile.classList.toggle('active')
  })
}

//
// Alert
//
var uiAlert = document.querySelectorAll('.ui-alert')
var uiAlertBtnClose = document.querySelectorAll('.ui-alert .button-close')
// Установка на каждое окно Alert обработчика для закрытия
if (uiAlert) {
  for (let i = 0; i < uiAlertBtnClose.length; i++) {
    uiAlertBtnClose[i].onclick = function () {
      this.parentNode.parentNode.removeChild(this.parentNode)
    }
  }
}

//
// Tag
//
var uiTag = document.querySelectorAll('.ui-tag')
var uiTagBtnClose = document.querySelectorAll('.ui-tag .button-close')
// Установка на каждый Tag (сейчас в приложении не используются) обработчика для закрытия
if (uiTag) {
  for (let i = 0; i < uiTagBtnClose.length; i++) {
    uiTagBtnClose[i].onclick = function () {
      this.parentNode.parentNode.removeChild(this.parentNode)
    }
  }
}

// TODO: Global FIX func
//
// Message
//
function showMessage (message, messageBtn) { // eslint-disable-line no-unused-vars
  var uiMessage = document.querySelectorAll(message)
  var uiMessageBtn = document.querySelectorAll(messageBtn)
  var timeOut = 2000
  // Becouse animation: fadeOutUp .3s
  var timeOutUp = timeOut - 1700

  // Only Message without button
  if (uiMessageBtn.length === 0) {
    for (let i = 0; i < uiMessage.length; i++) {
      uiMessage = uiMessage[i]
      showAndHideMessage()
    }
  }

  // Message with button
  for (let i = 0; i < uiMessage.length; i++) {
    uiMessage = uiMessage[i]
    uiMessageBtn = uiMessageBtn[i]

    uiMessageBtn.onclick = function () {
      showAndHideMessage()
    }
  }

  function showAndHideMessage () {
    uiMessage.style.display = 'flex'

    // Animation
    uiMessage.classList.add('fadeInDown')
    uiMessage.classList.remove('fadeOutUp')

    setTimeout(function () {
      setTimeout(function () {
        uiMessage.style.display = 'none'
      }, timeOutUp)

      // Animation
      uiMessage.classList.add('fadeOutUp')
      uiMessage.classList.remove('fadeInDown')
    }, timeOut)
  }
}

//
// Message Dialog
//
function uiMessage (okButtonHandler, cancelButtonHandler, modalName) { // eslint-disable-line no-unused-vars
  var dialogButtonsHandlers = {}
  // [i] for forEach
  dialogButtonsHandlers['ok'] = okButtonHandler
  dialogButtonsHandlers['cancel'] = cancelButtonHandler
  // var messageDialog = document.getElementsByClassName('ui-messageBox__wrapper')
  var uiMessageDialogBtnShow = document.getElementsByClassName('ui-messageBox-show')
  var uiMessageDialogBtnOk = document.getElementsByClassName('ui-messageBox-ok')
  var uiMessageDialogBtnCancel = document.getElementsByClassName('ui-messageBox-cancel')
  var uiMessageDialogBtnClose = document.getElementsByClassName('ui-messageBox-close')
  // Event for Show
  Array.prototype.forEach.call(uiMessageDialogBtnShow, function (element, i) {
    console.log('Array.prototype.forEach.call(uiMessageDialogBtnShow i = ' + i)
    var newElement = element.cloneNode(true)
    element.parentNode.replaceChild(newElement, element)
    newElement.addEventListener('click', function () {
      showMessageDialog(i)
    })
  })

  // Event for Close
  Array.prototype.forEach.call(uiMessageDialogBtnClose, function (element, i) {
    element.addEventListener('click', function () {
      closeMessageDialog(i)
    })

    // Close click to window
    window.addEventListener('click', function (e) {
      // Becouse [i]
      var messageDialog = document.getElementsByClassName('ui-messageBox__wrapper')[i]
      if (e.target === messageDialog) {
        messageDialog.style.display = 'none'
      }
    })
  })

  // Event for Close Cancel
  // TODO: bug
  // Если отмена отсутвует на 1 модалке и есть на второй - в i отправляется 0.
  // закрывается 1. вторая без изменений
  // решение - новая функция+класс для окна с отменой
  Array.prototype.forEach.call(uiMessageDialogBtnCancel, function (element, i) {
    var newElement = element.cloneNode(true)
    element.parentNode.replaceChild(newElement, element)
    newElement.addEventListener('click', function () {
      // Exit
      closeMessageDialog(i)
      // Ok func
      // messageDialogItCancel()
      dialogButtonsHandlers['cancel'].call()
    })
  })

  // Event for Close OK
  Array.prototype.forEach.call(uiMessageDialogBtnOk, function (element, i) {
    var newElement = element.cloneNode(true)
    element.parentNode.replaceChild(newElement, element)
    newElement.addEventListener('click', function () {
      // Exit
      closeMessageDialog(i)
      // Ok func
      // messageDialogItOk()
      dialogButtonsHandlers['ok'].call()
    })
  })

  // function showMessageDialog (i) {
  function showMessageDialog (modalName) {
    // Becouse [i]
    console.log('showMessageDialog modalName = ' + modalName)
    // var messageDialog = document.getElementsByClassName('ui-messageBox__wrapper')[i]
    var messageDialog = document.querySelectorAll('.ui-messageBox__wrapper#' + modalName)[0]
    messageDialog.style.display = 'flex'
  }

  function closeMessageDialog (i) {
    // Becouse [i]
    var messageDialog = document.getElementsByClassName('ui-messageBox__wrapper')[i]
    messageDialog.style.display = 'none'
  }

  return function () {
    // showMessageDialog(0)
    showMessageDialog(modalName)
  }
}
// Экспорт всех необходимых функций из модуля
export { showMessage, uiMessage, toggleSidebar, showSidebar, hideSidebar, showRightSidebar, hideRightSidebar }
