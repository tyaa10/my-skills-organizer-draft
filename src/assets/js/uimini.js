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

function toggleSidebar () {
  document.querySelector('.sidebar').classList.toggle('active')
  document.querySelector('.sidebar').classList.toggle('full')
  if (document.querySelector('.sidebar').classList.contains('active')) {
    document.querySelector('.sidebar').style = 'left: 0'
    // document.addEventListener('click', uiSidebarVisiblityListener, false)
  } else {
    document.querySelector('.sidebar').style = 'left: -240px'
    // document.removeEventListener('click', uiSidebarVisiblityListener, false)
  }
}

function showSidebar () {
  document.querySelector('.sidebar').classList.add('active')
  document.querySelector('.sidebar').classList.add('full')
  document.querySelector('.sidebar').style = 'left: 0'
}

function hideSidebar () {
  document.querySelector('.sidebar').classList.remove('active')
  document.querySelector('.sidebar').classList.remove('full')
  document.querySelector('.sidebar').style = 'left: -240px'
}

/* if (uiSidebarBtn) {
  uiSidebarBtn.addEventListener('click', toggleSidebar)
} */

/* //
// Sidebar 2
//

var sidebar2CloseButton = document.querySelector('#sidebar2-closer')

function toggleSidebar2 () {
  console.log(document.querySelector('#sidebar2'))
  document.querySelector('#sidebar2').classList.toggle('collapsed')
}

if (sidebar2CloseButton) {
  sidebar2CloseButton.addEventListener('click', toggleSidebar2)
} */

//
// Navbar
//
var uiNavbarListMobile = document.querySelector('.navbar-list__wrapper')
var uiNavbarMenuMobileBtn = document.querySelector('.navbar-content .button-burger')

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
  // console.log(uiMessageBtn)

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
var dialogButtonsHandlers = {}
function uiMessage (okButtonHandler, cancelButtonHandler) { // eslint-disable-line no-unused-vars
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
    element.addEventListener('click', function () {
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
  // Если кенцел отсутвует на 1 модалке и есть на второq в i отправляется 0.
  // закрывается 1. вторая без изменений
  // решение - новая функция+класс для окна с кенцел
  Array.prototype.forEach.call(uiMessageDialogBtnCancel, function (element, i) {
    element.addEventListener('click', function () {
      // Exit
      closeMessageDialog(i)
      // Ok func
      // messageDialogItCancel()
      dialogButtonsHandlers['cancel'].call()
    })
  })

  // Event for Close OK
  Array.prototype.forEach.call(uiMessageDialogBtnOk, function (element, i) {
    element.addEventListener('click', function () {
      // Exit
      closeMessageDialog(i)
      // Ok func
      // messageDialogItOk()
      dialogButtonsHandlers['ok'].call()
    })
  })

  function showMessageDialog (i) {
    // Becouse [i]
    var messageDialog = document.getElementsByClassName('ui-messageBox__wrapper')[i]
    messageDialog.style.display = 'flex'
  }

  function closeMessageDialog (i) {
    // Becouse [i]
    var messageDialog = document.getElementsByClassName('ui-messageBox__wrapper')[i]
    messageDialog.style.display = 'none'
  }

  return function () {
    showMessageDialog(0)
  }
}

export { showMessage, uiMessage, toggleSidebar, showSidebar, hideSidebar }
