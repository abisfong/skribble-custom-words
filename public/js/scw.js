// jshint esversion: 9
/* --------------------------------------------------------------------------
 * VARIABLES
 * -------------------------------------------------------------------------- */
// DOM elements
const actionButtons = document.getElementsByClassName('c-wordlist__action-btn');
const difficultyInput = document.querySelector('input[name="difficulty"]');
const difficultySelection = document.querySelector('.c-wordlist__difficulty--difficulty-selection');
const difficultyArrowLeft = document.querySelector('.fa-angle-left');
const difficultyArrowRight = document.querySelector('.fa-angle-right');
const duplicateEntry = document.querySelector('.c-wordlist__entry--duplicate-entry');
const list = document.querySelector('.c-wordlist');
const logoutBtn = document.querySelector('#logout');
const loginForm = document.querySelector('#login-form');
const passwordChangeForm = document.querySelector('.form--password-change');
const signupForm = document.querySelector('#form-signup');
const userInfoForm = document.querySelector('#form-user-info');
const username = document.getElementById('username');
const yourList = document.querySelector('.h1--your-list-title');

// helper variables
var selection = 0;
var timerId;

/* --------------------------------------------------------------------------
 * FUNCTIONS
 * -------------------------------------------------------------------------- */
// change background color of difficulty selection in word form
const changeColor = function(dir) {
  if(dir == 'prev')
    selection = selection - 1 >= 0 ? selection - 1 : 2;
  else
    selection = (selection + 1) % 3;

  if(selection == 0) {
    difficultySelection.style.backgroundImage = 'linear-gradient(to right, #50c878, #39ff14)';
    difficultyInput.value = 'easy';
  } else if(selection == 1) {
    difficultySelection.style.backgroundImage = 'linear-gradient(to right, #fff200, #fff200)';
    difficultyInput.value = 'medium';
  } else if(selection == 2) {
    difficultySelection.style.backgroundImage = 'linear-gradient(to right, #ed2939, #ff0800)';
    difficultyInput.value = 'hard';
  }
};

const changePassword = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updatePassword',
      data
    });

    if(res.data.status === 'success') {
      showAlert('success', 'Password was successfully updated!');
      setTimeout(() => {
        location.assign('/me');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const changeUserInfo = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/me',
      data
    });

    if(res.data.status === 'success') {
      showAlert('success', 'Your account information was successfully updated!');
      setTimeout(() => {
        location.assign('/me');
      }, 3000);
    }
  } catch(err) {
    showAlert('error', err.response.data.message);
  }
};

// Check if a username is taken using api
const checkUsername = async () => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/username',
      data: {
        username: username.value
      }
    });
    if(res.data.usernameIsTaken == true){
      username.classList.add('input--invalid');
    } else
      username.classList.remove('input--invalid');
  } catch(err) {
    console.error('error attempting to check username availability');
  }
};

const debounce = (fn, delay) => {
  clearTimeout(timerId);
  timerId = setTimeout(fn, delay);
};

const deleteWord = async (word) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: '/api/v1/words',
      data: {
        word
      }
    });

    if (res.status == 204)
      location.assign('/');
  } catch(err) {
    showAlert('error', err.response.data.message);
  }
};

const hideAlert = () => {
  const el = document.querySelector('.c-alert');
  if (el) el.parentElement.removeChild(el);
};

const login = async (_user, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        _user,
        password
      }
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Login successful! Welcome back!');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Incorrect email or password');
  }
};

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Sign out successful!');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', 'Unable to sign out. Try again later.');
  }
};

// <type> is 'success' or 'error'
const showAlert = (type, msg, time = 7) => {
  let newMsg;
  hideAlert();

  if(type == 'error' && typeof(msg) == "string")
    newMsg = msg.split('\n')[0];

  const markup = `<div class="c-alert c-alert--${type}">${newMsg ? newMsg : msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  setTimeout(hideAlert, time * 1000);
};

const signup = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Sign up successful! Welcome, '+data.fname+'!');
      setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const tooltipHandler = function(tooltip) {
  this.click = false;
  this.hover = false;

  this.tooltipOff = () => {
    console.log('Hiding tooltip: ', tooltip);
    tooltip.style.visibility = 'hidden';
  };

  this.tooltipOn = () => {
    console.log('Showing tooltip: ', tooltip);
    tooltip.style.visibility = 'visible';
  };

  this.tooltipClick = () => {
    console.log('click detected');
    this.click = this.click == false ? true : false;
    if(this.click)
      this.tooltipOn();
    else
      this.tooltipOff();
  };

  this.tooltipMouseleave = async () => {
    console.log('mouse leave detected');
    this.hover = false;
    if(!this.click){
      this.tooltipOff();
    }
  };

  this.tooltipMouseover = () => {
    console.log('mouse over detected');
    this.hover = true;
    this.tooltipOn();
  };
};

/* --------------------------------------------------------------------------
 * DELEGATION
 * -------------------------------------------------------------------------- */

// Change color of difficulty selection in word form on arrow click
if(difficultyArrowLeft && difficultyArrowRight) {
  difficultyArrowLeft.addEventListener('click', function() {
    changeColor('prev');
  });
  difficultyArrowRight.addEventListener('click', function() {
    changeColor('next');
  });
}

// Scroll list to duplicate word entry if previous input was a duplicate key
if(duplicateEntry) {
  list.scrollTop = duplicateEntry.offsetTop - list.offsetTop;
}

if(loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('user').value;
    const password = document.getElementById('password').value;
    login(user, password);
  });
}

if(logoutBtn) {
  logoutBtn.addEventListener('click', e => {
    logout();
  });
}

if(passwordChangeForm) {
  passwordChangeForm.addEventListener('submit', e => {
    e.preventDefault();
    const password = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const newPasswordConfirm = document.getElementById('confirm-new-password').value;
    changePassword({
      password,
      newPassword,
      newPasswordConfirm
    });
  });
}

if(signupForm){
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const fname = document.getElementById('fname').value;
    const lname = document.getElementById('lname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    signup({
      fname,
      lname,
      username: username.value,
      email,
      password,
      passwordConfirm
    });
  });
}

if(actionButtons) {
  for(var i = 0; i < actionButtons.length; i++) {
    if(actionButtons[i].nextElementSibling.classList.contains('c-tooltip')){
      let handler = new tooltipHandler(actionButtons[i].nextElementSibling);
      actionButtons[i].addEventListener(
        'click',
        handler.tooltipClick
      );

      actionButtons[i].addEventListener(
        'mouseover',
        handler.tooltipMouseover
      );

      actionButtons[i].addEventListener(
        'mouseleave',
        handler.tooltipMouseleave
      );
    }
  }
}

if(userInfoForm) {
  userInfoForm.addEventListener('submit', e => {
    let data = {};

    e.preventDefault();
    const fname = document.getElementById('fname').value;
    const lname = document.getElementById('lname').value;
    const email = document.getElementById('email').value;

    if(fname.length > 0)
      data.fname = fname;
    if(lname.length > 0)
      data.lname = lname;
    if(email.length > 0)
      data.email = email;
    if(username.value > 0)
      data.username = username.value;

    if(Object.values(data).length > 0)
      changeUserInfo(data);
  });
}

// Check if username is taken as user input is recieved (before submit)
if(username) {
  username.addEventListener('keyup', e => {
    debounce(checkUsername, 1200);
  });
}

// Scroll list into view on click of 'Your List' header in account view
if(yourList) {
  yourList.addEventListener('click', e => {
    document.documentElement.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  });
}































// EOF
